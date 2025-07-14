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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  ExternalLink,
  Users,
  Search,
  Edit,
  UserCheck,
  UserX,
  Shield,
  Ban,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useSubscription } from '@/hooks/useSubscription';
import { useTrialStatus } from '@/hooks/useTrialStatus';
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

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  raw_user_meta_data?: any;
  banned_until?: string;
  subscriber?: {
    subscribed: boolean;
    subscription_tier?: string;
    trial_end_date?: string;
    trial_proposals_used?: number;
  };
  role?: string;
}

const ConfiguracoesPage = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserPermissions();
  const { subscribed, subscription_tier } = useSubscription();
  const { isInTrial, daysUsed, totalTrialDays, proposalsUsed, proposalsRemaining } = useTrialStatus();
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

  // Estados para gerenciamento de usuários (admin)
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

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
          setCompanyData({
            id: data.id,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            website: data.website || '',
            cnpj: data.cnpj || '',
            description: data.description || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            zip_code: data.zip_code || '',
            country_code: data.country_code || '+55',
            logo_url: data.logo_url
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
      }
    };

    loadCompanyData();
  }, [user]);

  // Carregar usuários para admin
  useEffect(() => {
    if (isAdmin && activeTab === 'admin') {
      loadAdminUsers();
    }
  }, [isAdmin, activeTab]);

  // Filtrar usuários
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

  const loadAdminUsers = async () => {
    setIsLoadingUsers(true);
    try {
      // Buscar usuários
      const { data: authUsers, error: authError } = await supabase.functions.invoke('get-users');
      
      if (authError) {
        console.error('Erro ao buscar usuários:', authError);
        toast.error('Erro ao carregar usuários');
        return;
      }

      // Buscar dados de assinatura e roles
      const { data: subscribers } = await supabase.from('subscribers').select('*');
      const { data: roles } = await supabase.from('user_roles').select('*');

      // Combinar dados
      const usersWithData = authUsers.map((authUser: any) => {
        const subscriber = subscribers?.find(s => s.user_id === authUser.id || s.email === authUser.email);
        const userRole = roles?.find(r => r.user_id === authUser.id);
        
        return {
          ...authUser,
          subscriber,
          role: userRole?.role
        };
      });

      setAdminUsers(usersWithData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Verificar se telefone é único
  const checkUniquePhone = async (phone: string): Promise<boolean> => {
    if (!phone || !user) return true;

    try {
      const { data, error } = await supabase.rpc('check_unique_phone_across_users', {
        p_phone: phone,
        p_user_id: user.id
      });

      if (error) {
        console.error('Erro ao verificar telefone:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Erro ao verificar telefone:', error);
      return false;
    }
  };

  // Salvar dados da empresa
  const handleSaveCompany = async () => {
    if (!user) return;

    if (!companyData.name.trim()) {
      toast.error('Nome da empresa é obrigatório');
      return;
    }

    // Validar telefone único se fornecido
    if (companyData.phone && companyData.phone.trim()) {
      const isPhoneUnique = await checkUniquePhone(companyData.phone.trim());
      if (!isPhoneUnique) {
        toast.error('Este telefone já está sendo usado por outro usuário');
        return;
      }
    }

    setIsSaving(true);
    try {
      const dataToSave = {
        user_id: user.id,
        name: companyData.name.trim(),
        email: companyData.email?.trim() || null,
        phone: companyData.phone?.trim() || null,
        website: companyData.website?.trim() || null,
        cnpj: companyData.cnpj?.trim() || null,
        description: companyData.description?.trim() || null,
        address: companyData.address?.trim() || null,
        city: companyData.city?.trim() || null,
        state: companyData.state?.trim() || null,
        zip_code: companyData.zip_code?.trim() || null,
        country_code: companyData.country_code || '+55',
        logo_url: companyData.logo_url
      };

      const { data, error } = await supabase
        .from('companies')
        .upsert(dataToSave, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar empresa:', error);
        if (error.code === '23505') {
          toast.error('Este telefone já está sendo usado por outro usuário');
        } else {
          toast.error('Erro ao salvar dados da empresa');
        }
        return;
      }

      // Atualizar estado com dados salvos
      setCompanyData(prev => ({
        ...prev,
        id: data.id
      }));
      
      toast.success('Dados da empresa salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      toast.error('Erro ao salvar dados da empresa');
    } finally {
      setIsSaving(false);
    }
  };

  // Funções de gerenciamento de usuários (admin)
  const handleResetUserData = async (userId: string, resetType: 'proposals' | 'trial' | 'both') => {
    try {
      const { data, error } = await supabase.rpc('admin_reset_user_data', {
        target_user_id: userId,
        reset_proposals: resetType === 'proposals' || resetType === 'both',
        reset_trial: resetType === 'trial' || resetType === 'both'
      });

      if (error) {
        console.error('Erro ao resetar dados:', error);
        toast.error('Erro ao resetar dados do usuário');
        return;
      }

      toast.success('Dados do usuário resetados com sucesso!');
      loadAdminUsers();
    } catch (error) {
      console.error('Erro ao resetar dados:', error);
      toast.error('Erro ao resetar dados do usuário');
    }
  };

  const handleManageUserStatus = async (userId: string, action: 'activate' | 'deactivate' | 'delete', makeAdmin = false) => {
    const confirmMessages = {
      activate: 'Tem certeza que deseja ativar este usuário?',
      deactivate: 'Tem certeza que deseja desativar este usuário?',
      delete: 'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.'
    };

    if (!confirm(confirmMessages[action])) return;

    try {
      const { data, error } = await supabase.rpc('admin_manage_user_status', {
        target_user_id: userId,
        action,
        make_admin: makeAdmin
      });

      if (error) {
        console.error('Erro ao gerenciar usuário:', error);
        toast.error('Erro ao gerenciar usuário');
        return;
      }

      toast.success(`Usuário ${action === 'activate' ? 'ativado' : action === 'deactivate' ? 'desativado' : 'excluído'} com sucesso!`);
      loadAdminUsers();
    } catch (error) {
      console.error('Erro ao gerenciar usuário:', error);
      toast.error('Erro ao gerenciar usuário');
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
          <TabsList className={isAdmin ? "grid w-full grid-cols-5" : "grid w-full grid-cols-4"}>
            <TabsTrigger value="negocio">Meu Negócio</TabsTrigger>
            <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
            <TabsTrigger value="integracoes">Integrações</TabsTrigger>
            <TabsTrigger value="conta">Conta</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
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

                {/* Form fields */}
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
                      ⚠️ Importante: Este telefone é usado pelo bot do Telegram para identificar sua conta e deve ser único
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
                  {subscribed ? (
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">Assinatura Ativa</p>
                          <p className="text-sm text-green-700">
                            Plano: {subscription_tier === 'basico' ? 'Essencial' : 'Profissional'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  ) : isInTrial ? (
                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900">Período de Teste</p>
                          <p className="text-sm text-blue-700">
                            {totalTrialDays - daysUsed} dias restantes • {proposalsUsed}/{20} propostas usadas
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
                        10 propostas por mês
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
                    <Button className="w-full" variant={subscription_tier === 'basico' ? 'secondary' : 'default'}>
                      {subscription_tier === 'basico' ? 'Plano Atual' : 'Assinar Essencial'}
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
                        Propostas ilimitadas
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
                    <Button className="w-full" variant={subscription_tier === 'profissional' ? 'secondary' : 'default'}>
                      {subscription_tier === 'profissional' ? 'Plano Atual' : 'Assinar Profissional'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gerenciar Assinatura */}
            {subscribed && (
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
                    onClick={async () => {
                      if (!confirm('Tem certeza que deseja cancelar sua assinatura?')) return;
                      try {
                        const { error } = await supabase
                          .from('subscribers')
                          .update({ 
                            subscribed: false,
                            subscription_tier: null,
                            cancel_at_period_end: true
                          })
                          .eq('user_id', user?.id);

                        if (error) {
                          console.error('Erro ao cancelar assinatura:', error);
                          toast.error('Erro ao cancelar assinatura');
                          return;
                        }

                        toast.success('Assinatura cancelada com sucesso');
                      } catch (error) {
                        console.error('Erro ao cancelar assinatura:', error);
                        toast.error('Erro ao cancelar assinatura');
                      }
                    }}
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
                    onClick={async () => {
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
                    }}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Conta Permanentemente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
                  {/* Filtro */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="search">Buscar por nome ou email</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="search"
                          placeholder="Digite o nome ou email do usuário..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Button onClick={loadAdminUsers} disabled={isLoadingUsers}>
                      {isLoadingUsers ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Lista de usuários */}
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Plano</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Trial/Propostas</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((adminUser) => (
                          <TableRow key={adminUser.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{adminUser.email}</p>
                                {adminUser.raw_user_meta_data?.full_name && (
                                  <p className="text-sm text-gray-500">{adminUser.raw_user_meta_data.full_name}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {adminUser.email_confirmed_at ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Ativo
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                  <UserX className="h-3 w-3 mr-1" />
                                  Pendente
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {adminUser.subscriber?.subscribed ? (
                                <Badge variant="default" className="bg-blue-100 text-blue-800">
                                  {adminUser.subscriber.subscription_tier === 'basico' ? 'Essencial' : 'Profissional'}
                                </Badge>
                              ) : adminUser.subscriber?.trial_end_date ? (
                                <Badge variant="outline" className="border-purple-200 text-purple-800">
                                  Trial
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  Gratuito
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {adminUser.role === 'admin' ? (
                                <Badge variant="destructive">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Admin
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  Usuário
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {adminUser.subscriber?.trial_end_date && (
                                  <p>Propostas: {adminUser.subscriber.trial_proposals_used || 0}/20</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleResetUserData(adminUser.id, 'both')}
                                  title="Reset Trial e Propostas"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleManageUserStatus(adminUser.id, 'activate')}
                                  title="Ativar"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleManageUserStatus(adminUser.id, 'deactivate')}
                                  title="Desativar"
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant={adminUser.role === 'admin' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => handleManageUserStatus(adminUser.id, 'activate', adminUser.role !== 'admin')}
                                  title={adminUser.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                                >
                                  <Shield className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleManageUserStatus(adminUser.id, 'delete')}
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default ConfiguracoesPage;
