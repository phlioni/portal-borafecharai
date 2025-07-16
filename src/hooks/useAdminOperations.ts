
import { useState, useEffect } from 'react';
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
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async (): Promise<AdminUser[]> => {
    setLoading(true);
    try {
      console.log('useAdminOperations - Carregando usuários...');
      
      // Buscar usuários
      const { data: authUsers, error: authError } = await supabase.functions.invoke('get-users');
      
      if (authError) {
        console.error('Erro ao buscar usuários:', authError);
        toast.error('Erro ao carregar usuários');
        return [];
      }

      console.log('useAdminOperations - Usuários auth encontrados:', authUsers?.length);

      // Buscar dados de assinatura e roles
      const { data: subscribers } = await supabase.from('subscribers').select('*');
      const { data: roles } = await supabase.from('user_roles').select('*');

      console.log('useAdminOperations - Subscribers encontrados:', subscribers?.length);
      console.log('useAdminOperations - Roles encontradas:', roles?.length);

      // Combinar dados
      const usersWithData = authUsers.map((authUser: any) => {
        const subscriber = subscribers?.find(s => s.user_id === authUser.id || s.email === authUser.email);
        const userRole = roles?.find(r => r.user_id === authUser.id);
        
        console.log(`useAdminOperations - Usuário ${authUser.email}:`, {
          subscriber: subscriber ? 'encontrado' : 'não encontrado',
          role: userRole?.role || 'sem role'
        });
        
        return {
          ...authUser,
          subscriber,
          role: userRole?.role
        };
      });

      console.log('useAdminOperations - Usuários finais processados:', usersWithData.length);
      setUsers(usersWithData);
      return usersWithData;
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
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

      toast.success('Usuário excluído com sucesso!');
      await loadUsers(); // Recarregar lista
      return true;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      toast.error('Erro ao deletar usuário');
      return false;
    }
  };

  const createAdminUser = async (email: string) => {
    try {
      const { error } = await supabase.functions.invoke('create-admin-user', {
        body: { email }
      });

      if (error) {
        console.error('Erro ao criar admin:', error);
        toast.error('Erro ao criar usuário administrador');
        throw error;
      }

      toast.success('Usuário administrador criado com sucesso!');
      await loadUsers(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao criar admin:', error);
      throw error;
    }
  };

  const resetUserData = async (userId: string, resetType: 'proposals' | 'trial' | 'both') => {
    try {
      console.log('useAdminOperations - Iniciando reset para usuário:', userId, 'tipo:', resetType);
      
      if (resetType === 'proposals' || resetType === 'both') {
        console.log('useAdminOperations - Resetando propostas...');
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
        console.log('useAdminOperations - Resetando trial via edge function...');
        const { data, error } = await supabase.functions.invoke('fix-trial', {
          body: { userId }
        });

        console.log('useAdminOperations - Resposta da edge function:', data);

        if (error) {
          console.error('Erro ao resetar trial:', error);
          toast.error('Erro ao resetar trial');
          return false;
        }

        if (!data?.success) {
          console.error('Edge function não retornou sucesso:', data);
          toast.error('Erro ao resetar trial');
          return false;
        }
      }

      toast.success('Dados do usuário resetados com sucesso!');
      
      // Aguardar um tempo para garantir que as mudanças foram aplicadas no banco
      console.log('useAdminOperations - Aguardando antes de recarregar...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Recarregar dados dos usuários
      console.log('useAdminOperations - Recarregando dados dos usuários...');
      await loadUsers();
      return true;
    } catch (error) {
      console.error('Erro ao resetar dados:', error);
      toast.error('Erro ao resetar dados do usuário');
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

  // Carregar usuários na inicialização
  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    loading,
    deleteUser,
    createAdminUser,
    loadUsers,
    resetUserData,
    checkUniquePhone
  };
};
