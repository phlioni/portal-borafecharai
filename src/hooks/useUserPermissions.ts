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
  monthlyProposalLimit: number | null; // null means unlimited
  loading: boolean;
}

export const useUserPermissions = () => {
  const { user } = useAuth();
  const { subscribed, subscription_tier } = useSubscription();
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

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 15);

    await supabase
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
  };

  const checkPermissions = async () => {
    if (!user) {
      setPermissions(prev => ({ ...prev, loading: false }));
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

      // If user has no subscription and no trial, initiate trial
      if (!subscriberData?.subscribed && !isInTrial && !subscriberData?.trial_end_date) {
        await initiateTrial();
        // Refresh subscriber data after trial initiation
        const { data: newSubscriberData } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        // Update local reference
        if (newSubscriberData) {
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
          return {
            isAdmin: false,
            canCreateProposal: canCreate || false,
            canAccessAnalytics: false,
            canAccessPremiumTemplates: false,
            canCollaborate: false,
            monthlyProposalCount: subscriberData?.trial_proposals_used || 0,
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
  }, [user, subscribed, subscription_tier]);

  return {
    ...permissions,
    refreshPermissions: checkPermissions,
    initiateTrial,
  };
};