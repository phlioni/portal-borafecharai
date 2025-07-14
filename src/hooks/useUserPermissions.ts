
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

        // Check if user can create proposals
        const { data: canCreate } = await supabase
          .rpc('can_create_proposal', { _user_id: user.id });

        setCanCreateProposal(canCreate || false);

        // Set limits and permissions based on subscription
        if (adminRole) {
          setMonthlyProposalLimit(null); // Unlimited for admin
          setCanAccessAnalytics(true);
          setCanAccessPremiumTemplates(true);
        } else if (subscribed) {
          if (subscription_tier === 'basico') {
            setMonthlyProposalLimit(10);
            setCanAccessAnalytics(false);
            setCanAccessPremiumTemplates(false);
          } else if (subscription_tier === 'professional') {
            setMonthlyProposalLimit(null); // Unlimited
            setCanAccessAnalytics(true);
            setCanAccessPremiumTemplates(true);
          }
        } else {
          // Check if user has trial access
          const { data: subscriber } = await supabase
            .from('subscribers')
            .select('trial_end_date, trial_proposals_used')
            .eq('user_id', user.id)
            .single();

          if (subscriber?.trial_end_date && new Date(subscriber.trial_end_date) >= new Date()) {
            setMonthlyProposalLimit(20); // Trial limit
            setCanAccessAnalytics(false);
            setCanAccessPremiumTemplates(false);
          } else {
            setMonthlyProposalLimit(0);
            setCanAccessAnalytics(false);
            setCanAccessPremiumTemplates(false);
          }
        }

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
