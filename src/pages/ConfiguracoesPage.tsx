
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  CreditCard, 
  Bot, 
  Crown,
  MessageCircle,
  Sparkles,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Building2,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import SubscriptionPlanCard from '@/components/SubscriptionPlanCard';
import { Link } from 'react-router-dom';

const ConfiguracoesPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'negocio';
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
            <TabsTrigger value="negocio" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Meu Negócio
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

          <TabsContent value="negocio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informações do Negócio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-name">Nome da Empresa</Label>
                    <Input id="company-name" placeholder="Digite o nome da sua empresa" />
                  </div>
                  <div>
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input id="cnpj" placeholder="00.000.000/0000-00" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">E-mail Comercial</Label>
                    <Input id="email" type="email" placeholder="contato@empresa.com" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone/WhatsApp</Label>
                    <Input id="phone" placeholder="(11) 99999-9999" />
                    <p className="text-xs text-gray-500 mt-1">
                      ⚠️ Importante: Este número é usado pelo bot do Telegram para identificar sua conta
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" placeholder="https://www.empresa.com" />
                </div>

                <div>
                  <Label htmlFor="description">Descrição do Negócio</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Descreva brevemente seu negócio e principais serviços"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" placeholder="São Paulo" />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input id="state" placeholder="SP" />
                  </div>
                  <div>
                    <Label htmlFor="cep">CEP</Label>
                    <Input id="cep" placeholder="00000-000" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Input id="address" placeholder="Rua, Número, Bairro" />
                </div>

                <Button>
                  Salvar Informações
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conta do Usuário</CardTitle>
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
              {/* Plano Essencial */}
              <SubscriptionPlanCard
                title="Essencial"
                description="Ideal para freelancers e pequenos negócios"
                price="R$ 39,90"
                priceId="price_basic"
                productId="prod_basic"
                planTier="basico"
                features={[
                  { text: "10 propostas por mês", included: true },
                  { text: "3 templates profissionais", included: true },
                  { text: "Criação com IA", included: true },
                  { text: "Acompanhamento básico", included: true },
                  { text: "Suporte por email", included: true }
                ]}
                popular={false}
              />

              {/* Plano Profissional */}
              <SubscriptionPlanCard
                title="Profissional"
                description="Para empresas que querem crescer"
                price="R$ 79,90"
                priceId="price_professional"
                productId="prod_professional"
                planTier="profissional"
                features={[
                  { text: "Propostas ilimitadas", included: true },
                  { text: "Templates personalizados", included: true },
                  { text: "IA avançada", included: true },
                  { text: "Analytics completo", included: true },
                  { text: "Chat com cliente", included: true },
                  { text: "Bot do Telegram", included: true },
                  { text: "Suporte prioritário", included: true }
                ]}
                popular={true}
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
                          <th className="text-center py-3 px-4">Essencial</th>
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
                          <td className="py-3 px-4">Bot do Telegram</td>
                          <td className="text-center py-3 px-4">-</td>
                          <td className="text-center py-3 px-4">-</td>
                          <td className="text-center py-3 px-4"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4">Templates personalizados</td>
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
