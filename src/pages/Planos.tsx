import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, MessageCircle, BarChart3, Bot, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useStripePrices } from '@/hooks/useStripePrices';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Planos = () => {
  const { user } = useAuth();
  const { subscribed, subscription_tier, loading: subscriptionLoading } = useSubscription();
  const { prices, loading: pricesLoading } = useStripePrices();
  const navigate = useNavigate();
  const [isCreatingCheckout, setIsCreatingCheckout] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsCreatingCheckout(priceId);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsCreatingCheckout(null);
    }
  };

  const plans = [
    {
      name: 'Essencial',
      description: 'Permite uso do chat com IA e do bot do Telegram com limite de 20 propostas/mês',
      priceId: prices?.basico?.priceId,
      features: [
        'Chat com IA para criação de propostas',
        'Bot do Telegram integrado',
        'Até 20 propostas por mês',
        'Templates profissionais',
        'Suporte por email'
      ],
      icon: <Sparkles className="h-6 w-6" />,
      gradient: 'from-blue-500 to-cyan-500',
      popular: false
    },
    {
      name: 'Professional',
      description: 'Inclui tudo do Essencial, com número ilimitado de propostas, acesso ao Analytics e uso do chat com IA e do bot do Telegram',
      priceId: prices?.profissional?.priceId,
      features: [
        'Tudo do plano Essencial',
        'Propostas ilimitadas',
        'Analytics avançado',
        'Chat com IA avançado',
        'Bot do Telegram premium',
        'Suporte prioritário',
        'Relatórios detalhados'
      ],
      icon: <Crown className="h-6 w-6" />,
      gradient: 'from-purple-500 to-pink-500',
      popular: true
    }
  ];

  if (subscriptionLoading || pricesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha o plano ideal para seu negócio
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Crie propostas profissionais com inteligência artificial e feche mais negócios
          </p>
        </div>

        {/* Status atual */}
        {user && (
          <div className="text-center mb-8">
            <Badge variant={subscribed ? "default" : "secondary"} className="text-sm">
              {subscribed 
                ? `Plano ativo: ${subscription_tier === 'basico' ? 'Essencial' : 'Professional'}`
                : 'Período de teste ativo'
              }
            </Badge>
          </div>
        )}

        {/* Planos */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative shadow-lg transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    Mais Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`mx-auto w-12 h-12 rounded-lg bg-gradient-to-r ${plan.gradient} flex items-center justify-center text-white mb-4`}>
                  {plan.icon}
                </div>
                
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>
                
                <div className="text-center py-4">
                  {plan.priceId ? (
                    <div>
                      <span className="text-3xl font-bold">
                        R$ {plan.name === 'Essencial' ? '29' : '79'}
                      </span>
                      <span className="text-gray-600">/mês</span>
                    </div>
                  ) : (
                    <div className="text-gray-500">Carregando preço...</div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  {subscribed && subscription_tier === (plan.name === 'Essencial' ? 'basico' : 'profissional') ? (
                    <Button className="w-full" disabled>
                      Plano Atual
                    </Button>
                  ) : (
                    <Button
                      className={`w-full ${plan.popular ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' : ''}`}
                      onClick={() => plan.priceId && handleSubscribe(plan.priceId, plan.name)}
                      disabled={!plan.priceId || isCreatingCheckout === plan.priceId}
                    >
                      {isCreatingCheckout === plan.priceId ? (
                        'Processando...'
                      ) : subscribed ? (
                        'Fazer Upgrade'
                      ) : (
                        'Começar Agora'
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recursos destacados */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Recursos que fazem a diferença
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Chat com IA</h3>
              <p className="text-gray-600 text-sm">
                Converse com nossa IA e crie propostas profissionais em minutos
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Bot do Telegram</h3>
              <p className="text-gray-600 text-sm">
                Crie propostas direto do Telegram e receba notificações em tempo real
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm">
                Acompanhe o desempenho das suas propostas com relatórios detalhados
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Ainda tem dúvidas? Entre em contato conosco!
          </p>
          <Button variant="outline" asChild>
            <a href="mailto:contato@borafecharai.com">
              Falar com Suporte
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Planos;
