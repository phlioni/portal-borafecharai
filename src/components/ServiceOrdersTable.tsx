
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, CheckCircle } from 'lucide-react';
import { ServiceOrder } from '@/hooks/useServiceOrders';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ServiceOrdersTableProps {
  orders: ServiceOrder[];
  onEditOrder: (order: ServiceOrder) => void;
  onDeleteOrder: (orderId: string) => void;
  onCompleteOrder: (orderId: string) => void;
}

export const ServiceOrdersTable: React.FC<ServiceOrdersTableProps> = ({
  orders,
  onEditOrder,
  onDeleteOrder,
  onCompleteOrder,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'bg-blue-100 text-blue-800';
      case 'reagendado':
        return 'bg-yellow-100 text-yellow-800';
      case 'finalizado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'Agendado';
      case 'reagendado':
        return 'Reagendado';
      case 'finalizado':
        return 'Finalizado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const canComplete = (order: ServiceOrder) => {
    const scheduledDateTime = new Date(`${order.scheduled_date}T${order.scheduled_time}`);
    const now = new Date();
    return scheduledDateTime <= now && order.status !== 'finalizado' && order.status !== 'cancelado';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Serviço</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Horário</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead className="w-[70px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                Nenhuma ordem de serviço encontrada.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.proposals?.clients?.name || 'Cliente não informado'}
                </TableCell>
                <TableCell>{order.proposals?.title}</TableCell>
                <TableCell>
                  {format(new Date(order.scheduled_date), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>{order.scheduled_time}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {order.proposals?.value ? 
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(Number(order.proposals.value)) : 
                    'N/A'
                  }
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditOrder(order)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      {canComplete(order) && (
                        <DropdownMenuItem onClick={() => onCompleteOrder(order.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Finalizar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => onDeleteOrder(order.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
