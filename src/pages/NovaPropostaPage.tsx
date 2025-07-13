
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Eye, 
  Palette,
  Image,
  FileText,
  DollarSign,
  Calendar,
  User,
  Plus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateProposal } from '@/hooks/useProposals';
import { useCreateCompany, useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import PlanLimitGuard from '@/components/PlanLimitGuard';
import { toast } from 'sonner';

const NovaPropostaPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: companies } = useCompanies();
  const { canCreateProposal, canAccessPremiumTemplates, monthlyProposalCount, monthlyProposalLimit } = useUserPermissions();
  const createProposal = useCreateProposal();
  const createCompany = useCreateCompany();

  const [selectedTemplate, setSelectedTemplate] = useState('moderno');
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    cliente: '',
    clienteExistente: '',
    email: '',
    telefone: '',
    servico: '',
    descricao: '',
    valor: '',
    prazo: '',
    validade: '',
    observacoes: ''
  });

  const [newCompanyData, setNewCompanyData] = useState({
    nome: '',
    email: '',
    telefone: ''
  });

  const templates = [
    {
      id: 'moderno',
      name: 'Moderno',
      description: 'Design limpo e profissional para serviços de tecnologia',
      color: 'bg-blue-500',
      preview: '/templates/moderno.jpg',
      isPremium: false
    },
    {
      id: 'executivo',
      name: 'Executivo',
      description: 'Estilo corporativo para grandes empresas',
      color: 'bg-gray-800',
      preview: '/templates/executivo.jpg',
      isPremium: true
    },
    {
      id: 'criativo',
      name: 'Criativo',
      description: 'Visual diferenciado para agências e design',
      color: 'bg-purple-500',
      preview: '/templates/criativo.jpg',
      isPremium: true
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewCompanyChange = (field: string, value: string) => {
    setNewCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateCompany = async () => {
    if (!user || !newCompanyData.nome) return;

    try {
      const result = await createCompany.mutateAsync({
        user_id: user.id,
        name: newCompanyData.nome,
        email: newCompanyData.email || null,
        phone: newCompanyData.telefone || null
      });

      setFormData(prev => ({
        ...prev,
        clienteExistente: result.id,
        cliente: result.name,
        email: result.email || '',
        telefone: result.phone || ''
      }));

      setNewCompanyData({ nome: '', email: '', telefone: '' });
      setShowNewCompanyForm(false);
      toast.success('Cliente criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      toast.error('Erro ao criar cliente');
    }
  };

  const handleSubmit = async (action: 'save' | 'send') => {
    if (!user || !formData.titulo) {
      toast.error('Título é obrigatório');
      return;
    }

    if (!canCreateProposal && action === 'send') {
      toast.error('Você atingiu o limite de propostas do seu plano');
      return;
    }

    try {
      let companyId = formData.clienteExistente;

      // Se não há cliente selecionado e há dados de cliente preenchidos, criar novo cliente
      if (!companyId && formData.cliente) {
        const result = await createCompany.mutateAsync({
          user_id: user.id,
          name: formData.cliente,
          email: formData.email || null,
          phone: formData.telefone || null
        });
        companyId = result.id;
      }

      await createProposal.mutateAsync({
        user_id: user.id,
        company_id: companyId || null,
        title: formData.titulo,
        service_description: formData.servico || null,
        detailed_description: formData.descricao || null,
        value: formData.valor ? parseFloat(formData.valor.replace(/[^\d,]/g, '').replace(',', '.')) : null,
        delivery_time: formData.prazo || null,
        validity_date: formData.validade || null,
        observations: formData.observacoes || null,
        template_id: selectedTemplate,
        status: action === 'send' ? 'enviada' : 'rascunho'
      });

      toast.success(action === 'send' ? 'Proposta enviada com sucesso!' : 'Proposta salva como rascunho!');
      navigate('/propostas');
    } catch (error) {
      console.error('Erro ao salvar proposta:', error);
      toast.error('Erro ao salvar proposta');
    }
  };

  return (
    <PlanLimitGuard feature="createProposal">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/propostas" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Nova Proposta</h1>
            <p className="text-gray-600 mt-1">
              Crie uma proposta profissional em minutos
              {monthlyProposalLimit && (
                <span className="block text-sm text-orange-600 mt-1">
                  {monthlyProposalCount} de {monthlyProposalLimit} propostas usadas este mês
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSubmit('save')} disabled={createProposal.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Rascunho
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={() => handleSubmit('send')} 
              disabled={createProposal.isPending || !canCreateProposal}
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Proposta
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Cliente
              </CardTitle>
              <CardDescription>
                Dados do cliente que receberá a proposta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="clienteExistente">Cliente Existente</Label>
                  <select
                    id="clienteExistente"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.clienteExistente}
                    onChange={(e) => {
                      const selectedCompany = companies?.find(c => c.id === e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        clienteExistente: e.target.value,
                        cliente: selectedCompany?.name || '',
                        email: selectedCompany?.email || '',
                        telefone: selectedCompany?.phone || ''
                      }));
                    }}
                  >
                    <option value="">Selecione um cliente existente ou crie novo</option>
                    {companies?.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">ou</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewCompanyForm(!showNewCompanyForm)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Novo Cliente
                  </Button>
                </div>

                {showNewCompanyForm && (
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="novoClienteNome">Nome da Empresa/Cliente *</Label>
                        <Input
                          id="novoClienteNome"
                          placeholder="Ex: Empresa ABC Ltda"
                          value={newCompanyData.nome}
                          onChange={(e) => handleNewCompanyChange('nome', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="novoClienteEmail">E-mail</Label>
                          <Input
                            id="novoClienteEmail"
                            type="email"
                            placeholder="cliente@empresa.com"
                            value={newCompanyData.email}
                            onChange={(e) => handleNewCompanyChange('email', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="novoClienteTelefone">Telefone</Label>
                          <Input
                            id="novoClienteTelefone"
                            placeholder="(11) 99999-9999"
                            value={newCompanyData.telefone}
                            onChange={(e) => handleNewCompanyChange('telefone', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleCreateCompany}
                          disabled={!newCompanyData.nome || createCompany.isPending}
                        >
                          Criar Cliente
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowNewCompanyForm(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {!formData.clienteExistente && !showNewCompanyForm && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cliente">Nome da Empresa/Cliente</Label>
                      <Input
                        id="cliente"
                        placeholder="Ex: Empresa ABC Ltda"
                        value={formData.cliente}
                        onChange={(e) => handleInputChange('cliente', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail do Cliente</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="cliente@empresa.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="telefone">Telefone (Opcional)</Label>
                      <Input
                        id="telefone"
                        placeholder="(11) 99999-9999"
                        value={formData.telefone}
                        onChange={(e) => handleInputChange('telefone', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalhes do Serviço
              </CardTitle>
              <CardDescription>
                Descreva o que será entregue ao cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título da Proposta *</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Desenvolvimento de Website Institucional"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange('titulo', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="servico">Resumo do Serviço</Label>
                <Input
                  id="servico"
                  placeholder="Ex: Criação de website responsivo com CMS"
                  value={formData.servico}
                  onChange={(e) => handleInputChange('servico', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição Detalhada</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva em detalhes o que será entregue, metodologia, etapas, etc."
                  rows={4}
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Informações Financeiras
              </CardTitle>
              <CardDescription>
                Valores e prazos da proposta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor">Valor Total</Label>
                  <Input
                    id="valor"
                    placeholder="R$ 0,00"
                    value={formData.valor}
                    onChange={(e) => handleInputChange('valor', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="prazo">Prazo de Entrega</Label>
                  <Input
                    id="prazo"
                    placeholder="Ex: 30 dias úteis"
                    value={formData.prazo}
                    onChange={(e) => handleInputChange('prazo', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="validade">Validade da Proposta</Label>
                <Input
                  id="validade"
                  type="date"
                  value={formData.validade}
                  onChange={(e) => handleInputChange('validade', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="observacoes">Observações (Opcional)</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Condições de pagamento, informações adicionais, etc."
                  rows={3}
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Selection & Preview */}
        <div className="space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Escolha o Template
              </CardTitle>
              <CardDescription>
                Selecione o design da sua proposta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {templates.map((template) => {
                const isDisabled = template.isPremium && !canAccessPremiumTemplates;
                
                return (
                  <div
                    key={template.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all relative ${
                      selectedTemplate === template.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : isDisabled
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => !isDisabled && setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${template.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{template.name}</h3>
                          {template.isPremium && (
                            <Badge variant="secondary" className="text-xs">Premium</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                      {selectedTemplate === template.id && !isDisabled && (
                        <Badge variant="default">Selecionado</Badge>
                      )}
                    </div>
                    {isDisabled && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 rounded-lg">
                        <Link to="/planos">
                          <Button size="sm" variant="outline">
                            Upgrade para usar
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Pré-visualização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">
                  {formData.titulo || 'Título da Proposta'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Para: {formData.cliente || formData.clienteExistente ? companies?.find(c => c.id === formData.clienteExistente)?.name : 'Nome do Cliente'}
                </p>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {formData.valor || 'R$ 0,00'}
                </div>
                <p className="text-sm text-gray-500">
                  Template: {templates.find(t => t.id === selectedTemplate)?.name}
                </p>
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Eye className="h-4 w-4 mr-2" />
                Visualizar Completa
              </Button>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 text-sm">💡 Dicas para uma boa proposta</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <p>• Seja claro e específico na descrição</p>
              <p>• Inclua prazos realistas</p>
              <p>• Destaque o valor entregue ao cliente</p>
              <p>• Use um template que combine com seu negócio</p>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </PlanLimitGuard>
  );
};

export default NovaPropostaPage;
