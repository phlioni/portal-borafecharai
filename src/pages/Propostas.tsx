
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Eye, Calendar, DollarSign, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProposals } from '@/hooks/useProposals';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ModernLoader } from '@/components/ModernLoader';

const Propostas = () => {
  const { data: proposals, isLoading, error } = useProposals();

  if (isLoading) {
    return <ModernLoader message="Carregando propostas..." />;
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erro ao carregar propostas
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Ocorreu um erro ao carregar as propostas. Por favor, tente novamente mais tarde.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'enviada':
        return <Badge variant="secondary">Enviada</Badge>;
      case 'visualizada':
        return <Badge variant="outline">Visualizada</Badge>;
      case 'aceita':
        return <Badge className="bg-green-100 text-green-800">Aceita</Badge>;
      case 'perdida':
        return <Badge variant="destructive">Perdida</Badge>;
      default:
        return <Badge variant="outline">Rascunho</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Propostas</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/propostas/nova">
            <Plus className="h-4 w-4 mr-2" />
            Nova Proposta
          </Link>
        </Button>
      </div>

      {proposals && proposals.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma proposta encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              Comece criando sua primeira proposta para seus clientes.
            </p>
            <Button asChild>
              <Link to="/propostas/nova">
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira proposta
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {proposals?.map((proposal) => (
            <Card key={proposal.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <CardTitle className="text-lg leading-tight">{proposal.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Building className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{proposal.companies?.name || 'Cliente não informado'}</span>
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                    {getStatusBadge(proposal.status)}
                    <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                      <Link to={`/propostas/${proposal.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="font-medium truncate">
                      {proposal.value 
                        ? `R$ ${proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : 'Valor não informado'
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="truncate">
                      Criada em {format(new Date(proposal.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{proposal.views || 0} visualizações</span>
                  </div>
                </div>
                {proposal.service_description && (
                  <p className="mt-3 text-muted-foreground line-clamp-2">
                    {proposal.service_description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Propostas;
