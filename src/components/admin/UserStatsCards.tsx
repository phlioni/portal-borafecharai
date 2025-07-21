
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, UserCheck, DollarSign } from 'lucide-react';

interface UserStatsCardsProps {
  stats: {
    totalUsers: number;
    totalProposals: number;
    totalClients: number;
    totalRevenue: number;
  };
  loading: boolean;
}

const UserStatsCards = ({ stats, loading }: UserStatsCardsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const statsData = [
    {
      title: 'Total de Usuários',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Total de Propostas',
      value: stats.totalProposals,
      icon: FileText,
      color: 'text-green-600'
    },
    {
      title: 'Total de Clientes',
      value: stats.totalClients,
      icon: UserCheck,
      color: 'text-purple-600'
    },
    {
      title: 'Receita Total',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-yellow-600',
      isRevenue: true
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.isRevenue ? stat.value : stat.value.toLocaleString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default UserStatsCards;
