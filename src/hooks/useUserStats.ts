
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserStats {
  totalUsers: number;
  totalProposals: number;
  totalClients: number;
  totalRevenue: number;
  monthlyUsers: Array<{
    month: string;
    count: number;
    year: number;
  }>;
}

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    totalProposals: 0,
    totalClients: 0,
    totalRevenue: 0,
    monthlyUsers: []
  });
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Buscar total de usuários
      const { data: usersData, error: usersError } = await supabase.functions.invoke('get-users');
      if (usersError) throw usersError;
      const totalUsers = usersData?.length || 0;

      // Buscar total de propostas
      const { count: totalProposals, error: proposalsError } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true });
      if (proposalsError) throw proposalsError;

      // Buscar total de clientes
      const { count: totalClients, error: clientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });
      if (clientsError) throw clientsError;

      // Buscar receita total (soma dos valores das propostas aceitas)
      const { data: revenueData, error: revenueError } = await supabase
        .from('proposals')
        .select('value')
        .eq('status', 'aceita');
      if (revenueError) throw revenueError;

      const totalRevenue = revenueData?.reduce((sum, proposal) => sum + (proposal.value || 0), 0) || 0;

      // Buscar dados mensais de usuários dos últimos 12 meses
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('subscribers')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (monthlyError) throw monthlyError;

      // Processar dados mensais
      const monthlyUsers: Array<{ month: string; count: number; year: number }> = [];
      const usersByMonth: { [key: string]: number } = {};

      monthlyData?.forEach(user => {
        const date = new Date(user.created_at);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        usersByMonth[monthKey] = (usersByMonth[monthKey] || 0) + 1;
      });

      // Preencher os últimos 12 meses
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        
        monthlyUsers.push({
          month: monthName,
          count: usersByMonth[monthKey] || 0,
          year: date.getFullYear()
        });
      }

      setStats({
        totalUsers,
        totalProposals: totalProposals || 0,
        totalClients: totalClients || 0,
        totalRevenue,
        monthlyUsers
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas dos usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return {
    stats,
    loading,
    loadStats
  };
};
