
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
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ProposalPreviewModal from '@/components/ProposalPreviewModal';
import BudgetItemsManager from '@/components/BudgetItemsManager';

const NovaPropostaPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createProposal = useCreateProposal();
  const { data: companies } = useCompanies();

  const [formData, setFormData] = useState({
    title: '',
    company_id: '',
    service_description: '',
    detailed_description: '',
    delivery_time: '',
    validity_date: '',
    observations: ''
  });

  const [showPreview, setShowPreview] = useState(false);
  const [previewProposal, setPreviewProposal] = useState(null);
  const [companyLogo, setCompanyLogo] = useState('');
  const [tempProposalId, setTempProposalId] = useState<string | null>(null);
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

  const handlePreview = async () => {
    if (!formData.title) {
      toast.error('Título é obrigatório para visualizar');
      return;
    }

    try {
      // Buscar logo da empresa se selecionada
      let logoUrl = '';
      if (formData.company_id && companies) {
        const selectedCompany = companies.find(c => c.id === formData.company_id);
        logoUrl = selectedCompany?.logo_url || '';
      }

      // Calcular valor total baseado nos itens do orçamento
      const totalValue = budgetItems.reduce((total, item) => {
        return total + (item.quantity * item.unit_price);
      }, 0);

      const proposalForPreview = {
        id: 'temp-id',
        ...formData,
        value: totalValue,
        companies: formData.company_id && companies ? 
          companies.find(c => c.id === formData.company_id) : null,
        created_at: new Date().toISOString(),
        user_id: user?.id
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
      // Calcular valor total baseado nos itens do orçamento
      const totalValue = budgetItems.reduce((total, item) => {
        return total + (item.quantity * item.unit_price);
      }, 0);

      const proposalData = {
        title: formData.title,
        company_id: formData.company_id || null,
        service_description: formData.service_description || null,
        detailed_description: formData.detailed_description || null,
        value: totalValue > 0 ? totalValue : null,
        delivery_time: formData.delivery_time || null,
        validity_date: formData.validity_date || null,
        observations: formData.observations || null,
        user_id: user!.id
      };

      const newProposal = await createProposal.mutateAsync(proposalData);
      
      // Se há itens no orçamento, salvá-los no sessionStorage para processamento posterior
      if (budgetItems.length > 0) {
        sessionStorage.setItem('pendingBudgetItems', JSON.stringify(budgetItems));
      }
      
      toast.success('Proposta criada com sucesso!');
      
      // Navegar para a página de visualização da proposta criada
      navigate(`/propostas/visualizar/${newProposal.id}`);
    } catch (error) {
      console.error('Erro ao criar proposta:', error);
      toast.error('Erro ao criar proposta');
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
          <Button onClick={handleSave} disabled={createProposal.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Proposta
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
              <Label htmlFor="company">Cliente</Label>
              <Select value={formData.company_id} onValueChange={(value) => handleInputChange('company_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum cliente selecionado</SelectItem>
                  {companies?.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
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
              proposalId={tempProposalId} 
              onItemsChange={handleBudgetItemsChange}
              isNewProposal={true}
            />
          </CardContent>
        </Card>
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

export default NovaPropostaPage;
