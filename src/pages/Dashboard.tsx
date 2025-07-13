
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, CheckCircle2, CircleDollarSign, FileText, Users, TrendingUp, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboardData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ModernLoader } from '@/components/ModernLoader';
import { TrialCallToActionWrapper } from '@/components/TrialCallToActionWrapper';

const Dashboard = () => {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
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

  const formatDate = (date: string) => {
    return format(new Date(date), "d 'de' MMMM", { locale: ptBR });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Olá, ph.lioni! 👋</h1>
          <p className="text-gray-600">Aqui está um resumo da sua atividade</p>
        </div>
        <Button asChild>
          <Link to="/propostas/nova">+ Nova Proposta</Link>
        </Button>
      </div>

      {/* Trial Call to Action - agora com verificação otimizada */}
      <TrialCallToActionWrapper />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Propostas Criadas</p>
                <p className="text-3xl font-bold">{data?.totalProposalsSent || 0}</p>
                <p className="text-xs text-gray-500 mt-1">+2 este mês</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Clientes Ativos</p>
                <p className="text-3xl font-bold">{data?.totalClients || 0}</p>
                <p className="text-xs text-gray-500 mt-1">+1 este mês</p>
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
                <p className="text-3xl font-bold">75%</p>
                <p className="text-xs text-gray-500 mt-1">+5% este mês</p>
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
                <p className="text-3xl font-bold">156</p>
                <p className="text-xs text-gray-500 mt-1">+12 esta semana</p>
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
              <CardDescription>Suas últimas propostas enviadas</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link to="/propostas">Ver Todas</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Desenvolvimento de Website</h4>
                <p className="text-sm text-gray-600">Empresa ABC • 2024-01-15</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Enviada</span>
              <div className="text-right">
                <p className="font-semibold">R$ 15.000</p>
                <Button variant="link" className="h-auto p-0 text-xs">Ver detalhes</Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Consultoria em Marketing Digital</h4>
                <p className="text-sm text-gray-600">Startup XYZ • 2024-01-14</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Aprovada</span>
              <div className="text-right">
                <p className="font-semibold">R$ 8.500</p>
                <Button variant="link" className="h-auto p-0 text-xs">Ver detalhes</Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-medium">Sistema de Gestão</h4>
                <p className="text-sm text-gray-600">Loja 123 • 2024-01-13</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Em Análise</span>
              <div className="text-right">
                <p className="font-semibold">R$ 25.000</p>
                <Button variant="link" className="h-auto p-0 text-xs">Ver detalhes</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
