
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Eye, Plus, Trash2 } from 'lucide-react';
import { useCreateProposal } from '@/hooks/useProposals';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ProposalPreviewModal from '@/components/ProposalPreviewModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface BudgetItem {
  id: string;
  type: 'material' | 'labor';
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

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

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [newItem, setNewItem] = useState({
    type: 'material' as 'material' | 'labor',
    description: '',
    quantity: 1,
    unit_price: 0
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

  const handleAddBudgetItem = () => {
    if (!newItem.description) {
      toast.error('Descrição é obrigatória');
      return;
    }

    const item: BudgetItem = {
      id: Date.now().toString(),
      type: newItem.type,
      description: newItem.description,
      quantity: newItem.quantity,
      unit_price: newItem.unit_price,
      total_price: newItem.quantity * newItem.unit_price
    };

    setBudgetItems(prev => [...prev, item]);
    setNewItem({
      type: 'material',
      description: '',
      quantity: 1,
      unit_price: 0
    });
    toast.success('Item adicionado com sucesso!');
  };

  const handleRemoveBudgetItem = (id: string) => {
    setBudgetItems(prev => prev.filter(item => item.id !== id));
    toast.success('Item removido com sucesso!');
  };

  const calculateBudgetTotal = () => {
    return budgetItems.reduce((total, item) => total + item.total_price, 0);
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
        value: calculateBudgetTotal(), // Usar o total calculado dos itens
        companies: formData.company_id && companies ? 
          companies.find(c => c.id === formData.company_id) : null,
        proposal_budget_items: budgetItems.map(item => ({
          id: item.id,
          type: item.type,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }))
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
        value: calculateBudgetTotal() || null, // Usar o total calculado
        delivery_time: formData.delivery_time || null,
        validity_date: formData.validity_date || null,
        observations: formData.observations || null,
        template_id: 'standard', // Usar template padrão
        status: 'rascunho',
        user_id: user?.id || ''
      };

      console.log('Criando proposta com dados:', proposalData);
      const createdProposal = await createProposal.mutateAsync(proposalData);
      console.log('Proposta criada:', createdProposal);
      
      // Se há itens de orçamento, salvá-los usando o hook de budget items
      if (budgetItems.length > 0) {
        console.log('Salvando itens de orçamento:', budgetItems);
        // Armazenar itens no sessionStorage para usar na página de visualização
        sessionStorage.setItem('pendingBudgetItems', JSON.stringify(budgetItems));
        navigate(`/propostas/${createdProposal.id}`);
      } else {
        toast.success('Proposta criada com sucesso!');
        navigate('/propostas');
      }
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

        {/* Budget Items Manager */}
        <Card>
          <CardHeader>
            <CardTitle>Orçamento Detalhado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new item form */}
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium">Adicionar Item</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={newItem.type}
                    onValueChange={(value) => setNewItem({ ...newItem, type: value as 'material' | 'labor' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="labor">Mão de Obra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Descrição do item"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="unit_price">Valor Unitário</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.unit_price}
                    onChange={(e) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) || 0 })}
                    placeholder="R$ 0,00"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddBudgetItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>

            {/* Budget items table */}
            {budgetItems.length > 0 && (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Valor Unitário</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgetItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.type === 'material' ? 'Material' : 'Mão de Obra'}
                        </TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          R$ {item.unit_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          R$ {item.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveBudgetItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="flex justify-end">
                  <div className="text-lg font-semibold">
                    Total Geral: R$ {calculateBudgetTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            )}

            {budgetItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum item de orçamento adicionado
              </div>
            )}
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
