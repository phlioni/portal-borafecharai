
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Mail,
  Phone,
  Building,
  CreditCard,
  Users,
  Trash2,
  UserCheck,
  RotateCcw,
  MessageCircle,
  Check,
  X,
  Crown,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { useCompany } from '@/hooks/useCompanies';
import { useAdminOperations } from '@/hooks/useAdminOperations';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import CompanyLogoUpload from '@/components/CompanyLogoUpload';
import TelegramBotUserGuide from '@/components/TelegramBotUserGuide';
import { useTelegramBot } from '@/hooks/useTelegramBot';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  raw_user_meta_data?: any;
  banned_until?: string;
  is_anonymous?: boolean;
  subscriber?: {
    subscribed: boolean;
    subscription_tier?: string;
    trial_end_date?: string;
    trial_proposals_used?: number;
  };
  role?: string;
}

interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country_code?: string;
  cnpj?: string;
  website?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  logo_url?: string | null;
}

const ConfiguracoesPage = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserPermissions();
  const subscription = useSubscription();
  const trialStatus = useTrialStatus();
  const { companies, loading: companiesLoading, createCompany, updateCompany, deleteCompany, checkUniquePhone } = useCompany();
  const { loadUsers, resetUserData, manageUserStatus } = useAdminOperations();
  const { settings, loading: telegramLoading, saveSettings } = useTelegramBot();
  
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [isCompanyFormLoading, setIsCompanyFormLoading] = useState(false);
  const [telegramFormData, setTelegramFormData] = useState({
    bot_token: '',
    bot_username: ''
  });
  const [isConfiguringTelegram, setIsConfiguringTelegram] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const companySchema = z.object({
    name: z.string().min(2, {
      message: "O nome da empresa deve ter pelo menos 2 caracteres.",
    }),
    email: z.string().email({
      message: "Por favor, insira um email válido.",
    }),
    phone: z.string().min(1, {
      message: "O telefone é obrigatório.",
    }),
    address: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    state: z.string().optional().or(z.literal('')),
    zip_code: z.string().optional().or(z.literal('')),
    country_code: z.string().optional().or(z.literal('')),
    cnpj: z.string().optional().or(z.literal('')),
    website: z.string().optional().or(z.literal('')),
    description: z.string().optional().or(z.literal('')),
  });

  const companyForm = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      country_code: '',
      cnpj: '',
      website: '',
      description: '',
    },
  });

  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    if (companies && companies.length > 0) {
      setCompanyData(companies[0]);
      companyForm.reset(companies[0]);
    }
  }, [companies, companyForm]);

  useEffect(() => {
    if (settings.bot_token) {
      setTelegramFormData({
        bot_token: settings.bot_token,
        bot_username: settings.bot_username || ''
      });
    }
  }, [settings]);

  const onSubmitCompany = async (values: z.infer<typeof companySchema>) => {
    setIsCompanyFormLoading(true);
    try {
      if (values.phone && values.phone.trim() !== '') {
        const phoneIsUnique = await checkUniquePhone(values.phone, user?.id || '');
        if (!phoneIsUnique) {
          toast.error('Este telefone já está sendo usado por outro usuário.');
          setIsCompanyFormLoading(false);
          return;
        }
      }

      if (companyData) {
        await updateCompany(companyData.id, values as Partial<Company>);
        toast.success('Empresa atualizada com sucesso!');
      } else {
        const companyToCreate = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          address: values.address || '',
          city: values.city || '',
          state: values.state || '',
          zip_code: values.zip_code || '',
          country_code: values.country_code || '',
          cnpj: values.cnpj || '',
          website: values.website || '',
          description: values.description || '',
        };
        await createCompany(companyToCreate);
        toast.success('Empresa criada com sucesso!');
      }
    } catch (error: any) {
      console.error('Error saving company:', error);
      toast.error(error.message || 'Erro ao salvar empresa');
    } finally {
      setIsCompanyFormLoading(false);
    }
  };

  const handleLogoUpdate = (logoUrl: string | null) => {
    if (companyData) {
      setCompanyData({ ...companyData, logo_url: logoUrl });
    }
  };

  const handleTelegramSave = async () => {
    if (!telegramFormData.bot_token.trim()) {
      toast.error('Token do bot é obrigatório');
      return;
    }

    setIsConfiguringTelegram(true);
    try {
      await saveSettings({
        bot_token: telegramFormData.bot_token,
        bot_username: telegramFormData.bot_username,
        webhook_configured: false
      });

      const { data, error } = await supabase.functions.invoke('setup-telegram-webhook', {
        body: {
          bot_token: telegramFormData.bot_token
        }
      });

      if (error) {
        console.error('Erro ao configurar webhook:', error);
        setWebhookStatus('error');
        toast.error('Bot salvo, mas erro ao configurar webhook');
      } else {
        console.log('Webhook configurado:', data);
        setWebhookStatus('success');
        
        await saveSettings({
          bot_token: telegramFormData.bot_token,
          bot_username: telegramFormData.bot_username,
          webhook_configured: true
        });
        
        toast.success('Bot configurado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setWebhookStatus('error');
      toast.error('Erro ao configurar bot');
    } finally {
      setIsConfiguringTelegram(false);
    }
  };

  const testTelegramBot = async () => {
    if (!settings.bot_token) {
      toast.error('Configure o bot primeiro');
      return;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${settings.bot_token}/getMe`);
      const data = await response.json();

      if (data.ok) {
        toast.success(`Bot "${data.result.first_name}" está funcionando!`);
        setTelegramFormData(prev => ({
          ...prev,
          bot_username: data.result.username || ''
        }));
      } else {
        toast.error('Token inválido ou bot não encontrado');
      }
    } catch (error) {
      console.error('Erro ao testar bot:', error);
      toast.error('Erro ao conectar com o Telegram');
    }
  };

  const loadAdminUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const users = await loadUsers();
      setAdminUsers(users);
      setFilteredUsers(users);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleResetUserData = async (userId: string, resetType: 'proposals' | 'trial' | 'both') => {
    const success = await resetUserData(userId, resetType);
    if (success) {
      loadAdminUsers();
    }
  };

  const handleManageUserStatus = async (userId: string, action: 'activate' | 'deactivate' | 'delete', makeAdmin = false) => {
    const success = await manageUserStatus(userId, action, makeAdmin);
    if (success) {
      loadAdminUsers();
    }
  };

  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(adminUsers);
    } else {
      const filtered = adminUsers.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.raw_user_meta_data?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [adminUsers, searchTerm]);

  useEffect(() => {
    if (isAdmin) {
      loadAdminUsers();
    }
  }, [isAdmin]);

  const renderPlanCard = (title: string, price: string, features: { text: string; included: boolean }[], popular = false) => (
    <div className={`relative bg-white rounded-lg border p-6 ${popular ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-600 text-white px-3 py-1">
            <Crown className="w-3 h-3 mr-1" />
            Mais Popular
          </Badge>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="mb-4">
          <span className="text-3xl font-bold text-gray-900">{price}</span>
          <span className="text-gray-600">/mês</span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
              feature.included ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {feature.included ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <X className="w-3 h-3 text-gray-400" />
              )}
            </div>
            <span className={`text-sm ${
              feature.included ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {feature.text}
            </span>
          </div>
        ))}
      </div>

      <Button 
        className="w-full" 
        variant={popular ? "default" : "outline"}
        disabled={subscription.subscribed && subscription.subscription_tier === (title === 'Essencial' ? 'basico' : 'profissional')}
      >
        {subscription.subscribed && subscription.subscription_tier === (title === 'Essencial' ? 'basico' : 'profissional') 
          ? 'Plano Atual' 
          : 'Assinar Agora'
        }
      </Button>
    </div>
  );

  const getTabsList = () => {
    const baseTabs = [
      { value: "negocio", label: "Meu Negócio", icon: Building },
      { value: "planos", label: "Planos", icon: CreditCard },
      { value: "telegram", label: "Bot Telegram", icon: MessageCircle },
    ];

    if (isAdmin) {
      baseTabs.push({ value: "admin", label: "Admin", icon: Users });
    }

    return baseTabs;
  };

  const tabsList = getTabsList();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-gray-600">Gerencie sua empresa, planos e configurações</p>
        </div>
      </div>

      <Tabs defaultValue="negocio" className="space-y-6">
        <TabsList className={`grid w-full grid-cols-${tabsList.length}`}>
          {tabsList.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </TabsTrigger>
          ))}
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
              <CompanyLogoUpload 
                currentLogoUrl={companyData?.logo_url || null}
                onLogoUpdate={handleLogoUpdate}
              />

              <form onSubmit={companyForm.handleSubmit(onSubmitCompany)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome da Empresa *</Label>
                    <Input
                      id="name"
                      placeholder="Nome da Empresa"
                      {...companyForm.register("name")}
                    />
                    {companyForm.formState.errors.name && (
                      <p className="text-sm text-red-500">{companyForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email"
                      {...companyForm.register("email")}
                    />
                    {companyForm.formState.errors.email && (
                      <p className="text-sm text-red-500">{companyForm.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      placeholder="Telefone"
                      {...companyForm.register("phone")}
                    />
                    {companyForm.formState.errors.phone && (
                      <p className="text-sm text-red-500">{companyForm.formState.errors.phone.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      placeholder="CNPJ"
                      {...companyForm.register("cnpj")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      placeholder="Endereço"
                      {...companyForm.register("address")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      placeholder="Website"
                      {...companyForm.register("website")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      placeholder="Cidade"
                      {...companyForm.register("city")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      placeholder="Estado"
                      {...companyForm.register("state")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip_code">CEP</Label>
                    <Input
                      id="zip_code"
                      placeholder="CEP"
                      {...companyForm.register("zip_code")}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descrição"
                    {...companyForm.register("description")}
                  />
                </div>

                <Button type="submit" disabled={isCompanyFormLoading}>
                  {isCompanyFormLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planos" className="space-y-6">
          {/* Status da Assinatura */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Status da Assinatura
                </CardTitle>
                <CardDescription>
                  Gerencie sua assinatura e veja os detalhes do seu plano
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant={subscription.subscribed ? "default" : "secondary"}>
                    {subscription.subscribed ? 
                      (subscription.subscription_tier === 'basico' ? 'Essencial' : 'Professional') 
                      : 'Sem Assinatura'
                    }
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {subscription.subscribed ? 'Ativo' : 'Gratuito'}
                  </span>
                </div>
                {!subscription.subscribed && (
                  <p className="text-gray-600">
                    Você está no plano gratuito. Assine um plano para acessar recursos premium.
                  </p>
                )}
              </div>
              {!subscription.subscribed && (
                <div className="mt-4">
                  <Button asChild>
                    <Link to="/planos">Ver Planos</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Planos */}
          <div className="grid md:grid-cols-2 gap-6">
            {renderPlanCard('Essencial', 'R$ 39,90', [
              { text: 'Até 10 propostas por mês', included: true },
              { text: 'Templates básicos', included: true },
              { text: 'Gestão de clientes', included: true },
              { text: 'Suporte por email', included: true },
              { text: 'Analytics básico', included: false },
              { text: 'Templates premium', included: false },
              { text: 'Suporte prioritário', included: false },
            ])}

            {renderPlanCard('Professional', 'R$ 79,90', [
              { text: 'Propostas ilimitadas', included: true },
              { text: 'Templates básicos', included: true },
              { text: 'Templates premium', included: true },
              { text: 'Gestão avançada de clientes', included: true },
              { text: 'Analytics completo', included: true },
              { text: 'Suporte prioritário', included: true },
              { text: 'Colaboração em equipe', included: false },
            ], true)}
          </div>

          {/* Recursos Avançados */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Crown className="h-5 w-5" />
                Recursos Avançados
              </CardTitle>
              <CardDescription className="text-purple-700">
                Recursos exclusivos para planos premium
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-purple-900 mb-2">Templates Personalizados</h4>
                    <p className="text-sm text-purple-700 mb-3">Crie templates únicos para suas propostas</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-purple-600 border-purple-300">
                        Plano Equipes
                      </Badge>
                      <Button size="sm" variant="outline" className="text-purple-600 border-purple-300">
                        Acessar
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-purple-900 mb-2">Integração API</h4>
                    <p className="text-sm text-purple-700 mb-3">Conecte com seus sistemas</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-gray-600">
                        Em breve
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Perguntas Frequentes */}
          <Card>
            <CardHeader>
              <CardTitle>Perguntas Frequentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Posso cancelar minha assinatura a qualquer momento?
                </h4>
                <p className="text-gray-600 text-sm">
                  Sim, você pode cancelar sua assinatura a qualquer momento através do portal do cliente.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Existe período de teste gratuito?
                </h4>
                <p className="text-gray-600 text-sm">
                  Sim, oferecemos 15 dias de teste gratuito com até 20 propostas para novos usuários.
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Posso alterar meu plano depois?
                </h4>
                <p className="text-gray-600 text-sm">
                  Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="telegram" className="space-y-6">
          {isAdmin ? (
            // Admin view - Bot configuration
            <div className="space-y-6">
              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Status da Configuração
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    {settings.bot_token ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <Check className="h-4 w-4" />
                        Bot Configurado
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <X className="h-4 w-4" />
                        Bot Não Configurado
                      </Badge>
                    )}
                    
                    {settings.webhook_configured ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <Check className="h-4 w-4" />
                        Webhook Ativo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <X className="h-4 w-4" />
                        Webhook Pendente
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Configuration Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuração do Bot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bot_token">Token do Bot</Label>
                    <Input
                      id="bot_token"
                      type="password"
                      value={telegramFormData.bot_token}
                      onChange={(e) => setTelegramFormData({...telegramFormData, bot_token: e.target.value})}
                      placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Obtenha o token conversando com @BotFather no Telegram
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="bot_username">Username do Bot (opcional)</Label>
                    <Input
                      id="bot_username"
                      value={telegramFormData.bot_username}
                      onChange={(e) => setTelegramFormData({...telegramFormData, bot_username: e.target.value})}
                      placeholder="borafecharai_bot"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleTelegramSave} 
                      disabled={isConfiguringTelegram}
                      className="flex items-center gap-2"
                    >
                      {isConfiguringTelegram ? 'Configurando...' : 'Salvar Configuração'}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={testTelegramBot}
                      disabled={!telegramFormData.bot_token}
                    >
                      Testar Bot
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // User view - How to use guide
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    Configure seu Bot do Telegram
                  </CardTitle>
                  <CardDescription>
                    Permita que seus clientes criem propostas diretamente pelo Telegram
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <Button className="mb-8">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Configurar Bot
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">Como funciona:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <p className="text-blue-900">Cliente inicia conversa com o bot <strong>@borafecharai_bot</strong></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <p className="text-blue-900">Bot identifica o cliente pelo telefone</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <p className="text-blue-900">Coleta todas as informações da proposta</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <p className="text-blue-900">Cria proposta automaticamente no sistema</p>
                  </div>
                </CardContent>
              </Card>

              <TelegramBotUserGuide />
            </div>
          )}
        </TabsContent>

        {/* Admin Tab - only shown if user is admin */}
        {isAdmin && (
          <TabsContent value="admin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gerenciamento de Usuários
                </CardTitle>
                <CardDescription>
                  Gerencie todos os usuários do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search Filter */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Buscar usuários</Label>
                    <Input
                      id="search"
                      placeholder="Digite o nome ou email do usuário..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={loadAdminUsers} disabled={isLoadingUsers}>
                      {isLoadingUsers ? 'Carregando...' : 'Atualizar'}
                    </Button>
                  </div>
                </div>

                {/* Users Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Plano</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Trial</TableHead>
                        <TableHead>Propostas</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.email}</p>
                              {user.raw_user_meta_data?.full_name && (
                                <p className="text-sm text-gray-500">{user.raw_user_meta_data.full_name}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.email_confirmed_at ? 'default' : 'secondary'}>
                              {user.email_confirmed_at ? 'Ativo' : 'Pendente'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.subscriber?.subscribed ? (
                              <Badge variant="default">
                                {user.subscriber.subscription_tier === 'basico' ? 'Essencial' : 'Profissional'}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Gratuito</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                              {user.role === 'admin' ? 'Admin' : 'Usuário'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.subscriber?.trial_end_date ? (
                              <div className="text-sm">
                                <p>Fim: {new Date(user.subscriber.trial_end_date).toLocaleDateString('pt-BR')}</p>
                              </div>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span>{user.subscriber?.trial_proposals_used || 0}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResetUserData(user.id, 'both')}
                                title="Resetar dados"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleManageUserStatus(user.id, 'activate')}
                                title="Ativar"
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleManageUserStatus(user.id, 'delete')}
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ConfiguracoesPage;
