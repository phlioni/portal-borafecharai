
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { WorkOrder } from "@/hooks/useWorkOrders";

interface WorkOrdersTableProps {
  orders: WorkOrder[];
  onStatusChange: (id: string, status: WorkOrder['status']) => void;
  isUpdating: boolean;
}

export function WorkOrdersTable({ orders, onStatusChange, isUpdating }: WorkOrdersTableProps) {
  const getStatusVariant = (status: WorkOrder['status']) => {
    switch (status) {
      case 'approved': return 'default';
      case 'completed': return 'secondary';
      case 'pending_approval': return 'secondary';
      case 'canceled': return 'destructive';
      case 'rescheduled': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: WorkOrder['status']) => {
    switch (status) {
      case 'pending_approval': return 'Pendente';
      case 'approved': return 'Aprovado';
      case 'completed': return 'Concluído';
      case 'canceled': return 'Cancelado';
      case 'rescheduled': return 'Reagendado';
      default: return status;
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead>Data Agendada</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-xs">
                {order.id.slice(0, 8)}...
              </TableCell>
              <TableCell className="max-w-xs truncate">{order.address}</TableCell>
              <TableCell>
                {format(new Date(order.scheduled_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(order.status)}>
                  {getStatusLabel(order.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdating}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {order.status === 'pending_approval' && (
                      <DropdownMenuItem onClick={() => onStatusChange(order.id, 'approved')}>
                        Aprovar Agendamento
                      </DropdownMenuItem>
                    )}
                    {(order.status === 'approved' || order.status === 'rescheduled') && (
                      <DropdownMenuItem onClick={() => onStatusChange(order.id, 'completed')}>
                        Marcar como Concluída
                      </DropdownMenuItem>
                    )}
                    {order.status !== 'canceled' && order.status !== 'completed' && (
                      <DropdownMenuItem 
                        className="text-destructive" 
                        onClick={() => onStatusChange(order.id, 'canceled')}
                      >
                        Cancelar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                Nenhuma ordem de serviço encontrada
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
