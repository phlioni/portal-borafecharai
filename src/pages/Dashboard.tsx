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
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const stats = [
    {
      title: 'Propostas Criadas',
      value: '12',
      change: '+3 este mês',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Taxa de Visualização',
      value: '85%',
      change: '+12% vs mês anterior',
      icon: Eye,
      color: 'text-green-600'
    },
    {
      title: 'Propostas Aceitas',
      value: '7',
      change: '58% taxa de conversão',
      icon: CheckCircle,
      color: 'text-emerald-600'
    },
    {
      title: 'Valor Médio',
      value: 'R$ 4.250',
      change: '+8% vs mês anterior',
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  const recentProposals = [
    {
      id: 1,
      title: 'Proposta - Desenvolvimento Website',
      client: 'Empresa ABC Ltda',
      value: 'R$ 8.500,00',
      status: 'visualizada',
      date: '2024-01-15',
      daysAgo: 2
    },
    {
      id: 2,
      title: 'Proposta - Consultoria Marketing Digital',
      client: 'StartUp XYZ',
      value: 'R$ 3.200,00',
      status: 'aceita',
      date: '2024-01-13',
      daysAgo: 4
    },
    {
      id: 3,
      title: 'Proposta - Identidade Visual',
      client: 'Loja Fashion',
      value: 'R$ 2.800,00',
      status: 'enviada',
      date: '2024-01-12',
      daysAgo: 5
    },
    {
      id: 4,
      title: 'Proposta - Sistema de Gestão',
      client: 'Clínica Médica São Paulo',
      value: 'R$ 12.000,00',
      status: 'perdida',
      date: '2024-01-10',
      daysAgo: 7
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
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
          <div className="space-y-4">
            {recentProposals.map((proposal) => (
              <div key={proposal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{proposal.title}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Users className="h-4 w-4" />
                    {proposal.client}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {proposal.daysAgo} {proposal.daysAgo === 1 ? 'dia atrás' : 'dias atrás'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900">{proposal.value}</span>
                  {getStatusBadge(proposal.status)}
                </div>
              </div>
            ))}
          </div>
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
