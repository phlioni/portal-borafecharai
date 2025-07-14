
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from './useSubscription';

export const useUserPermissions = () => {
  const { user } = useAuth();
  const { subscribed, subscription_tier, loading: subscriptionLoading } = useSubscription();
  const [isAdmin, setIsAdmin] = useState(false);
  const [monthlyProposalCount, setMonthlyProposalCount] = useState(0);
  const [monthlyProposalLimit, setMonthlyProposalLimit] = useState<number | null>(null);
  const [canCreateProposal, setCanCreateProposal] = useState(false);
  const [canAccessAnalytics, setCanAccessAnalytics] = useState(false);
  const [canAccessPremiumTemplates, setCanAccessPremiumTemplates] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user || subscriptionLoading) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Check if user is admin
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        const adminRole = userRoles?.some(role => role.role === 'admin') || false;
        setIsAdmin(adminRole);

        // Get monthly proposal count
        const { data: monthlyCount } = await supabase
          .rpc('get_monthly_proposal_count', { _user_id: user.id });

        setMonthlyProposalCount(monthlyCount || 0);

        // Verificar status do trial
        const { data: subscriber } = await supabase
          .from('subscribers')
          .select('trial_end_date, trial_proposals_used, trial_start_date, subscribed, subscription_tier')
          .eq('user_id', user.id)
          .single();

        console.log('useUserPermissions - subscriber data:', subscriber);
        console.log('useUserPermissions - subscribed from hook:', subscribed);
        console.log('useUserPermissions - subscription_tier from hook:', subscription_tier);

        // Verificar se pode criar propostas
        let canCreate = false;
        let proposalLimit = null;

        if (adminRole) {
          canCreate = true;
          proposalLimit = null; // Unlimited for admin
          setCanAccessAnalytics(true);
          setCanAccessPremiumTemplates(true);
        } else if (subscribed) {
          if (subscription_tier === 'basico') {
            proposalLimit = 10;
            canCreate = monthlyCount < 10;
            setCanAccessAnalytics(false);
            setCanAccessPremiumTemplates(false);
          } else if (subscription_tier === 'profissional') {
            proposalLimit = null; // Unlimited
            canCreate = true;
            setCanAccessAnalytics(true);
            setCanAccessPremiumTemplates(true);
          }
        } else {
          // Verificar trial
          if (subscriber?.trial_end_date && new Date(subscriber.trial_end_date) >= new Date()) {
            const proposalsUsed = subscriber.trial_proposals_used || 0;
            proposalLimit = 20;
            canCreate = proposalsUsed < 20;
            console.log('useUserPermissions - trial check:', {
              trial_end_date: subscriber.trial_end_date,
              proposalsUsed,
              canCreate
            });
            setCanAccessAnalytics(false);
            setCanAccessPremiumTemplates(false);
          } else {
            proposalLimit = 0;
            canCreate = false;
            setCanAccessAnalytics(false);
            setCanAccessPremiumTemplates(false);
          }
        }

        setMonthlyProposalLimit(proposalLimit);
        setCanCreateProposal(canCreate);

        console.log('useUserPermissions - final state:', {
          canCreateProposal: canCreate,
          monthlyProposalLimit: proposalLimit,
          monthlyProposalCount: monthlyCount,
          isAdmin: adminRole,
          subscribed,
          subscription_tier
        });

      } catch (error) {
        console.error('Error checking permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [user, subscribed, subscription_tier, subscriptionLoading]);

  return {
    isAdmin,
    monthlyProposalCount,
    monthlyProposalLimit,
    canCreateProposal,
    canAccessAnalytics,
    canAccessPremiumTemplates,
    loading
  };
};
