
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
        console.log('useUserPermissions - Checking permissions for user:', user.id);

        // Check if user is admin
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        const adminRole = userRoles?.some(role => role.role === 'admin') || false;
        setIsAdmin(adminRole);

        // Get monthly proposal count
        const { data: monthlyCount, error: countError } = await supabase
          .rpc('get_monthly_proposal_count', { _user_id: user.id });

        if (countError) {
          console.error('useUserPermissions - Error getting monthly count:', countError);
          setMonthlyProposalCount(0);
        } else {
          setMonthlyProposalCount(monthlyCount || 0);
        }

        // Use database function to check if can create proposal
        const { data: canCreate, error: canCreateError } = await supabase
          .rpc('can_create_proposal', { _user_id: user.id });

        if (canCreateError) {
          console.error('useUserPermissions - Error checking can_create_proposal:', canCreateError);
          setCanCreateProposal(false);
        } else {
          setCanCreateProposal(canCreate || false);
        }

        // Get subscriber data for determining limits and access
        const { data: subscriber } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        console.log('useUserPermissions - subscriber data:', subscriber);
        console.log('useUserPermissions - subscribed from hook:', subscribed);
        console.log('useUserPermissions - subscription_tier from hook:', subscription_tier);

        // Determine limits and access based on status
        let proposalLimit = null;

        if (adminRole) {
          proposalLimit = null; // Unlimited for admin
          setCanAccessAnalytics(true);
          setCanAccessPremiumTemplates(true);
        } else if (subscribed) {
          if (subscription_tier === 'basico') {
            proposalLimit = 10;
            setCanAccessAnalytics(false);
            setCanAccessPremiumTemplates(false);
          } else if (subscription_tier === 'profissional') {
            proposalLimit = null; // Unlimited
            setCanAccessAnalytics(true);
            setCanAccessPremiumTemplates(true);
          }
        } else {
          // Trial or no access
          if (subscriber?.trial_end_date && new Date(subscriber.trial_end_date) >= new Date()) {
            proposalLimit = 20;
            console.log('useUserPermissions - User in trial, limit 20 proposals');
          } else {
            proposalLimit = 0;
            console.log('useUserPermissions - User trial expired, no access');
          }
          setCanAccessAnalytics(false);
          setCanAccessPremiumTemplates(false);
        }

        setMonthlyProposalLimit(proposalLimit);

        console.log('useUserPermissions - final state:', {
          canCreateProposal: canCreate,
          monthlyProposalLimit: proposalLimit,
          monthlyProposalCount: monthlyCount,
          isAdmin: adminRole,
          subscribed,
          subscription_tier
        });

      } catch (error) {
        console.error('useUserPermissions - Error checking permissions:', error);
        setCanCreateProposal(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [user, subscribed, subscription_tier, subscriptionLoading]);

  // Helper function to get remaining proposals
  const getRemainingProposals = () => {
    if (isAdmin || monthlyProposalLimit === null) {
      return null; // Unlimited
    }
    return Math.max(0, monthlyProposalLimit - monthlyProposalCount);
  };

  // Helper function to get usage percentage
  const getUsagePercentage = () => {
    if (isAdmin || monthlyProposalLimit === null) {
      return 0; // No limit
    }
    return Math.min(100, (monthlyProposalCount / monthlyProposalLimit) * 100);
  };

  return {
    isAdmin,
    monthlyProposalCount,
    monthlyProposalLimit,
    canCreateProposal,
    canAccessAnalytics,
    canAccessPremiumTemplates,
    loading,
    getRemainingProposals,
    getUsagePercentage
  };
};
