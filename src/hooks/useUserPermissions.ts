
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

        // Verificar ou criar status do trial
        let { data: subscriber } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // Se não existir subscriber, criar automaticamente
        if (!subscriber) {
          const trialStartDate = new Date();
          const trialEndDate = new Date(trialStartDate.getTime() + (15 * 24 * 60 * 60 * 1000));
          
          const { data: newSubscriber } = await supabase
            .from('subscribers')
            .insert({
              user_id: user.id,
              email: user.email || '',
              trial_start_date: trialStartDate.toISOString(),
              trial_end_date: trialEndDate.toISOString(),
              trial_proposals_used: 0,
              subscribed: false,
              subscription_tier: null,
            })
            .select()
            .single();

          subscriber = newSubscriber;
        }

        console.log('useUserPermissions - subscriber data:', subscriber);

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
          // Verificar trial - deve ter trial_end_date >= now() E propostas < 20
          if (subscriber?.trial_end_date && new Date(subscriber.trial_end_date) >= new Date()) {
            const proposalsUsed = subscriber.trial_proposals_used || 0;
            proposalLimit = 20;
            canCreate = proposalsUsed < 20;
            console.log('useUserPermissions - trial check:', {
              trial_end_date: subscriber.trial_end_date,
              proposalsUsed,
              canCreate,
              trialValid: new Date(subscriber.trial_end_date) >= new Date()
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
          subscription_tier,
          trialEndDate: subscriber?.trial_end_date,
          trialProposalsUsed: subscriber?.trial_proposals_used
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
