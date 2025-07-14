
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  cancel_at_period_end?: boolean;
  loading: boolean;
  error: string | null;
}

export const useSubscription = () => {
  const { user, session } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    cancel_at_period_end: false,
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
        .maybeSingle();

      if (subscriberData && !subscriberError) {
        setSubscriptionData({
          subscribed: subscriberData.subscribed || false,
          subscription_tier: subscriberData.subscription_tier || null,
          subscription_end: subscriberData.subscription_end || null,
          cancel_at_period_end: (subscriberData as any).cancel_at_period_end || false,
          loading: false,
          error: null,
        });
        return;
      }

      // Se não encontrar na tabela, cria um registro básico para o usuário
      if (!subscriberData) {
        await supabase
          .from('subscribers')
          .upsert({
            user_id: user.id,
            email: user.email || '',
            subscribed: false,
            subscription_tier: null,
            trial_start_date: new Date().toISOString(),
            trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days trial
            trial_proposals_used: 0
          }, { onConflict: 'user_id' });

        setSubscriptionData({
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          cancel_at_period_end: false,
          loading: false,
          error: null,
        });
        return;
      }

      // Se a edge function falhar, assume valores padrão
      setSubscriptionData({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        cancel_at_period_end: false,
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
        toast.error('Erro ao criar sessão de pagamento. Verifique se as configurações do Stripe estão corretas.');
        throw error;
      }
      
      toast.dismiss();
      toast.success('Redirecionando para o pagamento...');
      
      // Abrir checkout em nova aba
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('URL de checkout não encontrada');
      }
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
        toast.error('Erro ao abrir portal. Verifique se as configurações do Stripe estão corretas.');
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

  const cancelSubscription = async () => {
    if (!session) {
      toast.error('Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    try {
      toast.loading('Cancelando assinatura...');
      
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Cancel subscription error:', error);
        toast.error('Erro ao cancelar assinatura. Verifique se as configurações do Stripe estão corretas.');
        throw error;
      }
      
      toast.dismiss();
      
      if (data.success) {
        toast.success(data.message || 'Assinatura cancelada com sucesso!');
        // Atualizar dados locais
        setSubscriptionData(prev => ({
          ...prev,
          cancel_at_period_end: true
        }));
        // Recarregar dados da assinatura
        await checkSubscription();
      } else {
        toast.error(data.error || 'Erro ao cancelar assinatura');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error canceling subscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao cancelar assinatura: ' + errorMessage);
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
    cancelSubscription,
  };
};
