
import React, { useState, useMemo } from 'react';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useAdminOperations } from '@/hooks/useAdminOperations';
import { useUserStats } from '@/hooks/useUserStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Users, RefreshCw, UserCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import UserStatusBadges from '@/components/UserStatusBadges';
import UserActionsDropdown from '@/components/UserActionsDropdown';
import MobileUserCard from '@/components/MobileUserCard';
import UserStatsCards from '@/components/admin/UserStatsCards';
import UserEvolutionChart from '@/components/admin/UserEvolutionChart';
import UserSearchFilter from '@/components/admin/UserSearchFilter';
import { useIsMobile } from '@/hooks/use-mobile';

const GerenciamentoUsuariosPage = () => {
  const { isAdmin, loading: permissionsLoading } = useUserPermissions();
  const { 
    users, 
    loading, 
    loadUsers, 
    resetUserData, 
    deleteUser, 
    createAdminUser,
    changeUserRole,
    normalizeAllUserRoles
  } = useAdminOperations();
  const { stats, loading: statsLoading, loadStats } = useUserStats();
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [showCreateAdminDialog, setShowCreateAdminDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  // Filtrar usuários baseado no termo de busca
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      user.email.toLowerCase().includes(term) ||
      (user.profile?.name && user.profile.name.toLowerCase().includes(term))
    );
  }, [users, searchTerm]);

  const handleCreateAdmin = async () => {
    if (!newAdminEmail) {
      toast.error('Por favor, insira um email válido');
      return;
    }

    setIsCreatingAdmin(true);
    try {
      await createAdminUser(newAdminEmail);
      setNewAdminEmail('');
      setShowCreateAdminDialog(false);
      toast.success('Usuário admin criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar usuário admin:', error);
      toast.error('Erro ao criar usuário admin');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleResetProposals = async (userId: string) => {
    await resetUserData(userId, 'proposals');
  };

  const handleResetTrial = async (userId: string) => {
    await resetUserData(userId, 'trial');
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([loadUsers(), loadStats()]);
      toast.success('Dados atualizados!');
    } catch (error) {
      toast.error('Erro ao atualizar dados');
    }
  };

  const handleNormalizeRoles = async () => {
    if (window.confirm('Tem certeza que deseja normalizar todas as roles? Isso definirá todos os usuários como "user", exceto o admin principal.')) {
      try {
        await normalizeAllUserRoles();
      } catch (error) {
        // O erro já é tratado no hook
      }
    }
  };

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-destructive mb-2">Acesso Negado</h2>
              <p className="text-muted-foreground">
                Você não tem permissão para acessar esta página. 
                Apenas administradores podem gerenciar usuários.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, roles e permissões do sistema
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            disabled={loading || statsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(loading || statsLoading) ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Button 
            onClick={handleNormalizeRoles} 
            variant="outline"
            disabled={loading}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Normalizar Roles
          </Button>
          
          <Dialog open={showCreateAdminDialog} onOpenChange={setShowCreateAdminDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário Admin</DialogTitle>
                <DialogDescription>
                  Crie um novo usuário com privilégios de administrador. 
                  Uma senha temporária será gerada.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="admin-email">Email do novo admin</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@exemplo.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateAdmin}
                  disabled={isCreatingAdmin || !newAdminEmail}
                >
                  {isCreatingAdmin ? 'Criando...' : 'Criar Admin'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <UserStatsCards stats={stats} loading={statsLoading} />

      {/* Gráfico de Evolução */}
      <UserEvolutionChart monthlyUsers={stats.monthlyUsers} loading={statsLoading} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários do Sistema
          </CardTitle>
          <CardDescription>
            Total de {users.length} usuários cadastrados
            {filteredUsers.length !== users.length && (
              <span> • {filteredUsers.length} encontrados</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtro de Busca */}
          <UserSearchFilter 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
          />

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Carregando usuários...</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum usuário encontrado para a busca' : 'Nenhum usuário encontrado'}
              </p>
            </div>
          ) : (
            <>
              {isMobile ? (
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <MobileUserCard
                      key={user.id}
                      user={{
                        id: user.id,
                        email: user.email,
                        created_at: user.created_at,
                        role: user.role,
                        subscriber: user.subscriber
                      }}
                      onResetProposals={handleResetProposals}
                      onResetTrial={handleResetTrial}
                      onDeleteUser={deleteUser}
                      onChangeRole={changeUserRole}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data de Cadastro</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <UserStatusBadges user={user} />
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <UserActionsDropdown
                              user={user}
                              onResetProposals={handleResetProposals}
                              onResetTrial={handleResetTrial}
                              onDeleteUser={deleteUser}
                              onChangeRole={changeUserRole}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GerenciamentoUsuariosPage;
