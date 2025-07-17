
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
      console.log('Bônus já reivindicado?', bonusAlreadyClaimed);

      // Se já reivindicou, não precisa verificar mais nada
      if (bonusAlreadyClaimed) {
        return {
          isProfileComplete: true,
          bonusAlreadyClaimed: true,
          canClaimBonus: false
        };
      }

      // Verificar perfil (nome e telefone)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        throw profileError;
      }

      const profileComplete = profile && 
        profile.name && profile.name.trim() !== '' &&
        profile.phone && profile.phone.trim() !== '';

      console.log('Perfil completo?', profileComplete, profile);

      // Verificar empresa (nome, email, telefone, endereço, cidade, segmento e tipo)
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('name, email, phone, address, city, business_segment, business_type_detail')
        .eq('user_id', user.id)
        .maybeSingle();

      if (companyError) {
        console.error('Erro ao buscar empresa:', companyError);
        throw companyError;
      }

      const companyComplete = company &&
        company.name && company.name.trim() !== '' &&
        company.email && company.email.trim() !== '' &&
        company.phone && company.phone.trim() !== '' &&
        company.address && company.address.trim() !== '' &&
        company.city && company.city.trim() !== '' &&
        company.business_segment && company.business_segment.trim() !== '' &&
        company.business_type_detail && company.business_type_detail.trim() !== '';

      console.log('Empresa completa?', companyComplete, company);

      const isComplete = profileComplete && companyComplete;
      const canClaimBonus = isComplete && !bonusAlreadyClaimed;

      console.log('Status final:', {
        profileComplete,
        companyComplete,
        isComplete,
        bonusAlreadyClaimed,
        canClaimBonus
      });

      return {
        isProfileComplete: isComplete,
        bonusAlreadyClaimed,
        canClaimBonus
      };
    },
    enabled: !!user?.id,
    refetchInterval: 2000, // Verificar a cada 2 segundos
  });

  const claimBonus = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Tentando reivindicar bônus para usuário:', user.id);

      // Primeiro verificar se realmente pode reivindicar
      const currentStatus = await checkProfileCompletion.refetch();
      if (!currentStatus.data?.canClaimBonus) {
        console.log('Não pode reivindicar bônus no momento');
        return false;
      }

      // Conceder o bônus diretamente
      const { data: subscriber } = await supabase
        .from('subscribers')
        .select('bonus_proposals_current_month')
        .eq('user_id', user.id)
        .maybeSingle();

      const currentBonus = subscriber?.bonus_proposals_current_month || 0;

      const { error } = await supabase
        .from('subscribers')
        .update({
          profile_completion_bonus_claimed: true,
          bonus_proposals_current_month: currentBonus + 5,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao conceder bônus:', error);
        throw error;
      }

      console.log('Bônus concedido com sucesso!');
      return true;
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
