
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks/useClients';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileClientCard from '@/components/MobileClientCard';
import { formatPhoneNumber, displayPhoneNumber } from '@/utils/phoneUtils';

const ClientesPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [editingClient, setEditingClient] = useState<any>(null);
  const [search, setSearch] = useState('');
  const isMobile = useIsMobile();

  const { data: clients, isLoading, refetch } = useClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.email?.toLowerCase().includes(search.toLowerCase()) ||
    displayPhoneNumber(client.phone || '').includes(search)
  ) || [];

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: ''
    });
    setEditingClient(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await deleteClient.mutateAsync(id);
        toast.success('Cliente excluído com sucesso!');
        resetForm();
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        toast.error('Erro ao excluir cliente');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      const clientData = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() ? formatPhoneNumber(formData.phone.trim()) : null
      };

      if (editingClient) {
        await updateClient.mutateAsync({
          id: editingClient.id,
          updates: clientData
        });
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await createClient.mutateAsync(clientData);
        toast.success('Cliente criado com sucesso!');
      }
      
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast.error('Erro ao salvar cliente');
    }
  };

  const handleEdit = (client: any) => {
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone ? displayPhoneNumber(client.phone) : ''
    });
    setEditingClient(client);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gerencie seus clientes cadastrados</p>
        </div>
        <Button onClick={resetForm}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
          </CardTitle>
          <CardDescription>
            Preencha os dados do cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do cliente"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={displayPhoneNumber(formData.phone)}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="11988887777"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Digite apenas os números (ex: 11988887777)
              </p>
            </div>
            <div className="flex justify-end gap-2">
              {editingClient && (
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={createClient.isPending || updateClient.isPending}>
                {editingClient ? (updateClient.isPending ? 'Salvando...' : 'Salvar Cliente') : (createClient.isPending ? 'Criando...' : 'Criar Cliente')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Clientes Cadastrados</CardTitle>
          <CardDescription>
            {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''} encontrado{filteredClients.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              type="search"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Carregando clientes...</p>
              </div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum cliente encontrado</p>
            </div>
          ) : (
            <>
              {isMobile ? (
                <div className="space-y-4">
                  {filteredClients.map((client) => (
                    <MobileClientCard
                      key={client.id}
                      client={{
                        ...client,
                        phone: client.phone ? displayPhoneNumber(client.phone) : null
                      }}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isDeleting={deleteClient.isPending}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Data de Cadastro</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>{client.email || '-'}</TableCell>
                          <TableCell>
                            {client.phone ? displayPhoneNumber(client.phone) : '-'}
                          </TableCell>
                          <TableCell>
                            {new Date(client.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientesPage;
