
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface ProfileCompletionStatus {
  isProfileComplete: boolean;
  bonusAlreadyClaimed: boolean;
  canClaimBonus: boolean;
}

export const useProfileCompletion = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCelebration, setShowCelebration] = useState(false);

  const checkProfileCompletion = useQuery({
    queryKey: ['profile-completion', user?.id],
    queryFn: async (): Promise<ProfileCompletionStatus> => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Verificando status do perfil para usuário:', user.id);

      // Verificar se já reivindicou o bônus primeiro
      const { data: subscriber, error: subscriberError } = await supabase
        .from('subscribers')
        .select('profile_completion_bonus_claimed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subscriberError) {
        console.error('Erro ao buscar dados do subscriber:', subscriberError);
        throw subscriberError;
      }

      const bonusAlreadyClaimed = subscriber?.profile_completion_bonus_claimed || false;

      // Se já reivindicou, não precisa verificar mais nada
      if (bonusAlreadyClaimed) {
        return {
          isProfileComplete: true, // Assumir que está completo se já reivindicou
          bonusAlreadyClaimed: true,
          canClaimBonus: false
        };
      }

      // Verificar se perfil está completo usando a função do banco
      const { data: isComplete, error: completeError } = await supabase
        .rpc('is_profile_complete', { _user_id: user.id });

      if (completeError) {
        console.error('Erro ao verificar perfil completo:', completeError);
        throw completeError;
      }

      const canClaimBonus = isComplete && !bonusAlreadyClaimed;

      console.log('Status do perfil atualizado:', {
        isComplete,
        bonusAlreadyClaimed,
        canClaimBonus
      });

      return {
        isProfileComplete: isComplete || false,
        bonusAlreadyClaimed,
        canClaimBonus
      };
    },
    enabled: !!user?.id,
    refetchInterval: 3000, // Verificar a cada 3 segundos
  });

  const claimBonus = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Tentando reivindicar bônus manualmente para usuário:', user.id);

      const { data: success, error } = await supabase
        .rpc('grant_profile_completion_bonus', { _user_id: user.id });

      if (error) {
        console.error('Erro ao reivindicar bônus:', error);
        throw error;
      }

      if (!success) {
        throw new Error('Não foi possível reivindicar o bônus');
      }

      return success;
    },
    onSuccess: () => {
      // Mostrar celebração
      setShowCelebration(true);
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['profile-completion'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
    },
    onError: (error: any) => {
      console.error('Erro ao reivindicar bônus:', error);
      toast({
        title: "Erro",
        description: error.message || 'Erro ao reivindicar bônus',
        variant: "destructive",
      });
    },
  });

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    toast({
      title: "🎉 Bônus concedido com sucesso!",
      description: "Você ganhou 5 propostas extras para usar este mês!",
    });
  };

  return {
    ...checkProfileCompletion,
    claimBonus: claimBonus.mutate,
    isClaiming: claimBonus.isPending,
    showCelebration,
    handleCelebrationComplete
  };
};
