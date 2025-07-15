import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Building, CreditCard, Users, MessageSquare, Crown, Check, User, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useSubscription } from '@/hooks/useSubscription';
import { useCompanies, useUpdateCompany, useCreateCompany } from '@/hooks/useCompanies';
import CompanyLogoUpload from '@/components/CompanyLogoUpload';
import { toast } from 'sonner';
import GerenciamentoUsuariosPage from './GerenciamentoUsuariosPage';
import TelegramBotUserGuide from '@/components/TelegramBotUserGuide';
import TelegramBotPage from './TelegramBotPage';
import ProfileTab from '@/components/ProfileTab';
import EmailTemplateSettings from '@/components/EmailTemplateSettings';
import { useIsMobile } from '@/hooks/use-mobile';

const ConfiguracoesPage = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserPermissions();
  const subscription = useSubscription();
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const updateCompanyMutation = useUpdateCompany();
  const createCompanyMutation = useCreateCompany();
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState('perfil');
  const [companyData, setCompanyData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    cnpj: '',
    website: '',
    description: '',
    logo_url: '',
    country_code: '+55'
  });

  const company = companies?.[0];
  const isProfessional = subscription.subscription_tier === 'professional' || isAdmin;

  useEffect(() => {
    console.log('ConfiguracoesPage - companies:', companies);
    console.log('ConfiguracoesPage - company:', company);

    if (company) {
      setCompanyData({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        city: company.city || '',
        state: company.state || '',
        zip_code: company.zip_code || '',
        cnpj: company.cnpj || '',
        website: company.website || '',
        description: company.description || '',
        logo_url: company.logo_url || '',
        country_code: company.country_code || '+55'
      });
    } else if (user && !companiesLoading) {
      setCompanyData(prev => ({
        ...prev,
        email: user.email || '',
        name: 'Minha Empresa'
      }));
    }
  }, [company, user, companiesLoading]);

  const handleInputChange = (field: string, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    console.log('Saving company data:', companyData);

    try {
      if (company) {
        await updateCompanyMutation.mutateAsync({
          id: company.id,
          updates: companyData
        });
      } else {
        await createCompanyMutation.mutateAsync(companyData);
      }
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
    }
  };

  const handleLogoUpdate = (logoUrl: string | null) => {
    setCompanyData(prev => ({ ...prev, logo_url: logoUrl || '' }));
  };

  const handleSubscribe = async (priceId: string, planName: string) => {
    try {
      await subscription.createCheckout(priceId, planName);
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
    }
  };

  // Planos atualizados para ficar igual à página /planos
  const plans = [
    {
      name: 'Essencial',
      description: 'Ideal para freelancers e pequenos projetos',
      price: 'R$ 39,90',
      priceId: 'price_1RktM2IjvuQQ47SwvTDKabRJ',
      currency: 'BRL',
      features: [
        'Até 10 propostas por mês',
        'Chat com IA para criação de propostas',
        'Bot do Telegram para consultas',
        'Gestão de clientes',
        'Suporte por email'
      ],
      buttonText: subscription.subscription_tier === 'basico' ? 'Plano Atual' : 'Assinar Agora',
      current: subscription.subscription_tier === 'basico',
      popular: false
    },
    {
      name: 'Professional',
      description: 'Para empresas que precisam de mais recursos',
      price: 'R$ 79,90',
      currency: 'BRL',
      priceId: 'price_1RktMUIjvuQQ47Swctsuavr9',
      features: [
        'Propostas ilimitadas',
        'Chat com IA para criação avançada',
        'Bot do Telegram com recursos completos',
        'Gestão avançada de clientes',
        'Analytics completo',
        'Suporte prioritário'
      ],
      buttonText: subscription.subscription_tier === 'professional' ? 'Plano Atual' : 'Assinar Agora',
      current: subscription.subscription_tier === 'professional',
      popular: true
    }
  ];

  if (companiesLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas configurações e preferências</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Tabs principais sempre visíveis */}
          <TabsList className="grid w-full grid-cols-2 h-auto p-1">
            <TabsTrigger 
              value="perfil" 
              className="flex flex-col items-center gap-1 p-3 text-xs"
            >
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger 
              value="negocio" 
              className="flex flex-col items-center gap-1 p-3 text-xs"
            >
              <Building className="h-4 w-4" />
              Negócio
            </TabsTrigger>
          </TabsList>

          {/* Tabs secundárias */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={activeTab === 'email' ? 'default' : 'outline'}
              className="flex items-center justify-center gap-2 p-3"
              onClick={() => setActiveTab('email')}
            >
              <Mail className="h-4 w-4" />
              <span className="text-xs">Email</span>
            </Button>
            <Button
              variant={activeTab === 'planos' ? 'default' : 'outline'}
              className="flex items-center justify-center gap-2 p-3"
              onClick={() => setActiveTab('planos')}
            >
              <CreditCard className="h-4 w-4" />
              <span className="text-xs">Planos</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={activeTab === 'telegram' ? 'default' : 'outline'}
              className="flex items-center justify-center gap-2 p-3"
              onClick={() => setActiveTab('telegram')}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs">Bot Telegram</span>
            </Button>
            {isAdmin && (
              <Button
                variant={activeTab === 'admin' ? 'default' : 'outline'}
                className="flex items-center justify-center gap-2 p-3"
                onClick={() => setActiveTab('admin')}
              >
                <Users className="h-4 w-4" />
                <span className="text-xs">Admin</span>
              </Button>
            )}
          </div>

          <TabsContent value="perfil" className="mt-4">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="negocio" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
                <CardDescription>Configure os dados da sua empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <CompanyLogoUpload
                    currentLogoUrl={companyData.logo_url}
                    onLogoUpdate={handleLogoUpdate}
                  />

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="name">Nome da Empresa</Label>
                      <Input
                        id="name"
                        value={companyData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Digite o nome da empresa"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={companyData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="contato@empresa.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={companyData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="55+DDD+Número (ex: 5511999999999)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        value={companyData.cnpj}
                        onChange={(e) => handleInputChange('cnpj', e.target.value)}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={companyData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://www.empresa.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={companyData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="São Paulo"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={companyData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Rua, número, bairro"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={companyData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Descreva sua empresa..."
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={updateCompanyMutation.isPending || createCompanyMutation.isPending}
                    className="w-full"
                  >
                    {(updateCompanyMutation.isPending || createCompanyMutation.isPending) ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="mt-4">
            <EmailTemplateSettings />
          </TabsContent>

          <TabsContent value="planos" className="mt-4">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">Escolha seu Plano</h2>
                <p className="text-muted-foreground">Selecione o plano que melhor atende às suas necessidades</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {plans.map((plan) => (
                  <Card key={plan.name} className={`relative ${plan.popular ? 'border-blue-600 shadow-lg' : ''} ${plan.current ? 'ring-2 ring-green-500' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          Mais Popular
                        </span>
                      </div>
                    )}
                    {plan.current && (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Plano Atual
                        </span>
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription className="text-sm text-gray-600">{plan.description}</CardDescription>
                      <div className="text-2xl font-bold text-blue-600">{plan.price}</div>
                      <CardDescription>por mês</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => handleSubscribe(plan.priceId, plan.name)}
                        disabled={plan.current || subscription.loading}
                        variant={plan.current ? 'outline' : plan.popular ? 'default' : 'outline'}
                        className="w-full"
                      >
                        {plan.buttonText}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Trial Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  🎉 Teste Gratuito de 15 Dias
                </h3>
                <p className="text-green-700 text-sm">
                  Experimente todos os recursos premium gratuitamente por 15 dias com até 20 propostas incluídas!
                </p>
              </div>

              {isProfessional && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-500" />
                      Recursos Avançados
                    </CardTitle>
                    <CardDescription>Disponível apenas no plano Professional</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-semibold mb-2">Analytics Avançadas</h3>
                          <p className="text-sm text-muted-foreground">Relatórios detalhados sobre suas propostas</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-semibold mb-2">Bot Telegram</h3>
                          <p className="text-sm text-muted-foreground">Automatize seu atendimento via Telegram</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="telegram" className="mt-4">
            {isAdmin ? (
              <TelegramBotPage />
            ) : (
              <TelegramBotUserGuide />
            )}
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin" className="mt-4">
              <GerenciamentoUsuariosPage />
            </TabsContent>
          )}
        </Tabs>
      </div>
    );
  }

  // Versão desktop original
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas configurações e preferências</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-6' : 'grid-cols-5'}`}>
          <TabsTrigger value="perfil" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="negocio" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Meu Negócio
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Templates Email
          </TabsTrigger>
          <TabsTrigger value="planos" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Planos
          </TabsTrigger>
          <TabsTrigger value="telegram" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Bot Telegram
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Admin
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="perfil">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="negocio">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>Configure os dados da sua empresa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <CompanyLogoUpload
                  currentLogoUrl={companyData.logo_url}
                  onLogoUpdate={handleLogoUpdate}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome da Empresa</Label>
                    <Input
                      id="name"
                      value={companyData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Digite o nome da empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={companyData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contato@empresa.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={companyData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="55+DDD+Número (ex: 5511999999999)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={companyData.cnpj}
                      onChange={(e) => handleInputChange('cnpj', e.target.value)}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={companyData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://www.empresa.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={companyData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="São Paulo"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={companyData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Rua, número, bairro"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={companyData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descreva sua empresa..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={updateCompanyMutation.isPending || createCompanyMutation.isPending}
                  className="w-full"
                >
                  {(updateCompanyMutation.isPending || createCompanyMutation.isPending) ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <EmailTemplateSettings />
        </TabsContent>

        <TabsContent value="planos">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Escolha seu Plano</h2>
              <p className="text-muted-foreground">Selecione o plano que melhor atende às suas necessidades</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <Card key={plan.name} className={`relative ${plan.popular ? 'border-blue-600 shadow-lg' : ''} ${plan.current ? 'ring-2 ring-green-500' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Mais Popular
                      </span>
                    </div>
                  )}
                  {plan.current && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Plano Atual
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                    <div className="text-3xl font-bold text-blue-600">{plan.price}</div>
                    <CardDescription>por mês</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleSubscribe(plan.priceId, plan.name)}
                      disabled={plan.current || subscription.loading}
                      variant={plan.current ? 'outline' : plan.popular ? 'default' : 'outline'}
                      className="w-full"
                    >
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Trial Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                🎉 Teste Gratuito de 15 Dias
              </h3>
              <p className="text-green-700">
                Experimente todos os recursos premium gratuitamente por 15 dias com até 20 propostas incluídas!
              </p>
            </div>

            {isProfessional && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    Recursos Avançados
                  </CardTitle>
                  <CardDescription>Disponível apenas no plano Professional</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">Analytics Avançadas</h3>
                        <p className="text-sm text-muted-foreground">Relatórios detalhados sobre suas propostas</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">Bot Telegram</h3>
                        <p className="text-sm text-muted-foreground">Automatize seu atendimento via Telegram</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="telegram">
          {isAdmin ? (
            <TelegramBotPage />
          ) : (
            <TelegramBotUserGuide />
          )}
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin">
            <GerenciamentoUsuariosPage />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ConfiguracoesPage;
