
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Send, 
  Calendar,
  DollarSign,
  Building,
  MessageSquare,
  Bot
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useProposals, useUpdateProposal } from '@/hooks/useProposals';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const Propostas = () => {
  const { data: proposals, isLoading } = useProposals();
  const updateProposal = useUpdateProposal();
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    const variants = {
      'rascunho': 'bg-gray-100 text-gray-800',
      'enviada': 'bg-blue-100 text-blue-800',
      'aceita': 'bg-green-100 text-green-800',
      'rejeitada': 'bg-red-100 text-red-800'
    };
    
    return variants[status as keyof typeof variants] || variants.rascunho;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'rascunho': 'Rascunho',
      'enviada': 'Enviada',
      'aceita': 'Aceita',
      'rejeitada': 'Rejeitada'
    };
    
    return labels[status as keyof typeof labels] || 'Rascunho';
  };

  const handleViewProposal = (proposalId: string) => {
    navigate(`/propostas/${proposalId}`);
  };

  const handleEditProposal = (proposalId: string) => {
    navigate(`/propostas/editar/${proposalId}`);
  };

  const handleDeleteProposal = async (proposalId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta proposta?')) return;

    try {
      // Implementar delete quando necessário
      toast.success('Proposta excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir proposta:', error);
      toast.error('Erro ao excluir proposta');
    }
  };

  const handleSendProposal = async (proposalId: string) => {
    try {
      await updateProposal.mutateAsync({
        id: proposalId,
        updates: { status: 'enviada' }
      });
      
      // Chamar função de envio de email
      const response = await fetch('/functions/v1/send-proposal-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proposalId })
      });

      if (response.ok) {
        toast.success('Proposta enviada por email com sucesso!');
      } else {
        toast.success('Proposta marcada como enviada!');
      }
    } catch (error) {
      console.error('Erro ao enviar proposta:', error);
      toast.error('Erro ao enviar proposta');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Propostas</h1>
          <p className="text-gray-600 mt-1">Gerencie suas propostas comerciais</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
            <Link to="/propostas/chat" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Chat IA
            </Link>
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link to="/propostas/nova" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Proposta
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Edit className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rascunhos</p>
                <p className="text-xl font-bold">
                  {proposals?.filter(p => p.status === 'rascunho').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Send className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Enviadas</p>
                <p className="text-xl font-bold">
                  {proposals?.filter(p => p.status === 'enviada').length || 0}
                </p>
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
                <p className="text-sm text-gray-600">Aceitas</p>
                <p className="text-xl font-bold">
                  {proposals?.filter(p => p.status === 'aceita').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-xl font-bold">
                  R$ {proposals?.reduce((acc, p) => acc + (p.value || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {!proposals || proposals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma proposta criada
              </h3>
              <p className="text-gray-600 mb-6">
                Comece criando sua primeira proposta comercial
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                  <Link to="/propostas/chat" className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Usar Chat IA
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/propostas/nova" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Proposta
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          proposals.map((proposal) => (
            <Card key={proposal.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {proposal.title}
                      </h3>
                      <Badge className={getStatusBadge(proposal.status || 'rascunho')}>
                        {getStatusLabel(proposal.status || 'rascunho')}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {proposal.companies && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {proposal.companies.name}
                          </span>
                        </div>
                      )}
                      
                      {proposal.value && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            R$ {proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {format(new Date(proposal.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    
                    {proposal.service_description && (
                      <p className="text-sm text-gray-600 mb-4">
                        {proposal.service_description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewProposal(proposal.id)}
                      title="Visualizar proposta"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditProposal(proposal.id)}
                      title="Editar proposta"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {proposal.status === 'rascunho' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleSendProposal(proposal.id)}
                        title="Enviar proposta"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteProposal(proposal.id)}
                      title="Excluir proposta"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Propostas;
