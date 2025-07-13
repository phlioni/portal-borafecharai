
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  Star, 
  Users, 
  FileText, 
  BarChart3,
  Zap,
  Shield,
  Clock
} from 'lucide-react';

const Planos = () => {
  const plans = [
    {
      id: 'basico',
      name: 'Básico',
      price: 79,
      period: '/mês',
      description: 'Perfeito para freelancers e pequenos negócios',
      popular: false,
      features: [
        { name: '1 usuário', included: true },
        { name: '50 propostas por mês', included: true },
        { name: '3 templates profissionais', included: true },
        { name: 'Rastreamento básico', included: true },
        { name: 'Suporte por email', included: true },
        { name: 'Usuários ilimitados', included: false },
        { name: 'Propostas ilimitadas', included: false },
        { name: 'Analytics avançados', included: false },
        { name: 'Suporte prioritário', included: false },
        { name: 'Dashboard por equipe', included: false }
      ],
      cta: 'Começar Grátis',
      trial: '14 dias grátis'
    },
    {
      id: 'profissional',
      name: 'Profissional',
      price: 149,
      period: '/mês',
      description: 'Ideal para pequenas empresas em crescimento',
      popular: true,
      features: [
        { name: '3 usuários', included: true },
        { name: 'Propostas ilimitadas', included: true },
        { name: '10 templates profissionais', included: true },
        { name: 'Rastreamento avançado', included: true },
        { name: 'Analytics completos', included: true },
        { name: 'Suporte prioritário', included: true },
        { name: 'Personalização de marca', included: true },
        { name: 'Integrações', included: true },
        { name: 'Dashboard por equipe', included: false },
        { name: 'Suporte 24/7', included: false }
      ],
      cta: 'Mais Popular',
      trial: '14 dias grátis'
    },
    {
      id: 'equipes',
      name: 'Equipes',
      price: 299,
      period: '/mês',
      description: 'Para empresas que precisam de controle total',
      popular: false,
      features: [
        { name: '10 usuários', included: true },
        { name: 'Propostas ilimitadas', included: true },
        { name: 'Templates ilimitados', included: true },
        { name: 'Analytics avançados', included: true },
        { name: 'Dashboard por equipe', included: true },
        { name: 'Suporte 24/7', included: true },
        { name: 'API personalizada', included: true },
        { name: 'Treinamento dedicado', included: true },
        { name: 'Gerente de conta', included: true },
        { name: 'SLA garantido', included: true }
      ],
      cta: 'Falar com Vendas',
      trial: '30 dias grátis'
    }
  ];

  const currentPlan = 'trial'; // Simulando plano atual

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Escolha Seu Plano</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Encontre o plano perfeito para suas necessidades. Todos os planos incluem trial gratuito.
        </p>
        
        {/* Current Plan Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-center gap-2 text-blue-800">
            <Clock className="h-5 w-5" />
            <span className="font-medium">Trial Gratuito Ativo</span>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            Restam 12 dias • 8 de 50 propostas utilizadas
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${
              plan.popular 
                ? 'border-blue-500 shadow-lg scale-105 bg-gradient-to-br from-blue-50 to-white' 
                : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-4 py-1 flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Mais Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-gray-600 mb-4">
                {plan.description}
              </CardDescription>
              
              <div className="space-y-2">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">R$ {plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <p className="text-sm text-green-600 font-medium">{plan.trial}</p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Features List */}
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-gray-300 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${
                      feature.included ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button 
                className={`w-full ${
                  plan.popular 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
                size="lg"
              >
                {plan.cta}
              </Button>

              {plan.popular && (
                <p className="text-xs text-center text-gray-500">
                  Mais de 10.000 empresas confiam em nós
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Comparison */}
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Compare Recursos</CardTitle>
            <CardDescription>
              Veja todos os recursos disponíveis em cada plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <Users className="h-5 w-5" />
                  <h3 className="font-semibold">Gestão de Usuários</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Controle de acesso por função</li>
                  <li>• Colaboração em tempo real</li>
                  <li>• Histórico de atividades</li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <BarChart3 className="h-5 w-5" />
                  <h3 className="font-semibold">Analytics Avançados</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Taxa de conversão detalhada</li>
                  <li>• Tempo de visualização</li>
                  <li>• Relatórios personalizados</li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-600">
                  <Shield className="h-5 w-5" />
                  <h3 className="font-semibold">Segurança</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Backup automático</li>
                  <li>• SSL/TLS criptografado</li>
                  <li>• Conformidade LGPD</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Posso cancelar a qualquer momento?</h4>
              <p className="text-sm text-gray-600">
                Sim, você pode cancelar sua assinatura a qualquer momento. Não há contratos de permanência.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Como funciona o trial gratuito?</h4>
              <p className="text-sm text-gray-600">
                Todos os planos incluem um período de teste gratuito com acesso completo aos recursos.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Posso mudar de plano depois?</h4>
              <p className="text-sm text-gray-600">
                Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Há desconto para pagamento anual?</h4>
              <p className="text-sm text-gray-600">
                Sim, oferecemos 20% de desconto para assinaturas anuais em todos os planos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Support */}
      <div className="text-center">
        <Card className="max-w-md mx-auto bg-gray-50">
          <CardContent className="pt-6">
            <Zap className="h-8 w-8 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Precisa de ajuda?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Nossa equipe está pronta para ajudar você a escolher o melhor plano.
            </p>
            <Button variant="outline">
              Falar com Especialista
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Planos;
