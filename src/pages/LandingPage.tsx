import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, FileText, MessageCircle, Bot, Clock, Sparkles, Eye, Mail, BarChart3, Users, Zap, Download, Bell, TrendingUp, Target, Smartphone, Timer } from 'lucide-react';
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
              <span className="text-xl font-bold text-gray-900">BoraFecharAI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                
              </Button>
              <Button asChild>
                <Link to="/login">Começar Grátis</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-12 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
              🚀 Venda mais rápido com IA
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Propostas Inteligentes 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block sm:inline"> em Minutos</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Acelere suas vendas com propostas profissionais criadas por IA. 
              Acompanhe cada visualização, saiba quando aceitar e ganhe tempo 
              para focar no que importa: vender mais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
                
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto">
                <a href="#recursos" className="flex items-center">
                  Ver Como Funciona
                  <Sparkles className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
            
            {/* Estatísticas rápidas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8 mt-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">2min</div>
                <div className="text-sm sm:text-base text-gray-600">Para criar proposta</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">90%</div>
                <div className="text-sm sm:text-base text-gray-600">Menos tempo gasto</div>
              </div>
              <div className="text-center col-span-2 sm:col-span-1">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">24/7</div>
                <div className="text-sm sm:text-base text-gray-600">Assistente disponível</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona - 2 Formas Inteligentes */}
      <section id="recursos" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              2 Formas Inteligentes de Criar Propostas
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Escolha como prefere trabalhar: pelo Telegram ou direto na plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <Card className="p-6 sm:p-8 hover:shadow-lg transition-shadow border-2 hover:border-green-200">
              <CardContent className="p-0 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Assistente no Telegram</h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  Crie propostas conversando no Telegram. Nosso assistente coleta as informações 
                  e gera uma proposta profissional automaticamente.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center text-green-600 font-medium text-sm sm:text-base">
                    <Clock className="h-4 w-4 mr-2" />
                    Criação em 2 minutos
                  </div>
                  <div className="flex items-center justify-center text-green-600 font-medium text-sm sm:text-base">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Funciona no celular
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 sm:p-8 hover:shadow-lg transition-shadow border-2 hover:border-purple-200">
              <CardContent className="p-0 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Bot className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Chat com IA Integrado</h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  Converse diretamente com nossa IA na plataforma. Descreva seu projeto 
                  e receba uma proposta completa e personalizada.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center text-purple-600 font-medium text-sm sm:text-base">
                    <Sparkles className="h-4 w-4 mr-2" />
                    IA especializada
                  </div>
                  <div className="flex items-center justify-center text-purple-600 font-medium text-sm sm:text-base">
                    <Target className="h-4 w-4 mr-2" />
                    Propostas personalizadas
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Rastreamento e Visibilidade */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Saiba Exatamente o Que Acontece com Suas Propostas
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Acompanhe em tempo real cada interação do cliente com sua proposta
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            <Card className="p-6 hover:shadow-lg transition-shadow text-center">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Visualização em Tempo Real</h3>
                <p className="text-gray-600 text-sm">
                  Receba notificação no momento que o cliente abrir sua proposta
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow text-center">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Status de Aprovação</h3>
                <p className="text-gray-600 text-sm">
                  Saiba instantaneamente se a proposta foi aceita ou rejeitada
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow text-center">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Download className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Download em PDF</h3>
                <p className="text-gray-600 text-sm">
                  Propostas profissionais prontas para download e impressão
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Demonstração visual do rastreamento */}
          
        </div>
      </section>

      {/* Analytics Inteligente */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Analytics que Impulsionam suas Vendas
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Dados inteligentes para você tomar as melhores decisões comerciais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Taxa de Conversão</h3>
                      <p className="text-gray-600 text-sm">
                        Acompanhe quantas propostas são aceitas e identifique padrões de sucesso
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Desempenho por Cliente</h3>
                      <p className="text-gray-600 text-sm">
                        Veja qual tipo de cliente aceita mais suas propostas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Timer className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Tempo de Resposta</h3>
                      <p className="text-gray-600 text-sm">
                        Descubra o melhor momento para fazer follow-up
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                <BarChart3 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Insights Poderosos</h3>
                <div className="space-y-3 text-left max-w-sm mx-auto">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">85%</span>
                    </div>
                    <span className="text-gray-700 text-sm">Taxa de abertura média</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">3.2</span>
                    </div>
                    <span className="text-gray-700 text-sm">Dias para resposta média</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-sm">67%</span>
                    </div>
                    <span className="text-gray-700 text-sm">Taxa de conversão</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ganho de Tempo e Padronização */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ganhe Tempo e Padronize suas Entregas
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Transforme horas de trabalho em minutos e impressione seus clientes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Zap className="h-6 w-6 text-yellow-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Economize 90% do Tempo</h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Pare de gastar horas criando propostas no Word. Nossa IA faz em minutos 
                    o que levaria horas para fazer manualmente.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Sempre Profissional</h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Templates modernos e linguagem comercial adequada. Suas propostas 
                    sempre terão aparência profissional e persuasiva.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Users className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Padronização Total</h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Mantenha consistência em todas as propostas. Sua marca sempre 
                    bem representada, independente de quem criar a proposta.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">8h</div>
                <div className="text-gray-600 text-sm">Tempo tradicional</div>
                <div className="text-xs text-gray-500 mt-1">Pesquisa + redação + formatação</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">15min</div>
                <div className="text-gray-600 text-sm">Com BoraFecharAI</div>
                <div className="text-xs text-gray-500 mt-1">Conversa + geração + envio</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center col-span-2">
                <div className="text-2xl font-bold text-blue-500 mb-2">32x</div>
                <div className="text-gray-600 text-sm">Mais rápido que o método tradicional</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ideal para PMEs e Autônomos */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Feito para PMEs e Profissionais Autônomos
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Uma solução simples e poderosa para quem quer vender mais e crescer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Simples de Usar</h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Não precisa ser expert em tecnologia. Nossa interface é intuitiva 
                    e o assistente te guia em cada passo.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Venda Mais e Mais Rápido</h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Com propostas profissionais criadas em minutos, você pode focar 
                    no que realmente importa: conquistar novos clientes.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Assistente Sempre Disponível</h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    24 horas por dia, 7 dias por semana. Crie propostas quando for 
                    conveniente para você, até mesmo pelo celular.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Acompanhamento Inteligente</h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Saiba exatamente quando fazer follow-up e nunca perca uma 
                    oportunidade de fechamento.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Acelere Suas Vendas Hoje</h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  Junte-se a centenas de empresários que já descobriram como 
                  vender mais com propostas inteligentes
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-center text-green-600 font-medium text-sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Setup em menos de 5 minutos
                  </div>
                  <div className="flex items-center justify-center text-blue-600 font-medium text-sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Suporte especializado
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Pare de Perder Tempo e Comece a Vender Mais
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-8">
            Crie sua primeira proposta inteligente em menos de 2 minutos. 
            Teste grátis e veja a diferença que a IA pode fazer no seu negócio.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 h-auto" asChild>
              <Link to="/login">
                Criar Minha Primeira Proposta
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 text-blue-200 text-sm max-w-2xl mx-auto">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              20 propostas gratuitas
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Sem cartão de crédito
            </div>
            <div className="flex items-center justify-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Resultados imediatos
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
                <span className="text-xl font-bold">BoraFecharAI</span>
              </div>
              <p className="text-gray-400 text-sm">
                A solução definitiva para PMEs criarem propostas inteligentes e acelerar suas vendas.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#recursos" className="hover:text-white">Como Funciona</a></li>
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
                  <Mail className="h-4 w-4 mr-2" />
                  <a href="mailto:contato@borafecharai.com" className="hover:text-white">
                    contato@borafecharai.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BoraFecharAI. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
