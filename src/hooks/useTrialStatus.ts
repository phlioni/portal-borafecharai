
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
      
      // Verificar role do usuário
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      const isUserRole = userRole?.role === 'user';
      
      const { data: subscriberData, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('useTrialStatus - Error fetching subscriber:', error);
        
        // Se não encontrou subscriber, vamos tentar criar um automaticamente
        if (error.code === 'PGRST116') {
          console.log('useTrialStatus - Subscriber not found, creating one...');
          
          const { error: insertError } = await supabase
            .from('subscribers')
            .insert({
              user_id: user.id,
              email: user.email!,
              trial_start_date: new Date().toISOString(),
              trial_end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
              trial_proposals_used: 0,
              subscribed: false,
              subscription_tier: null
            });

          if (insertError) {
            console.error('useTrialStatus - Error creating subscriber:', insertError);
            setTrialStatus(prev => ({ ...prev, loading: false }));
            return;
          }

          // Buscar novamente após criar
          const { data: newSubscriberData, error: newError } = await supabase
            .from('subscribers')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (newError || !newSubscriberData) {
            console.error('useTrialStatus - Error fetching new subscriber:', newError);
            setTrialStatus(prev => ({ ...prev, loading: false }));
            return;
          }

          subscriberData = newSubscriberData;
        } else {
          setTrialStatus(prev => ({ ...prev, loading: false }));
          return;
        }
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
      
      // Para usuários com role 'user', sempre deve estar em trial se não tem assinatura ativa
      const hasActiveSubscription = subscriberData.subscribed && subscriberData.subscription_tier;
      
      // Usuário está em trial se:
      // 1. É role 'user' E não tem assinatura ativa E tem data de fim do trial válida E ainda não expirou
      const isInTrial = isUserRole && !hasActiveSubscription && trialEndDate && trialEndDate >= now;
      
      // Calcular dias usados desde o início do trial
      let daysUsed = 0;
      if (trialStartDate && trialEndDate) {
        const timeDiff = now.getTime() - trialStartDate.getTime();
        const daysPassed = Math.floor(timeDiff / (1000 * 3600 * 24));
        daysUsed = Math.min(15, Math.max(0, daysPassed));
      }

      // USAR O VALOR REAL DO BANCO
      const proposalsUsed = subscriberData.trial_proposals_used || 0;
      const proposalsRemaining = Math.max(0, 20 - proposalsUsed);

      console.log('useTrialStatus - Calculated status:', {
        isInTrial: !!isInTrial,
        isUserRole,
        hasActiveSubscription,
        daysUsed,
        proposalsUsed,
        proposalsRemaining,
        trialStartDate,
        trialEndDate,
        now: now.toISOString(),
        trialEndDateString: trialEndDate?.toISOString()
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
