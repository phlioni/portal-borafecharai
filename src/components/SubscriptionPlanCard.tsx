
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface SubscriptionPlanCardProps {
  title: string;
  description: string;
  price: string;
  priceId: string;
  productId: string;
  features: PlanFeature[];
  popular?: boolean;
  planTier: 'basico' | 'profissional' | 'equipes';
}

const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  title,
  description,
  price,
  priceId,
  features,
  popular = false,
  planTier,
}) => {
  const { createCheckout, subscribed, subscription_tier } = useSubscription();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const isCurrentPlan = subscribed && subscription_tier === planTier;
  const hasHigherPlan = subscribed && subscription_tier && 
    ['basico', 'profissional', 'equipes'].indexOf(subscription_tier) > 
    ['basico', 'profissional', 'equipes'].indexOf(planTier);

  const handleSubscribe = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      setLoading(true);
      console.log('Creating checkout for:', { priceId, title, planTier });
      await createCheckout(priceId, title);
    } catch (error) {
      console.error('Error creating checkout:', error);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (isCurrentPlan) return 'Plano Atual';
    if (hasHigherPlan) return 'Fazer Downgrade';
    if (subscribed) return 'Alterar Plano';
    return 'Assinar Agora';
  };

  const getButtonVariant = () => {
    if (isCurrentPlan) return 'outline';
    return popular ? 'default' : 'outline';
  };

  return (
    <Card className={`relative h-full flex flex-col w-full max-w-sm mx-auto ${popular ? 'border-blue-600 shadow-lg' : ''} ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}>
      {popular && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-blue-600 text-white px-3 py-1 text-xs">
            <Crown className="w-3 h-3 mr-1" />
            Mais Popular
          </Badge>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-2 right-2 z-10">
          <Badge className="bg-green-600 text-white px-3 py-1 text-xs">
            Seu Plano
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4 px-4 pt-6">
        <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold">{title}</CardTitle>
        <CardDescription className="text-gray-600 text-sm">{description}</CardDescription>
        <div className="mt-4">
          <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{price}</span>
          <span className="text-gray-600 text-sm">/mês</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col px-4 pb-4">
        <div className="space-y-3 flex-1 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                feature.included ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Check className={`w-3 h-3 ${
                  feature.included ? 'text-green-600' : 'text-gray-400'
                }`} />
              </div>
              <span className={`text-sm leading-relaxed ${
                feature.included ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        <Button
          onClick={handleSubscribe}
          disabled={loading || isCurrentPlan}
          variant={getButtonVariant()}
          className="w-full text-sm font-medium py-3 h-auto"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </div>
          ) : (
            getButtonText()
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubscriptionPlanCard;
