
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Plus,
  Edit,
  Trash,
  Eye,
  Crown,
  Wand2,
  Sparkles,
  Save
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useCustomTemplates } from '@/hooks/useCustomTemplates';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ProposalTemplatePreview from '@/components/ProposalTemplatePreview';

const TemplatesPersonalizadosPage = () => {
  const { subscribed, subscription_tier } = useSubscription();
  const { canAccessPremiumTemplates, isAdmin } = useUserPermissions();
  const { templates, loading, saveTemplate, deleteTemplate } = useCustomTemplates();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    style: 'moderno'
  });

  const [aiForm, setAiForm] = useState({
    businessType: '',
    serviceType: '',
    targetAudience: '',
    tone: 'profissional'
  });

  // Verificar se tem permissão para templates personalizados  
  const hasPermission = canAccessPremiumTemplates || isAdmin;

  const generateWithAI = async () => {
    if (!aiForm.businessType || !aiForm.serviceType) {
      toast.error('Preencha pelo menos o tipo de negócio e serviço');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-proposal-template', {
        body: aiForm
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const templateData = response.data;
      setFormData({
        name: templateData.title,
        description: templateData.service_description,
        content: templateData.detailed_description,
        style: 'moderno'
      });

      setPreviewData({
        title: templateData.title,
        client: 'Cliente Exemplo',
        value: 5000,
        deliveryTime: '30 dias',
        description: templateData.detailed_description,
        template: 'moderno'
      });

      toast.success('Template gerado com IA!');
    } catch (error) {
      console.error('Erro ao gerar template:', error);
      toast.error('Erro ao gerar template com IA');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome do template é obrigatório');
      return;
    }

    try {
      await saveTemplate({
        template_id: formData.name.toLowerCase().replace(/\s+/g, '-'),
        name: formData.name,
        description: formData.description,
        html_content: formData.content
      });

      setFormData({ name: '', description: '', content: '', style: 'moderno' });
      setAiForm({ businessType: '', serviceType: '', targetAudience: '', tone: 'profissional' });
      setShowCreateForm(false);
      setPreviewData(null);
      toast.success('Template criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteTemplate(id);
      toast.success('Template excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir template');
    }
  };

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" asChild>
              <Link to="/configuracoes?tab=planos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Templates Personalizados</h1>
              <p className="text-gray-600">Crie e gerencie seus templates únicos</p>
            </div>
          </div>

          {/* Access Denied */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="text-center py-12">
              <Crown className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-orange-900 mb-2">
                Recurso Exclusivo do Plano Profissional
              </h3>
              <p className="text-orange-700 mb-6">
                Para criar templates personalizados, você precisa estar no plano Profissional.
              </p>
              <Button asChild className="bg-orange-600 hover:bg-orange-700">
                <Link to="/configuracoes?tab=planos">
                  <Crown className="h-4 w-4 mr-2" />
                  Fazer Upgrade
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/configuracoes?tab=planos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                Templates Personalizados
              </h1>
              <p className="text-gray-600">Crie templates únicos com inteligência artificial</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Form */}
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-purple-600" />
                  Criar Novo Template
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Geração com IA */}
                <div className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-purple-600" />
                    Gerar com Inteligência Artificial
                  </h4>
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div>
                      <Label htmlFor="businessType">Tipo de Negócio</Label>
                      <Input
                        id="businessType"
                        value={aiForm.businessType}
                        onChange={(e) => setAiForm({...aiForm, businessType: e.target.value})}
                        placeholder="Ex: Agência de Marketing"
                      />
                    </div>
                    <div>
                      <Label htmlFor="serviceType">Tipo de Serviço</Label>
                      <Input
                        id="serviceType"
                        value={aiForm.serviceType}
                        onChange={(e) => setAiForm({...aiForm, serviceType: e.target.value})}
                        placeholder="Ex: Criação de Site"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetAudience">Público-alvo</Label>
                      <Input
                        id="targetAudience"
                        value={aiForm.targetAudience}
                        onChange={(e) => setAiForm({...aiForm, targetAudience: e.target.value})}
                        placeholder="Ex: Pequenas empresas"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tone">Tom da Proposta</Label>
                      <Select 
                        value={aiForm.tone} 
                        onValueChange={(value) => setAiForm({...aiForm, tone: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="profissional">Profissional</SelectItem>
                          <SelectItem value="amigável">Amigável</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="criativo">Criativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    onClick={generateWithAI} 
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isGenerating ? (
                      "Gerando..."
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Gerar Template com IA
                      </>
                    )}
                  </Button>
                </div>

                {/* Formulário Manual */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Personalizar Template</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="name">Nome do Template</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Nome do template"
                      />
                    </div>
                    <div>
                      <Label htmlFor="style">Estilo Visual</Label>
                      <Select 
                        value={formData.style} 
                        onValueChange={(value) => setFormData({...formData, style: value})}
                      >
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
                      <Label htmlFor="description">Descrição Breve</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Breve descrição do template"
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">Conteúdo Detalhado</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        placeholder="Conteúdo detalhado do template..."
                        rows={6}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleCreateTemplate} className="flex items-center gap-2 flex-1">
                      <Save className="h-4 w-4" />
                      Salvar Template
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const data = {
                          title: formData.name || 'Título da Proposta',
                          client: 'Cliente Exemplo',
                          value: 5000,
                          deliveryTime: '30 dias',
                          description: formData.content || 'Descrição do serviço...',
                          template: formData.style
                        };
                        setPreviewData(data);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Atualizar Preview
                    </Button>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormData({ name: '', description: '', content: '', style: 'moderno' });
                      setAiForm({ businessType: '', serviceType: '', targetAudience: '', tone: 'profissional' });
                      setPreviewData(null);
                    }}
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Pré-visualização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {previewData ? (
                    <div className="transform scale-75 origin-top">
                      <ProposalTemplatePreview data={previewData} />
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Gere um template com IA ou preencha os campos para ver a pré-visualização</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Templates List */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando templates...</p>
            </div>
          ) : templates.length > 0 ? (
            templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{template.name}</h3>
                          <Badge variant="default">Personalizado</Badge>
                        </div>
                        <p className="text-gray-600">{template.description}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Criado em {new Date(template.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Sparkles className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum template personalizado
                </h3>
                <p className="text-gray-600 mb-4">
                  Crie seu primeiro template personalizado com IA para dar uma identidade única às suas propostas.
                </p>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Criar Primeiro Template com IA
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatesPersonalizadosPage;
