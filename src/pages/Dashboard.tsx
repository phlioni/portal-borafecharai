
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Plus, 
  TrendingUp,
  Clock,
  Users,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProposals } from '@/hooks/useProposals';

const Dashboard = () => {
  const { data: proposals, isLoading, error } = useProposals();

  // Calculate stats from real data
  const stats = React.useMemo(() => {
    if (!proposals) return [];

    const totalProposals = proposals.length;
    const acceptedProposals = proposals.filter(p => p.status === 'aceita').length;
    const viewedProposals = proposals.filter(p => p.status === 'visualizada' || p.status === 'aceita').length;
    const totalValue = proposals
      .filter(p => p.status === 'aceita' && p.value)
      .reduce((sum, p) => sum + (Number(p.value) || 0), 0);
    
    const averageValue = acceptedProposals > 0 ? totalValue / acceptedProposals : 0;
    const viewRate = totalProposals > 0 ? Math.round((viewedProposals / totalProposals) * 100) : 0;
    const conversionRate = totalProposals > 0 ? Math.round((acceptedProposals / totalProposals) * 100) : 0;

    return [
      {
        title: 'Propostas Criadas',
        value: totalProposals.toString(),
        change: `${acceptedProposals} aceitas`,
        icon: FileText,
        color: 'text-blue-600'
      },
      {
        title: 'Taxa de Visualização',
        value: `${viewRate}%`,
        change: `${viewedProposals} visualizadas`,
        icon: Eye,
        color: 'text-green-600'
      },
      {
        title: 'Taxa de Conversão',
        value: `${conversionRate}%`,
        change: `${acceptedProposals} aceitas`,
        icon: CheckCircle,
        color: 'text-emerald-600'
      },
      {
        title: 'Valor Médio',
        value: `R$ ${averageValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
        change: `Total: R$ ${totalValue.toLocaleString('pt-BR')}`,
        icon: TrendingUp,
        color: 'text-purple-600'
      }
    ];
  }, [proposals]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { 
      label: string; 
      variant: 'default' | 'secondary' | 'destructive' | 'outline'; 
      icon: any; 
      className?: string; 
    }> = {
      'enviada': { label: 'Enviada', variant: 'secondary' as const, icon: Clock },
      'visualizada': { label: 'Visualizada', variant: 'default' as const, icon: Eye },
      'aceita': { label: 'Aceita', variant: 'default' as const, icon: CheckCircle, className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      'perdida': { label: 'Perdida', variant: 'destructive' as const, icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.enviada;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className || ''}`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Erro ao carregar dados</h1>
          <p className="text-gray-600">Tente recarregar a página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral das suas propostas e desempenho</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link to="/propostas/nova">
            <Plus className="h-4 w-4 mr-2" />
            Nova Proposta
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Proposals */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Propostas Recentes</CardTitle>
              <CardDescription>
                Acompanhe o status das suas últimas propostas enviadas
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link to="/propostas">Ver Todas</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Carregando propostas...</span>
            </div>
          ) : !proposals || proposals.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma proposta encontrada</h3>
              <p className="text-gray-500 mb-4">Comece criando sua primeira proposta comercial.</p>
              <Button asChild>
                <Link to="/propostas/nova">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Proposta
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.slice(0, 4).map((proposal) => (
                <div key={proposal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{proposal.title}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <Users className="h-4 w-4" />
                      {proposal.companies?.name || 'Cliente não informado'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {getDaysAgo(proposal.created_at)} {getDaysAgo(proposal.created_at) === 1 ? 'dia atrás' : 'dias atrás'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900">
                      {proposal.value ? `R$ ${Number(proposal.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Valor não informado'}
                    </span>
                    {getStatusBadge(proposal.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Templates
            </CardTitle>
            <CardDescription>
              Acesse seus templates personalizados
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Analytics
            </CardTitle>
            <CardDescription>
              Veja relatórios detalhados de performance
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Clientes
            </CardTitle>
            <CardDescription>
              Gerencie seus clientes e contatos
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
