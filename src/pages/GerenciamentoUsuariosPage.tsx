import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  Edit, 
  Trash2, 
  Plus, 
  UserCheck, 
  UserX, 
  Shield,
  AlertCircle,
  Calendar,
  Mail,
  Phone,
  Building,
  CreditCard,
  Activity,
  Settings,
  Ban,
  CheckCircle,
  XCircle,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useAdminOperations } from '@/hooks/useAdminOperations';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  raw_user_meta_data?: any;
  banned_until?: string;
  is_anonymous?: boolean;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  user_id?: string;
  subscribed: boolean;
  subscription_tier?: string;
  trial_start_date?: string;
  trial_end_date?: string;
  trial_proposals_used?: number;
  created_at: string;
  updated_at: string;
}

interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  user_id: string;
  created_at: string;
}

interface Proposal {
  id: string;
  title: string;
  status: string;
  value?: number;
  created_at: string;
  user_id: string;
}

const GerenciamentoUsuariosPage = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserPermissions();
  const { isLoading, loadUsers, resetUserData, manageUserStatus } = useAdminOperations();
  
  const [users, setUsers] = useState<User[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [selectedUserRole, setSelectedUserRole] = useState<UserRole | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    trialUsers: 0,
    totalProposals: 0,
    totalRevenue: 0
  });

  // Carregar dados dos usuários usando o hook
  const loadAllData = async () => {
    try {
      const usersData = await loadUsers();
      
      // Buscar dados adicionais
      const { data: subscribersData } = await supabase.from('subscribers').select('*');
      const { data: rolesData } = await supabase.from('user_roles').select('*');
      const { data: companiesData } = await supabase.from('companies').select('*');
      const { data: proposalsData } = await supabase.from('proposals').select('*');

      setUsers(usersData);
      setSubscribers(subscribersData || []);
      setUserRoles(rolesData || []);
      setCompanies(companiesData || []);
      setProposals(proposalsData || []);

      // Calcular estatísticas
      const activeSubscriptions = subscribersData?.filter(s => s.subscribed).length || 0;
      const trialUsers = subscribersData?.filter(s => s.trial_end_date && new Date(s.trial_end_date) > new Date()).length || 0;
      const totalRevenue = subscribersData?.reduce((sum, s) => {
        if (s.subscription_tier === 'basico') return sum + 39.90;
        if (s.subscription_tier === 'profissional') return sum + 79.90;
        return sum;
      }, 0) || 0;

      setStats({
        totalUsers: usersData.length,
        activeSubscriptions,
        trialUsers,
        totalProposals: proposalsData?.length || 0,
        totalRevenue
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  // Filtrar usuários
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.raw_user_meta_data?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  // Abrir dialog de edição
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    
    const subscriber = subscribers.find(s => s.user_id === user.id || s.email === user.email);
    setSelectedSubscriber(subscriber || null);
    
    const role = userRoles.find(r => r.user_id === user.id);
    setSelectedUserRole(role || null);
    
    setIsEditDialogOpen(true);
  };

  // Salvar alterações do usuário - CORRIGIDO
  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      // Atualizar subscriber se existir
      if (selectedSubscriber) {
        const subscriberData = {
          user_id: selectedUser.id,
          email: selectedUser.email,
          subscribed: selectedSubscriber.subscribed,
          subscription_tier: selectedSubscriber.subscription_tier,
          trial_end_date: selectedSubscriber.trial_end_date,
          trial_start_date: selectedSubscriber.trial_start_date,
          trial_proposals_used: selectedSubscriber.trial_proposals_used || 0
        };

        if (selectedSubscriber.id) {
          // Update existing
          const { error: subscriberError } = await supabase
            .from('subscribers')
            .update(subscriberData)
            .eq('id', selectedSubscriber.id);

          if (subscriberError) {
            console.error('Erro ao atualizar subscriber:', subscriberError);
            toast.error('Erro ao atualizar assinatura');
            return;
          }
        } else {
          // Insert new
          const { error: subscriberError } = await supabase
            .from('subscribers')
            .insert(subscriberData);

          if (subscriberError) {
            console.error('Erro ao criar subscriber:', subscriberError);
            toast.error('Erro ao criar assinatura');
            return;
          }
        }
      }

      // Atualizar ou criar role
      if (selectedUserRole && selectedUserRole.role !== 'user') {
        // Primeiro, deletar role existente se houver
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', selectedUser.id);

        // Inserir nova role se não for 'user' (que é o padrão)
        if (selectedUserRole.role === 'admin') {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: selectedUser.id,
              role: selectedUserRole.role
            });

          if (roleError) {
            console.error('Erro ao atualizar role:', roleError);
            toast.error('Erro ao atualizar permissões');
            return;
          }
        }
      } else if (selectedUserRole && selectedUserRole.role === 'user') {
        // Remover role de admin se mudar para user
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', selectedUser.id);
      }

      toast.success('Usuário atualizado com sucesso!');
      setIsEditDialogOpen(false);
      loadAllData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar alterações');
    }
  };

  // Resetar dados do usuário
  const handleResetUserData = async (userId: string, resetType: 'proposals' | 'trial' | 'both') => {
    const success = await resetUserData(userId, resetType);
    if (success) {
      loadAllData();
    }
  };

  // Gerenciar status do usuário
  const handleManageUserStatus = async (userId: string, action: 'activate' | 'deactivate' | 'delete', makeAdmin = false) => {
    const success = await manageUserStatus(userId, action, makeAdmin);
    if (success) {
      if (action === 'delete') {
        setIsEditDialogOpen(false);
      }
      loadAllData();
    }
  };

  // Obter dados do usuário
  const getUserSubscriber = (userId: string, email: string) => {
    return subscribers.find(s => s.user_id === userId || s.email === email);
  };

  const getUserRole = (userId: string) => {
    return userRoles.find(r => r.user_id === userId);
  };

  const getUserCompany = (userId: string) => {
    return companies.find(c => c.user_id === userId);
  };

  const getUserProposals = (userId: string) => {
    return proposals.filter(p => p.user_id === userId);
  };

  if (!isAdmin) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="h-5 w-5" />
              Acesso Restrito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-800">
              Esta página é acessível apenas para administradores do sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-600 mt-1">Painel administrativo completo</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinantes Ativos</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários em Trial</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.trialUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Propostas</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProposals}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtrar Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar por nome ou email</Label>
              <Input
                id="search"
                placeholder="Digite o nome ou email do usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="proposals">Propostas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
              <CardDescription>
                Gerencie todos os usuários do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Último Login</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const subscriber = getUserSubscriber(user.id, user.email);
                    const role = getUserRole(user.id);
                    const company = getUserCompany(user.id);
                    const userProposals = getUserProposals(user.id);
                    const isBanned = user.banned_until && new Date(user.banned_until) > new Date();
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.email}</p>
                            {user.raw_user_meta_data?.full_name && (
                              <p className="text-sm text-gray-500">{user.raw_user_meta_data.full_name}</p>
                            )}
                            {company && (
                              <p className="text-xs text-blue-600">{company.name}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {isBanned ? (
                            <Badge variant="destructive" className="bg-red-100 text-red-800">
                              <Ban className="h-3 w-3 mr-1" />
                              Banido
                            </Badge>
                          ) : user.email_confirmed_at ? (
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
                          {subscriber?.subscribed ? (
                            <Badge variant="default" className="bg-blue-100 text-blue-800">
                              {subscriber.subscription_tier === 'basico' ? 'Essencial' : 'Profissional'}
                            </Badge>
                          ) : subscriber?.trial_end_date ? (
                            <Badge variant="outline" className="border-purple-200 text-purple-800">
                              Trial ({subscriber.trial_proposals_used || 0}/20)
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              Gratuito
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {role?.role === 'admin' ? (
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
                          <div className="text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('pt-BR') : 'Nunca'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {isBanned ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleManageUserStatus(user.id, 'activate')}
                                title="Desbanir"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleManageUserStatus(user.id, 'deactivate')}
                                title="Banir"
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
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
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Empresas ({companies.length})</CardTitle>
              <CardDescription>
                Todas as empresas cadastradas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Criado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => {
                    const owner = users.find(u => u.id === company.user_id);
                    return (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.email || '-'}</TableCell>
                        <TableCell>{company.phone || '-'}</TableCell>
                        <TableCell>{owner?.email || 'Desconhecido'}</TableCell>
                        <TableCell>{new Date(company.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proposals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Propostas ({proposals.length})</CardTitle>
              <CardDescription>
                Todas as propostas criadas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Criado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposals.slice(0, 50).map((proposal) => {
                    const owner = users.find(u => u.id === proposal.user_id);
                    return (
                      <TableRow key={proposal.id}>
                        <TableCell className="font-medium">{proposal.title}</TableCell>
                        <TableCell>
                          <Badge variant={
                            proposal.status === 'aceita' ? 'default' : 
                            proposal.status === 'rejeitada' ? 'destructive' : 
                            'secondary'
                          }>
                            {proposal.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {proposal.value ? `R$ ${proposal.value.toLocaleString('pt-BR')}` : '-'}
                        </TableCell>
                        <TableCell>{owner?.email || 'Desconhecido'}</TableCell>
                        <TableCell>{new Date(proposal.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumo de Assinaturas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Plano Essencial:</span>
                    <span>{subscribers.filter(s => s.subscription_tier === 'basico').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plano Profissional:</span>
                    <span>{subscribers.filter(s => s.subscription_tier === 'profissional').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Usuários em Trial:</span>
                    <span>{stats.trialUsers}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Receita Mensal:</span>
                    <span>R$ {stats.totalRevenue.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status das Propostas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Aceitas:</span>
                    <span>{proposals.filter(p => p.status === 'aceita').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rejeitadas:</span>
                    <span>{proposals.filter(p => p.status === 'rejeitada').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Enviadas:</span>
                    <span>{proposals.filter(p => p.status === 'enviada').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rascunhos:</span>
                    <span>{proposals.filter(p => p.status === 'rascunho').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de Edição - CORRIGIDO */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Gerencie as permissões e configurações do usuário
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* Informações do Usuário */}
              <div>
                <h3 className="font-medium mb-3">Informações do Usuário</h3>
                <div className="space-y-2">
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>ID:</strong> {selectedUser.id}</p>
                  <p><strong>Cadastro:</strong> {new Date(selectedUser.created_at).toLocaleString('pt-BR')}</p>
                  <p><strong>Último Login:</strong> {selectedUser.last_sign_in_at ? new Date(selectedUser.last_sign_in_at).toLocaleString('pt-BR') : 'Nunca'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <h3 className="font-medium">Ações Rápidas</h3>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleResetUserData(selectedUser.id, 'proposals')}
                  >
                    Resetar Propostas
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleResetUserData(selectedUser.id, 'trial')}
                  >
                    Resetar Trial
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleResetUserData(selectedUser.id, 'both')}
                  >
                    Resetar Tudo
                  </Button>
                </div>
              </div>

              {/* Role */}
              <div className="space-y-3">
                <Label>Permissões</Label>
                <Select
                  value={selectedUserRole?.role || 'user'}
                  onValueChange={(value: 'admin' | 'user') => {
                    setSelectedUserRole({
                      id: selectedUserRole?.id || '',
                      user_id: selectedUser.id,
                      role: value,
                      created_at: selectedUserRole?.created_at || new Date().toISOString()
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assinatura */}
              <div className="space-y-4">
                <h3 className="font-medium">Assinatura</h3>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={selectedSubscriber?.subscribed || false}
                    onCheckedChange={(checked) => {
                      if (!selectedSubscriber) {
                        setSelectedSubscriber({
                          id: '',
                          email: selectedUser.email,
                          user_id: selectedUser.id,
                          subscribed: checked,
                          trial_proposals_used: 0,
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString()
                        });
                      } else {
                        setSelectedSubscriber({
                          ...selectedSubscriber,
                          subscribed: checked
                        });
                      }
                    }}
                  />
                  <Label>Assinatura Ativa</Label>
                </div>

                <div className="space-y-3">
                  <Label>Plano</Label>
                  <Select
                    value={selectedSubscriber?.subscription_tier || ''}
                    onValueChange={(value) => {
                      if (!selectedSubscriber) {
                        setSelectedSubscriber({
                          id: '',
                          email: selectedUser.email,
                          user_id: selectedUser.id,
                          subscribed: false,
                          subscription_tier: value,
                          trial_proposals_used: 0,
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString()
                        });
                      } else {
                        setSelectedSubscriber({
                          ...selectedSubscriber,
                          subscription_tier: value
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basico">Essencial</SelectItem>
                      <SelectItem value="profissional">Profissional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Data Início do Trial</Label>
                  <Input
                    type="datetime-local"
                    value={selectedSubscriber?.trial_start_date ? 
                      new Date(selectedSubscriber.trial_start_date).toISOString().slice(0, 16) : 
                      ''
                    }
                    onChange={(e) => {
                      const newDate = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                      if (!selectedSubscriber) {
                        setSelectedSubscriber({
                          id: '',
                          email: selectedUser.email,
                          user_id: selectedUser.id,
                          subscribed: false,
                          trial_start_date: newDate,
                          trial_proposals_used: 0,
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString()
                        });
                      } else {
                        setSelectedSubscriber({
                          ...selectedSubscriber,
                          trial_start_date: newDate
                        });
                      }
                    }}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Data Fim do Trial</Label>
                  <Input
                    type="datetime-local"
                    value={selectedSubscriber?.trial_end_date ? 
                      new Date(selectedSubscriber.trial_end_date).toISOString().slice(0, 16) : 
                      ''
                    }
                    onChange={(e) => {
                      const newDate = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                      if (!selectedSubscriber) {
                        setSelectedSubscriber({
                          id: '',
                          email: selectedUser.email,
                          user_id: selectedUser.id,
                          subscribed: false,
                          trial_end_date: newDate,
                          trial_proposals_used: 0,
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString()
                        });
                      } else {
                        setSelectedSubscriber({
                          ...selectedSubscriber,
                          trial_end_date: newDate
                        });
                      }
                    }}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Propostas Usadas no Trial</Label>
                  <Input
                    type="number"
                    value={selectedSubscriber?.trial_proposals_used || 0}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value) || 0;
                      if (!selectedSubscriber) {
                        setSelectedSubscriber({
                          id: '',
                          email: selectedUser.email,
                          user_id: selectedUser.id,
                          subscribed: false,
                          trial_proposals_used: newValue,
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString()
                        });
                      } else {
                        setSelectedSubscriber({
                          ...selectedSubscriber,
                          trial_proposals_used: newValue
                        });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveUser}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GerenciamentoUsuariosPage;
