
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
    trial_start_date?: string;
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
      
      // Buscar usuários com melhor tratamento de erro
      const { data: authUsers, error: authError } = await supabase.functions.invoke('get-users');
      
      if (authError) {
        console.error('useAdminOperations - Erro ao buscar usuários:', authError);
        
        // Mensagens de erro mais específicas
        if (authError.message?.includes('401') || authError.message?.includes('Unauthorized')) {
          toast.error('Erro de autorização. Verifique se você tem permissões de admin.');
        } else if (authError.message?.includes('403') || authError.message?.includes('Access denied')) {
          toast.error('Acesso negado. Apenas administradores podem ver esta página.');
        } else {
          toast.error('Erro ao carregar usuários. Tente novamente.');
        }
        return [];
      }

      if (!authUsers || !Array.isArray(authUsers)) {
        console.error('useAdminOperations - Resposta inválida da API:', authUsers);
        toast.error('Erro na resposta do servidor');
        return [];
      }

      console.log('useAdminOperations - Usuários auth encontrados:', authUsers?.length);

      // Buscar dados de assinatura e roles com dados mais atualizados
      const { data: subscribers } = await supabase
        .from('subscribers')
        .select('*')
        .order('updated_at', { ascending: false });
        
      const { data: roles } = await supabase
        .from('user_roles')
        .select('*');

      console.log('useAdminOperations - Subscribers encontrados:', subscribers?.length);
      console.log('useAdminOperations - Roles encontradas:', roles?.length);

      // Combinar dados e garantir que todos tenham uma role
      const usersWithData = await Promise.all(authUsers.map(async (authUser: any) => {
        const subscriber = subscribers?.find(s => s.user_id === authUser.id || s.email === authUser.email);
        let userRole = roles?.find(r => r.user_id === authUser.id);
        
        // Se o usuário não tem role, criar uma role 'user' por padrão
        if (!userRole && authUser.email !== 'admin@borafecharai.com') {
          console.log(`useAdminOperations - Criando role 'user' para ${authUser.email}`);
          const { data: newRole, error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: authUser.id,
              role: 'user'
            })
            .select()
            .single();

          if (!roleError && newRole) {
            userRole = newRole;
          }
        }
        
        console.log(`useAdminOperations - Usuário ${authUser.email}:`, {
          subscriber: subscriber ? 'encontrado' : 'não encontrado',
          subscriberData: subscriber,
          role: userRole?.role || 'sem role',
          trialProposalsUsed: subscriber?.trial_proposals_used
        });
        
        return {
          ...authUser,
          subscriber,
          role: userRole?.role
        };
      }));

      console.log('useAdminOperations - Usuários finais processados:', usersWithData.length);
      setUsers(usersWithData);
      return usersWithData;
    } catch (error) {
      console.error('useAdminOperations - Erro ao carregar usuários:', error);
      toast.error('Erro inesperado ao carregar usuários');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      console.log('Iniciando exclusão do usuário:', userId);
      
      // Deletar usuário via edge function (que já cuida de todos os dados relacionados)
      const { data, error: deleteError } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (deleteError) {
        console.error('Erro ao excluir usuário:', deleteError);
        
        // Mensagens de erro mais específicas
        if (deleteError.message?.includes('403') || deleteError.message?.includes('Access denied')) {
          toast.error('Acesso negado. Apenas administradores podem deletar usuários.');
        } else if (deleteError.message?.includes('401') || deleteError.message?.includes('Unauthorized')) {
          toast.error('Erro de autorização. Faça login novamente.');
        } else {
          toast.error(`Erro ao excluir usuário: ${deleteError.message || 'Erro desconhecido'}`);
        }
        return false;
      }

      if (data && !data.success) {
        console.error('Edge function retornou erro:', data);
        toast.error('Erro ao excluir usuário');
        return false;
      }

      console.log('Usuário excluído com sucesso');
      toast.success('Usuário excluído com sucesso!');
      
      // Recarregar lista após um pequeno delay para garantir que a exclusão foi processada
      setTimeout(() => {
        loadUsers();
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      toast.error('Erro inesperado ao deletar usuário');
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
      
      // Recarregar dados com um pequeno delay para garantir que as mudanças foram persistidas
      setTimeout(async () => {
        console.log('useAdminOperations - Recarregando dados dos usuários após reset...');
        await loadUsers();
      }, 1000);
      
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
