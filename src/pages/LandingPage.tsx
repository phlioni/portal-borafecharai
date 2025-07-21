import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, FileText, Eye, Users, BarChart3, Target, MessageSquare, TrendingUp, DollarSign, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
const LandingPage = () => {
  return <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">BoraFecharAI</span>
            </div>
            <div className="flex items-center space-x-4">
              
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link to="/login">Começar Grátis</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100 text-lg px-4 py-2">
              <Gift className="w-5 h-5 mr-2" />
              100% GRATUITO
            </Badge>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Deixe de perder tempo com propostas.{' '}
            <span className="text-blue-600">Foque em fechar mais negócios.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Nossa IA cria propostas que convertem, economizando 90% do seu tempo. 
            Junte-se a PMEs, autônomos e prestadores de serviços que já estão vendendo mais e mais rápido.
            <span className="font-semibold text-green-700"> Completamente grátis!</span>
          </p>

          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6 h-auto mb-6" asChild>
            <Link to="/login">
              Começar Grátis Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center justify-center space-x-4">
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Setup em menos de 5 minutos
              </span>
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Não precisa ser expert em tecnologia
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            Sua rotina de vendas parece com isso?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <Clock className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-700 font-medium">
                  Horas gastas no Word/PDF para cada proposta?
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <Target className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <p className="text-gray-700 font-medium">
                  Insegurança se a proposta parece profissional o suficiente?
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <Users className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <p className="text-gray-700 font-medium">
                  Dificuldade em padronizar o trabalho da equipe?
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <Eye className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <p className="text-gray-700 font-medium">
                  Envia a proposta e fica sem saber se o cliente viu?
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <DollarSign className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-700 font-medium">
                  Paga caro por ferramentas que prometem muito e entregam pouco?
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <TrendingUp className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-700 font-medium">
                  Sente que está em desvantagem contra concorrentes maiores?
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution & Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-20">
          
          {/* Benefit 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Propostas Perfeitas em 2 Minutos
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Nossa inteligência artificial cria documentos profissionais enquanto você toma um café. 
                Ganhe 90% do seu tempo de volta. <span className="font-semibold text-green-700">Sem pagar nada!</span>
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
                <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <div className="text-center text-gray-700">
                  <div className="font-semibold mb-2">Interface de Criação IA</div>
                  <div className="text-sm">Propostas profissionais automatizadas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6">
                  <Eye className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <div className="text-center text-gray-700">
                    <div className="font-semibold mb-2">Rastreamento em Tempo Real</div>
                    <div className="text-sm">Notificações de visualização</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Saiba Exatamente Quando Agir
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Receba notificações quando seu cliente visualizar a proposta e veja quais partes ele mais leu. 
                Faça o follow-up na hora certa. <span className="font-semibold text-green-700">Recursos premium, totalmente grátis!</span>
              </p>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Otimize o que Funciona
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Entenda sua taxa de conversão, desempenho por cliente e melhore seus resultados a cada envio.
                <span className="font-semibold text-green-700"> Analytics profissionais sem custo algum!</span>
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-lg p-6">
                <BarChart3 className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <div className="text-center text-gray-700">
                  <div className="font-semibold mb-2">Dashboard Analytics</div>
                  <div className="text-sm">Relatórios de performance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Differentiator Callout */}
          <div className="bg-green-600 rounded-2xl p-8 text-center text-white">
            <Badge className="mb-4 bg-white text-green-600 hover:bg-white">
              <Gift className="w-4 h-4 mr-2" />
              100% Gratuito
            </Badge>
            <p className="text-lg mb-4">
              Enquanto a concorrência cobra R$200+ por mês, oferecemos a melhor tecnologia de IA 
              para propostas completamente grátis. Sem pegadinhas, sem limitações escondidas.
            </p>
            <p className="text-sm opacity-90">
              Nossa missão é democratizar o acesso a ferramentas profissionais para PMEs, autônomos e prestadores de serviços.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            Milhares de empreendedores já confiam no BoraFecharAI
          </h2>

          <div className="text-center">
            <p className="text-lg text-gray-600 mb-6">Usado por profissionais em segmentos como:</p>
            <div className="flex flex-wrap justify-center items-center gap-6 text-gray-500">
              <span className="px-4 py-2 bg-gray-100 rounded-lg">Advogados</span>
              <span className="px-4 py-2 bg-gray-100 rounded-lg">Agências</span>
              <span className="px-4 py-2 bg-gray-100 rounded-lg">Freelancers</span>
              <span className="px-4 py-2 bg-gray-100 rounded-lg">Prestadores de Serviços</span>
              <span className="px-4 py-2 bg-gray-100 rounded-lg">Fotógrafos</span>
              <span className="px-4 py-2 bg-gray-100 rounded-lg">Clínicas</span>
              <span className="px-4 py-2 bg-gray-100 rounded-lg">Consultores</span>
            </div>
          </div>
        </div>
      </section>

      {/* Free Access Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Comece a vender mais hoje, sem pagar nada.
          </h2>
          
          <p className="text-xl text-gray-600 mb-8">
            Enquanto outras ferramentas cobram centenas de reais por mês, 
            oferecemos acesso completo e gratuito à melhor IA do mercado.
          </p>

          <Card className="max-w-md mx-auto p-8 shadow-lg border-2 border-green-200">
            <CardContent className="p-0">
              <div className="flex items-center justify-center mb-4">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-lg px-4 py-2">
                  <Gift className="w-5 h-5 mr-2" />
                  100% GRATUITO
                </Badge>
              </div>
              
              <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-lg py-6 mb-6" asChild>
                <Link to="/login">
                  Criar Minha Primeira Proposta
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <ul className="space-y-3 text-left text-gray-700">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                  Criação ilimitada de propostas
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                  Rastreamento de visualizações
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                  Analytics completo
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                  Assistente IA 24/7
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                  Download em PDF
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                  Suporte especializado
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="mt-8 space-y-4">
            <p className="text-lg text-gray-600">
              <span className="font-semibold">Plataforma gratuita.</span> Economize centenas de horas 
              e aumente sua conversão em até 67%, sem gastar um centavo.
            </p>
            <p className="text-sm text-gray-500">
              A tecnologia mais avançada, democratizada para o pequeno negócio brasileiro.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Pronto para acelerar suas vendas?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a milhares de empreendedores que já descobriram o poder da IA gratuita.
          </p>
          
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6 h-auto" asChild>
            <Link to="/login">
              Começar Grátis Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">BoraFecharAI</span>
              </div>
              <p className="text-gray-400 text-sm">
                A solução definitiva e gratuita para PMEs e prestadores de serviços criarem propostas inteligentes e acelerar suas vendas.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/login" className="hover:text-white">Começar Grátis</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/termos-de-uso" className="hover:text-white">Termos de Uso</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contato</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <a href="mailto:contato@borafecharai.com" className="hover:text-white">
                    contato@borafecharai.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 BoraFecharAI. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default LandingPage;