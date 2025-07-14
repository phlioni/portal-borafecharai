
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  CreditCard, 
  Bot, 
  Crown,
  MessageCircle,
  Sparkles,
  BarChart3,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import SubscriptionPlanCard from '@/components/SubscriptionPlanCard';
import { Link } from 'react-router-dom';

const ConfiguracoesPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'perfil';
  const { user } = useAuth();
  const { isAdmin } = useUserPermissions();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
          <p className="text-gray-600">Gerencie sua conta e preferências</p>
        </div>

        <Tabs defaultValue={initialTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="planos" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Planos
            </TabsTrigger>
            <TabsTrigger value="integrações" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Integrações
            </TabsTrigger>
            <TabsTrigger value="telegram" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Telegram
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Conta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="default">Ativo</Badge>
                      {isAdmin && <Badge variant="secondary">Admin</Badge>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planos" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Escolha o Plano Ideal
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Desbloqueie todo o potencial da plataforma com recursos avançados 
                para aumentar suas vendas e produtividade.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Plano Básico */}
              <SubscriptionPlanCard
                planId="basico"
                title="Básico"
                price="R$ 27"
                period="por mês"
                description="Ideal para freelancers e pequenos negócios"
                features={[
                  "10 propostas por mês",
                  "3 templates profissionais",
                  "Criação com IA",
                  "Acompanhamento básico",
                  "Suporte por email"
                ]}
                buttonText="Escolher Básico"
                popular={false}
              />

              {/* Plano Profissional */}
              <SubscriptionPlanCard
                planId="profissional"
                title="Profissional"
                price="R$ 47"
                period="por mês"
                description="Para empresas que querem crescer"
                features={[
                  "Propostas ilimitadas",
                  "Templates personalizados",
                  "IA avançada",
                  "Analytics completo",
                  "Chat com cliente",
                  "Notificações Telegram",
                  "Suporte prioritário"
                ]}
                buttonText="Escolher Profissional"
                popular={true}
                highlight={
                  <div className="flex items-center gap-2 text-blue-600 mb-4">
                    <Crown className="h-4 w-4" />
                    <span className="text-sm font-medium">Mais Popular</span>
                  </div>
                }
              />
            </div>

            {/* Recursos Detalhados */}
            <div className="mt-12">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                Compare os Recursos
              </h3>
              
              <Card>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Recurso</th>
                          <th className="text-center py-3 px-4">Teste Grátis</th>
                          <th className="text-center py-3 px-4">Básico</th>
                          <th className="text-center py-3 px-4">Profissional</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        <tr className="border-b">
                          <td className="py-3 px-4">Número de propostas</td>
                          <td className="text-center py-3 px-4">20 (trial)</td>
                          <td className="text-center py-3 px-4">10/mês</td>
                          <td className="text-center py-3 px-4">Ilimitadas</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">Templates disponíveis</td>
                          <td className="text-center py-3 px-4">3 básicos</td>
                          <td className="text-center py-3 px-4">3 profissionais</td>
                          <td className="text-center py-3 px-4">Todos + Personalizados</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">Criação com IA</td>
                          <td className="text-center py-3 px-4"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                          <td className="text-center py-3 px-4"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                          <td className="text-center py-3 px-4"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">Analytics avançado</td>
                          <td className="text-center py-3 px-4">-</td>
                          <td className="text-center py-3 px-4">-</td>
                          <td className="text-center py-3 px-4"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">Chat com cliente</td>
                          <td className="text-center py-3 px-4">-</td>
                          <td className="text-center py-3 px-4">-</td>
                          <td className="text-center py-3 px-4"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">Templates personalizados</td>
                          <td className="text-center py-3 px-4">-</td>
                          <td className="text-center py-3 px-4">-</td>
                          <td className="text-center py-3 px-4"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4">Notificações Telegram</td>
                          <td className="text-center py-3 px-4">-</td>
                          <td className="text-center py-3 px-4">-</td>
                          <td className="text-center py-3 px-4"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA para Templates Personalizados */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Templates Personalizados</h3>
                      <p className="text-gray-600">Crie templates únicos com IA para destacar sua marca</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                    <Link to="/templates-personalizados">
                      Explorar
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrações" className="space-y-6">
            {isAdmin ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                      Bot do Telegram
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Configure o bot do Telegram para receber notificações em tempo real 
                      sobre suas propostas.
                    </p>
                    <Button asChild>
                      <Link to="/telegram-bot">
                        <Bot className="h-4 w-4 mr-2" />
                        Configurar Bot
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      Analytics Avançado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Acompanhe métricas detalhadas de desempenho das suas propostas 
                      e otimize seus resultados.
                    </p>
                    <Button variant="outline" disabled>
                      Em Breve
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="text-center py-12">
                  <Crown className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-orange-900 mb-2">
                    Integrações Disponíveis nos Planos Pagos
                  </h3>
                  <p className="text-orange-700 mb-6">
                    Desbloqueie integrações poderosas para automatizar seu fluxo de trabalho.
                  </p>
                  <Button asChild className="bg-orange-600 hover:bg-orange-700">
                    <Link to="/configuracoes?tab=planos">
                      <Crown className="h-4 w-4 mr-2" />
                      Ver Planos
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="telegram" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  {isAdmin ? 'Configurar Bot do Telegram' : 'Como usar o Bot do Telegram'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {isAdmin 
                    ? 'Configure o bot do Telegram para receber notificações em tempo real sobre suas propostas.'
                    : 'O bot do Telegram permite que você receba notificações instantâneas sobre suas propostas.'
                  }
                </p>
                <Button asChild>
                  <Link to="/telegram-bot">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {isAdmin ? 'Configurar Bot' : 'Ver Como Usar'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ConfiguracoesPage;
