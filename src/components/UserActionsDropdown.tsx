
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, RotateCcw, Clock, FileText, UserCog } from 'lucide-react';
import { useAdminOperations } from '@/hooks/useAdminOperations';
import { toast } from 'sonner';

interface UserActionsDropdownProps {
  user: {
    id: string;
    email: string;
    subscriber?: {
      trial_end_date?: string;
      trial_proposals_used?: number;
    };
  };
}

const UserActionsDropdown = ({ user }: UserActionsDropdownProps) => {
  const { resetUserData } = useAdminOperations();
  const [isResetting, setIsResetting] = useState(false);

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
        <DropdownMenuItem>
          <UserCog className="mr-2 h-4 w-4" />
          Gerenciar Roles
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Edit className="mr-2 h-4 w-4" />
          Editar Usuário
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActionsDropdown;
