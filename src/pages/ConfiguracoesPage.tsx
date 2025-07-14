
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building, Crown, Users, MessageCircle, Zap, Star, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useSubscription } from '@/hooks/useSubscription';
import { useCompanies, useUpdateCompany } from '@/hooks/useCompanies';
import CompanyLogoUpload from '@/components/CompanyLogoUpload';
import { toast } from 'sonner';
import GerenciamentoUsuariosPage from './GerenciamentoUsuariosPage';
import TelegramBotUserGuide from '@/components/TelegramBotUserGuide';
import TelegramBotPage from './TelegramBotPage';

const ConfiguracoesPage = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserPermissions();
  const subscription = useSubscription();
  const { data: companies } = useCompanies();
  const updateCompanyMutation = useUpdateCompany();
  
  const [activeTab, setActiveTab] = useState('negocio');
  const [companyData, setCompanyData] = useState({
    name: '',
    email: '',
    phone: '',
    cnpj: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    description: '',
    logo_url: ''
  });

  const company = companies?.[0];
  const isProfessional = subscription.subscription_tier === 'professional' || isAdmin;

  useEffect(() => {
    if (company) {
      setCompanyData({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        cnpj: company.cnpj || '',
        website: company.website || '',
        address: company.address || '',
        city: company.city || '',
        state: company.state || '',
        zip_code: company.zip_code || '',
        description: company.description || '',
        logo_url: company.logo_url || ''
      });
    }
  }, [company]);

  const handleSaveCompany = async () => {
    if (!company?.id) {
      toast.error('Dados da empresa não encontrados');
      return;
    }

    if (!companyData.name.trim()) {
      toast.error('Nome da empresa é obrigatório');
      return;
    }

    if (!companyData.phone.trim()) {
      toast.error('Telefone é obrigatório');
      return;
    }

    if (!companyData.email.trim()) {
      toast.error('E-mail é obrigatório');
      return;
    }

    try {
      await updateCompanyMutation.mutateAsync({
        id: company.id,
        updates: companyData
      });
      toast.success('Dados da empresa salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast.error('Erro ao salvar dados da empresa');
    }
  };

  const handleLogoUpdate = (logoUrl: string | null) => {
    setCompanyData(prev => ({ ...prev, logo_url: logoUrl || '' }));
  };

  const plans = [
    {
      name: 'Essencial',
      price: 'R$ 39,90',
      period: '/mês',
      description: 'Perfeito para freelancers e pequenos negócios',
      features: [
        'Até 10 propostas por mês',
        'Templates básicos',
        'Suporte por email',
        'Marca d\'água removida'
      ],
      buttonText: subscription.subscription_tier === 'basico' ? 'Plano Atual' : 'Escolher Plano',
      current: subscription.subscription_tier === 'basico',
      popular: false
    },
    {
      name: 'Professional',
      price: 'R$ 79,90',
      period: '/mês',
      description: 'Para empresas que precisam de mais recursos',
      features: [
        'Propostas ilimitadas',
        'Templates personalizados',
        'Integração com API',
        'Suporte prioritário',
        'Marca d\'água removida',
        'Relatórios avançados'
      ],
      buttonText: subscription.subscription_tier === 'professional' ? 'Plano Atual' : 'Escolher Plano',
      current: subscription.subscription_tier === 'professional',
      popular: true
    }
  ];

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie sua empresa, planos e configurações</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="negocio" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Meu Negócio
          </TabsTrigger>
          <TabsTrigger value="planos" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Planos
          </TabsTrigger>
          <TabsTrigger value="telegram" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Bot Telegram
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Admin
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="negocio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Informações da Empresa
              </CardTitle>
              <CardDescription>
                Atualize as informações da sua empresa. Campos obrigatórios: Nome, Telefone e Email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <CompanyLogoUpload
                  currentLogoUrl={companyData.logo_url}
                  onLogoUpdate={handleLogoUpdate}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome da Empresa *</Label>
                    <Input
                      id="name"
                      value={companyData.name}
                      onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={companyData.cnpj}
                      onChange={(e) => setCompanyData({...companyData, cnpj: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={companyData.email}
                      onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      value={companyData.phone}
                      onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={companyData.website}
                      onChange={(e) => setCompanyData({...companyData, website: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={companyData.city}
                      onChange={(e) => setCompanyData({...companyData, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={companyData.state}
                      onChange={(e) => setCompanyData({...companyData, state: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip_code">CEP</Label>
                    <Input
                      id="zip_code"
                      value={companyData.zip_code}
                      onChange={(e) => setCompanyData({...companyData, zip_code: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Input
                    id="address"
                    value={companyData.address}
                    onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição da Empresa</Label>
                  <Textarea
                    id="description"
                    value={companyData.description}
                    onChange={(e) => setCompanyData({...companyData, description: e.target.value})}
                    placeholder="Descreva brevemente sua empresa e seus serviços..."
                  />
                </div>
              </div>

              <Button onClick={handleSaveCompany} disabled={updateCompanyMutation.isPending}>
                {updateCompanyMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planos" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.current ? "secondary" : "default"}
                    disabled={plan.current}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {isProfessional && (
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Crown className="h-5 w-5" />
                  Recursos Avançados
                </CardTitle>
                <CardDescription>Recursos exclusivos para planos premium</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4 text-purple-600" />
                      Templates Personalizados
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Crie templates únicos para suas propostas
                    </p>
                    <Button variant="outline" size="sm">Acessar</Button>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-purple-600" />
                      Integração API
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Conecte com seus sistemas
                    </p>
                    <Button variant="outline" size="sm" disabled>Em breve</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="telegram">
          {isAdmin ? <TelegramBotPage /> : <TelegramBotUserGuide />}
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
