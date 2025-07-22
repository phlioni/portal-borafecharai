
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit, Package, Wrench } from 'lucide-react';
import { useBudgetTemplates } from '@/hooks/useBudgetTemplates';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ModelosOrcamentoPage = () => {
  const { toast } = useToast();
  const {
    templates,
    templateItems,
    isLoading,
    createTemplate,
    deleteTemplate,
    createTemplateItem,
    deleteTemplateItem,
  } = useBudgetTemplates();

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemType, setNewItemType] = useState<'material' | 'labor'>('material');
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [isCreateItemOpen, setIsCreateItemOpen] = useState(false);

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do modelo é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTemplate.mutateAsync({ name: newTemplateName });
      setNewTemplateName('');
      setIsCreateTemplateOpen(false);
      toast({
        title: "Sucesso",
        description: "Modelo criado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar modelo",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplate.mutateAsync(templateId);
      if (selectedTemplate === templateId) {
        setSelectedTemplate(null);
      }
      toast({
        title: "Sucesso",
        description: "Modelo excluído com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir modelo",
        variant: "destructive",
      });
    }
  };

  const handleCreateItem = async () => {
    if (!selectedTemplate || !newItemDescription.trim()) {
      toast({
        title: "Erro",
        description: "Selecione um modelo e informe a descrição do item",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTemplateItem.mutateAsync({
        template_id: selectedTemplate,
        type: newItemType,
        description: newItemDescription,
      });
      setNewItemDescription('');
      setIsCreateItemOpen(false);
      toast({
        title: "Sucesso",
        description: "Item criado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await deleteTemplateItem.mutateAsync(itemId);
      toast({
        title: "Sucesso",
        description: "Item excluído com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir item",
        variant: "destructive",
      });
    }
  };

  const selectedTemplateData = templates?.find(t => t.id === selectedTemplate);
  const itemsForSelectedTemplate = templateItems?.filter(item => item.template_id === selectedTemplate) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Modelos de Orçamento</h1>
          <p className="text-gray-600 mt-2">
            Gerencie seus modelos de orçamento e itens pré-cadastrados
          </p>
        </div>
        
        <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Modelo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Modelo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Nome do Modelo</Label>
                <Input
                  id="template-name"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Ex: Reforma Residencial"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateTemplateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateTemplate} disabled={createTemplate.isPending}>
                  {createTemplate.isPending ? 'Criando...' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Modelos */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Modelos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {templates?.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTemplate === template.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{template.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.id);
                        }}
                        disabled={deleteTemplate.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {(!templates || templates.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum modelo encontrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalhes do Modelo Selecionado */}
        <div className="lg:col-span-2">
          {selectedTemplate && selectedTemplateData ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{selectedTemplateData.name}</CardTitle>
                  <Dialog open={isCreateItemOpen} onOpenChange={setIsCreateItemOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Item ao Modelo</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="item-type">Tipo</Label>
                          <Select value={newItemType} onValueChange={(value: 'material' | 'labor') => setNewItemType(value)}>
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
                          <Label htmlFor="item-description">Descrição</Label>
                          <Input
                            id="item-description"
                            value={newItemDescription}
                            onChange={(e) => setNewItemDescription(e.target.value)}
                            placeholder="Ex: Tinta branca látex 18L"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsCreateItemOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleCreateItem} disabled={createTemplateItem.isPending}>
                            {createTemplateItem.isPending ? 'Adicionando...' : 'Adicionar'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Materiais */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Package className="w-5 h-5 mr-2" />
                      Materiais
                    </h3>
                    <div className="space-y-2">
                      {itemsForSelectedTemplate
                        .filter(item => item.type === 'material')
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                          >
                            <span>{item.description}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteItem(item.id)}
                              disabled={deleteTemplateItem.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      {itemsForSelectedTemplate.filter(item => item.type === 'material').length === 0 && (
                        <div className="text-gray-500 text-center py-4">
                          Nenhum material cadastrado
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mão de Obra */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Wrench className="w-5 h-5 mr-2" />
                      Mão de Obra
                    </h3>
                    <div className="space-y-2">
                      {itemsForSelectedTemplate
                        .filter(item => item.type === 'labor')
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                          >
                            <span>{item.description}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteItem(item.id)}
                              disabled={deleteTemplateItem.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      {itemsForSelectedTemplate.filter(item => item.type === 'labor').length === 0 && (
                        <div className="text-gray-500 text-center py-4">
                          Nenhuma mão de obra cadastrada
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16">
                <div className="text-center text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Selecione um modelo para ver os detalhes</p>
                  <p className="text-sm">Escolha um modelo na lista ao lado para visualizar e gerenciar seus itens</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelosOrcamentoPage;
