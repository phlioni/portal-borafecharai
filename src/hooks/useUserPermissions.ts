
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
        const guestRole = userRoles?.some(role => role.role === 'guest') || false;
        setIsAdmin(adminRole);

        // Get monthly proposal count
        const { data: monthlyCount } = await supabase
          .rpc('get_monthly_proposal_count', { _user_id: user.id });

        setMonthlyProposalCount(monthlyCount || 0);

        // Usar a função do banco para verificar se pode criar proposta
        const { data: canCreate, error: canCreateError } = await supabase
          .rpc('can_create_proposal', { _user_id: user.id });

        if (canCreateError) {
          console.error('useUserPermissions - Error checking can_create_proposal:', canCreateError);
          setCanCreateProposal(false);
        } else {
          setCanCreateProposal(canCreate || false);
        }

        // Verificar dados do subscriber para determinar limites e acessos
        const { data: subscriber } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        console.log('useUserPermissions - subscriber data:', subscriber);
        console.log('useUserPermissions - subscribed from hook:', subscribed);
        console.log('useUserPermissions - subscription_tier from hook:', subscription_tier);

        // Determinar limites e acessos baseado no status
        let proposalLimit = null;

        if (adminRole) {
          proposalLimit = null; // Unlimited for admin
          setCanAccessAnalytics(true);
          setCanAccessPremiumTemplates(true);
        } else if (guestRole) {
          // Guest tem todos os recursos liberados exceto administrar usuários
          proposalLimit = null; // Unlimited for guest
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
          // Trial ou sem acesso
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
          isGuest: guestRole,
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
