
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useBudgetItems, useCreateBudgetItem, useUpdateBudgetItem, useDeleteBudgetItem } from '@/hooks/useBudgetItems';

interface BudgetItem {
  id?: string;
  type: 'material' | 'labor';
  description: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
}

interface BudgetItemsManagerProps {
  proposalId: string;
  isNewProposal?: boolean;
  onItemsChange?: (items: BudgetItem[]) => void;
}

const BudgetItemsManager = ({ proposalId, isNewProposal = false, onItemsChange }: BudgetItemsManagerProps) => {
  const [localItems, setLocalItems] = useState<BudgetItem[]>([]);
  const [newItem, setNewItem] = useState<BudgetItem>({
    type: 'labor',
    description: '',
    quantity: 1,
    unit_price: 0
  });

  // Hooks para operações no banco (só usados quando não é nova proposta)
  const { data: dbItems = [], refetch } = useBudgetItems(isNewProposal ? '' : proposalId);
  const createItem = useCreateBudgetItem();
  const updateItem = useUpdateBudgetItem();
  const deleteItem = useDeleteBudgetItem();

  // Sincronizar com o banco quando não é nova proposta
  useEffect(() => {
    if (!isNewProposal && dbItems) {
      // Convert database items to proper BudgetItem format
      const convertedItems: BudgetItem[] = dbItems.map(item => ({
        id: item.id,
        type: item.type as 'material' | 'labor',
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price || 0
      }));
      setLocalItems(convertedItems);
    }
  }, [dbItems, isNewProposal]);

  // Notificar mudanças para componente pai
  useEffect(() => {
    if (onItemsChange) {
      onItemsChange(localItems);
    }
  }, [localItems, onItemsChange]);

  const calculateTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const handleAddItem = async () => {
    if (!newItem.description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }

    const itemToAdd = {
      ...newItem,
      total_price: calculateTotal(newItem.quantity, newItem.unit_price)
    };

    if (isNewProposal) {
      // Para nova proposta, apenas adiciona localmente
      setLocalItems(prev => [...prev, { ...itemToAdd, id: Date.now().toString() }]);
    } else {
      // Para proposta existente, salva no banco
      try {
        await createItem.mutateAsync({
          proposal_id: proposalId,
          type: itemToAdd.type,
          description: itemToAdd.description,
          quantity: itemToAdd.quantity,
          unit_price: itemToAdd.unit_price
        });
        toast.success('Item adicionado com sucesso');
        refetch();
      } catch (error) {
        console.error('Erro ao adicionar item:', error);
        toast.error('Erro ao adicionar item');
      }
    }

    // Limpar formulário
    setNewItem({
      type: 'labor',
      description: '',
      quantity: 1,
      unit_price: 0
    });
  };

  const handleUpdateItem = async (id: string, updates: Partial<BudgetItem>) => {
    if (isNewProposal) {
      // Para nova proposta, atualiza localmente
      setLocalItems(prev => prev.map(item => 
        item.id === id 
          ? { 
              ...item, 
              ...updates, 
              total_price: calculateTotal(
                updates.quantity ?? item.quantity, 
                updates.unit_price ?? item.unit_price
              )
            }
          : item
      ));
    } else {
      // Para proposta existente, atualiza no banco
      try {
        const updatedData = {
          ...updates,
          total_price: calculateTotal(
            updates.quantity ?? 1, 
            updates.unit_price ?? 0
          )
        };
        
        await updateItem.mutateAsync({ id, updates: updatedData });
        refetch();
      } catch (error) {
        console.error('Erro ao atualizar item:', error);
        toast.error('Erro ao atualizar item');
      }
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (isNewProposal) {
      // Para nova proposta, remove localmente
      setLocalItems(prev => prev.filter(item => item.id !== id));
    } else {
      // Para proposta existente, remove do banco
      try {
        await deleteItem.mutateAsync({ id, proposalId });
        toast.success('Item removido com sucesso');
        refetch();
      } catch (error) {
        console.error('Erro ao remover item:', error);
        toast.error('Erro ao remover item');
      }
    }
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const totalValue = localItems.reduce((total, item) => total + (item.total_price || 0), 0);

  return (
    <div className="space-y-6">
      {/* Formulário para adicionar novo item */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Adicionar Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="item-type">Tipo</Label>
              <Select value={newItem.type} onValueChange={(value: 'material' | 'labor') => setNewItem(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="labor">Serviço</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="item-description">Descrição</Label>
              <Input
                id="item-description"
                value={newItem.description}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do item"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="item-quantity">Quantidade</Label>
              <Input
                id="item-quantity"
                type="text"
                value={newItem.quantity.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setNewItem(prev => ({ ...prev, quantity: value === '' ? 0 : parseFloat(value) || 0 }));
                  }
                }}
                placeholder="Quantidade"
              />
            </div>
            <div>
              <Label htmlFor="item-unit-price">Preço Unitário</Label>
              <Input
                id="item-unit-price"
                type="text"
                value={newItem.unit_price.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setNewItem(prev => ({ ...prev, unit_price: value === '' ? 0 : parseFloat(value) || 0 }));
                  }
                }}
                placeholder="Preço unitário"
              />
            </div>
            <div>
              <Label>Total</Label>
              <div className="h-10 px-3 py-2 bg-gray-50 border rounded-md flex items-center">
                {formatCurrency(calculateTotal(newItem.quantity, newItem.unit_price))}
              </div>
            </div>
          </div>
          
          <Button onClick={handleAddItem} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Item
          </Button>
        </CardContent>
      </Card>

      {/* Lista de itens */}
      {localItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Itens do Orçamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {localItems.map((item, index) => (
                <div key={item.id || index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Tipo</Label>
                        <Select 
                          value={item.type} 
                          onValueChange={(value: 'material' | 'labor') => 
                            handleUpdateItem(item.id!, { type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="labor">Serviço</SelectItem>
                            <SelectItem value="material">Material</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Descrição</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => handleUpdateItem(item.id!, { description: e.target.value })}
                          placeholder="Descrição do item"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id!)}
                      className="text-red-600 hover:text-red-700 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Quantidade</Label>
                      <Input
                        type="text"
                        value={item.quantity.toString()}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            handleUpdateItem(item.id!, { quantity: value === '' ? 0 : parseFloat(value) || 0 });
                          }
                        }}
                        placeholder="Quantidade"
                      />
                    </div>
                    <div>
                      <Label>Preço Unitário</Label>
                      <Input
                        type="text"
                        value={item.unit_price.toString()}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            handleUpdateItem(item.id!, { unit_price: value === '' ? 0 : parseFloat(value) || 0 });
                          }
                        }}
                        placeholder="Preço unitário"
                      />
                    </div>
                    <div>
                      <Label>Total</Label>
                      <div className="h-10 px-3 py-2 bg-gray-50 border rounded-md flex items-center font-medium">
                        {formatCurrency(item.total_price || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total geral */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-end">
                <div className="text-right">
                  <div className="text-lg font-bold">
                    Total Geral: {formatCurrency(totalValue)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BudgetItemsManager;
