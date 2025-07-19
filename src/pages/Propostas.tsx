import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, MoreVertical, Plus, Search, Edit, Trash2, Copy, Send } from 'lucide-react';
import { useProposals, useDeleteProposal } from '@/hooks/useProposals';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ProposalPreviewModal from '@/components/ProposalPreviewModal';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileProposalCard from '@/components/MobileProposalCard';

const PropostasPage = () => {
  const navigate = useNavigate();
  const { data: proposals, loading } = useProposals();
  const deleteProposal = useDeleteProposal();
  const { canCreateProposal } = useUserPermissions();
  const isMobile = useIsMobile();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const filteredProposals = proposals?.filter(proposal =>
    proposal.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handlePreview = (proposal: any) => {
    setSelectedProposal(proposal);
    setShowPreviewModal(true);
  };

  const handleClosePreview = () => {
    setShowPreviewModal(false);
    setSelectedProposal(null);
  };

  const handleEdit = (id: string) => {
    navigate(`/propostas/${id}/editar`);
  };

  const handleDuplicate = (id: string) => {
    navigate(`/propostas/${id}/duplicar`);
  };

  const handleSend = (id: string) => {
    navigate(`/propostas/${id}/enviar`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta proposta?')) {
      try {
        await deleteProposal.mutateAsync(id);
      } catch (error) {
        toast.error('Erro ao excluir proposta');
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Propostas</h1>
          <p className="text-gray-600 mt-1">Gerencie suas propostas comerciais</p>
        </div>
        {canCreateProposal && (
          <Button onClick={() => navigate('/propostas/nova')}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Proposta
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Propostas</CardTitle>
          <CardDescription>
            {filteredProposals.length} proposta{filteredProposals.length !== 1 ? 's' : ''} encontrada{filteredProposals.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Buscar proposta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-4">Carregando propostas...</div>
          ) : filteredProposals.length === 0 ? (
            <div className="text-center py-4">Nenhuma proposta encontrada.</div>
          ) : (
            <>
              {isMobile ? (
                <div className="space-y-4">
                  {filteredProposals.map((proposal) => (
                    <MobileProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      onPreview={handlePreview}
                      onEdit={handleEdit}
                      onDuplicate={handleDuplicate}
                      onSend={handleSend}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data de Criação</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProposals.map((proposal) => (
                        <TableRow key={proposal.id}>
                          <TableCell className="font-medium">{proposal.title}</TableCell>
                          <TableCell>{proposal.clients?.name || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{proposal.status}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Abrir menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handlePreview(proposal)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>Visualizar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(proposal.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Editar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicate(proposal.id)}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  <span>Duplicar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSend(proposal.id)}>
                                  <Send className="mr-2 h-4 w-4" />
                                  <span>Enviar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(proposal.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Excluir</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ProposalPreviewModal
        isOpen={showPreviewModal}
        onClose={handleClosePreview}
        proposal={selectedProposal}
      />
    </div>
  );
};

export default PropostasPage;
