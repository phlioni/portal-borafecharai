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
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  raw_user_meta_data?: any;
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

const GerenciamentoUsuariosPage = () => {
  const { user } = useAuth();
  const { fixTrial } = useUserPermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [selectedUserRole, setSelectedUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Verificar se o usuário é admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.email === 'admin@borafecharai.com') {
        setIsAdmin(true);
      } else {
        // Verificar se o usuário tem role de admin
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user?.id)
          .eq('role', 'admin')
          .single();
          
        if (userRoles) {
          setIsAdmin(true);
        }
      }
    };
    
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  // Carregar dados dos usuários
  const loadUsers = async () => {
    if (!isAdmin) return;
    
    setIsLoading(true);
    try {
      // Buscar usuários (usando edge function para acessar auth.users)
      const { data: authUsers, error: authError } = await supabase.functions.invoke('get-users');
      
      if (authError) {
        console.error('Erro ao buscar usuários:', authError);
        toast.error('Erro ao carregar usuários');
        return;
      }

      // Buscar assinantes
      const { data: subscribersData, error: subscribersError } = await supabase
        .from('subscribers')
        .select('*');

      if (subscribersError) {
        console.error('Erro ao buscar assinantes:', subscribersError);
        toast.error('Erro ao carregar assinantes');
        return;
      }

      // Buscar roles dos usuários
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) {
        console.error('Erro ao buscar roles:', rolesError);
        toast.error('Erro ao carregar roles');
        return;
      }

      setUsers(authUsers || []);
      setSubscribers(subscribersData || []);
      setUserRoles(rolesData || []);
    } catch (error) {
      console.error('Erro geral:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
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

  // Carregar dados quando o componente montar
  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  // Abrir dialog de edição
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    
    // Encontrar subscriber correspondente
    const subscriber = subscribers.find(s => s.user_id === user.id || s.email === user.email);
    setSelectedSubscriber(subscriber || null);
    
    // Encontrar role correspondente
    const role = userRoles.find(r => r.user_id === user.id);
    setSelectedUserRole(role || null);
    
    setIsEditDialogOpen(true);
  };

  // Salvar alterações do usuário
  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      // Atualizar subscriber se existir
      if (selectedSubscriber) {
        const { error: subscriberError } = await supabase
          .from('subscribers')
          .update({
            subscribed: selectedSubscriber.subscribed,
            subscription_tier: selectedSubscriber.subscription_tier,
            trial_end_date: selectedSubscriber.trial_end_date,
            trial_proposals_used: selectedSubscriber.trial_proposals_used
          })
          .eq('id', selectedSubscriber.id);

        if (subscriberError) {
          console.error('Erro ao atualizar subscriber:', subscriberError);
          toast.error('Erro ao atualizar assinatura');
          return;
        }
      }

      // Atualizar ou criar role
      if (selectedUserRole) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: selectedUser.id,
            role: selectedUserRole.role
          });

        if (roleError) {
          console.error('Erro ao atualizar role:', roleError);
          toast.error('Erro ao atualizar permissões');
          return;
        }
      }

      toast.success('Usuário atualizado com sucesso!');
      setIsEditDialogOpen(false);
      loadUsers(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar alterações');
    }
  };

  // Excluir usuário
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      // Primeiro, excluir registros relacionados
      await supabase.from('user_roles').delete().eq('user_id', userId);
      await supabase.from('subscribers').delete().eq('user_id', userId);
      
      // Excluir usuário via edge function
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (error) {
        console.error('Erro ao excluir usuário:', error);
        toast.error('Erro ao excluir usuário');
        return;
      }

      toast.success('Usuário excluído com sucesso!');
      loadUsers(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir usuário');
    }
  };

  // Obter subscriber de um usuário
  const getUserSubscriber = (userId: string, email: string) => {
    return subscribers.find(s => s.user_id === userId || s.email === email);
  };

  // Obter role de um usuário
  const getUserRole = (userId: string) => {
    return userRoles.find(r => r.user_id === userId);
  };

  // Corrigir trial de um usuário específico
  const handleFixUserTrial = async (userId: string, userEmail: string) => {
    try {
      // Usar edge function fix-trial para o usuário específico
      const { error } = await supabase.functions.invoke('fix-trial', {
        body: { userId, userEmail }
      });
      
      if (error) {
        console.error('Erro ao corrigir trial:', error);
        toast.error('Erro ao corrigir trial do usuário');
        return;
      }
      
      toast.success('Trial do usuário corrigido com sucesso!');
      loadUsers(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao corrigir trial:', error);
      toast.error('Erro ao corrigir trial do usuário');
    }
  };

  // Verificação de acesso admin
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
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-600 mt-1">Gerencie todos os usuários do sistema</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtrar Usuários
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

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Lista de todos os usuários cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const subscriber = getUserSubscriber(user.id, user.email);
                const role = getUserRole(user.id);
                
                return (
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
                      {user.email_confirmed_at ? (
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
                          {subscriber.subscription_tier || 'Assinante'}
                        </Badge>
                      ) : subscriber?.trial_end_date ? (
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
                       <div className="flex gap-2">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleEditUser(user)}
                         >
                           <Edit className="h-4 w-4" />
                         </Button>
                         <Button
                           variant="secondary"
                           size="sm"
                           onClick={() => handleFixUserTrial(user.id, user.email)}
                           title="Corrigir Trial"
                         >
                           🔧
                         </Button>
                         <Button
                           variant="destructive"
                           size="sm"
                           onClick={() => handleDeleteUser(user.id)}
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

      {/* Dialog de Edição */}
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
              {selectedSubscriber && (
                <div className="space-y-4">
                  <h3 className="font-medium">Assinatura</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={selectedSubscriber.subscribed}
                      onCheckedChange={(checked) => {
                        setSelectedSubscriber({
                          ...selectedSubscriber,
                          subscribed: checked
                        });
                      }}
                    />
                    <Label>Assinatura Ativa</Label>
                  </div>

                  <div className="space-y-3">
                    <Label>Plano</Label>
                    <Select
                      value={selectedSubscriber.subscription_tier || ''}
                      onValueChange={(value) => {
                        setSelectedSubscriber({
                          ...selectedSubscriber,
                          subscription_tier: value
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o plano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basico">Básico</SelectItem>
                        <SelectItem value="profissional">Profissional</SelectItem>
                        <SelectItem value="equipes">Equipes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Data Fim do Trial</Label>
                    <Input
                      type="datetime-local"
                      value={selectedSubscriber.trial_end_date ? 
                        new Date(selectedSubscriber.trial_end_date).toISOString().slice(0, 16) : 
                        ''
                      }
                      onChange={(e) => {
                        setSelectedSubscriber({
                          ...selectedSubscriber,
                          trial_end_date: e.target.value ? new Date(e.target.value).toISOString() : undefined
                        });
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Propostas Usadas no Trial</Label>
                    <Input
                      type="number"
                      value={selectedSubscriber.trial_proposals_used || 0}
                      onChange={(e) => {
                        setSelectedSubscriber({
                          ...selectedSubscriber,
                          trial_proposals_used: parseInt(e.target.value) || 0
                        });
                      }}
                    />
                  </div>
                </div>
              )}

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