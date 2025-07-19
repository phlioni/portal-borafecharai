
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, FileText, Plus, Send, MessageSquare } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { TrialCallToActionWrapper } from '@/components/TrialCallToActionWrapper';
import ProfileCompletionAlert from '@/components/ProfileCompletionAlert';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const { canCreateProposal, isGuest } = useUserPermissions();
  const { data, isLoading } = useDashboardData();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        {canCreateProposal && (
          <div className="flex items-center space-x-2">
            <Button onClick={() => navigate('/propostas/nova')}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Proposta
            </Button>
          </div>
        )}
      </div>

      {/* Alertas e CTAs */}
      <div className="space-y-4">
        <ProfileCompletionAlert />
        {!isGuest && <TrialCallToActionWrapper />}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Propostas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalProposalsSent || 0}</div>
            <p className="text-xs text-muted-foreground">Propostas enviadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propostas Aceitas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalProposalsApproved || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data?.totalProposalsSent ? ((data.totalProposalsApproved / data.totalProposalsSent) * 100).toFixed(1) : 0}% taxa de aceite
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalClients || 0}</div>
            <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {data?.totalProposalsValue ? new Intl.NumberFormat('pt-BR').format(data.totalProposalsValue) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Em propostas aceitas</p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {canCreateProposal && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nova Proposta
              </CardTitle>
              <CardDescription>Crie uma nova proposta comercial</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/propostas/nova')} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Criar Proposta
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gerenciar Clientes
            </CardTitle>
            <CardDescription>Visualize e gerencie seus clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/clientes')} variant="outline" className="w-full">
              <Users className="mr-2 h-4 w-4" />
              Ver Clientes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Propostas Enviadas
            </CardTitle>
            <CardDescription>Acompanhe suas propostas</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/propostas')} variant="outline" className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Ver Propostas
            </Button>
          </CardContent>
        </Card>

        {/* Destaque do Telegram para mobile */}
        {isMobile && (
          <Card className="md:col-span-2 lg:col-span-1 border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <MessageSquare className="h-5 w-5" />
                Assistente Telegram
              </CardTitle>
              <CardDescription>Use nosso bot inteligente para criar propostas pelo Telegram</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.open('https://t.me/borafecharai_bot', '_blank')}
                className="w-full"
                variant="default"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Abrir no Telegram
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
