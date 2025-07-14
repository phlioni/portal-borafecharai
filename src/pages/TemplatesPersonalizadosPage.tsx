import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useCustomTemplates } from '@/hooks/useCustomTemplates';
import { toast } from 'sonner';
import PlanLimitGuard from '@/components/PlanLimitGuard';

const TemplatesPersonalizadosPage = () => {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useCustomTemplates();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template_id: '',
    html_content: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, formData);
        toast.success('Template atualizado com sucesso!');
      } else {
        await createTemplate(formData);
        toast.success('Template criado com sucesso!');
      }
      
      setDialogOpen(false);
      setEditingTemplate(null);
      setFormData({
        name: '',
        description: '',
        template_id: '',
        html_content: ''
      });
    } catch (error) {
      toast.error('Erro ao salvar template');
    }
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      template_id: template.template_id,
      html_content: template.html_content
    });
    setDialogOpen(true);
  };

  const handleDelete = async (templateId: string) => {
    if (confirm('Tem certeza que deseja excluir este template?')) {
      try {
        await deleteTemplate(templateId);
        toast.success('Template excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir template');
      }
    }
  };

  const defaultTemplateContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Proposta Comercial</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .company-logo { max-width: 200px; margin-bottom: 20px; }
        .content { margin: 20px 0; }
        .section { margin: 20px 0; }
        .footer { margin-top: 40px; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        \{\{#if company.logo_url\}\}
        <img src="\{\{company.logo_url\}\}" alt="\{\{company.name\}\}" class="company-logo">
        \{\{/if\}\}
        <h1>Proposta Comercial</h1>
        <h2>\{\{title\}\}</h2>
    </div>

    <div class="content">
        <div class="section">
            <h3>Descrição do Serviço</h3>
            <p>\{\{service_description\}\}</p>
        </div>

        <div class="section">
            <h3>Detalhes</h3>
            <p>\{\{detailed_description\}\}</p>
        </div>

        <div class="section">
            <h3>Informações Comerciais</h3>
            <p><strong>Valor:</strong> \{\{#if value\}\}R$ \{\{value\}\}\{\{else\}\}A definir\{\{/if\}\}</p>
            <p><strong>Prazo de Entrega:</strong> \{\{delivery_time\}\}</p>
            <p><strong>Validade:</strong> \{\{validity_date\}\}</p>
        </div>

        \{\{#if observations\}\}
        <div class="section">
            <h3>Observações</h3>
            <p>\{\{observations\}\}</p>
        </div>
        \{\{/if\}\}
    </div>

    <div class="footer">
        <p>\{\{company.name\}\}</p>
        <p>\{\{company.email\}\} | \{\{company.phone\}\}</p>
    </div>
</body>
</html>`;

  return (
    <PlanLimitGuard feature="premiumTemplates">
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Templates Personalizados</h1>
            <p className="text-muted-foreground">Crie e gerencie seus templates personalizados</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingTemplate(null);
                setFormData({
                  name: '',
                  description: '',
                  template_id: '',
                  html_content: defaultTemplateContent
                });
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Editar Template' : 'Novo Template'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome do Template</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="template_id">ID do Template</Label>
                    <Input
                      id="template_id"
                      value={formData.template_id}
                      onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                      placeholder="ex: meu-template-personalizado"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="html_content">HTML do Template</Label>
                  <Textarea
                    id="html_content"
                    value={formData.html_content}
                    onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                    rows={20}
                    className="font-mono text-sm"
                    placeholder="Cole seu HTML aqui..."
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Use variáveis como {'{{title}}'}, {'{{company.name}}'}, {'{{service_description}}'}, etc.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingTemplate ? 'Atualizar' : 'Criar'} Template
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p>Carregando templates...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      ID: {template.template_id}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && templates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum template personalizado encontrado.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Crie seu primeiro template personalizado para começar.
            </p>
          </div>
        )}
      </div>
    </PlanLimitGuard>
  );
};

export default TemplatesPersonalizadosPage;
