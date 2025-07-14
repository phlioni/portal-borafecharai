
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
      const { data, error } = await supabase.rpc('admin_reset_user_data', {
        target_user_id: userId,
        reset_proposals: resetType === 'proposals' || resetType === 'both',
        reset_trial: resetType === 'trial' || resetType === 'both'
      });

      if (error) {
        console.error('Erro ao resetar dados:', error);
        toast.error('Erro ao resetar dados do usuário');
        return false;
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
      const { data, error } = await supabase.rpc('admin_manage_user_status', {
        target_user_id: userId,
        action,
        make_admin: makeAdmin
      });

      if (error) {
        console.error('Erro ao gerenciar usuário:', error);
        toast.error('Erro ao gerenciar usuário');
        return false;
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
      const { data, error } = await supabase.rpc('check_unique_phone_across_users', {
        p_phone: phone,
        p_user_id: userId
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

  return {
    isLoading,
    loadUsers,
    resetUserData,
    manageUserStatus,
    checkUniquePhone
  };
};
