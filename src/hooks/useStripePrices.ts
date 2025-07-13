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

export const useStripePrices = () => {
  const [prices, setPrices] = useState<PlanPrices>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke('get-product-prices');

      if (functionError) {
        console.error('Error fetching prices:', functionError);
        setError('Erro ao buscar preços');
        return;
      }

      if (data?.planPrices) {
        setPrices(data.planPrices);
        console.log('Prices fetched successfully:', data.planPrices);
      }
    } catch (err) {
      console.error('Error fetching prices:', err);
      setError('Erro ao buscar preços');
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