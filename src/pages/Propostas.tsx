
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  FileText, 
  Plus, 
  Eye, 
  Calendar, 
  DollarSign, 
  Building, 
  Search, 
  Edit,
  Trash2,
  Send,
  Share
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useProposals } from '@/hooks/useProposals';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ModernLoader } from '@/components/ModernLoader';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

const Propostas = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { data: proposals, isLoading, error } = useProposals();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const itemsPerPage = isMobile ? 5 : 10;

  const deleteProposal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Proposta excluída com sucesso!');
      window.location.reload(); // Recarrega a página para atualizar a lista
    } catch (error) {
      console.error('Erro ao excluir proposta:', error);
      toast.error('Erro ao excluir proposta');
    }
  };

  if (isLoading) {
    return <ModernLoader message="Carregando propostas..." />;
  }

  if (error) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
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

  // Filtrar propostas com base no termo de busca
  const filteredProposals = proposals?.filter(proposal =>
    proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proposal.companies?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proposal.service_description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Cálculo da paginação
  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProposals = filteredProposals.slice(startIndex, startIndex + itemsPerPage);

  const handleViewProposal = (proposal: any) => {
    setSelectedProposal(proposal);
    setIsViewModalOpen(true);
  };

  const handleEditProposal = (proposalId: string) => {
    navigate(`/propostas/${proposalId}/editar`);
  };

  // Mobile Card Component
  const ProposalCard = ({ proposal }: { proposal: any }) => (
    <Card className="mb-4" onClick={() => handleViewProposal(proposal)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-sm truncate flex-1 mr-2">{proposal.title}</h3>
          {getStatusBadge(proposal.status)}
        </div>
        
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Building className="h-3 w-3" />
            <span className="truncate">{proposal.companies?.name || 'Cliente não informado'}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            <span>
              {proposal.value 
                ? `R$ ${proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : 'Não informado'
              }
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(proposal.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{proposal.views || 0} visualizações</span>
          </div>
        </div>
        
        <div className="flex gap-2 mt-3 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <Link to={`/propostas/${proposal.id}`}>
              <Eye className="h-3 w-3 mr-1" />
              Ver
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              handleEditProposal(proposal.id);
            }}
          >
            <Edit className="h-3 w-3 mr-1" />
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Proposta</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta proposta? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteProposal(proposal.id)}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`${isMobile ? 'p-4' : 'p-4 sm:p-6'} max-w-7xl mx-auto space-y-6`}>
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
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 items-start justify-between">
              <div>
                <CardTitle>Suas Propostas</CardTitle>
                <CardDescription>
                  Gerencie todas as suas propostas enviadas
                </CardDescription>
              </div>
              <div className="relative w-full">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar propostas..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isMobile ? (
              // Mobile View - Cards
              <div>
                {paginatedProposals.map((proposal) => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))}
              </div>
            ) : (
              // Desktop View - Table
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Visualizações</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProposals.map((proposal) => (
                      <TableRow 
                        key={proposal.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewProposal(proposal)}
                      >
                        <TableCell className="font-medium">
                          {proposal.title}
                        </TableCell>
                        <TableCell>
                          {proposal.companies?.name || 'Cliente não informado'}
                        </TableCell>
                        <TableCell>
                          {proposal.value 
                            ? `R$ ${proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                            : 'Não informado'
                          }
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(proposal.status)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(proposal.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          {proposal.views || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Link to={`/propostas/${proposal.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProposal(proposal.id);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir Proposta</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir esta proposta? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteProposal(proposal.id)}>
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(totalPages, isMobile ? 3 : 5) }, (_, i) => {
                      const pageNum = isMobile ? 
                        Math.max(1, Math.min(currentPage - 1, totalPages - 2)) + i :
                        i + 1;
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Visualização */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[90vh]' : 'max-w-4xl max-h-[80vh]'} overflow-y-auto`}>
          <DialogHeader>
            <DialogTitle>{selectedProposal?.title}</DialogTitle>
          </DialogHeader>
          {selectedProposal && (
            <div className="space-y-4">
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                  <p>{selectedProposal.companies?.name || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  {getStatusBadge(selectedProposal.status)}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor</p>
                  <p>{selectedProposal.value 
                    ? `R$ ${selectedProposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : 'Não informado'
                  }</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Prazo de Entrega</p>
                  <p>{selectedProposal.delivery_time || 'Não informado'}</p>
                </div>
              </div>
              
              {selectedProposal.service_description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resumo do Serviço</p>
                  <p>{selectedProposal.service_description}</p>
                </div>
              )}
              
              {selectedProposal.detailed_description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Descrição Detalhada</p>
                  <p className="whitespace-pre-wrap">{selectedProposal.detailed_description}</p>
                </div>
              )}
              
              {selectedProposal.observations && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Observações</p>
                  <p className="whitespace-pre-wrap">{selectedProposal.observations}</p>
                </div>
              )}
              
              <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 pt-4`}>
                <Button asChild className={isMobile ? 'w-full' : ''}>
                  <Link to={`/propostas/${selectedProposal.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar Completa
                  </Link>
                </Button>
                <Button variant="outline" className={isMobile ? 'w-full' : ''} onClick={() => {
                  setIsViewModalOpen(false);
                  handleEditProposal(selectedProposal.id);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Propostas;
