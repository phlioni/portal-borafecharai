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

// Função para detectar dispositivos móveis
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

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
      console.log('useSubscription - Checking subscription for user:', user.id);
      
      // Chamar a função check-subscription para verificar com o Stripe
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('useSubscription - Error calling check-subscription:', error);
        throw error;
      }

      console.log('useSubscription - Stripe check result:', data);

      // Se retornou dados do Stripe, usar esses dados
      if (data) {
        setSubscriptionData({
          subscribed: data.subscribed || false,
          subscription_tier: data.subscription_tier || null,
          subscription_end: data.subscription_end || null,
          cancel_at_period_end: data.cancel_at_period_end || false,
          loading: false,
          error: null,
        });
        return;
      }

      // Fallback: buscar diretamente na tabela subscribers se a função falhar
      const { data: subscriberData, error: subscriberError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subscriberError) {
        console.error('useSubscription - Error fetching subscriber:', subscriberError);
        throw subscriberError;
      }

      if (subscriberData) {
        console.log('useSubscription - Found subscriber data:', subscriberData);
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

      // Se não encontrar na tabela, criar um registro básico para o usuário
      console.log('useSubscription - No subscriber found, creating trial record');
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 15);

      await supabase
        .from('subscribers')
        .insert({
          user_id: user.id,
          email: user.email || '',
          subscribed: false,
          subscription_tier: null,
          trial_start_date: new Date().toISOString(),
          trial_end_date: trialEndDate.toISOString(),
          trial_proposals_used: 0
        });

      setSubscriptionData({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        cancel_at_period_end: false,
        loading: false,
        error: null,
      });

    } catch (error) {
      console.error('useSubscription - Error checking subscription:', error);
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
      
      // Detectar se é dispositivo móvel e usar redirecionamento apropriado
      if (data?.url) {
        const mobile = isMobileDevice();
        console.log('Redirecting to Stripe checkout:', { url: data.url, mobile });
        
        if (mobile) {
          // Em dispositivos móveis, usar window.location.href para evitar bloqueios
          window.location.href = data.url;
        } else {
          // Em desktop, usar nova aba
          const newWindow = window.open(data.url, '_blank');
          if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
            // Se a nova aba foi bloqueada, usar location.href como fallback
            console.log('Popup blocked, using location.href as fallback');
            window.location.href = data.url;
          }
        }
        
        // Após redirecionamento, verificar periodicamente se houve mudança na assinatura
        const checkInterval = setInterval(async () => {
          console.log('Verificando mudanças na assinatura após checkout...');
          await checkSubscription();
          
          // Parar de verificar após 5 minutos
          setTimeout(() => {
            clearInterval(checkInterval);
          }, 5 * 60 * 1000);
        }, 10000); // Verificar a cada 10 segundos
        
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
      
      // Detectar se é dispositivo móvel para portal também
      const mobile = isMobileDevice();
      if (mobile) {
        window.location.href = data.url;
      } else {
        const newWindow = window.open(data.url, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
          window.location.href = data.url;
        }
      }
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

  // Verificar mudanças na URL que possam indicar retorno do Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutSuccess = urlParams.get('checkout');
    
    if (checkoutSuccess === 'success' && user && session) {
      console.log('Detectado retorno de checkout com sucesso, verificando assinatura...');
      // Aguardar um pouco para dar tempo do Stripe processar
      setTimeout(() => {
        checkSubscription();
      }, 2000);
    }
  }, [user, session]);

  return {
    ...subscriptionData,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    cancelSubscription,
  };
};
