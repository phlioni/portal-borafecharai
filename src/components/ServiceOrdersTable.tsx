
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useServiceOrders, ServiceOrder } from '@/hooks/useServiceOrders';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, Trash2, CheckCircle } from 'lucide-react';

const ServiceOrdersTable = () => {
  const { orders, loading, updateOrder, deleteOrder, completeOrder } = useServiceOrders();

  const getStatusColor = (status: ServiceOrder['status']) => {
    switch (status) {
      case 'agendado': return 'bg-blue-500';
      case 'reagendado': return 'bg-yellow-500';
      case 'finalizado': return 'bg-green-500';
      case 'cancelado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: ServiceOrder['status']) => {
    switch (status) {
      case 'agendado': return 'Agendado';
      case 'reagendado': return 'Reagendado';
      case 'finalizado': return 'Finalizado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const handleComplete = async (orderId: string) => {
    if (confirm('Tem certeza que deseja marcar esta ordem como finalizada?')) {
      await completeOrder(orderId);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
      await deleteOrder(orderId);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Ordens de Serviço</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-center py-8 text-gray-500">
            Nenhuma ordem de serviço encontrada
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Proposta</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    {order.proposals?.clients?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {order.proposals?.title || 'Proposta'}
                  </TableCell>
                  <TableCell>
                    {format(parseISO(order.scheduled_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {order.scheduled_time}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.proposals?.value 
                      ? `R$ ${order.proposals.value.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {order.status !== 'finalizado' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleComplete(order.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(order.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceOrdersTable;
