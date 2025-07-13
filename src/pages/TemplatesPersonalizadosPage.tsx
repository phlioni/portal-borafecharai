import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Plus,
  Edit,
  Trash,
  Eye,
  Crown,
  Palette
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

const TemplatesPersonalizadosPage = () => {
  const { subscribed, subscription_tier } = useSubscription();
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Template Corporativo Premium',
      description: 'Template elegante para propostas corporativas',
      created_at: '2024-01-15',
      isActive: true
    },
    {
      id: 2,
      name: 'Template Criativo Plus',
      description: 'Design moderno para projetos criativos',
      created_at: '2024-01-10',
      isActive: false
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    headerStyle: '',
    contentStyle: '',
    footerStyle: ''
  });

  // Verificar se tem permissão para templates personalizados
  const hasPermission = subscribed && subscription_tier === 'equipes';

  const handleCreateTemplate = () => {
    if (!formData.name.trim()) {
      toast.error('Nome do template é obrigatório');
      return;
    }

    const newTemplate = {
      id: templates.length + 1,
      name: formData.name,
      description: formData.description,
      created_at: new Date().toISOString().split('T')[0],
      isActive: true
    };

    setTemplates([...templates, newTemplate]);
    setFormData({ name: '', description: '', headerStyle: '', contentStyle: '', footerStyle: '' });
    setShowCreateForm(false);
    toast.success('Template criado com sucesso!');
  };

  const handleDeleteTemplate = (id: number) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast.success('Template excluído com sucesso!');
  };

  const toggleTemplateStatus = (id: number) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, isActive: !t.isActive } : t
    ));
    toast.success('Status do template atualizado!');
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
                Recurso Exclusivo do Plano Equipes
              </h3>
              <p className="text-orange-700 mb-6">
                Para criar templates personalizados, você precisa estar no plano Equipes.
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
      <div className="p-6 max-w-6xl mx-auto">
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
              <h1 className="text-2xl font-bold text-gray-900">Templates Personalizados</h1>
              <p className="text-gray-600">Crie e gerencie seus templates únicos</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-blue-600" />
                Criar Novo Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="templateName">Nome do Template *</Label>
                  <Input
                    id="templateName"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Template Corporativo Premium"
                  />
                </div>
                <div>
                  <Label htmlFor="templateDescription">Descrição</Label>
                  <Input
                    id="templateDescription"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Ex: Template elegante para propostas corporativas"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="headerStyle">Estilo do Cabeçalho (CSS)</Label>
                <Textarea
                  id="headerStyle"
                  value={formData.headerStyle}
                  onChange={(e) => setFormData({...formData, headerStyle: e.target.value})}
                  placeholder="Ex: background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="contentStyle">Estilo do Conteúdo (CSS)</Label>
                <Textarea
                  id="contentStyle"
                  value={formData.contentStyle}
                  onChange={(e) => setFormData({...formData, contentStyle: e.target.value})}
                  placeholder="Ex: font-family: 'Arial', sans-serif; line-height: 1.6;"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="footerStyle">Estilo do Rodapé (CSS)</Label>
                <Textarea
                  id="footerStyle"
                  value={formData.footerStyle}
                  onChange={(e) => setFormData({...formData, footerStyle: e.target.value})}
                  placeholder="Ex: border-top: 2px solid #667eea; padding-top: 20px;"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateTemplate}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Criar Template
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Templates List */}
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{template.name}</h3>
                        <Badge variant={template.isActive ? "default" : "secondary"}>
                          {template.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
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
                      onClick={() => toggleTemplateStatus(template.id)}
                    >
                      {template.isActive ? 'Desativar' : 'Ativar'}
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
          ))}

          {templates.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Palette className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum template personalizado
                </h3>
                <p className="text-gray-600 mb-4">
                  Crie seu primeiro template personalizado para dar uma identidade única às suas propostas.
                </p>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Template
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