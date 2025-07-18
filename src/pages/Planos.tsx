
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, X } from 'lucide-react';
import SubscriptionPlanCard from '@/components/SubscriptionPlanCard';
import { useStripePrices } from '@/hooks/useStripePrices';
import { ModernLoader } from '@/components/ModernLoader';

const Planos = () => {
  const { prices, loading, error } = useStripePrices();

  const getPlansWithRealPrices = () => {
    const basePlans = [
      {
        title: 'Essencial',
        description: 'Ideal para freelancers e pequenos projetos',
        price: 'R$ 39,90',
        productId: 'prod_SfuTlv2mX4TfJe',
        planTier: 'basico' as const,
        features: [
          { text: 'Até 15 propostas por mês', included: true },
          { text: 'Chat com IA para criação de propostas', included: true },
          { text: 'Bot do Telegram para consultas', included: true },
          { text: 'Gestão de clientes', included: true },
          { text: 'Suporte por email', included: true },
          { text: 'Analytics completo', included: false },
          { text: 'Propostas ilimitadas', included: false },
        ],
      },
      {
        title: 'Professional',
        description: 'Para empresas que precisam de mais recursos',
        price: 'R$ 79,90',
        productId: 'prod_SfuTErakRcHMsq',
        planTier: 'profissional' as const,
        popular: true,
        features: [
          { text: 'Propostas ilimitadas', included: true },
          { text: 'Chat com IA para criação avançada', included: true },
          { text: 'Bot do Telegram com recursos completos', included: true },
          { text: 'Gestão avançada de clientes', included: true },
          { text: 'Analytics completo', included: true },
          { text: 'Suporte prioritário', included: true },
          { text: 'Colaboração em equipe', included: false },
        ],
      },
    ];

    // Adicionar os price IDs reais se disponíveis
    return basePlans.map(plan => ({
      ...plan,
      priceId: prices[plan.planTier]?.priceId || 'loading...'
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <ModernLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar planos</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const plans = getPlansWithRealPrices();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao início
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha o Plano Ideal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Selecione o plano que melhor se adapta às suas necessidades e comece a criar propostas profissionais hoje mesmo.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <SubscriptionPlanCard
              key={index}
              title={plan.title}
              description={plan.description}
              price={plan.price}
              priceId={plan.priceId}
              productId={plan.productId}
              planTier={plan.planTier}
              features={plan.features}
              popular={plan.popular}
            />
          ))}
        </div>

        {/* Trial Info */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              🎉 Teste Gratuito de 15 Dias
            </h3>
            <p className="text-green-700">
              Experimente todos os recursos premium gratuitamente por 15 dias com até 20 propostas incluídas!
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Perguntas Frequentes
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">
                Posso cancelar minha assinatura a qualquer momento?
              </h3>
              <p className="text-gray-600">
                Sim, você pode cancelar sua assinatura a qualquer momento através do portal do cliente. Você continuará tendo acesso aos recursos premium até o final do período pago.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">
                Existe período de teste gratuito?
              </h3>
              <p className="text-gray-600">
                Sim, oferecemos 15 dias de teste gratuito para todos os planos pagos com até 20 propostas incluídas. Você pode experimentar todos os recursos premium sem compromisso.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">
                Posso alterar meu plano depois?
              </h3>
              <p className="text-gray-600">
                Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As alterações serão aplicadas no próximo ciclo de cobrança.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">
                Qual a diferença entre os planos?
              </h3>
              <p className="text-gray-600">
                O plano Essencial oferece até 15 propostas mensais, acesso ao chat com IA e bot do Telegram. O Professional inclui propostas ilimitadas, chat com IA avançado, analytics completo e suporte prioritário.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planos;
