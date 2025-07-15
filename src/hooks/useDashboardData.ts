
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalProposals: number;
  totalProposalsSent: number;
  totalProposalsValue: number;
  totalClients: number;
  totalProposalsApproved: number;
  lastProposalSentAt: string | null;
  proposalsExpiringSoon: Array<{
    id: string;
    title: string;
    validity_date: string;
    companies: {
      name: string;
    } | null;
  }>;
}

interface RecentProposal {
  id: string;
  title: string;
  status: string | null;
  created_at: string;
  companies: {
    name: string;
  } | null;
}

interface DashboardData {
  stats: DashboardStats;
  recentProposals: RecentProposal[];
  loading: boolean;
}

export const useDashboardData = () => {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-data', user?.id],
    queryFn: async (): Promise<Omit<DashboardData, 'loading'>> => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      // Get total proposals
      const { count: totalProposals } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get total proposals sent
      const { count: totalProposalsSent } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'enviada');

      // Get total proposals value
      const { data: proposalsData } = await supabase
        .from('proposals')
        .select('value')
        .eq('user_id', user.id)
        .not('value', 'is', null);

      const totalProposalsValue = proposalsData?.reduce((sum, proposal) => sum + (proposal.value || 0), 0) || 0;

      // Get total clients
      const { count: totalClients } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get total approved proposals
      const { count: totalProposalsApproved } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'aceita');

      // Get last proposal sent date
      const { data: lastProposal } = await supabase
        .from('proposals')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('status', 'enviada')
        .order('created_at', { ascending: false })
        .limit(1);

      // Get proposals expiring soon (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data: proposalsExpiringSoon } = await supabase
        .from('proposals')
        .select(`
          id,
          title,
          validity_date,
          companies:company_id (
            name
          )
        `)
        .eq('user_id', user.id)
        .gte('validity_date', new Date().toISOString())
        .lte('validity_date', thirtyDaysFromNow.toISOString())
        .order('validity_date', { ascending: true })
        .limit(5);

      // Get recent proposals
      const { data: recentProposals } = await supabase
        .from('proposals')
        .select(`
          id,
          title,
          status,
          created_at,
          companies:company_id (
            name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const stats: DashboardStats = {
        totalProposals: totalProposals || 0,
        totalProposalsSent: totalProposalsSent || 0,
        totalProposalsValue,
        totalClients: totalClients || 0,
        totalProposalsApproved: totalProposalsApproved || 0,
        lastProposalSentAt: lastProposal?.[0]?.created_at || null,
        proposalsExpiringSoon: proposalsExpiringSoon || [],
      };

      return {
        stats,
        recentProposals: recentProposals || []
      };
    },
    enabled: !!user?.id,
  });

  return {
    stats: data?.stats || {
      totalProposals: 0,
      totalProposalsSent: 0,
      totalProposalsValue: 0,
      totalClients: 0,
      totalProposalsApproved: 0,
      lastProposalSentAt: null,
      proposalsExpiringSoon: []
    },
    recentProposals: data?.recentProposals || [],
    loading: isLoading
  };
};
