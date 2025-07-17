
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

      // Verificar se perfil está completo usando a função do banco
      const { data: isComplete, error: completeError } = await supabase
        .rpc('is_profile_complete', { _user_id: user.id });

      if (completeError) {
        console.error('Erro ao verificar perfil completo:', completeError);
        throw completeError;
      }

      // Verificar se já reivindicou o bônus
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
      const canClaimBonus = isComplete && !bonusAlreadyClaimed;

      console.log('Status do perfil atualizado:', {
        isComplete,
        bonusAlreadyClaimed,
        canClaimBonus
      });

      // Se pode reivindicar o bônus, reivindicar automaticamente
      if (canClaimBonus) {
        console.log('Bônus pode ser reivindicado automaticamente!');
        setTimeout(() => {
          handleAutoClaimBonus();
        }, 1000);
      }

      return {
        isProfileComplete: isComplete || false,
        bonusAlreadyClaimed,
        canClaimBonus
      };
    },
    enabled: !!user?.id,
    refetchInterval: 5000, // Verificar a cada 5 segundos
  });

  const handleAutoClaimBonus = async () => {
    if (!user?.id) return;

    try {
      console.log('Tentando reivindicar bônus automaticamente para usuário:', user.id);

      const { data: success, error } = await supabase
        .rpc('grant_profile_completion_bonus', { _user_id: user.id });

      if (error) {
        console.error('Erro ao reivindicar bônus automaticamente:', error);
        return;
      }

      if (success) {
        console.log('Bônus reivindicado com sucesso automaticamente!');
        // Mostrar celebração
        setShowCelebration(true);
        
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: ['profile-completion'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
        queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      }
    } catch (error) {
      console.error('Erro ao reivindicar bônus automaticamente:', error);
    }
  };

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
