
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import TrialCallToAction from './TrialCallToAction';

export const TrialCallToActionWrapper = () => {
  const { user } = useAuth();
  const { subscribed, subscription_tier, loading } = useSubscription();

  // Don't show if loading or no user
  if (loading || !user) {
    return null;
  }

  // Don't show if user has active subscription
  if (subscribed) {
    return null;
  }

  // Show trial CTA for users without subscription
  return <TrialCallToAction />;
};
