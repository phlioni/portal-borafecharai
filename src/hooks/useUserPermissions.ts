
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';

interface UserPermissions {
  isAdmin: boolean;
  canCreateProposal: boolean;
  canAccessAnalytics: boolean;
  canAccessPremiumTemplates: boolean;
  canCollaborate: boolean;
  monthlyProposalCount: number;
  monthlyProposalLimit: number | null;
  loading: boolean;
}

export const useUserPermissions = () => {
  const { user } = useAuth();
  const { subscribed, subscription_tier, loading: subscriptionLoading } = useSubscription();
  const [permissions, setPermissions] = useState<UserPermissions>({
    isAdmin: false,
    canCreateProposal: false,
    canAccessAnalytics: false,
    canAccessPremiumTemplates: false,
    canCollaborate: false,
    monthlyProposalCount: 0,
    monthlyProposalLimit: null,
    loading: true,
  });

  const initiateTrial = async () => {
    if (!user) return;

    console.log('Iniciando trial automático para usuário:', user.email);

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 15);

    const { error } = await supabase
      .from('subscribers')
      .upsert({
        user_id: user.id,
        email: user.email!,
        trial_start_date: new Date().toISOString(),
        trial_end_date: trialEndDate.toISOString(),
        trial_proposals_used: 0,
        subscribed: false,
        subscription_tier: null,
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Erro ao iniciar trial:', error);
    } else {
      console.log('Trial iniciado com sucesso até:', trialEndDate);
    }
  };

  const checkPermissions = async () => {
    if (!user) {
      setPermissions(prev => ({ ...prev, loading: false }));
      return;
    }

    // Se ainda está carregando a assinatura, aguarda
    if (subscriptionLoading) {
      return;
    }

    try {
      // Check if user is admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      const isAdmin = !!roleData;

      // Get subscriber data including trial info
      const { data: subscriberData } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get monthly proposal count
      const { data: proposalCount } = await supabase.rpc('get_monthly_proposal_count', {
        _user_id: user.id
      });

      // Check if user can create proposal
      const { data: canCreate } = await supabase.rpc('can_create_proposal', {
        _user_id: user.id
      });

      // Check if user is in trial period
      const isInTrial = subscriberData?.trial_end_date && 
        new Date(subscriberData.trial_end_date) >= new Date();

      // Se usuário não tem assinatura, não está em trial e nunca teve trial, iniciar automaticamente
      if (!subscriberData?.subscribed && !isInTrial && !subscriberData?.trial_end_date) {
        console.log('Usuário novo detectado, iniciando trial automático');
        await initiateTrial();
        // Refresh subscriber data after trial initiation
        const { data: newSubscriberData } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (newSubscriberData) {
          // Atualizar a referência local para os dados atualizados
          Object.assign(subscriberData || {}, newSubscriberData);
        }
      }

      // Determine permissions based on plan and admin status
      const getPermissions = (): Omit<UserPermissions, 'loading'> => {
        if (isAdmin) {
          return {
            isAdmin: true,
            canCreateProposal: true,
            canAccessAnalytics: true,
            canAccessPremiumTemplates: true,
            canCollaborate: true,
            monthlyProposalCount: proposalCount || 0,
            monthlyProposalLimit: null,
          };
        }

        // Trial period permissions
        if (isInTrial) {
          const trialProposalsUsed = subscriberData?.trial_proposals_used || 0;
          return {
            isAdmin: false,
            canCreateProposal: canCreate || false,
            canAccessAnalytics: false,
            canAccessPremiumTemplates: false,
            canCollaborate: false,
            monthlyProposalCount: trialProposalsUsed,
            monthlyProposalLimit: 20,
          };
        }

        if (!subscribed) {
          return {
            isAdmin: false,
            canCreateProposal: false,
            canAccessAnalytics: false,
            canAccessPremiumTemplates: false,
            canCollaborate: false,
            monthlyProposalCount: proposalCount || 0,
            monthlyProposalLimit: 0,
          };
        }

        switch (subscription_tier) {
          case 'basico':
            return {
              isAdmin: false,
              canCreateProposal: canCreate || false,
              canAccessAnalytics: false,
              canAccessPremiumTemplates: false,
              canCollaborate: false,
              monthlyProposalCount: proposalCount || 0,
              monthlyProposalLimit: 10,
            };

          case 'profissional':
            return {
              isAdmin: false,
              canCreateProposal: true,
              canAccessAnalytics: true,
              canAccessPremiumTemplates: true,
              canCollaborate: false,
              monthlyProposalCount: proposalCount || 0,
              monthlyProposalLimit: null,
            };

          case 'equipes':
            return {
              isAdmin: false,
              canCreateProposal: true,
              canAccessAnalytics: true,
              canAccessPremiumTemplates: true,
              canCollaborate: true,
              monthlyProposalCount: proposalCount || 0,
              monthlyProposalLimit: null,
            };

          default:
            return {
              isAdmin: false,
              canCreateProposal: false,
              canAccessAnalytics: false,
              canAccessPremiumTemplates: false,
              canCollaborate: false,
              monthlyProposalCount: proposalCount || 0,
              monthlyProposalLimit: 0,
            };
        }
      };

      setPermissions({
        ...getPermissions(),
        loading: false,
      });

    } catch (error) {
      console.error('Error checking permissions:', error);
      setPermissions(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    checkPermissions();
  }, [user, subscribed, subscription_tier, subscriptionLoading]);

  return {
    ...permissions,
    refreshPermissions: checkPermissions,
    initiateTrial,
  };
};
