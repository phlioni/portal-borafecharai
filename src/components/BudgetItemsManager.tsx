
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { useBudgetItems, useCreateBudgetItem, useUpdateBudgetItem, useDeleteBudgetItem } from '@/hooks/useBudgetItems';
import { toast } from 'sonner';

interface BudgetItemsManagerProps {
  proposalId: string;
  isReadOnly?: boolean;
  isNewProposal?: boolean;
  onItemsChange?: (items: any[]) => void;
}

const BudgetItemsManager = ({ proposalId, isReadOnly = false, isNewProposal = false, onItemsChange }: BudgetItemsManagerProps) => {
  const [newItem, setNewItem] = useState({
    type: 'material' as 'material' | 'labor',
    description: '',
    quantity: 1,
    unit_price: 0
  });

  const [localItems, setLocalItems] = useState<any[]>([]);

  const { data: budgetItems = [], isLoading } = useBudgetItems(proposalId);
  const createBudgetItem = useCreateBudgetItem();
  const updateBudgetItem = useUpdateBudgetItem();
  const deleteBudgetItem = useDeleteBudgetItem();

  // Para novas propostas, use estado local em vez de dados do banco
  const effectiveItems = isNewProposal ? localItems : budgetItems;

  useEffect(() => {
    if (!isNewProposal && budgetItems.length > 0) {
      setLocalItems(budgetItems);
    }
  }, [budgetItems, isNewProposal]);

  // Notificar mudanças nos itens para componentes pai
  useEffect(() => {
    if (onItemsChange) {
      onItemsChange(effectiveItems);
    }
  }, [effectiveItems, onItemsChange]);

  const handleAddItem = async () => {
    if (!newItem.description) {
      toast.error('Descrição é obrigatória');
      return;
    }

    const itemToAdd = {
      id: `temp-${Date.now()}`,
      proposal_id: proposalId,
      type: newItem.type,
      description: newItem.description,
      quantity: newItem.quantity,
      unit_price: newItem.unit_price,
      total_price: newItem.quantity * newItem.unit_price,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isNewProposal) {
      // Para novas propostas, adicione ao estado local
      setLocalItems(prev => [...prev, itemToAdd]);
      toast.success('Item adicionado com sucesso!');
    } else {
      // Para propostas existentes, salve no banco
      try {
        await createBudgetItem.mutateAsync({
          proposal_id: proposalId,
          type: newItem.type,
          description: newItem.description,
          quantity: newItem.quantity,
          unit_price: newItem.unit_price
        });
        toast.success('Item adicionado com sucesso!');
      } catch (error) {
        console.error('Error adding budget item:', error);
        toast.error('Erro ao adicionar item');
        return;
      }
    }

    setNewItem({
      type: 'material',
      description: '',
      quantity: 1,
      unit_price: 0
    });
  };

  const handleDeleteItem = async (id: string) => {
    if (isNewProposal) {
      // Para novas propostas, remova do estado local
      setLocalItems(prev => prev.filter(item => item.id !== id));
      toast.success('Item removido com sucesso!');
    } else {
      // Para propostas existentes, delete do banco
      try {
        await deleteBudgetItem.mutateAsync({ id, proposalId });
        toast.success('Item removido com sucesso!');
      } catch (error) {
        console.error('Error deleting budget item:', error);
        toast.error('Erro ao remover item');
      }
    }
  };

  const calculateTotal = () => {
    return effectiveItems.reduce((total, item) => total + (item.total_price || 0), 0);
  };

  if (!isNewProposal && isLoading) {
    return <div>Carregando itens do orçamento...</div>;
  }

  return (
    <div className="space-y-4">
      {!isReadOnly && (
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
              <Button onClick={handleAddItem} disabled={createBudgetItem.isPending}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      )}

      {effectiveItems.length > 0 && (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Valor Unitário</TableHead>
                <TableHead>Total</TableHead>
                {!isReadOnly && <TableHead>Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {effectiveItems.map((item) => (
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
                  {!isReadOnly && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={deleteBudgetItem.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="flex justify-end">
            <div className="text-lg font-semibold">
              Total Geral: R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}

      {effectiveItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhum item de orçamento adicionado
        </div>
      )}
    </div>
  );
};

export default BudgetItemsManager;
