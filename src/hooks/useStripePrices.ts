
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PlanPrice {
  priceId: string;
  amount: number;
  currency: string;
  productId: string;
}

interface PlanPrices {
  basico?: PlanPrice;
  profissional?: PlanPrice;
  equipes?: PlanPrice;
}

const HARDCODED_PRICES = {
  basico: {
    priceId: process.env.NODE_ENV === 'production' ? 'price_live_essential' : 'price_test_essential',
    amount: 3990, // R$ 39,90 em centavos
    currency: 'brl',
    productId: 'prod_essential'
  },
  profissional: {
    priceId: process.env.NODE_ENV === 'production' ? 'price_live_professional' : 'price_test_professional',
    amount: 7990, // R$ 79,90 em centavos
    currency: 'brl',
    productId: 'prod_professional'
  }
};

export const useStripePrices = () => {
  const [prices, setPrices] = useState<PlanPrices>(HARDCODED_PRICES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);

      // Usar preços hardcoded por padrão
      setPrices(HARDCODED_PRICES);
      
      // Opcionalmente, tentar buscar preços dinâmicos do Stripe
      // mas não falhar se não conseguir
      try {
        const { data, error: functionError } = await supabase.functions.invoke('get-product-prices');
        
        if (!functionError && data?.planPrices) {
          setPrices(data.planPrices);
          console.log('Prices fetched successfully:', data.planPrices);
        }
      } catch (err) {
        console.warn('Could not fetch dynamic prices, using hardcoded values:', err);
      }
    } catch (err) {
      console.error('Error in fetchPrices:', err);
      setError('Erro ao buscar preços');
      // Manter preços hardcoded mesmo em caso de erro
      setPrices(HARDCODED_PRICES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  return {
    prices,
    loading,
    error,
    refetch: fetchPrices,
  };
};
