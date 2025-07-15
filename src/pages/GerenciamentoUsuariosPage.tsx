
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminOperations } from '@/hooks/useAdminOperations';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Users, UserPlus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileUserCard from '@/components/MobileUserCard';
import UserActionsDropdown from '@/components/UserActionsDropdown';
import UserStatusBadges from '@/components/UserStatusBadges';

const GerenciamentoUsuariosPage = () => {
  const { users, loading, deleteUser, createAdminUser } = useAdminOperations();
  const [email, setEmail] = useState('');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleCreateAdmin = async () => {
    if (!email.trim()) {
      toast.error('Por favor, insira um email válido');
      return;
    }

    setIsCreatingAdmin(true);
    try {
      await createAdminUser(email);
      setEmail('');
      toast.success('Usuário administrador criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar admin:', error);
      toast.error('Erro ao criar usuário administrador');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    try {
      await deleteUser(userId);
      toast.success('Usuário deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      toast.error('Erro ao deletar usuário');
    } finally {
      setDeletingUserId(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSubscribers = users.filter(user => user.subscriber?.subscribed).length;
  const activeTrials = users.filter(user => {
    const trialEndDate = user.subscriber?.trial_end_date;
    return trialEndDate && new Date(trialEndDate) > new Date() && !user.subscriber?.subscribed;
  }).length;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-6`}>
      <div>
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold flex items-center gap-2`}>
          <Users className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
          Gerenciamento de Usuários
        </h1>
        <p className="text-muted-foreground">Painel administrativo completo</p>
      </div>

      {/* Estatísticas */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-4`}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinantes Ativos</CardTitle>
            <Badge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscribers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trials Ativos</CardTitle>
            <Badge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTrials}</div>
          </CardContent>
        </Card>
      </div>

      {/* Criar Admin */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Criar Usuário Administrador
          </CardTitle>
          <CardDescription>
            Adicione um novo usuário com privilégios de administrador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email do usuário</Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@exemplo.com"
            />
          </div>
          <Button
            onClick={handleCreateAdmin}
            disabled={isCreatingAdmin}
            className="w-full"
          >
            {isCreatingAdmin ? 'Criando...' : 'Criar Administrador'}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
          <CardDescription>
            Gerencie todos os usuários cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Busca */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isMobile ? (
            /* Cards para Mobile */
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum usuário encontrado
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <MobileUserCard
                    key={user.id}
                    user={user}
                    onDeleteUser={handleDeleteUser}
                    isDeleting={deletingUserId === user.id}
                  />
                ))
              )}
            </div>
          ) : (
            /* Tabela para Desktop */
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono text-sm">
                        {user.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <UserStatusBadges user={user} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <UserActionsDropdown user={user} />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deletingUserId === user.id}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deletingUserId === user.id ? 'Deletando...' : 'Deletar'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GerenciamentoUsuariosPage;
