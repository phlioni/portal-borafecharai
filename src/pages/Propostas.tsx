
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Send,
  Calendar,
  DollarSign,
  Building,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { useProposal } from '@/hooks/useProposals';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import ProposalPreviewModal from '@/components/ProposalPreviewModal';
import SendProposalModal from '@/components/SendProposalModal';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import ProposalLimitStatus from '@/components/ProposalLimitStatus';
import PlanLimitGuard from '@/components/PlanLimitGuard';

const Propostas = () => {
  const { user } = useAuth();
  const { proposals, loading, deleteProposal } = useProposal();
  const { canCreateProposal, monthlyProposalLimit, monthlyProposalCount, loading: permissionsLoading } = useUserPermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [proposalToSend, setProposalToSend] = useState<any>(null);

  // Filtering logic
  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.companies?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta proposta?')) {
      try {
        await deleteProposal(id);
        toast.success('Proposta excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir proposta:', error);
        toast.error('Erro ao excluir proposta');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aceita': return 'bg-green-100 text-green-800';
      case 'rejeitada': return 'bg-red-100 text-red-800';
      case 'enviada': return 'bg-blue-100 text-blue-800';
      case 'rascunho': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aceita': return 'Aceita';
      case 'rejeitada': return 'Rejeitada';
      case 'enviada': return 'Enviada';
      case 'rascunho': return 'Rascunho';
      default: return status;
    }
  };

  if (loading || permissionsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Propostas</h1>
          <p className="text-gray-600 mt-1">Gerencie todas as suas propostas comerciais</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <PlanLimitGuard 
            feature="createProposal"
            fallback={
              <div className="flex flex-col sm:flex-row gap-2">
                <Button disabled className="opacity-50">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Proposta
                </Button>
                <Button disabled className="opacity-50">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat IA
                </Button>
              </div>
            }
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild>
                <Link to="/propostas/nova">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Proposta
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/chat-proposta">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat IA
                </Link>
              </Button>
            </div>
          </PlanLimitGuard>
        </div>
      </div>

      {/* Proposal Limit Status */}
      <ProposalLimitStatus className="max-w-md" />

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por título ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os status</option>
                <option value="rascunho">Rascunho</option>
                <option value="enviada">Enviada</option>
                <option value="aceita">Aceita</option>
                <option value="rejeitada">Rejeitada</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {proposals.length === 0 ? 'Nenhuma proposta encontrada' : 'Nenhuma proposta corresponde aos filtros'}
            </h3>
            <p className="text-gray-600 mb-6">
              {proposals.length === 0 
                ? 'Comece criando sua primeira proposta comercial' 
                : 'Tente ajustar os filtros para encontrar suas propostas'
              }
            </p>
            {proposals.length === 0 && canCreateProposal && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link to="/propostas/nova">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Proposta
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/chat-proposta">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Usar Chat IA
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredProposals.map((proposal) => (
            <Card key={proposal.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Proposal Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {proposal.title}
                      </h3>
                      <Badge className={getStatusColor(proposal.status)}>
                        {getStatusText(proposal.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      {proposal.companies && (
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          <span>{proposal.companies.name}</span>
                        </div>
                      )}
                      
                      {proposal.value && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(proposal.value)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(proposal.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProposal(proposal);
                        setShowPreview(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/propostas/editar/${proposal.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setProposalToSend(proposal);
                        setShowSendModal(true);
                      }}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(proposal.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {showPreview && selectedProposal && (
        <ProposalPreviewModal
          proposal={selectedProposal}
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setSelectedProposal(null);
          }}
          onContinue={() => {
            setShowPreview(false);
            setProposalToSend(selectedProposal);
            setShowSendModal(true);
          }}
          companyLogo={selectedProposal.companies?.logo_url || ''}
        />
      )}

      {showSendModal && proposalToSend && (
        <SendProposalModal
          isOpen={showSendModal}
          onClose={() => {
            setShowSendModal(false);
            setProposalToSend(null);
          }}
          onSend={(data) => {
            console.log('Sending proposal with data:', data);
            // Here you would implement the actual sending logic
            toast.success('Proposta enviada com sucesso!');
            setShowSendModal(false);
            setProposalToSend(null);
          }}
          proposalTitle={proposalToSend.title}
          clientName={proposalToSend.companies?.name || ''}
          clientEmail={proposalToSend.companies?.email || ''}
        />
      )}
    </div>
  );
};

export default Propostas;
