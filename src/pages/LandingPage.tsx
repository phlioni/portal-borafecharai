
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  Zap, 
  BarChart3, 
  MessageCircle,
  Mail,
  Bot,
  Clock,
  Target,
  TrendingUp,
  Eye,
  Users,
  Settings,
  Sparkles,
  Send
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
              🚀 Acelere suas vendas
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Propostas Profissionais 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> em Minutos</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A ferramenta definitiva para PMEs e autônomos criarem propostas comerciais 
              impressionantes através de 3 canais inteligentes: Chat IA, Telegram e Interface Manual.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/login">
                  Teste Grátis - 20 Propostas
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                <a href="#recursos" className="flex items-center">
                  Conhecer Recursos
                  <Sparkles className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Canais Principais */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              3 Formas Inteligentes de Criar Propostas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Escolha o canal que melhor se adapta ao seu momento e acelere a entrega das suas propostas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
              <CardContent className="p-0 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Telegram</h3>
                <p className="text-gray-600 mb-6">
                  Crie propostas diretamente pelo Telegram, onde você está todos os dias. 
                  Rápido, prático e sem sair do aplicativo.
                </p>
                <div className="flex items-center justify-center text-green-600 font-medium">
                  <Clock className="h-4 w-4 mr-2" />
                  Criação em 2 minutos
                </div>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-2 hover:border-purple-200">
              <CardContent className="p-0 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Bot className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Chat IA</h3>
                <p className="text-gray-600 mb-6">
                  Converse com nossa IA e descreva seu projeto. Ela cria a proposta 
                  completa com linguagem profissional adaptada ao seu negócio.
                </p>
                <div className="flex items-center justify-center text-purple-600 font-medium">
                  <Sparkles className="h-4 w-4 mr-2" />
                  IA especializada
                </div>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
              <CardContent className="p-0 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Settings className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Interface Manual</h3>
                <p className="text-gray-600 mb-6">
                  Para quem prefere controle total. Interface intuitiva com templates 
                  profissionais e personalização completa.
                </p>
                <div className="flex items-center justify-center text-blue-600 font-medium">
                  <Target className="h-4 w-4 mr-2" />
                  Controle total
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recursos Principais */}
      <section id="recursos" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Recursos que Fazem a Diferença
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tudo que você precisa para profissionalizar suas propostas e aumentar suas vendas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Inteligente</h3>
                    <p className="text-gray-600">
                      Veja quando o cliente abriu sua proposta, quanto tempo leu cada seção 
                      e identifique o melhor momento para fazer o follow-up.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Personalizado</h3>
                    <p className="text-gray-600">
                      Configure templates de email personalizados com sua assinatura 
                      e mensagem específica para cada tipo de cliente.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Acompanhamento em Tempo Real</h3>
                    <p className="text-gray-600">
                      Receba notificações instantâneas quando o cliente visualizar 
                      sua proposta. Nunca perca o timing certo para fechar o negócio.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestão de Clientes</h3>
                    <p className="text-gray-600">
                      Mantenha todo histórico de propostas organizadas por cliente. 
                      Controle total sobre seus negócios em um só lugar.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefícios para PMEs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Feito para PMEs e Autônomos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Entendemos os desafios únicos de pequenas empresas e profissionais independentes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Economize Tempo Valioso</h3>
                  <p className="text-gray-600">
                    Pare de gastar horas no Word. Crie propostas profissionais em minutos 
                    e foque no que realmente importa: seus clientes.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Aparência Profissional</h3>
                  <p className="text-gray-600">
                    Templates modernos que transmitem credibilidade e seriedade, 
                    mesmo para negócios que estão começando.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Preço Acessível</h3>
                  <p className="text-gray-600">
                    Solução pensada para o orçamento de pequenas empresas, 
                    com resultado de grandes corporações.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Organização Completa</h3>
                  <p className="text-gray-600">
                    Controle total sobre suas propostas, clientes e histórico de vendas. 
                    Tudo organizado e acessível.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                <TrendingUp className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Acelere Suas Vendas</h3>
                <p className="text-gray-600">
                  Propostas mais rápidas, profissionais e organizadas = mais tempo para vender
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comece Gratuitamente
            </h2>
            <p className="text-xl text-gray-600">
              Teste nossa solução sem compromisso
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
                    <span>3 canais de criação</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Templates profissionais</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Analytics básico</span>
                  </li>
                </ul>
                
                <Button className="w-full" size="lg" asChild>
                  <Link to="/login">Começar Agora</Link>
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
                    <span>Todos os canais + IA avançada</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Analytics completo</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Email personalizado</span>
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
                  <Link to="/login">Começar Grátis</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              💡 Teste grátis primeiro, faça upgrade quando precisar de mais recursos
            </p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Transforme Sua Forma de Criar Propostas
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se aos empresários que já descobriram como criar propostas profissionais 
            em minutos e acelerar suas vendas.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6" asChild>
              <Link to="/login">
                Teste Grátis - 20 Propostas
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-8 text-blue-200 text-sm">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Sem cartão de crédito
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Setup em 2 minutos
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Suporte brasileiro
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
                A ferramenta definitiva para PMEs criarem propostas profissionais e acelerarem suas vendas.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#recursos" className="hover:text-white">Recursos</a></li>
                <li><Link to="/login" className="hover:text-white">Preços</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/termos-de-uso" className="hover:text-white">Termos de Uso</Link></li>
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
