
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardData {
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

export const useDashboardData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-data', user?.id],
    queryFn: async (): Promise<DashboardData> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Get total proposals sent
      const { data: proposals, error: proposalsError } = await supabase
        .from('proposals')
        .select('*')
        .eq('user_id', user.id);

      if (proposalsError) {
        console.error('Error fetching proposals:', proposalsError);
        throw proposalsError;
      }

      // Get companies count
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id);

      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
        throw companiesError;
      }

      // Get proposals expiring soon (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data: expiringProposals, error: expiringError } = await supabase
        .from('proposals')
        .select(`
          id,
          title,
          validity_date,
          companies (
            name
          )
        `)
        .eq('user_id', user.id)
        .not('validity_date', 'is', null)
        .lte('validity_date', thirtyDaysFromNow.toISOString().split('T')[0])
        .gte('validity_date', new Date().toISOString().split('T')[0]);

      if (expiringError) {
        console.error('Error fetching expiring proposals:', expiringError);
        throw expiringError;
      }

      // Calculate metrics
      const totalProposalsSent = proposals?.length || 0;
      const totalProposalsValue = proposals?.reduce((sum, proposal) => {
        return sum + (proposal.value || 0);
      }, 0) || 0;
      const totalClients = companies?.length || 0;
      const totalProposalsApproved = proposals?.filter(p => p.status === 'aceita')?.length || 0;
      
      // Get last proposal sent date
      const sortedProposals = proposals?.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const lastProposalSentAt = sortedProposals?.[0]?.created_at || null;

      return {
        totalProposalsSent,
        totalProposalsValue,
        totalClients,
        totalProposalsApproved,
        lastProposalSentAt,
        proposalsExpiringSoon: expiringProposals || []
      };
    },
    enabled: !!user?.id,
  });
};
