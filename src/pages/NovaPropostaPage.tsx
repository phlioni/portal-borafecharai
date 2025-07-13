
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
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';

const NovaPropostaPage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('moderno');
  const [formData, setFormData] = useState({
    titulo: '',
    cliente: '',
    email: '',
    telefone: '',
    servico: '',
    descricao: '',
    valor: '',
    prazo: '',
    validade: '',
    observacoes: ''
  });

  const templates = [
    {
      id: 'moderno',
      name: 'Moderno',
      description: 'Design limpo e profissional para serviços de tecnologia',
      color: 'bg-blue-500',
      preview: '/templates/moderno.jpg'
    },
    {
      id: 'executivo',
      name: 'Executivo',
      description: 'Estilo corporativo para grandes empresas',
      color: 'bg-gray-800',
      preview: '/templates/executivo.jpg'
    },
    {
      id: 'criativo',
      name: 'Criativo',
      description: 'Visual diferenciado para agências e design',
      color: 'bg-purple-500',
      preview: '/templates/criativo.jpg'
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (action: 'save' | 'send') => {
    // Implementar lógica de salvamento ou envio
    console.log('Ação:', action, 'Dados:', formData, 'Template:', selectedTemplate);
  };

  return (
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
          <p className="text-gray-600 mt-1">Crie uma proposta profissional em minutos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSubmit('save')}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Rascunho
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleSubmit('send')}>
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
              </div>
              <div>
                <Label htmlFor="telefone">Telefone (Opcional)</Label>
                <Input
                  id="telefone"
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                />
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
                <Label htmlFor="titulo">Título da Proposta</Label>
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
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTemplate === template.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${template.color}`} />
                    <div className="flex-1">
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                    {selectedTemplate === template.id && (
                      <Badge variant="default">Selecionado</Badge>
                    )}
                  </div>
                </div>
              ))}
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
                  Para: {formData.cliente || 'Nome do Cliente'}
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
  );
};

export default NovaPropostaPage;
