
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  Zap, 
  BarChart3, 
  Users, 
  Star,
  Crown,
  Sparkles,
  MessageCircle,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Bora Fechar</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link to="/login">Começar Grátis</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
              🚀 Plataforma em constante evolução
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Crie Propostas 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Profissionais </span>
              em Minutos
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A plataforma completa para PMEs criarem, gerenciarem e enviarem propostas comerciais 
              de forma rápida e profissional, aumentando suas chances de fechar negócios.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/login">
                  Começar Grátis - 20 Propostas
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                <a href="#recursos" className="flex items-center">
                  Ver Demonstração
                  <Zap className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">Centenas</div>
              <div className="text-gray-600">de empresas já testaram</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-gray-600">mais rápido que Word</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">+40%</div>
              <div className="text-gray-600">taxa de conversão</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cansado de Perder Vendas por Propostas Amadoras?
            </h2>
            <p className="text-xl text-gray-600">
              Sabemos como é frustrante...
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 border-red-100 bg-red-50">
              <CardContent className="p-0">
                <div className="text-red-600 text-4xl mb-4">😤</div>
                <h3 className="font-semibold text-gray-900 mb-2">Propostas no Word</h3>
                <p className="text-gray-600">
                  Horas perdidas formatando documentos que ficam com aparência amadora
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 border-orange-100 bg-orange-50">
              <CardContent className="p-0">
                <div className="text-orange-600 text-4xl mb-4">📧</div>
                <h3 className="font-semibold text-gray-900 mb-2">Email Perdido</h3>
                <p className="text-gray-600">
                  Sem saber se o cliente abriu, leu ou está interessado na sua proposta
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 border-yellow-100 bg-yellow-50">
              <CardContent className="p-0">
                <div className="text-yellow-600 text-4xl mb-4">💸</div>
                <h3 className="font-semibold text-gray-900 mb-2">Vendas Perdidas</h3>
                <p className="text-gray-600">
                  Clientes rejeitam propostas mal apresentadas, mesmo com bons serviços
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100">
              ✨ A Solução Completa
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tudo que Você Precisa para Fechar Mais Vendas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa plataforma transforma a forma como você cria e gerencia propostas comerciais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Criação Rápida com IA</h3>
                <p className="text-gray-600">
                  Inteligência artificial gera propostas personalizadas em segundos. 
                  Apenas descreva seu serviço e deixe a IA fazer o resto.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Templates Profissionais</h3>
                <p className="text-gray-600">
                  Designs modernos e elegantes que impressionam clientes. 
                  Escolha entre diferentes estilos ou crie seus próprios templates.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Acompanhamento em Tempo Real</h3>
                <p className="text-gray-600">
                  Saiba exatamente quando o cliente abriu sua proposta e por quanto tempo visualizou. 
                  Dados precisos para follow-up certeiro.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chat Inteligente</h3>
                <p className="text-gray-600">
                  Cliente pode fazer perguntas diretamente na proposta através de um chat com IA, 
                  aumentando o engajamento e esclarecendo dúvidas na hora.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestão de Clientes</h3>
                <p className="text-gray-600">
                  Organize todos seus clientes em um só lugar. 
                  Histórico completo de propostas e interações para cada cliente.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Notificações Telegram</h3>
                <p className="text-gray-600">
                  Receba alertas instantâneos no Telegram quando clientes 
                  visualizam ou respondem suas propostas. Nunca perca uma oportunidade.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Resultados que Nossos Usuários Alcançaram
            </h2>
            <p className="text-xl text-blue-100">
              Veja o impacto real na sua empresa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">95% Mais Rápido</h3>
                  <p className="text-blue-100">
                    Em vez de gastar 2-3 horas no Word, crie propostas profissionais em 5 minutos
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">+40% Taxa de Conversão</h3>
                  <p className="text-blue-100">
                    Propostas profissionais e acompanhamento em tempo real aumentam significativamente as vendas
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">100% Organizado</h3>
                  <p className="text-blue-100">
                    Todos os clientes, propostas e históricos em um só lugar, acessível de qualquer dispositivo
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Follow-up Certeiro</h3>
                  <p className="text-blue-100">
                    Saiba exatamente quando entrar em contato baseado no comportamento do cliente
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
                <div className="text-6xl font-bold text-white mb-4">2x</div>
                <div className="text-xl text-blue-100 mb-2">Mais Vendas</div>
                <div className="text-blue-200">
                  Média de aumento nas vendas dos nossos usuários beta
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              O que Nossos Usuários Beta Estão Dizendo
            </h2>
            <p className="text-xl text-gray-600">
              Feedback real de empresários que testaram nossa plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Incrível como consegui criar propostas profissionais em minutos. 
                  A IA realmente entende meu negócio e cria textos que eu mesmo escreveria."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    M
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900">Maria S.</div>
                    <div className="text-sm text-gray-500">Agência de Marketing</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "O acompanhamento em tempo real mudou meu jogo. Agora sei exatamente 
                  quando fazer o follow-up e minhas vendas aumentaram 50%."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                    J
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900">João P.</div>
                    <div className="text-sm text-gray-500">Consultor TI</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Economizo horas toda semana. Antes gastava uma tarde inteira 
                  fazendo uma proposta no Word, agora faço várias em 30 minutos."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    A
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900">Ana L.</div>
                    <div className="text-sm text-gray-500">Designer Freelancer</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Planos Simples e Transparentes
            </h2>
            <p className="text-xl text-gray-600">
              Escolha o plano ideal para o tamanho da sua empresa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plano Gratuito */}
            <Card className="p-8 border-2 border-gray-200">
              <CardContent className="p-0">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Teste Grátis</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-1">R$ 0</div>
                  <div className="text-gray-500">20 propostas para testar</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>20 propostas gratuitas</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>3 templates profissionais</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Criação com IA</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Acompanhamento básico</span>
                  </li>
                </ul>
                
                <Button className="w-full" size="lg" asChild>
                  <Link to="/login">Começar Grátis</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Plano Profissional */}
            <Card className="p-8 border-2 border-blue-500 relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                Mais Popular
              </Badge>
              <CardContent className="p-0">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Profissional</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-1">R$ 47</div>
                  <div className="text-gray-500">por mês</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Propostas ilimitadas</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Todos os templates + personalizados</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>IA avançada</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Analytics completo</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Chat com cliente</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Notificações Telegram</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Suporte prioritário</span>
                  </li>
                </ul>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg" asChild>
                  <Link to="/login">Começar Agora</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              💡 Comece grátis e faça upgrade quando precisar de mais recursos
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-600">
              Esclarecemos suas principais dúvidas
            </p>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Como funciona o período de teste gratuito?
                </h3>
                <p className="text-gray-600">
                  Você pode criar até 20 propostas completamente grátis, com acesso a todas as funcionalidades básicas. 
                  Não há cobrança automática - você só paga se decidir continuar usando.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  A IA realmente entende meu tipo de negócio?
                </h3>
                <p className="text-gray-600">
                  Sim! Nossa IA foi treinada com milhares de propostas de diferentes setores. 
                  Ela se adapta ao seu ramo de atividade e estilo de comunicação, criando textos personalizados e profissionais.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Posso cancelar a qualquer momento?
                </h3>
                <p className="text-gray-600">
                  Claro! Não há fidelidade. Você pode cancelar sua assinatura a qualquer momento e 
                  continuar usando até o fim do período pago.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Como funciona o acompanhamento das propostas?
                </h3>
                <p className="text-gray-600">
                  Cada proposta tem um link único e seguro. Quando o cliente acessa, você recebe notificação 
                  em tempo real com dados como tempo de visualização, seções mais lidas e se houve interação no chat.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Meus dados estão seguros?
                </h3>
                <p className="text-gray-600">
                  Absolutamente. Utilizamos criptografia de ponta e servidores seguros. 
                  Seus dados e os de seus clientes são protegidos com os mais altos padrões de segurança.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para Dobrar Suas Vendas?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se às centenas de empresários que já estão criando propostas profissionais 
            e fechando mais negócios com nossa plataforma.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6" asChild>
              <Link to="/login">
                Começar Grátis Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6">
              <a href="mailto:contato@borafecharai.com" className="flex items-center">
                Falar com Especialista
                <MessageCircle className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-8 text-blue-200 text-sm">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Sem cartão de crédito
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Suporte brasileiro
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Comece em 2 minutos
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Bora Fechar</span>
              </div>
              <p className="text-gray-400">
                A plataforma completa para PMEs criarem propostas profissionais e fecharem mais vendas.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#recursos" className="hover:text-white">Recursos</a></li>
                <li><Link to="/login" className="hover:text-white">Preços</Link></li>
                <li><Link to="/login" className="hover:text-white">Demonstração</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/termos-de-uso" className="hover:text-white">Termos de Uso</Link></li>
                <li><a href="mailto:contato@borafecharai.com" className="hover:text-white">Contato</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contato</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href="mailto:contato@borafecharai.com" className="hover:text-white">
                    contato@borafecharai.com
                  </a>
                </li>
                <li className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  <span>Suporte via chat</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Bora Fechar. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
