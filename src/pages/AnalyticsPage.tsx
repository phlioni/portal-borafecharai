
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Send
} from 'lucide-react';
import { useProposals } from '@/hooks/useProposals';
import { useCompanies } from '@/hooks/useCompanies';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AnalyticsPage = () => {
  const { data: proposals } = useProposals();
  const { data: companies } = useCompanies();

  // Calcular estatísticas
  const totalProposals = proposals?.length || 0;
  const totalClients = companies?.length || 0;
  const totalValue = proposals?.reduce((acc, p) => acc + (p.value || 0), 0) || 0;
  const acceptedProposals = proposals?.filter(p => p.status === 'aceita').length || 0;
  const sentProposals = proposals?.filter(p => p.status === 'enviada').length || 0;
  const draftProposals = proposals?.filter(p => p.status === 'rascunho').length || 0;
  const rejectedProposals = proposals?.filter(p => p.status === 'rejeitada').length || 0;

  const acceptanceRate = totalProposals > 0 ? (acceptedProposals / totalProposals) * 100 : 0;
  const averageValue = totalProposals > 0 ? totalValue / totalProposals : 0;

  // Dados para gráfico de status
  const statusData = [
    { name: 'Aceitas', value: acceptedProposals, color: '#10B981' },
    { name: 'Enviadas', value: sentProposals, color: '#3B82F6' },
    { name: 'Rascunhos', value: draftProposals, color: '#6B7280' },
    { name: 'Rejeitadas', value: rejectedProposals, color: '#EF4444' },
  ];

  // Dados para gráfico mensal (últimos 6 meses)
  const last6Months = eachMonthOfInterval({
    start: startOfMonth(subMonths(new Date(), 5)),
    end: endOfMonth(new Date())
  });

  const monthlyData = last6Months.map(month => {
    const monthProposals = proposals?.filter(p => {
      const proposalDate = new Date(p.created_at);
      return proposalDate >= startOfMonth(month) && proposalDate <= endOfMonth(month);
    }) || [];

    return {
      month: format(month, 'MMM/yy', { locale: ptBR }),
      propostas: monthProposals.length,
      valor: monthProposals.reduce((acc, p) => acc + (p.value || 0), 0) / 1000, // em milhares
      aceitas: monthProposals.filter(p => p.status === 'aceita').length
    };
  });

  // Dados para gráfico de templates
  const templateData = [
    { name: 'Moderno', value: proposals?.filter(p => p.template_id === 'moderno').length || 0 },
    { name: 'Executivo', value: proposals?.filter(p => p.template_id === 'executivo').length || 0 },
    { name: 'Criativo', value: proposals?.filter(p => p.template_id === 'criativo').length || 0 },
  ].filter(item => item.value > 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Análise detalhada das suas propostas e performance</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Propostas</p>
                <p className="text-2xl font-bold">{totalProposals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold">
                  R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Taxa de Aceitação</p>
                <p className="text-2xl font-bold">{acceptanceRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Clientes</p>
                <p className="text-2xl font-bold">{totalClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Aceitas</p>
                <p className="text-xl font-bold text-green-600">{acceptedProposals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Enviadas</p>
                <p className="text-xl font-bold text-blue-600">{sentProposals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Rascunhos</p>
                <p className="text-xl font-bold text-gray-600">{draftProposals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Rejeitadas</p>
                <p className="text-xl font-bold text-red-600">{rejectedProposals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Propostas por Mês</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="propostas" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="aceitas" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
            <CardDescription>Status das propostas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Value by Month */}
        <Card>
          <CardHeader>
            <CardTitle>Valor por Mês</CardTitle>
            <CardDescription>Em milhares de reais</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value}k`, 'Valor']} />
                <Bar dataKey="valor" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Template Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Templates Mais Usados</CardTitle>
            <CardDescription>Distribuição por template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {templateData.map((template, index) => (
                <div key={template.name} className="flex items-center justify-between">
                  <span className="font-medium">{template.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(template.value / totalProposals) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{template.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Valor Médio por Proposta</h3>
            <p className="text-2xl font-bold text-blue-600">
              R$ {averageValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Propostas Este Mês</h3>
            <p className="text-2xl font-bold text-green-600">
              {monthlyData[monthlyData.length - 1]?.propostas || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Valor Este Mês</h3>
            <p className="text-2xl font-bold text-purple-600">
              R$ {((monthlyData[monthlyData.length - 1]?.valor || 0) * 1000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
