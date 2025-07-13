
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Plus,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionStatus from '@/components/SubscriptionStatus';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, subscription } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (checkout === 'success') {
      toast.success('Pagamento realizado com sucesso! Sua assinatura está sendo processada.');
      // Refresh subscription status after successful checkout
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } else if (checkout === 'canceled') {
      toast.info('Pagamento cancelado. Você pode tentar novamente quando quiser.');
    }
  }, [searchParams]);

  // Mock data - replace with real data from your database
  const stats = [
    {
      title: 'Propostas Criadas',
      value: '12',
      change: '+2 este mês',
      icon: FileText,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Clientes Ativos',
      value: '8',
      change: '+1 este mês',
      icon: Users,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'Taxa de Conversão',
      value: '75%',
      change: '+5% este mês',
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      title: 'Visualizações',
      value: '156',
      change: '+12 esta semana',
      icon: Eye,
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  const recentProposals = [
    {
      id: 1,
      title: 'Desenvolvimento de Website',
      client: 'Empresa ABC',
      status: 'enviada',
      value: 'R$ 15.000',
      date: '2024-01-15'
    },
    {
      id: 2,
      title: 'Consultoria em Marketing Digital',
      client: 'Startup XYZ',
      status: 'aprovada',
      value: 'R$ 8.500',
      date: '2024-01-14'
    },
    {
      id: 3,
      title: 'Sistema de Gestão',
      client: 'Loja 123',
      status: 'em_analise',
      value: 'R$ 25.000',
      date: '2024-01-13'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovada':
        return 'bg-green-100 text-green-800';
      case 'enviada':
        return 'bg-blue-100 text-blue-800';
      case 'em_analise':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejeitada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovada':
        return <CheckCircle className="h-4 w-4" />;
      case 'enviada':
        return <FileText className="h-4 w-4" />;
      case 'em_analise':
        return <Clock className="h-4 w-4" />;
      case 'rejeitada':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aprovada':
        return 'Aprovada';
      case 'enviada':
        return 'Enviada';
      case 'em_analise':
        return 'Em Análise';
      case 'rejeitada':
        return 'Rejeitada';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Olá, {user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Aqui está um resumo da sua atividade
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/propostas/nova">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nova Proposta</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Subscription Status */}
      <SubscriptionStatus />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Proposals */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Propostas Recentes</CardTitle>
              <CardDescription>
                Suas últimas propostas enviadas
              </CardDescription>
            </div>
            <Link to="/propostas">
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProposals.map((proposal) => (
              <div key={proposal.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-gray-900">{proposal.title}</h3>
                    <Badge className={`${getStatusColor(proposal.status)} flex items-center space-x-1`}>
                      {getStatusIcon(proposal.status)}
                      <span>{getStatusText(proposal.status)}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {proposal.client} • {proposal.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{proposal.value}</p>
                  <Link 
                    to={`/propostas/visualizar/${proposal.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Ver detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/propostas/nova">
            <CardContent className="p-6 text-center">
              <Plus className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Criar Nova Proposta</h3>
              <p className="text-sm text-gray-600">
                Comece uma nova proposta do zero ou use um template
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/clientes">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Gerenciar Clientes</h3>
              <p className="text-sm text-gray-600">
                Adicione novos clientes e organize suas informações
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/analytics">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Ver Analytics</h3>
              <p className="text-sm text-gray-600">
                Acompanhe o desempenho das suas propostas
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
