
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export const useAdminOperations = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loadUsers = async (): Promise<AdminUser[]> => {
    setIsLoading(true);
    try {
      // Buscar usuários
      const { data: authUsers, error: authError } = await supabase.functions.invoke('get-users');
      
      if (authError) {
        console.error('Erro ao buscar usuários:', authError);
        toast.error('Erro ao carregar usuários');
        return [];
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

      return usersWithData;
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const resetUserData = async (userId: string, resetType: 'proposals' | 'trial' | 'both') => {
    try {
      if (resetType === 'proposals' || resetType === 'both') {
        const { error: proposalsError } = await supabase
          .from('subscribers')
          .update({ trial_proposals_used: 0 })
          .eq('user_id', userId);

        if (proposalsError) {
          console.error('Erro ao resetar propostas:', proposalsError);
          toast.error('Erro ao resetar propostas');
          return false;
        }
      }

      if (resetType === 'trial' || resetType === 'both') {
        const { error } = await supabase.functions.invoke('fix-trial', {
          body: { userId }
        });

        if (error) {
          console.error('Erro ao resetar trial:', error);
          toast.error('Erro ao resetar trial');
          return false;
        }
      }

      toast.success('Dados do usuário resetados com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao resetar dados:', error);
      toast.error('Erro ao resetar dados do usuário');
      return false;
    }
  };

  const manageUserStatus = async (userId: string, action: 'activate' | 'deactivate' | 'delete', makeAdmin = false) => {
    const confirmMessages = {
      activate: 'Tem certeza que deseja ativar este usuário?',
      deactivate: 'Tem certeza que deseja desativar este usuário?',
      delete: 'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.'
    };

    if (!confirm(confirmMessages[action])) return false;

    try {
      // Gerenciar permissão de admin
      if (makeAdmin) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({ user_id: userId, role: 'admin' });

        if (roleError) {
          console.error('Erro ao definir admin:', roleError);
          toast.error('Erro ao definir permissões de admin');
          return false;
        }
      } else {
        const { error: roleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (roleError) {
          console.error('Erro ao remover admin:', roleError);
        }
      }

      // Processar ação
      switch (action) {
        case 'activate':
          const { error: activateError } = await supabase
            .from('subscribers')
            .update({ subscribed: true })
            .eq('user_id', userId);

          if (activateError) {
            console.error('Erro ao ativar usuário:', activateError);
            toast.error('Erro ao ativar usuário');
            return false;
          }
          break;

        case 'deactivate':
          const { error: deactivateError } = await supabase
            .from('subscribers')
            .update({ subscribed: false })
            .eq('user_id', userId);

          if (deactivateError) {
            console.error('Erro ao desativar usuário:', deactivateError);
            toast.error('Erro ao desativar usuário');
            return false;
          }
          break;

        case 'delete':
          // Deletar dados relacionados
          await supabase.from('proposals').delete().eq('user_id', userId);
          await supabase.from('companies').delete().eq('user_id', userId);
          await supabase.from('subscribers').delete().eq('user_id', userId);
          await supabase.from('user_roles').delete().eq('user_id', userId);

          // Deletar usuário via edge function
          const { error: deleteError } = await supabase.functions.invoke('delete-user', {
            body: { userId }
          });

          if (deleteError) {
            console.error('Erro ao excluir usuário:', deleteError);
            toast.error('Erro ao excluir usuário');
            return false;
          }
          break;
      }

      const successMessages = {
        activate: 'ativado',
        deactivate: 'desativado',
        delete: 'excluído'
      };

      toast.success(`Usuário ${successMessages[action]} com sucesso!`);
      return true;
    } catch (error) {
      console.error('Erro ao gerenciar usuário:', error);
      toast.error('Erro ao gerenciar usuário');
      return false;
    }
  };

  const checkUniquePhone = async (phone: string, userId: string): Promise<boolean> => {
    if (!phone) return true;

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id')
        .eq('phone', phone)
        .neq('user_id', userId);

      if (error) {
        console.error('Erro ao verificar telefone:', error);
        return false;
      }

      return data.length === 0;
    } catch (error) {
      console.error('Erro ao verificar telefone:', error);
      return false;
    }
  };

  return {
    isLoading,
    loadUsers,
    resetUserData,
    manageUserStatus,
    checkUniquePhone
  };
};
