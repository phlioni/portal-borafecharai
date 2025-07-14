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
  Bell
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { useCompany } from '@/hooks/useCompanies';
import { useAdminOperations } from '@/hooks/useAdminOperations';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import CompanyLogoUpload from '@/components/CompanyLogoUpload';

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
  
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [isCompanyFormLoading, setIsCompanyFormLoading] = useState(false);

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

  const onSubmitCompany = async (values: z.infer<typeof companySchema>) => {
    setIsCompanyFormLoading(true);
    try {
      // Validar telefone único se foi fornecido
      if (values.phone && values.phone.trim() !== '') {
        const phoneIsUnique = await checkUniquePhone(values.phone, user?.id || '');
        if (!phoneIsUnique) {
          toast.error('Este telefone já está sendo usado por outro usuário.');
          setIsCompanyFormLoading(false);
          return;
        }
      }

      if (companyData) {
        // Update existing company
        await updateCompany(companyData.id, values as Partial<Company>);
        toast.success('Empresa atualizada com sucesso!');
      } else {
        // Create new company - ensure required fields are present
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

  const tabsList = [
    { value: "perfil", label: "Perfil & Empresa", icon: Building },
    { value: "plano", label: "Plano & Assinatura", icon: CreditCard },
    { value: "notificacoes", label: "Notificações", icon: Bell },
  ];

  if (isAdmin) {
    tabsList.push({ value: "admin", label: "Admin", icon: Users });
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
          {tabsList.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="perfil" className="space-y-6">
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

        <TabsContent value="plano" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Plano & Assinatura
              </CardTitle>
              <CardDescription>
                Gerencie seu plano e assinatura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription.subscribed ? (
                <>
                  <p>
                    Seu plano atual é:{' '}
                    <span className="font-medium">
                      {subscription.subscription_tier === 'basico' ? 'Essencial' : 'Professional'}
                    </span>
                  </p>
                  <p>
                    Status da assinatura:{' '}
                    <Switch checked={subscription.subscribed} disabled />
                  </p>
                </>
              ) : trialStatus.trialEndDate ? (
                <p>
                  Você está no período de trial. Termina em:{' '}
                  {trialStatus.trialEndDate.toLocaleDateString()}
                </p>
              ) : (
                <p>Você está no plano gratuito.</p>
              )}
              <Button>Mudar Plano</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
              <CardDescription>
                Gerencie suas preferências de notificação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Em breve...</p>
            </CardContent>
          </Card>
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
