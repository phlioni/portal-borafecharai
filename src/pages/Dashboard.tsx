import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  FileText, 
  TrendingUp, 
  Users, 
  Sparkles, 
  Plus,
  BarChart3,
  Bot
} from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useSubscription } from '@/hooks/useSubscription';
import TrialCallToActionWrapper from '@/components/TrialCallToActionWrapper';

const Dashboard = () => {
  const { stats, recentProposals, loading } = useDashboardData();
  const { canCreateProposal, monthlyProposalCount, monthlyProposalLimit, canAccessAnalytics } = useUserPermissions();
  const { subscribed, subscription_tier } = useSubscription();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header com destaque para Chat IA */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold mb-4">
            ✨ Crie Propostas Profissionais com IA
          </h1>
          <p className="text-xl mb-6 opacity-90">
            Use nosso Chat com IA para gerar propostas incríveis em minutos
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link to="/chat-proposta" className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Chat Proposta IA
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link to="/nova-proposta" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Criar Manualmente
              </Link>
            </Button>
          </div>
        </div>

        {/* Trial CTA */}
        <TrialCallToActionWrapper />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Propostas este mês</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {monthlyProposalCount}
                {monthlyProposalLimit && (
                  <span className="text-sm text-muted-foreground">/{monthlyProposalLimit}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {monthlyProposalLimit ? 
                  `${monthlyProposalLimit - monthlyProposalCount} restantes` : 
                  'Ilimitadas'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status do Plano</CardTitle>
              <Badge variant={subscribed ? "default" : "secondary"}>
                {subscribed ? 
                  (subscription_tier === 'basico' ? 'Essencial' : 'Professional') : 
                  'Trial'
                }
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscribed ? 'Ativo' : 'Teste'}
              </div>
              <p className="text-xs text-muted-foreground">
                {subscribed ? 
                  'Plano em funcionamento' : 
                  'Período de avaliação'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Propostas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProposals}</div>
              <p className="text-xs text-muted-foreground">
                Todas as propostas criadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ações principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <MessageCircle className="h-5 w-5" />
                Chat IA
              </CardTitle>
              <CardDescription>
                Crie propostas conversando com nossa IA especializada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/chat-proposta">
                  Começar Conversa
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Nova Proposta
              </CardTitle>
              <CardDescription>
                Crie uma proposta manual com formulário estruturado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/nova-proposta">
                  Criar Manual
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Clientes
              </CardTitle>
              <CardDescription>
                Gerencie seus clientes e empresas cadastradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/clientes">
                  Ver Clientes
                </Link>
              </Button>
            </CardContent>
          </Card>

          {canAccessAnalytics ? (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics
                </CardTitle>
                <CardDescription>
                  Relatórios detalhados das suas propostas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/analytics">
                    Ver Relatórios
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Bot className="h-5 w-5" />
                  Bot Telegram
                </CardTitle>
                <CardDescription>
                  Crie propostas direto do Telegram
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/telegram-bot">
                    Configurar Bot
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Propostas recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Propostas Recentes</span>
              <Button asChild variant="outline" size="sm">
                <Link to="/propostas">Ver Todas</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentProposals.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma proposta ainda
                </h3>
                <p className="text-gray-600 mb-4">
                  Comece criando sua primeira proposta com nossa IA!
                </p>
                <Button asChild>
                  <Link to="/chat-proposta" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Criar com IA
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <h4 className="font-medium">{proposal.title}</h4>
                      <p className="text-sm text-gray-600">
                        {proposal.companies?.name || 'Cliente não informado'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          proposal.status === 'aceita' ? 'default' :
                          proposal.status === 'rejeitada' ? 'destructive' :
                          'secondary'
                        }
                      >
                        {proposal.status || 'Rascunho'}
                      </Badge>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/propostas/${proposal.id}`}>
                          Ver
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
