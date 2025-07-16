
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface TrialStatus {
  isInTrial: boolean;
  daysUsed: number;
  totalTrialDays: number;
  proposalsUsed: number;
  proposalsRemaining: number;
  trialStartDate: Date | null;
  trialEndDate: Date | null;
  loading: boolean;
}

export const useTrialStatus = () => {
  const { user } = useAuth();
  const [trialStatus, setTrialStatus] = useState<TrialStatus>({
    isInTrial: false,
    daysUsed: 0,
    totalTrialDays: 15,
    proposalsUsed: 0,
    proposalsRemaining: 20,
    trialStartDate: null,
    trialEndDate: null,
    loading: true,
  });

  const checkTrialStatus = async () => {
    if (!user) {
      setTrialStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      console.log('useTrialStatus - Checking trial status for user:', user.id);
      
      const { data: subscriberData, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('useTrialStatus - Error fetching subscriber:', error);
        setTrialStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      if (!subscriberData) {
        console.log('useTrialStatus - No subscriber data found');
        setTrialStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      console.log('useTrialStatus - Subscriber data:', subscriberData);

      const now = new Date();
      const trialStartDate = subscriberData.trial_start_date ? new Date(subscriberData.trial_start_date) : null;
      const trialEndDate = subscriberData.trial_end_date ? new Date(subscriberData.trial_end_date) : null;
      
      // Usuário está em trial se tem data de fim do trial, ainda não expirou e não tem assinatura
      const isInTrial = trialEndDate && trialEndDate >= now && !subscriberData.subscribed;
      
      // Calcular dias usados desde o início do trial
      let daysUsed = 0;
      if (trialStartDate && trialEndDate) {
        const timeDiff = now.getTime() - trialStartDate.getTime();
        const daysPassed = Math.floor(timeDiff / (1000 * 3600 * 24));
        daysUsed = Math.min(15, Math.max(0, daysPassed));
      }

      const proposalsUsed = subscriberData.trial_proposals_used || 0;
      const proposalsRemaining = Math.max(0, 20 - proposalsUsed);

      console.log('useTrialStatus - Calculated status:', {
        isInTrial: !!isInTrial,
        daysUsed,
        proposalsUsed,
        proposalsRemaining,
        trialStartDate,
        trialEndDate
      });

      setTrialStatus({
        isInTrial: !!isInTrial,
        daysUsed,
        totalTrialDays: 15,
        proposalsUsed,
        proposalsRemaining,
        trialStartDate,
        trialEndDate,
        loading: false,
      });

    } catch (error) {
      console.error('useTrialStatus - Erro ao verificar status do trial:', error);
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
