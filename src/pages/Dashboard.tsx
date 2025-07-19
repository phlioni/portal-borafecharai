import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, CheckCircle2, CircleDollarSign, FileText, Users, TrendingUp, Eye, Plus, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useProposals } from '@/hooks/useProposals';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ModernLoader } from '@/components/ModernLoader';
import { TrialCallToActionWrapper } from '@/components/TrialCallToActionWrapper';
import ProfileCompletionAlert from '@/components/ProfileCompletionAlert';

const Dashboard = () => {
  const { data, isLoading, error } = useDashboardData();
  const { data: proposals, isLoading: proposalsLoading } = useProposals();
  const { subscribed, subscription_tier, subscription_end } = useSubscription();
  const { monthlyProposalCount, monthlyProposalLimit } = useUserPermissions();

  if (isLoading || proposalsLoading) {
    return <ModernLoader message="Carregando dashboard..." fullScreen />;
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erro ao carregar os dados do painel
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message || 'Ocorreu um erro ao carregar os dados. Por favor, tente novamente mais tarde.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalProposals = data?.totalProposalsSent || 0;
  const totalClients = data?.totalClients || 0;
  const totalAccepted = data?.totalProposalsApproved || 0;
  const totalValue = data?.totalProposalsValue || 0;
  const acceptanceRate = totalProposals > 0 ? (totalAccepted / totalProposals) * 100 : 0;
  const totalViews = proposals?.reduce((acc, p) => acc + (p.views || 0), 0) || 0;

  const recentProposals = proposals?.slice(0, 3) || [];

  const formatDate = (date: string) => {
    return format(new Date(date), "d 'de' MMMM", { locale: ptBR });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aceita':
        return 'bg-green-100 text-green-800';
      case 'enviada':
        return 'bg-blue-100 text-blue-800';
      case 'rascunho':
        return 'bg-gray-100 text-gray-800';
      case 'rejeitada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aceita':
        return 'Aceita';
      case 'enviada':
        return 'Enviada';
      case 'rascunho':
        return 'Rascunho';
      case 'rejeitada':
        return 'Rejeitada';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aceita':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'enviada':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'rascunho':
        return <CalendarDays className="h-5 w-5 text-gray-600" />;
      case 'rejeitada':
        return <CircleDollarSign className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPlanName = (tier: string | null) => {
    switch (tier) {
      case 'basico':
        return 'Essencial';
      case 'profissional':
        return 'Professional';
      default:
        return 'Gratuito';
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Olá! 👋</h1>
          <p className="text-muted-foreground">Aqui está um resumo da sua atividade</p>
        </div>
        {/* <Button asChild className="w-full sm:w-auto">
          <Link to="/propostas/nova">
            <Plus className="h-4 w-4 mr-2" />
            Nova Proposta
          </Link>
        </Button> */}
      </div>

      {/* Profile Completion Alert */}
      {/* <ProfileCompletionAlert /> */}

      {/* Subscription Status Card
      {subscribed && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Crown className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Plano {getPlanName(subscription_tier)}</h3>
                  <p className="text-sm text-blue-700">
                    {subscription_end && `Próxima cobrança: ${formatDate(subscription_end)}`}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/configuracoes">Gerenciar Plano</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )} */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          🎁 Acesso Especial Liberado até 30/10/2025
        </h3>
        <p className="text-green-700">
          Como forma de reconhecimento pela sua importância para nós neste início, liberamos para você todos os recursos premium, sem necessidade de assinatura, até o dia <strong>30/10/2025</strong>.<br />
          Explore tudo, envie suas propostas com inteligência e nos ajude a tornar o BoraFecharAI ainda melhor!
        </p>
      </div>
      {/* Trial Call to Action */}
      <TrialCallToActionWrapper />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Propostas Criadas</p>
                <p className="text-3xl font-bold">{totalProposals}</p>
                <p className="text-xs text-gray-500 mt-1">Total criadas</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Proposal Limit Card - Only show for subscribed users with limits */}
        {subscribed && subscription_tier === 'basico' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Propostas deste Mês</p>
                  <p className="text-3xl font-bold">
                    {monthlyProposalCount}
                    {monthlyProposalLimit && (
                      <span className="text-lg text-gray-500">/{monthlyProposalLimit}</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {monthlyProposalLimit && monthlyProposalLimit - monthlyProposalCount > 0
                      ? `${monthlyProposalLimit - monthlyProposalCount} restantes`
                      : 'Limite atingido'
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CalendarDays className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Clientes Cadastrados</p>
                <p className="text-3xl font-bold">{totalClients}</p>
                <p className="text-xs text-gray-500 mt-1">Total de clientes</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Taxa de Conversão</p>
                <p className="text-3xl font-bold">{acceptanceRate.toFixed(0)}%</p>
                <p className="text-xs text-gray-500 mt-1">Propostas aceitas</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Visualizações</p>
                <p className="text-3xl font-bold">{totalViews}</p>
                <p className="text-xs text-gray-500 mt-1">Total de views</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Propostas Recentes</CardTitle>
              <CardDescription>Suas últimas propostas criadas</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link to="/propostas">Ver Todas</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentProposals.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma proposta criada ainda</p>
              {/* <Button asChild className="mt-4">
                <Link to="/propostas/nova">Criar primeira proposta</Link>
              </Button> */}
            </div>
          ) : (
            recentProposals.map((proposal) => (
              <div key={proposal.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 rounded-lg gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {getStatusIcon(proposal.status || 'enviada')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium truncate">{proposal.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {proposal.clients?.name || 'Cliente não definido'} • {formatDate(proposal.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <span className={`px-2 py-1 text-xs rounded-full self-start ${getStatusColor(proposal.status || 'enviada')}`}>
                    {getStatusText(proposal.status || 'enviada')}
                  </span>
                  <div className="text-left sm:text-right">
                    <p className="font-semibold">
                      {proposal.value ? `R$ ${proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Valor não definido'}
                    </p>
                    <Button variant="link" className="h-auto p-0 text-xs justify-start sm:justify-end" asChild>
                      <Link to={`/propostas/${proposal.id}/visualizar`}>Ver detalhes</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
