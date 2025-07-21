import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

export const useAdminOperations = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('useAdminOperations - Loading users...');

      const { data, error } = await supabase.functions.invoke('get-users');

      if (error) {
        console.error('useAdminOperations - Error loading users:', error);
        throw error;
      }

      console.log('useAdminOperations - Users loaded:', data?.length || 0);
      
      // Buscar dados adicionais para cada usuário
      const usersWithDetails = await Promise.all(
        (data || []).map(async (user: any) => {
          // Buscar role do usuário
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);

          // Determinar role principal (prioridade: admin > guest > user)
          let primaryRole = 'user';
          if (userRoles && userRoles.length > 0) {
            if (userRoles.some(r => r.role === 'admin')) {
              primaryRole = 'admin';
            } else if (userRoles.some(r => r.role === 'guest')) {
              primaryRole = 'guest';
            }
          }

          // Buscar subscriber data
          const { data: subscriberData } = await supabase
            .from('subscribers')
            .select('*')
            .eq('user_id', user.id)
            .single();

          // Buscar trial limits para usuários em trial
          let trialLimits = null;
          if (subscriberData && !subscriberData.subscribed) {
            const { data: limitsData } = await supabase
              .from('trial_limits')
              .select('*')
              .eq('user_id', user.id)
              .single();
            
            trialLimits = limitsData;
          }

          return {
            ...user,
            role: primaryRole,
            subscriber: subscriberData,
            trial_limits: trialLimits
          };
        })
      );

      setUsers(usersWithDetails);
      return usersWithDetails;
    } catch (error) {
      console.error('useAdminOperations - Error in loadUsers:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changeUserRole = async (userId: string, newRole: 'user' | 'guest' | 'admin') => {
    try {
      console.log(`useAdminOperations - Changing role for user ${userId} to ${newRole}`);

      // Primeiro, remover todas as roles existentes do usuário
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('useAdminOperations - Error deleting existing roles:', deleteError);
        throw deleteError;
      }

      // Depois, inserir a nova role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole
        });

      if (insertError) {
        console.error('useAdminOperations - Error inserting new role:', insertError);
        throw insertError;
      }

      console.log(`useAdminOperations - Successfully changed role for user ${userId} to ${newRole}`);
      
      // Recarregar dados dos usuários
      await loadUsers();
      
      toast.success(`Role do usuário alterada para ${newRole} com sucesso!`);

    } catch (error) {
      console.error(`useAdminOperations - Error changing user role:`, error);
      toast.error('Erro ao alterar role do usuário');
      throw error;
    }
  };

  const normalizeAllUserRoles = async () => {
    try {
      setLoading(true);
      console.log('useAdminOperations - Normalizing all user roles...');

      // Buscar todos os usuários
      const { data: allUsers, error: usersError } = await supabase.functions.invoke('get-users');
      
      if (usersError) {
        console.error('useAdminOperations - Error getting users:', usersError);
        throw usersError;
      }

      // Processar cada usuário
      for (const user of allUsers || []) {
        try {
          if (user.email === 'admin@borafecharai.com') {
            // Garantir que o admin principal tenha role admin
            await supabase
              .from('user_roles')
              .upsert({
                user_id: user.id,
                role: 'admin'
              }, {
                onConflict: 'user_id,role'
              });
            console.log(`Admin principal ${user.email} mantido como admin`);
          } else {
            // Primeiro, remover todas as roles existentes do usuário
            await supabase
              .from('user_roles')
              .delete()
              .eq('user_id', user.id);

            // Depois, inserir apenas a role 'user'
            await supabase
              .from('user_roles')
              .insert({
                user_id: user.id,
                role: 'user'
              });
            console.log(`Usuário ${user.email} definido como user`);
          }
        } catch (userError) {
          console.error(`Erro ao normalizar role do usuário ${user.email}:`, userError);
          // Continua com os outros usuários mesmo se um falhar
        }
      }

      console.log('useAdminOperations - User roles normalized successfully');
      
      // Recarregar dados dos usuários
      await loadUsers();
      
      toast.success('Roles de todos os usuários normalizadas com sucesso!');

    } catch (error) {
      console.error('useAdminOperations - Error normalizing user roles:', error);
      toast.error('Erro ao normalizar roles dos usuários');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetUserData = async (userId: string, type: 'proposals' | 'trial' | 'both') => {
    try {
      console.log(`useAdminOperations - Resetting ${type} for user:`, userId);

      if (type === 'proposals' || type === 'both') {
        // Reset trial_proposals_used
        const { error: proposalsError } = await supabase
          .from('subscribers')
          .update({ 
            trial_proposals_used: 0,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (proposalsError) {
          console.error('useAdminOperations - Error resetting proposals:', proposalsError);
          throw proposalsError;
        }
      }

      if (type === 'trial' || type === 'both') {
        // Reset trial dates and update trial_limits
        const newTrialStart = new Date();
        const newTrialEnd = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

        const { error: trialError } = await supabase
          .from('subscribers')
          .update({
            trial_start_date: newTrialStart.toISOString(),
            trial_end_date: newTrialEnd.toISOString(),
            trial_proposals_used: 0,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (trialError) {
          console.error('useAdminOperations - Error resetting trial:', trialError);
          throw trialError;
        }

        // Reset trial_limits to default values
        const { error: limitsError } = await supabase
          .from('trial_limits')
          .upsert({
            user_id: userId,
            trial_days_limit: 15,
            trial_proposals_limit: 20,
            updated_at: new Date().toISOString()
          });

        if (limitsError) {
          console.error('useAdminOperations - Error resetting trial limits:', limitsError);
          throw limitsError;
        }
      }

      console.log(`useAdminOperations - Successfully reset ${type} for user:`, userId);
      
      // Recarregar dados dos usuários
      await loadUsers();

    } catch (error) {
      console.error(`useAdminOperations - Error resetting ${type}:`, error);
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      console.log('useAdminOperations - Deleting user:', userId);
      
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (error) {
        console.error('useAdminOperations - Error deleting user:', error);
        throw error;
      }

      console.log('useAdminOperations - User deleted successfully:', userId);
      
      // Recarregar dados dos usuários
      await loadUsers();
      
      return data;
    } catch (error) {
      console.error('useAdminOperations - Error in deleteUser:', error);
      throw error;
    }
  };

  const createAdminUser = async (email: string) => {
    try {
      console.log('useAdminOperations - Creating admin user:', email);
      
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: { 
          email, 
          password: 'TempPassword123!' // Senha temporária que deve ser alterada
        }
      });

      if (error) {
        console.error('useAdminOperations - Error creating admin user:', error);
        throw error;
      }

      console.log('useAdminOperations - Admin user created successfully:', email);
      
      // Recarregar dados dos usuários
      await loadUsers();
      
      return data;
    } catch (error) {
      console.error('useAdminOperations - Error in createAdminUser:', error);
      throw error;
    }
  };

  return {
    users,
    loading,
    loadUsers,
    changeUserRole,
    normalizeAllUserRoles,
    resetUserData,
    deleteUser,
    createAdminUser
  };
};
