import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-PRODUCT-PRICES] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });

    // Product IDs fornecidos pelo usuário
    const productMap = {
      'prod_SfuTlv2mX4TfJe': 'basico',     // Essencial
      'prod_SfuTErakRcHMsq': 'profissional', // Professional  
      'prod_SfuTPAmInfb3sD': 'equipes'     // Equipe
    };

    const planPrices: Record<string, { priceId: string; amount: number; currency: string; productId: string }> = {};

    // Buscar preços para cada produto
    for (const [productId, planTier] of Object.entries(productMap)) {
      logStep("Fetching prices for product", { productId, planTier });
      
      const prices = await stripe.prices.list({
        product: productId,
        active: true,
        type: 'recurring',
        limit: 10
      });

      logStep("Found prices", { productId, count: prices.data.length });

      if (prices.data.length > 0) {
        // Pegar o primeiro preço ativo encontrado
        const price = prices.data[0];
        planPrices[planTier] = {
          priceId: price.id,
          amount: price.unit_amount || 0,
          currency: price.currency,
          productId: productId
        };
        logStep("Price found", { planTier, priceId: price.id, amount: price.unit_amount });
      } else {
        logStep("No price found for product", { productId, planTier });
      }
    }

    logStep("All prices fetched", { planPrices });

    return new Response(JSON.stringify({ planPrices }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in get-product-prices", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});