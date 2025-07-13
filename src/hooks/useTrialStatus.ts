import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface TrialStatus {
  isInTrial: boolean;
  daysRemaining: number;
  proposalsUsed: number;
  proposalsRemaining: number;
  trialEndDate: Date | null;
  loading: boolean;
}

export const useTrialStatus = () => {
  const { user } = useAuth();
  const [trialStatus, setTrialStatus] = useState<TrialStatus>({
    isInTrial: false,
    daysRemaining: 0,
    proposalsUsed: 0,
    proposalsRemaining: 20,
    trialEndDate: null,
    loading: true,
  });

  const checkTrialStatus = async () => {
    if (!user) {
      setTrialStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const { data: subscriberData } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!subscriberData) {
        setTrialStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      const now = new Date();
      const trialEndDate = subscriberData.trial_end_date ? new Date(subscriberData.trial_end_date) : null;
      const isInTrial = trialEndDate && trialEndDate >= now && !subscriberData.subscribed;
      
      let daysRemaining = 0;
      if (trialEndDate) {
        const timeDiff = trialEndDate.getTime() - now.getTime();
        daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
      }

      const proposalsUsed = subscriberData.trial_proposals_used || 0;
      const proposalsRemaining = Math.max(0, 20 - proposalsUsed);

      setTrialStatus({
        isInTrial: !!isInTrial,
        daysRemaining,
        proposalsUsed,
        proposalsRemaining,
        trialEndDate,
        loading: false,
      });

    } catch (error) {
      console.error('Erro ao verificar status do trial:', error);
      setTrialStatus(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    checkTrialStatus();
    
    // Verificar a cada minuto para manter atualizado
    const interval = setInterval(checkTrialStatus, 60000);
    
    return () => clearInterval(interval);
  }, [user]);

  return {
    ...trialStatus,
    refreshTrialStatus: checkTrialStatus,
  };
};