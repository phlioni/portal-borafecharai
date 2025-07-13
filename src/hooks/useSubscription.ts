
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  loading: boolean;
  error: string | null;
}

export const useSubscription = () => {
  const { user, session } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    loading: true,
    error: null,
  });

  const checkSubscription = async () => {
    if (!user || !session) {
      setSubscriptionData(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setSubscriptionData(prev => ({ ...prev, loading: true, error: null }));
      
      // Primeiro tenta buscar diretamente na tabela subscribers
      const { data: subscriberData, error: subscriberError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subscriberData && !subscriberError) {
        setSubscriptionData({
          subscribed: subscriberData.subscribed || false,
          subscription_tier: subscriberData.subscription_tier || null,
          subscription_end: subscriberData.subscription_end || null,
          loading: false,
          error: null,
        });
        return;
      }

      // Se não encontrar na tabela, tenta via edge function (Stripe)
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setSubscriptionData({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || null,
        subscription_end: data.subscription_end || null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscriptionData(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao verificar assinatura',
      }));
    }
  };

  const createCheckout = async (priceId: string, planName: string) => {
    if (!session) {
      toast.error('Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    try {
      toast.loading('Criando sessão de pagamento...');
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, planName },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        toast.error('Erro ao criar sessão de pagamento: ' + error.message);
        throw error;
      }
      
      toast.dismiss();
      toast.success('Redirecionando para o pagamento...');
      
      // Abrir checkout em nova aba
      window.open(data.url, '_blank');
    } catch (error) {
      toast.dismiss();
      console.error('Error creating checkout:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao processar pagamento: ' + errorMessage);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    if (!session) {
      toast.error('Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    try {
      toast.loading('Abrindo portal do cliente...');
      
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Customer portal error:', error);
        toast.error('Erro ao abrir portal: ' + error.message);
        throw error;
      }
      
      toast.dismiss();
      toast.success('Abrindo portal do cliente...');
      
      // Abrir portal em nova aba
      window.open(data.url, '_blank');
    } catch (error) {
      toast.dismiss();
      console.error('Error opening customer portal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao abrir portal: ' + errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user, session]);

  return {
    ...subscriptionData,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};
