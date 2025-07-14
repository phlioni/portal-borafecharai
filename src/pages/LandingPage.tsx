import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Zap, 
  TrendingUp, 
  Clock, 
  Users, 
  CheckCircle, 
  Star, 
  ArrowRight,
  BarChart3,
  Target,
  Sparkles,
  Shield,
  HeadphonesIcon,
  Smartphone,
  Eye
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: Zap,
      title: "IA Avançada",
      description: "Criação automática de propostas com inteligência artificial em segundos"
    },
    {
      icon: Clock,
      title: "90% Mais Rápido",
      description: "Reduza o tempo de criação de propostas de horas para minutos"
    },
    {
      icon: TrendingUp,
      title: "+65% Conversão",
      description: "Propostas profissionais que aumentam suas chances de fechamento"
    },
    {
      icon: BarChart3,
      title: "Analytics Completo",
      description: "Acompanhe visualizações, status e performance das suas propostas"
    },
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Organize todos seus clientes e histórico em um só lugar"
    },
    {
      icon: Target,
      title: "Templates Profissionais",
      description: "Modelos criados por especialistas para cada tipo de negócio"
    }
  ];

  const benefits = [
    "Propostas criadas em 3 minutos ou menos",
    "Templates para todos os segmentos",
    "Assinatura eletrônica integrada", 
    "Acompanhamento em tempo real",
    "Relatórios de performance",
    "Suporte especializado"
  ];

  const testimonials = [
    {
      name: "Teste Beta",
      company: "Empresa Parceira",
      content: "Estamos testando a plataforma e os resultados iniciais são muito promissores.",
      rating: 5
    },
    {
      name: "Feedback Inicial",
      company: "Cliente Piloto",
      content: "A ferramenta tem um potencial incrível para automatizar nossas propostas.",
      rating: 5
    },
    {
      name: "Avaliação Prévia",
      company: "Empresa Teste",
      content: "Interface intuitiva e funcionalidades que realmente fazem diferença.",
      rating: 5
    }
  ];

  const plans = [
    {
      name: "Essencial",
      price: "R$ 49,90",
      period: "/mês",
      description: "Ideal para freelancers e pequenos negócios",
      features: [
        "Até 10 propostas por mês",
        "IA para criação de textos",
        "Templates básicos",
        "Gestão de clientes",
        "Suporte por email"
      ],
      popular: false
    },
    {
      name: "Profissional",
      price: "R$ 89,90", 
      period: "/mês",
      description: "Para empresas que precisam de mais recursos",
      features: [
        "Propostas ilimitadas",
        "IA avançada",
        "Todos os templates",
        "Analytics completo",
        "Assinatura eletrônica",
        "Suporte prioritário"
      ],
      popular: true
    },
    {
      name: "Equipes",
      price: "R$ 149,90",
      period: "/mês", 
      description: "Para equipes que precisam colaborar",
      features: [
        "Tudo do Profissional",
        "Usuários ilimitados",
        "Colaboração em equipe",
        "Templates personalizados",
        "API integração",
        "Suporte premium 24/7"
      ],
      popular: false
    }
  ];

  const faqs = [
    {
      question: "Como funciona o período de teste gratuito?",
      answer: "Você tem 15 dias gratuitos para testar todas as funcionalidades da plataforma, incluindo IA e templates profissionais. Não é necessário cartão de crédito."
    },
    {
      question: "A IA realmente cria propostas de qualidade?",
      answer: "Sim! Nossa IA foi treinada especificamente para criar propostas comerciais profissionais. Ela analisa seu negócio e gera textos personalizados que convertem."
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer: "Claro! Não há fidelidade. Você pode cancelar sua assinatura a qualquer momento e continuar usando até o final do período pago."
    },
    {
      question: "Como funciona a assinatura eletrônica?",
      answer: "Seus clientes podem assinar as propostas diretamente pela plataforma, com validade jurídica total conforme a Lei 14.063/2020."
    },
    {
      question: "Tem suporte em português?",
      answer: "Sim! Todo nosso suporte é em português, feito por especialistas brasileiros que entendem o mercado nacional."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">BoraFecharAI</h1>
                <p className="text-xs text-gray-600">Propostas Inteligentes</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link to="/login">Começar Grátis</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div className="mb-12 lg:mb-0">
              <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800">
                <Sparkles className="h-3 w-3 mr-1" />
                IA Revolucionária
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Propostas que
                <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text block">
                  fecham negócios
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                A única plataforma com <strong>IA especializada</strong> que cria propostas comerciais 
                profissionais em minutos. Aumente suas vendas em até 65% com textos que convertem.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link to="/login">
                    Começar Teste Grátis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
                  <Link to="#features">Ver Funcionalidades</Link>
                </Button>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  15 dias grátis
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Sem cartão de crédito
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Cancele quando quiser
                </div>
              </div>
            </div>
            
            <div className="lg:pl-8">
              <div className="bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-shadow duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Proposta Comercial</h3>
                    <Badge variant="default" className="bg-green-100 text-green-800">Enviada</Badge>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">Modernização do Site Institucional</h4>
                    <p className="text-sm text-gray-600">Para: Empresa ABC Ltda.</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700 italic">
                      "Proposta criada com IA em 90 segundos. 
                      Cliente aprovou em 24 horas! 🚀"
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-2xl font-bold text-green-600">R$ 15.900</span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Eye className="h-4 w-4 mr-1" />
                      Visualizada 3x
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Cansado de perder vendas por propostas amadoras?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A maioria das PMEs perde negócios porque suas propostas não transmitem profissionalismo
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Muito Tempo Perdido</h3>
                <p className="text-gray-600">Horas criando propostas no Word que ficam desorganizadas</p>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Aparência Amadora</h3>
                <p className="text-gray-600">Propostas mal formatadas que não transmitem confiança</p>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Baixa Conversão</h3>
                <p className="text-gray-600">Clientes não aprovam porque a proposta não convence</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800">
              Funcionalidades
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para vender mais
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma plataforma completa que revoluciona a forma como você cria e envia propostas
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Por que escolher o Bora Fechar Aí?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Uma plataforma moderna desenvolvida para transformar PMEs em máquinas de vendas
              </p>
              
              <div className="grid gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-6 text-center">Benefícios Esperados</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">+50%</div>
                    <div className="text-blue-100">Meta de Aprovação</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">80%</div>
                    <div className="text-blue-100">Economia de Tempo</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">3min</div>
                    <div className="text-blue-100">Para Criar Proposta</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
                    <div className="text-blue-100">Disponibilidade</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Avaliações da versão beta
            </h2>
            <p className="text-xl text-gray-600">
              Feedback inicial dos primeiros usuários que testaram a plataforma
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-4 italic">
                    "{testimonial.content}"
                  </blockquote>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Planos que cabem no seu bolso
            </h2>
            <p className="text-xl text-gray-600">
              Comece grátis e escale conforme sua empresa cresce
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 border-2 shadow-xl scale-105' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Mais Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link to="/login">Começar Teste Grátis</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-600">
              Tudo que você precisa saber sobre o Bora Fechar Aí
            </p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Pronto para revolucionar suas vendas?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se aos primeiros usuários que estão revolucionando suas vendas com o Bora Fechar Aí
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6" asChild>
              <Link to="/login">
                Começar Teste Grátis Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6" asChild>
              <a href="mailto:contato@borafecharai.com">Falar com Especialista</a>
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Dados 100% Seguros
            </div>
            <div className="flex items-center">
              <HeadphonesIcon className="h-4 w-4 mr-2" />
              Suporte Especializado
            </div>
            <div className="flex items-center">
              <Smartphone className="h-4 w-4 mr-2" />
              Acesso em Qualquer Lugar
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-bold">BoraFecharAI</h3>
                  <p className="text-xs text-gray-400">Propostas Inteligentes</p>
                </div>
              </div>
              <p className="text-gray-400">
                A plataforma inteligente para criação de propostas comerciais profissionais.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/login" className="hover:text-white">Funcionalidades</Link></li>
                <li><Link to="/login" className="hover:text-white">Preços</Link></li>
                <li><Link to="/login" className="hover:text-white">Começar Grátis</Link></li>
                <li><a href="mailto:contato@borafecharai.com" className="hover:text-white">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="mailto:contato@borafecharai.com" className="hover:text-white">Sobre</a></li>
                <li><Link to="/login" className="hover:text-white">Cadastrar</Link></li>
                <li><a href="mailto:contato@borafecharai.com" className="hover:text-white">Parcerias</a></li>
                <li><a href="mailto:contato@borafecharai.com" className="hover:text-white">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="mailto:contato@borafecharai.com" className="hover:text-white">Central de Ajuda</a></li>
                <li><Link to="/login" className="hover:text-white">Começar</Link></li>
                <li><Link to="/termos-de-uso" className="hover:text-white">Termos de Uso</Link></li>
                <li><a href="mailto:contato@borafecharai.com" className="hover:text-white">Privacidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 BoraFecharAI. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;