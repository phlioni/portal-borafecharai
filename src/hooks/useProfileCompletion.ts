
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileCompletionStatus {
  isProfileComplete: boolean;
  bonusAlreadyClaimed: boolean;
  canClaimBonus: boolean;
}

export const useProfileCompletion = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

      console.log('Status do perfil:', {
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
  });

  const claimBonus = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Tentando reivindicar bônus para usuário:', user.id);

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
      toast({
        title: "Parabéns! 🎉",
        description: "Você ganhou 5 propostas extras por completar seu perfil!",
      });
      
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

  return {
    ...checkProfileCompletion,
    claimBonus: claimBonus.mutate,
    isClaiming: claimBonus.isPending
  };
};
