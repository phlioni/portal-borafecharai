
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Propostas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const propostas = [
    {
      id: 1,
      title: 'Desenvolvimento Website Corporativo',
      client: 'Empresa ABC Ltda',
      value: 'R$ 8.500,00',
      status: 'visualizada',
      date: '2024-01-15',
      validUntil: '2024-02-15',
      views: 3,
      lastViewed: '2024-01-16 14:30'
    },
    {
      id: 2,
      title: 'Consultoria Marketing Digital - Pacote Premium',
      client: 'StartUp XYZ',
      value: 'R$ 3.200,00',
      status: 'aceita',
      date: '2024-01-13',
      validUntil: '2024-02-13',
      views: 5,
      lastViewed: '2024-01-14 09:15'
    },
    {
      id: 3,
      title: 'Criação de Identidade Visual Completa',
      client: 'Loja Fashion Boutique',
      value: 'R$ 2.800,00',
      status: 'enviada',
      date: '2024-01-12',
      validUntil: '2024-02-12',
      views: 0,
      lastViewed: null
    },
    {
      id: 4,
      title: 'Desenvolvimento Sistema de Gestão Médica',
      client: 'Clínica Médica São Paulo',
      value: 'R$ 12.000,00',
      status: 'perdida',
      date: '2024-01-10',
      validUntil: '2024-02-10',
      views: 2,
      lastViewed: '2024-01-11 16:45'
    },
    {
      id: 5,
      title: 'Campanha Publicitária Google Ads',
      client: 'Restaurante Gourmet',
      value: 'R$ 1.800,00',
      status: 'visualizada',
      date: '2024-01-08',
      validUntil: '2024-02-08',
      views: 1,
      lastViewed: '2024-01-09 11:20'
    },
    {
      id: 6,
      title: 'Consultoria em Transformação Digital',
      client: 'Indústria Metal Forte',
      value: 'R$ 15.000,00',
      status: 'enviada',
      date: '2024-01-05',
      validUntil: '2024-02-05',
      views: 0,
      lastViewed: null
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'enviada': { label: 'Enviada', variant: 'secondary' as const, icon: Clock },
      'visualizada': { label: 'Visualizada', variant: 'default' as const, icon: Eye },
      'aceita': { label: 'Aceita', variant: 'default' as const, icon: CheckCircle },
      'perdida': { label: 'Perdida', variant: 'destructive' as const, icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.enviada;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aceita': return 'text-green-600';
      case 'visualizada': return 'text-blue-600';
      case 'enviada': return 'text-yellow-600';
      case 'perdida': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const filteredPropostas = propostas.filter(proposta => {
    const matchesSearch = proposta.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposta.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || proposta.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Propostas</h1>
          <p className="text-gray-600 mt-1">Gerencie todas as suas propostas comerciais</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link to="/propostas/nova">
            <Plus className="h-4 w-4 mr-2" />
            Nova Proposta
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por título ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="enviada">Enviada</option>
                <option value="visualizada">Visualizada</option>
                <option value="aceita">Aceita</option>
                <option value="perdida">Perdida</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredPropostas.map((proposta) => (
          <Card key={proposta.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{proposta.title}</h3>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {proposta.client}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Criada em {formatDate(proposta.date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {proposta.value}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <span>{proposta.views} visualizações</span>
                    </div>
                    {proposta.lastViewed && (
                      <div className="text-gray-500">
                        Última visualização: {new Date(proposta.lastViewed).toLocaleString('pt-BR')}
                      </div>
                    )}
                    <div className="text-gray-500">
                      Válida até: {formatDate(proposta.validUntil)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(proposta.status)}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                    <Button variant="outline" size="sm">
                      Copiar Link
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPropostas.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma proposta encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros ou criar uma nova proposta.'
                : 'Comece criando sua primeira proposta comercial.'
              }
            </p>
            <Button asChild>
              <Link to="/propostas/nova">
                <Plus className="h-4 w-4 mr-2" />
                Nova Proposta
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Propostas;
