import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Save, 
  Building, 
  CreditCard, 
  Bell, 
  User, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Crown,
  MessageCircle,
  Bot,
  Settings,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import CompanyLogoUpload from '@/components/CompanyLogoUpload';

interface CompanyData {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  cnpj?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country_code?: string;
  logo_url?: string | null;
}

interface SubscriberData {
  id?: string;
  email: string;
  subscribed: boolean;
  subscription_tier?: string;
  trial_end_date?: string;
  trial_proposals_used?: number;
}

const ConfiguracoesPage = () => {
  const { user } = useAuth();
  const { canCreateProposal, isSubscribed, trialDaysLeft, proposalsUsed, maxProposals } = useUserPermissions();
  const [activeTab, setActiveTab] = useState('negocio');
  const [isSaving, setIsSaving] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    email: '',
    phone: '',
    website: '',
    cnpj: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country_code: '+55',
    logo_url: null
  });
  const [subscriberData, setSubscriberData] = useState<SubscriberData | null>(null);

  // Carregar dados da empresa
  useEffect(() => {
    const loadCompanyData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao carregar dados da empresa:', error);
          return;
        }

        if (data) {
          setCompanyData(data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
      }
    };

    loadCompanyData();
  }, [user]);

  // Carregar dados do assinante
  useEffect(() => {
    const loadSubscriberData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao carregar dados do assinante:', error);
          return;
        }

        if (data) {
          setSubscriberData(data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do assinante:', error);
      }
    };

    loadSubscriberData();
  }, [user]);

  // Salvar dados da empresa
  const handleSaveCompany = async () => {
    if (!user) return;

    if (!companyData.name.trim()) {
      toast.error('Nome da empresa é obrigatório');
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .upsert({
          user_id: user.id,
          name: companyData.name,
          email: companyData.email || null,
          phone: companyData.phone || null,
          website: companyData.website || null,
          cnpj: companyData.cnpj || null,
          description: companyData.description || null,
          address: companyData.address || null,
          city: companyData.city || null,
          state: companyData.state || null,
          zip_code: companyData.zip_code || null,
          country_code: companyData.country_code || '+55',
          logo_url: companyData.logo_url
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar empresa:', error);
        toast.error('Erro ao salvar dados da empresa');
        return;
      }

      setCompanyData(data);
      toast.success('Dados da empresa salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      toast.error('Erro ao salvar dados da empresa');
    } finally {
      setIsSaving(false);
    }
  };

  // Cancelar assinatura
  const handleCancelSubscription = async () => {
    if (!subscriberData || !confirm('Tem certeza que deseja cancelar sua assinatura?')) return;

    try {
      const { error } = await supabase
        .from('subscribers')
        .update({ 
          subscribed: false,
          subscription_tier: null,
          cancel_at_period_end: true
        })
        .eq('id', subscriberData.id);

      if (error) {
        console.error('Erro ao cancelar assinatura:', error);
        toast.error('Erro ao cancelar assinatura');
        return;
      }

      setSubscriberData(prev => prev ? { ...prev, subscribed: false, cancel_at_period_end: true } : null);
      toast.success('Assinatura cancelada com sucesso');
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      toast.error('Erro ao cancelar assinatura');
    }
  };

  // Excluir conta
  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmation = prompt('Para confirmar a exclusão da conta, digite "EXCLUIR" (em maiúsculas):');
    if (confirmation !== 'EXCLUIR') {
      toast.error('Confirmação incorreta. Conta não foi excluída.');
      return;
    }

    try {
      // Excluir dados relacionados primeiro
      await supabase.from('proposals').delete().eq('user_id', user.id);
      await supabase.from('companies').delete().eq('user_id', user.id);
      await supabase.from('subscribers').delete().eq('user_id', user.id);
      await supabase.from('user_roles').delete().eq('user_id', user.id);

      // Excluir usuário via edge function
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId: user.id }
      });

      if (error) {
        console.error('Erro ao excluir conta:', error);
        toast.error('Erro ao excluir conta');
        return;
      }

      toast.success('Conta excluída com sucesso');
      // Redirecionar para página de login
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      toast.error('Erro ao excluir conta');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie suas configurações e preferências</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="negocio">Meu Negócio</TabsTrigger>
            <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
            <TabsTrigger value="integracoes">Integrações</TabsTrigger>
            <TabsTrigger value="conta">Conta</TabsTrigger>
          </TabsList>

          <TabsContent value="negocio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
                <CardDescription>
                  Configure os dados da sua empresa que aparecerão nas propostas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <CompanyLogoUpload
                  currentLogoUrl={companyData.logo_url}
                  onLogoUpdate={(logoUrl) => setCompanyData(prev => ({ ...prev, logo_url: logoUrl }))}
                />

                {/* Existing form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Nome da Empresa *</Label>
                    <Input
                      id="company-name"
                      value={companyData.name}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome da sua empresa"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-email">E-mail</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={companyData.email || ''}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contato@empresa.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-phone">Telefone</Label>
                    <div className="flex gap-2">
                      <Select 
                        value={companyData.country_code || '+55'} 
                        onValueChange={(value) => setCompanyData(prev => ({ ...prev, country_code: value }))}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+55">🇧🇷 +55</SelectItem>
                          <SelectItem value="+1">🇺🇸 +1</SelectItem>
                          <SelectItem value="+351">🇵🇹 +351</SelectItem>
                          <SelectItem value="+34">🇪🇸 +34</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        id="company-phone"
                        value={companyData.phone || ''}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(11) 99999-9999"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      ⚠️ Importante: Este telefone é usado pelo bot do Telegram para identificar sua conta
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-website">Website</Label>
                    <Input
                      id="company-website"
                      value={companyData.website || ''}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://www.empresa.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-cnpj">CNPJ</Label>
                    <Input
                      id="company-cnpj"
                      value={companyData.cnpj || ''}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, cnpj: e.target.value }))}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-description">Descrição da Empresa</Label>
                  <Textarea
                    id="company-description"
                    value={companyData.description || ''}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva sua empresa e área de atuação..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Endereço</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-address">Endereço</Label>
                      <Input
                        id="company-address"
                        value={companyData.address || ''}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Rua, número, complemento"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company-city">Cidade</Label>
                      <Input
                        id="company-city"
                        value={companyData.city || ''}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Cidade"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company-state">Estado</Label>
                      <Input
                        id="company-state"
                        value={companyData.state || ''}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="Estado/UF"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company-zip">CEP</Label>
                      <Input
                        id="company-zip"
                        value={companyData.zip_code || ''}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, zip_code: e.target.value }))}
                        placeholder="00000-000"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveCompany} disabled={isSaving} className="w-full">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Informações
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assinatura" className="space-y-6">
            {/* Status da Assinatura */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Status da Assinatura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isSubscribed ? (
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">Assinatura Ativa</p>
                          <p className="text-sm text-green-700">
                            Plano: {subscriberData?.subscription_tier === 'basico' ? 'Essencial' : 'Profissional'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  ) : trialDaysLeft > 0 ? (
                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900">Período de Teste</p>
                          <p className="text-sm text-blue-700">
                            {trialDaysLeft} dias restantes • {proposalsUsed}/{maxProposals} propostas usadas
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-blue-200 text-blue-800">
                        Trial
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Plano Gratuito</p>
                          <p className="text-sm text-gray-700">
                            Funcionalidades limitadas
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        Gratuito
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Planos Disponíveis */}
            <Card>
              <CardHeader>
                <CardTitle>Planos Disponíveis</CardTitle>
                <CardDescription>
                  Escolha o plano ideal para suas necessidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Plano Essencial */}
                  <div className="border rounded-lg p-6 space-y-4">
                    <div className="text-center">
                      <h3 className="text-xl font-bold">Essencial</h3>
                      <div className="text-3xl font-bold text-blue-600 mt-2">
                        R$ 39,90
                        <span className="text-sm font-normal text-gray-500">/mês</span>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Propostas ilimitadas
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        3 templates profissionais
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Acompanhamento de status
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Suporte por email
                      </li>
                    </ul>
                    <Button className="w-full" variant={subscriberData?.subscription_tier === 'basico' ? 'secondary' : 'default'}>
                      {subscriberData?.subscription_tier === 'basico' ? 'Plano Atual' : 'Assinar Essencial'}
                    </Button>
                  </div>

                  {/* Plano Profissional */}
                  <div className="border-2 border-blue-500 rounded-lg p-6 space-y-4 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500">Mais Popular</Badge>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold">Profissional</h3>
                      <div className="text-3xl font-bold text-blue-600 mt-2">
                        R$ 79,90
                        <span className="text-sm font-normal text-gray-500">/mês</span>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Tudo do plano Essencial
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Templates personalizados
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Bot do Telegram
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Relatórios avançados
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Suporte prioritário
                      </li>
                    </ul>
                    <Button className="w-full" variant={subscriberData?.subscription_tier === 'profissional' ? 'secondary' : 'default'}>
                      {subscriberData?.subscription_tier === 'profissional' ? 'Plano Atual' : 'Assinar Profissional'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gerenciar Assinatura */}
            {subscriberData?.subscribed && (
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Assinatura</CardTitle>
                  <CardDescription>
                    Opções para sua assinatura atual
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelSubscription}
                    className="w-full"
                  >
                    Cancelar Assinatura
                  </Button>
                  <p className="text-sm text-gray-500 text-center">
                    Você continuará tendo acesso até o final do período pago
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="integracoes" className="space-y-6">
            {/* Bot do Telegram */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  Bot do Telegram
                </CardTitle>
                <CardDescription>
                  Crie propostas e receba notificações pelo Telegram
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bot className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">@borafecharai_bot</p>
                      <p className="text-sm text-gray-600">
                        Bot oficial para criação de propostas
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" asChild>
                      <Link to="/telegram-bot">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Link>
                    </Button>
                    <Button asChild>
                      <a 
                        href="https://t.me/borafecharai_bot" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir Bot
                      </a>
                    </Button>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Como usar:</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Certifique-se de que seu telefone está cadastrado em "Meu Negócio"</li>
                    <li>2. Abra o bot no Telegram e digite /start</li>
                    <li>3. Compartilhe seu telefone para identificação</li>
                    <li>4. Siga as instruções para criar propostas</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Notificações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações
                </CardTitle>
                <CardDescription>
                  Configure como você quer receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações por Email</p>
                    <p className="text-sm text-gray-600">
                      Receba atualizações sobre suas propostas por email
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações no Telegram</p>
                    <p className="text-sm text-gray-600">
                      Receba notificações instantâneas no Telegram
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conta" className="space-y-6">
            {/* Informações da Conta */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input value={user?.email || ''} disabled />
                  </div>
                  <div>
                    <Label>Data de Cadastro</Label>
                    <Input 
                      value={user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : ''} 
                      disabled 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Zona de Perigo */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-900 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Zona de Perigo
                </CardTitle>
                <CardDescription>
                  Ações irreversíveis para sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">Excluir Conta</h4>
                  <p className="text-sm text-red-800 mb-4">
                    Esta ação excluirá permanentemente sua conta e todos os dados associados. 
                    Esta ação não pode ser desfeita.
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Conta Permanentemente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ConfiguracoesPage;
