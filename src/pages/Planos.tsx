
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, X } from 'lucide-react';
import SubscriptionPlanCard from '@/components/SubscriptionPlanCard';

const Planos = () => {
  const plans = [
    {
      title: 'Essencial',
      description: 'Ideal para freelancers e pequenos projetos',
      price: 'R$ 49,90',
      productId: 'prod_SfuTlv2mX4TfJe', // Product ID do Stripe para o plano básico
      priceId: 'price_1QWj6DInZ9ScpgFJMHLfxrZR', // Temporário - será substituído por busca dinâmica
      planTier: 'basico' as const,
      features: [
        { text: 'Até 10 propostas por mês', included: true },
        { text: 'Templates básicos', included: true },
        { text: 'Gestão de clientes', included: true },
        { text: 'Suporte por email', included: true },
        { text: 'Analytics básico', included: false },
        { text: 'Templates premium', included: false },
        { text: 'Suporte prioritário', included: false },
      ],
    },
    {
      title: 'Profissional',
      description: 'Para empresas que precisam de mais recursos',
      price: 'R$ 89,90',
      productId: 'prod_SfuTErakRcHMsq', // Product ID do Stripe para o plano profissional
      priceId: 'price_1QWj6fInZ9ScpgFJ8vYNwxDL', // Temporário - será substituído por busca dinâmica
      planTier: 'profissional' as const,
      popular: true,
      features: [
        { text: 'Propostas ilimitadas', included: true },
        { text: 'Templates básicos', included: true },
        { text: 'Templates premium', included: true },
        { text: 'Gestão avançada de clientes', included: true },
        { text: 'Analytics completo', included: true },
        { text: 'Suporte prioritário', included: true },
        { text: 'Colaboração em equipe', included: false },
      ],
    },
    {
      title: 'Equipes',
      description: 'Para equipes que precisam colaborar',
      price: 'R$ 149,90',
      productId: 'prod_SfuTPAmInfb3sD', // Product ID do Stripe para o plano equipes
      priceId: 'price_1QWj6xInZ9ScpgFJvL8cNqhY', // Temporário - será substituído por busca dinâmica
      planTier: 'equipes' as const,
      features: [
        { text: 'Propostas ilimitadas', included: true },
        { text: 'Todos os templates', included: true },
        { text: 'Gestão avançada de clientes', included: true },
        { text: 'Analytics completo', included: true },
        { text: 'Colaboração em equipe', included: true },
        { text: 'Usuários ilimitados', included: true },
        { text: 'Suporte premium 24/7', included: true },
      ],
    },
  ];

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
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <SubscriptionPlanCard
              key={index}
              title={plan.title}
              description={plan.description}
              price={plan.price}
              priceId={plan.priceId}
              planTier={plan.planTier}
              features={plan.features}
              popular={plan.popular}
            />
          ))}
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
                Sim, oferecemos 7 dias de teste gratuito para todos os planos pagos. Você pode experimentar todos os recursos premium sem compromisso.
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planos;
