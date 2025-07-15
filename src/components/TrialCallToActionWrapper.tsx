
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import TrialCallToAction from './TrialCallToAction';

export const TrialCallToActionWrapper = () => {
  const { user } = useAuth();
  const { subscribed, loading: subscriptionLoading } = useSubscription();
  const { isInTrial, loading: trialLoading } = useTrialStatus();

  console.log('TrialCallToActionWrapper - Status:', {
    user: !!user,
    subscribed,
    isInTrial,
    subscriptionLoading,
    trialLoading
  });

  // Don't show if loading or no user
  if (subscriptionLoading || trialLoading || !user) {
    return null;
  }

  // Don't show if user has active subscription
  if (subscribed) {
    return null;
  }

  // Show trial CTA only if user is in trial
  if (isInTrial) {
    return <TrialCallToAction />;
  }

  return null;
};
