import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, CheckCircle2, CircleDollarSign, FileText, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboardData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const Dashboard = () => {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return <LoadingSpinner message="Carregando dashboard..." />;
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

  const formatDate = (date: string) => {
    return format(new Date(date), "d 'de' MMMM", { locale: ptBR });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="text-2xl font-bold">Dashboard</div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Propostas Enviadas
            </CardTitle>
            <CardDescription>Total de propostas enviadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.totalProposalsSent || 0}</div>
            {data?.lastProposalSentAt && (
              <p className="text-sm text-gray-500 mt-2">
                Última proposta enviada em {formatDate(data.lastProposalSentAt)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4" />
              Valor Total Propostas
            </CardTitle>
            <CardDescription>Soma do valor de todas as propostas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              R$ {data?.totalProposalsValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total de Clientes
            </CardTitle>
            <CardDescription>Número de clientes cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.totalClients || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Propostas Aprovadas
            </CardTitle>
            <CardDescription>Total de propostas aprovadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.totalProposalsApproved || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Ações</CardTitle>
            <CardDescription>Ações recomendadas para você</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p>Criar uma nova proposta</p>
              <Button asChild>
                <Link to="/nova-proposta">Criar</Link>
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <p>Ver todas as propostas</p>
              <Button asChild>
                <Link to="/propostas">Ver Propostas</Link>
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <p>Gerenciar seus clientes</p>
              <Button asChild>
                <Link to="/clientes">Gerenciar Clientes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Vencimentos</CardTitle>
            <CardDescription>Propostas com vencimento nos próximos 30 dias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.proposalsExpiringSoon && data.proposalsExpiringSoon.length > 0 ? (
              data.proposalsExpiringSoon.map((proposal) => (
                <div key={proposal.id} className="flex items-center justify-between">
                  <p>
                    {proposal.title} - {proposal.companies?.name}
                  </p>
                  <span className="text-sm text-gray-500">
                    Vence em {formatDate(proposal.validity_date)}
                  </span>
                </div>
              ))
            ) : (
              <p>Nenhuma proposta com vencimento próximo.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
