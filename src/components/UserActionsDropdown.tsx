
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, RotateCcw, Clock, Trash2, UserCog, Shield, Users, User } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  created_at: string;
  role?: string;
  subscriber?: {
    subscribed: boolean;
    subscription_tier?: string;
    trial_end_date?: string;
    trial_proposals_used?: number;
    trial_start_date?: string;
    bonus_proposals_current_month?: number;
  };
  trial_limits?: {
    trial_proposals_limit: number;
    trial_days_limit: number;
  };
}

interface UserActionsDropdownProps {
  user: User;
  onResetProposals: (userId: string) => Promise<void>;
  onResetTrial: (userId: string) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onChangeRole: (userId: string, role: 'user' | 'guest' | 'admin') => Promise<void>;
}

const UserActionsDropdown = ({ 
  user, 
  onResetProposals, 
  onResetTrial, 
  onDeleteUser,
  onChangeRole 
}: UserActionsDropdownProps) => {
  const handleResetProposals = async () => {
    try {
      await onResetProposals(user.id);
      toast.success('Propostas resetadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao resetar propostas');
    }
  };

  const handleResetTrial = async () => {
    try {
      await onResetTrial(user.id);
      toast.success('Trial resetado com sucesso!');
    } catch (error) {
      toast.error('Erro ao resetar trial');
    }
  };

  const handleDeleteUser = async () => {
    if (window.confirm(`Tem certeza que deseja deletar o usuário ${user.email}?`)) {
      try {
        await onDeleteUser(user.id);
        toast.success('Usuário deletado com sucesso!');
      } catch (error) {
        toast.error('Erro ao deletar usuário');
      }
    }
  };

  const handleChangeRole = async (newRole: 'user' | 'guest' | 'admin') => {
    // Não permitir alterar role do admin principal
    if (user.email === 'admin@borafecharai.com') {
      toast.error('Não é possível alterar a role do administrador principal');
      return;
    }

    if (window.confirm(`Tem certeza que deseja alterar a role de ${user.email} para ${newRole}?`)) {
      try {
        await onChangeRole(user.id, newRole);
      } catch (error) {
        // O erro já é tratado no hook
      }
    }
  };

  const isMainAdmin = user.email === 'admin@borafecharai.com';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        
        {!isMainAdmin && (
          <>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <UserCog className="mr-2 h-4 w-4" />
                <span>Alterar Role</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem 
                  onClick={() => handleChangeRole('user')}
                  disabled={user.role === 'user'}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>User</span>
                  {user.role === 'user' && <span className="ml-auto text-xs text-muted-foreground">atual</span>}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleChangeRole('guest')}
                  disabled={user.role === 'guest'}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>Guest</span>
                  {user.role === 'guest' && <span className="ml-auto text-xs text-muted-foreground">atual</span>}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleChangeRole('admin')}
                  disabled={user.role === 'admin'}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin</span>
                  {user.role === 'admin' && <span className="ml-auto text-xs text-muted-foreground">atual</span>}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={handleResetProposals}>
          <RotateCcw className="mr-2 h-4 w-4" />
          <span>Resetar Propostas</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleResetTrial}>
          <Clock className="mr-2 h-4 w-4" />
          <span>Resetar Trial</span>
        </DropdownMenuItem>
        
        {!isMainAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDeleteUser}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Deletar Usuário</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActionsDropdown;
