
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

  const fixTrial = async () => {
    if (!user) return;

    console.log('Corrigindo trial para usuário:', user.email);

    try {
      const { data, error } = await supabase.functions.invoke('fix-trial');
      
      if (error) {
        console.error('Erro ao corrigir trial:', error);
        return;
      }

      console.log('Trial corrigido:', data);
      // Recarregar permissões após corrigir o trial
      setTimeout(() => checkPermissions(), 1000);
    } catch (error) {
      console.error('Erro ao corrigir trial:', error);
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

      // Se não há dados de subscriber ou trial não está configurado, corrigir trial
      if (!subscriberData || (!subscriberData.trial_start_date && !subscriberData.subscribed)) {
        console.log('Corrigindo configuração de trial');
        await fixTrial();
        return;
      }
      
      // Se usuário existe mas trial expirou e não tem assinatura, corrigir trial  
      else if (!subscriberData.subscribed && subscriberData.trial_end_date && new Date(subscriberData.trial_end_date) < new Date()) {
        console.log('Trial expirado, recriando trial');
        await fixTrial();
        return;
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
          console.log('useUserPermissions - Trial ativo:', {
            isInTrial,
            canCreate,
            trialProposalsUsed,
            trialEndDate: subscriberData?.trial_end_date
          });
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
    fixTrial,
  };
};
