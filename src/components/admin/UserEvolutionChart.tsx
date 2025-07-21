
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface UserEvolutionChartProps {
  monthlyUsers: Array<{
    month: string;
    count: number;
    year: number;
  }>;
  loading: boolean;
}

const UserEvolutionChart = ({ monthlyUsers, loading }: UserEvolutionChartProps) => {
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Obter anos únicos dos dados
  const availableYears = [...new Set(monthlyUsers.map(data => data.year))].sort((a, b) => b - a);

  // Filtrar dados por ano se selecionado
  const filteredData = selectedYear === 'all' 
    ? monthlyUsers 
    : monthlyUsers.filter(data => data.year.toString() === selectedYear);

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolução Mensal de Usuários
          </CardTitle>
          <CardDescription>
            Crescimento de usuários nos últimos meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução Mensal de Usuários
            </CardTitle>
            <CardDescription>
              Crescimento de usuários nos últimos meses
            </CardDescription>
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filtrar ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                labelFormatter={(label) => `Mês: ${label}`}
                formatter={(value) => [`${value} usuários`, 'Novos usuários']}
              />
              <Bar 
                dataKey="count" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserEvolutionChart;
