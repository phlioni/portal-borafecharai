
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
    value: '',
    delivery_time: '',
    validity_date: '',
    observations: '',
    template_id: 'moderno'
  });

  const [showPreview, setShowPreview] = useState(false);
  const [previewProposal, setPreviewProposal] = useState(null);
  const [companyLogo, setCompanyLogo] = useState('');

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
      if (formData.company_id && companies) {
        const selectedCompany = companies.find(c => c.id === formData.company_id);
        logoUrl = selectedCompany?.logo_url || '';
      }

      const proposalForPreview = {
        ...formData,
        id: 'preview',
        user_id: user?.id || '',
        status: 'rascunho',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        value: formData.value ? parseFloat(formData.value.replace(/[^\d,]/g, '').replace(',', '.')) : null,
        companies: formData.company_id && companies ? 
          companies.find(c => c.id === formData.company_id) : null
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
      const proposalData = {
        title: formData.title,
        company_id: formData.company_id || null,
        service_description: formData.service_description || null,
        detailed_description: formData.detailed_description || null,
        value: formData.value ? parseFloat(formData.value.replace(/[^\d,]/g, '').replace(',', '.')) : null,
        delivery_time: formData.delivery_time || null,
        validity_date: formData.validity_date || null,
        observations: formData.observations || null,
        template_id: formData.template_id,
        status: 'rascunho',
        user_id: user?.id || ''
      };

      await createProposal.mutateAsync(proposalData);
      toast.success('Proposta criada com sucesso!');
      navigate('/propostas');
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
                <Label htmlFor="value">Valor</Label>
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                  placeholder="R$ 0,00"
                />
              </div>
              <div>
                <Label htmlFor="delivery_time">Prazo de Entrega</Label>
                <Input
                  id="delivery_time"
                  value={formData.delivery_time}
                  onChange={(e) => handleInputChange('delivery_time', e.target.value)}
                  placeholder="Ex: 30 dias"
                />
              </div>
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
            <div>
              <Label htmlFor="template_id">Modelo de Template</Label>
              <Select value={formData.template_id} onValueChange={(value) => handleInputChange('template_id', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moderno">Moderno</SelectItem>
                  <SelectItem value="executivo">Executivo</SelectItem>
                  <SelectItem value="criativo">Criativo</SelectItem>
                </SelectContent>
              </Select>
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

        {/* Budget Items Manager - será exibido apenas se a proposta for salva */}
        <Card>
          <CardHeader>
            <CardTitle>Orçamento Detalhado (Opcional)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              O orçamento detalhado ficará disponível após salvar a proposta. 
              Você poderá adicionar itens de materiais e mão de obra na página de edição.
            </p>
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
