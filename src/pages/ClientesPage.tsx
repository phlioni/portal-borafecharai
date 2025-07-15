
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Users, Edit, Trash2 } from 'lucide-react';
import ClientEditModal from '@/components/ClientEditModal';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileClientCard from '@/components/MobileClientCard';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const ClientesPage = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const fetchClients = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        toast.error('Erro ao carregar clientes');
        return;
      }

      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([{
          ...clientData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating client:', error);
        toast.error('Erro ao criar cliente');
        return;
      }

      await fetchClients();
      toast.success('Cliente criado com sucesso!');
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('Erro ao criar cliente');
    }
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('companies')
        .update(clientData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating client:', error);
        toast.error('Erro ao atualizar cliente');
        return;
      }

      await fetchClients();
      toast.success('Cliente atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Erro ao atualizar cliente');
    }
  };

  const deleteClient = async (clientId: string) => {
    if (!user) return;

    setDeletingClientId(clientId);
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', clientId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting client:', error);
        toast.error('Erro ao deletar cliente');
        return;
      }

      await fetchClients();
      toast.success('Cliente deletado com sucesso!');
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Erro ao deletar cliente');
    } finally {
      setDeletingClientId(null);
    }
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  const handleSaveClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (selectedClient) {
      await updateClient(selectedClient.id, clientData);
    } else {
      await createClient(clientData);
    }
    handleCloseModal();
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-6`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold flex items-center gap-2`}>
            <Users className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
            Clientes
          </h1>
          <p className="text-muted-foreground">Gerencie seus clientes</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className={`${isMobile ? 'px-3' : ''}`}
        >
          <Plus className="h-4 w-4 mr-2" />
          {isMobile ? 'Novo' : 'Novo Cliente'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            Todos os seus clientes cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Busca */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isMobile ? (
            /* Cards para Mobile */
            <div className="space-y-3">
              {filteredClients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                </div>
              ) : (
                filteredClients.map((client) => (
                  <MobileClientCard
                    key={client.id}
                    client={client}
                    onEdit={handleEditClient}
                    onDelete={deleteClient}
                    isDeleting={deletingClientId === client.id}
                  />
                ))
              )}
            </div>
          ) : (
            /* Tabela para Desktop */
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email || '-'}</TableCell>
                      <TableCell>{client.phone || '-'}</TableCell>
                      <TableCell>
                        {new Date(client.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClient(client)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteClient(client.id)}
                            disabled={deletingClientId === client.id}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deletingClientId === client.id ? 'Deletando...' : 'Deletar'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ClientEditModal
        company={selectedClient}
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        onCompanyUpdated={fetchClients}
      />
    </div>
  );
};

export default ClientesPage;
