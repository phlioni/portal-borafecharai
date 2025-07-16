
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, RotateCcw, Clock, FileText, UserCog } from 'lucide-react';
import { useAdminOperations } from '@/hooks/useAdminOperations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserActionsDropdownProps {
  user: {
    id: string;
    email: string;
    role?: string;
    subscriber?: {
      trial_end_date?: string;
      trial_proposals_used?: number;
    };
  };
}

const UserActionsDropdown = ({ user }: UserActionsDropdownProps) => {
  const { resetUserData, loadUsers } = useAdminOperations();
  const [isResetting, setIsResetting] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const handleResetProposals = async () => {
    setIsResetting(true);
    try {
      await resetUserData(user.id, 'proposals');
      toast.success('Propostas resetadas com sucesso!');
    } catch (error) {
      console.error('Erro ao resetar propostas:', error);
      toast.error('Erro ao resetar propostas');
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetTrial = async () => {
    setIsResetting(true);
    try {
      await resetUserData(user.id, 'trial');
      toast.success('Trial resetado com sucesso!');
    } catch (error) {
      console.error('Erro ao resetar trial:', error);
      toast.error('Erro ao resetar trial');
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetBoth = async () => {
    setIsResetting(true);
    try {
      await resetUserData(user.id, 'both');
      toast.success('Dados do usuário resetados com sucesso!');
    } catch (error) {
      console.error('Erro ao resetar dados:', error);
      toast.error('Erro ao resetar dados do usuário');
    } finally {
      setIsResetting(false);
    }
  };

  const handleRoleChange = async (newRole: 'admin' | 'user' | 'guest') => {
    setIsUpdatingRole(true);
    try {
      console.log(`Alterando role de ${user.email} para ${newRole}`);
      
      // Primeiro, remover role existente
      if (user.role) {
        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Erro ao remover role existente:', deleteError);
        }
      }

      // Inserir nova role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: newRole
        });

      if (error) {
        console.error('Erro ao atualizar role:', error);
        toast.error('Erro ao atualizar role do usuário');
        return;
      }

      toast.success(`Role alterada para ${newRole} com sucesso!`);
      
      // Aguardar um pouco e recarregar dados dos usuários
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadUsers();
    } catch (error) {
      console.error('Erro ao alterar role:', error);
      toast.error('Erro ao alterar role do usuário');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleResetProposals} disabled={isResetting}>
          <FileText className="mr-2 h-4 w-4" />
          Resetar Propostas
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleResetTrial} disabled={isResetting}>
          <Clock className="mr-2 h-4 w-4" />
          Resetar Trial
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleResetBoth} disabled={isResetting}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Resetar Tudo
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={isUpdatingRole}>
            <UserCog className="mr-2 h-4 w-4" />
            Alterar Role
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem 
              onClick={() => handleRoleChange('admin')}
              disabled={isUpdatingRole || user.role === 'admin'}
            >
              Admin
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleRoleChange('user')}
              disabled={isUpdatingRole || user.role === 'user'}
            >
              User
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleRoleChange('guest')}
              disabled={isUpdatingRole || user.role === 'guest'}
            >
              Guest
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActionsDropdown;
