import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { useProposals, useUpdateProposal } from '@/hooks/useProposals';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ProposalPreviewModal from '@/components/ProposalPreviewModal';
import BudgetItemsManager from '@/components/BudgetItemsManager';
import { useCreateBudgetItem } from '@/hooks/useBudgetItems';

const EditarPropostaPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: proposals } = useProposals();
  const updateProposal = useUpdateProposal();
  const { data: clients } = useClients();
  const createBudgetItem = useCreateBudgetItem();

  const proposal = proposals?.find(p => p.id === id);

  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    service_description: '',
    detailed_description: '',
    value: '',
    delivery_time: '',
    validity_date: '',
    observations: ''
  });

  const [showPreview, setShowPreview] = useState(false);
  const [previewProposal, setPreviewProposal] = useState(null);
  const [companyLogo, setCompanyLogo] = useState('');
  const [itemsProcessed, setItemsProcessed] = useState(false);

  useEffect(() => {
    if (proposal) {
      setFormData({
        title: proposal.title || '',
        client_id: proposal.client_id || '',
        service_description: proposal.service_description || '',
        detailed_description: proposal.detailed_description || '',
        value: proposal.value ? proposal.value.toString() : '',
        delivery_time: proposal.delivery_time || '',
        validity_date: proposal.validity_date || '',
        observations: proposal.observations || ''
      });
    }
  }, [proposal]);

  // Verificar se há itens pendentes do sessionStorage apenas uma vez
  useEffect(() => {
    const processPendingItems = async () => {
      if (itemsProcessed) return; // Evita processamento duplo
      
      const pendingItems = sessionStorage.getItem('pendingBudgetItems');
      if (pendingItems && id) {
        try {
          const items = JSON.parse(pendingItems);
          console.log('Processando itens pendentes na edição:', items);
          
          // Marcar como processado antes de salvar para evitar loops
          setItemsProcessed(true);
          sessionStorage.removeItem('pendingBudgetItems');
          
          // Salvar cada item no banco de dados
          await Promise.all(
            items.map((item: any) => 
              createBudgetItem.mutateAsync({
                proposal_id: id,
                type: item.type,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price
              })
            )
          );
          
          toast.success('Itens do orçamento salvos com sucesso!');
        } catch (error) {
          console.error('Erro ao salvar itens do orçamento:', error);
          toast.error('Erro ao salvar itens do orçamento');
          setItemsProcessed(false); // Permitir nova tentativa em caso de erro
        }
      }
    };

    if (proposal && !itemsProcessed) {
      processPendingItems();
    }
  }, [id, createBudgetItem, proposal, itemsProcessed]);

  if (!proposal) {
    return <div>Proposta não encontrada</div>;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreview = async () => {
    if (!formData.title) {
      toast.error('Título é obrigatório para visualizar');
      return;
    }

    try {
      // Buscar logo da empresa se selecionada
      let logoUrl = '';
      if (formData.client_id && clients) {
        const selectedClient = clients.find(c => c.id === formData.client_id);
        logoUrl = ''; // Clientes não têm logo
      }

      const proposalForPreview = {
        ...proposal,
        ...formData,
        value: formData.value ? parseFloat(formData.value.replace(/[^\d,]/g, '').replace(',', '.')) : null,
        clients: formData.client_id && clients ? 
          clients.find(c => c.id === formData.client_id) : null
      };

      setPreviewProposal(proposalForPreview);
      setCompanyLogo(logoUrl);
      setShowPreview(true);
    } catch (error) {
      console.error('Erro ao preparar preview:', error);
      toast.error('Erro ao preparar visualização');
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error('Título é obrigatório');
      return;
    }

    try {
      const updates = {
        title: formData.title,
        client_id: formData.client_id || null,
        service_description: formData.service_description || null,
        detailed_description: formData.detailed_description || null,
        value: formData.value ? parseFloat(formData.value.replace(/[^\d,]/g, '').replace(',', '.')) : null,
        delivery_time: formData.delivery_time || null,
        validity_date: formData.validity_date || null,
        observations: formData.observations || null
      };

      await updateProposal.mutateAsync({ id: proposal.id, updates });
      toast.success('Proposta atualizada com sucesso!');
      navigate('/propostas');
    } catch (error) {
      console.error('Erro ao atualizar proposta:', error);
      toast.error('Erro ao atualizar proposta');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/propostas')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Proposta</h1>
            <p className="text-gray-600 mt-1">Edite sua proposta comercial</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </Button>
          <Button onClick={handleSave} disabled={updateProposal.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título da Proposta</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Digite o título da proposta"
              />
            </div>
            <div>
              <Label htmlFor="client">Cliente</Label>
              <Select 
                value={formData.client_id || undefined}
                onValueChange={(value) => handleInputChange('client_id', value || '')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="service_description">Resumo do Serviço</Label>
              <Input
                id="service_description"
                value={formData.service_description}
                onChange={(e) => handleInputChange('service_description', e.target.value)}
                placeholder="Breve descrição do serviço"
              />
            </div>
            <div>
              <Label htmlFor="detailed_description">Descrição Detalhada</Label>
              <Textarea
                id="detailed_description"
                rows={4}
                value={formData.detailed_description}
                onChange={(e) => handleInputChange('detailed_description', e.target.value)}
                placeholder="Descrição completa do projeto/serviço"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delivery_time">Prazo de Entrega</Label>
                <Input
                  id="delivery_time"
                  value={formData.delivery_time}
                  onChange={(e) => handleInputChange('delivery_time', e.target.value)}
                  placeholder="Ex: 30 dias"
                />
              </div>
              <div>
                <Label htmlFor="validity_date">Validade</Label>
                <Input
                  id="validity_date"
                  type="date"
                  value={formData.validity_date}
                  onChange={(e) => handleInputChange('validity_date', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                rows={3}
                value={formData.observations}
                onChange={(e) => handleInputChange('observations', e.target.value)}
                placeholder="Observações adicionais"
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget Items Manager */}
        <BudgetItemsManager proposalId={proposal.id} />
      </div>

      {/* Preview Modal */}
      {showPreview && previewProposal && (
        <ProposalPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onContinue={handleSave}
          proposal={previewProposal}
          companyLogo={companyLogo}
        />
      )}
    </div>
  );
};

export default EditarPropostaPage;
