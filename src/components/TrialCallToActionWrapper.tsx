
import React from 'react';
import TrialCallToAction from './TrialCallToAction';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useSubscription } from '@/hooks/useSubscription';

export const TrialCallToActionWrapper = () => {
  const { loading: permissionsLoading, isAdmin } = useUserPermissions();
  const { subscribed, loading: subscriptionLoading } = useSubscription();

  // Se ainda está carregando, não mostra nada (sem skeleton)
  if (permissionsLoading || subscriptionLoading) {
    return null;
  }

  // Se é admin ou tem assinatura ativa, não mostra o call to action
  if (isAdmin || subscribed) {
    return null;
  }

  // Só mostra se não é admin e não tem assinatura
  return <TrialCallToAction />;
};
