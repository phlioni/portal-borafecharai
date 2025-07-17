
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { useCreateProposal } from '@/hooks/useProposals';
import { useClients } from '@/hooks/useClients';
import { useUserCompany } from '@/hooks/useUserCompany';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ProposalCreatePreviewModal from '@/components/ProposalCreatePreviewModal';
import SendProposalModal from '@/components/SendProposalModal';
import BudgetItemsManager from '@/components/BudgetItemsManager';
import { useProposalSending } from '@/hooks/useProposalSending';

const NovaPropostaPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createProposal = useCreateProposal();
  const { data: clients } = useClients();
  const { data: userCompany } = useUserCompany();
  const { sendProposal, isSending } = useProposalSending();

  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    service_description: '',
    detailed_description: '',
    delivery_time: '',
    validity_date: '',
    observations: ''
  });

  const [showPreview, setShowPreview] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [previewProposal, setPreviewProposal] = useState(null);
  const [companyLogo, setCompanyLogo] = useState('');
  const [budgetItems, setBudgetItems] = useState<any[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBudgetItemsChange = (items: any[]) => {
    setBudgetItems(items);
  };

  const prepareProposalForPreview = () => {
    // Buscar logo da empresa do usuário
    let logoUrl = '';
    let selectedClient = null;
    
    if (formData.client_id && formData.client_id !== 'none' && clients) {
      selectedClient = clients.find(c => c.id === formData.client_id);
    }

    if (userCompany) {
      logoUrl = userCompany.logo_url || '';
    }

    // Calcular valor total baseado nos itens do orçamento
    const totalValue = budgetItems.reduce((total, item) => {
      return total + (item.quantity * item.unit_price);
    }, 0);

    const proposalForPreview = {
      id: 'temp-id',
      ...formData,
      value: totalValue,
      clients: selectedClient,
      created_at: new Date().toISOString(),
      user_id: user?.id,
      proposal_budget_items: budgetItems.map(item => ({
        ...item,
        total_price: item.quantity * item.unit_price
      }))
    };

    return { proposalForPreview, logoUrl };
  };

  const handlePreview = async () => {
    if (!formData.title) {
      toast.error('Título é obrigatório para visualizar');
      return;
    }

    try {
      const { proposalForPreview, logoUrl } = prepareProposalForPreview();
      setPreviewProposal(proposalForPreview);
      setCompanyLogo(logoUrl);
      setShowPreview(true);
    } catch (error) {
      console.error('Erro ao preparar preview:', error);
      toast.error('Erro ao preparar visualização');
    }
  };

  const handleSaveAsDraft = async () => {
    if (!formData.title) {
      toast.error('Título é obrigatório');
      return;
    }

    try {
      const totalValue = budgetItems.reduce((total, item) => {
        return total + (item.quantity * item.unit_price);
      }, 0);

      const proposalData = {
        title: formData.title,
        client_id: formData.client_id && formData.client_id !== 'none' ? formData.client_id : null,
        service_description: formData.service_description || null,
        detailed_description: formData.detailed_description || null,
        value: totalValue > 0 ? totalValue : null,
        delivery_time: formData.delivery_time || null,
        validity_date: formData.validity_date || null,
        observations: formData.observations || null,
        status: 'rascunho' as const,
        user_id: user!.id
      };

      const newProposal = await createProposal.mutateAsync(proposalData);
      
      if (budgetItems.length > 0) {
        sessionStorage.setItem('pendingBudgetItems', JSON.stringify(budgetItems));
      }
      
      toast.success('Proposta salva como rascunho!');
      setShowPreview(false);
      navigate(`/propostas/${newProposal.id}`);
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
      toast.error('Erro ao salvar rascunho');
    }
  };

  const handleSendEmail = () => {
    setShowPreview(false);
    setShowSendModal(true);
  };

  const handleSendProposal = async (emailData: any) => {
    if (!previewProposal) return;

    try {
      // Primeiro criar a proposta
      const totalValue = budgetItems.reduce((total, item) => {
        return total + (item.quantity * item.unit_price);
      }, 0);

      const proposalData = {
        title: formData.title,
        client_id: formData.client_id && formData.client_id !== 'none' ? formData.client_id : null,
        service_description: formData.service_description || null,
        detailed_description: formData.detailed_description || null,
        value: totalValue > 0 ? totalValue : null,
        delivery_time: formData.delivery_time || null,
        validity_date: formData.validity_date || null,
        observations: formData.observations || null,
        status: 'enviada' as const,
        user_id: user!.id
      };

      const newProposal = await createProposal.mutateAsync(proposalData);
      
      if (budgetItems.length > 0) {
        sessionStorage.setItem('pendingBudgetItems', JSON.stringify(budgetItems));
      }

      // Enviar por email
      const success = await sendProposal(newProposal, emailData);
      if (success) {
        setShowSendModal(false);
        toast.success('Proposta criada e enviada com sucesso!');
        navigate(`/propostas/${newProposal.id}`);
      }
    } catch (error) {
      console.error('Erro ao criar e enviar proposta:', error);
      toast.error('Erro ao criar e enviar proposta');
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
            <h1 className="text-3xl font-bold text-gray-900">Nova Proposta</h1>
            <p className="text-gray-600 mt-1">Crie uma nova proposta comercial</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
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
                value={formData.client_id} 
                onValueChange={(value) => handleInputChange('client_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum cliente selecionado</SelectItem>
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

        {/* Budget Items */}
        <Card>
          <CardHeader>
            <CardTitle>Itens do Orçamento</CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetItemsManager 
              proposalId={'temp-proposal'} 
              isNewProposal={true}
              onItemsChange={handleBudgetItemsChange}
            />
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      {showPreview && previewProposal && (
        <ProposalCreatePreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onSaveAsDraft={handleSaveAsDraft}
          onSendEmail={handleSendEmail}
          proposal={previewProposal}
          companyLogo={companyLogo}
          isLoading={createProposal.isPending}
        />
      )}

      {/* Send Modal */}
      {showSendModal && previewProposal && (
        <SendProposalModal
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          onSend={handleSendProposal}
          proposalTitle={previewProposal.title}
          clientName={previewProposal.clients?.name}
          clientEmail={previewProposal.clients?.email}
          isLoading={isSending || createProposal.isPending}
        />
      )}
    </div>
  );
};

export default NovaPropostaPage;
