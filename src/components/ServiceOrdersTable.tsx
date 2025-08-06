import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ServiceOrder } from "@/hooks/useServiceOrders";

interface ServiceOrdersTableProps {
  orders: ServiceOrder[];
  onStatusChange: (id: string, status: ServiceOrder['status']) => void;
  isUpdating: boolean;
  onRowClick?: (order: ServiceOrder) => void;
}

export function ServiceOrdersTable({ orders, onStatusChange, isUpdating, onRowClick }: ServiceOrdersTableProps) {
  const getStatusVariant = (status: ServiceOrder['status']) => {
    switch (status) {
      case 'agendado': return 'outline';
      case 'reagendado': return 'default';
      case 'finalizado': return 'secondary';
      case 'cancelado': return 'destructive';
      default: return 'outline';
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

  const formatDate = (date: string) => {
    return format(new Date(date + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR });
  };

  const formatTime = (time: string) => {
    return format(new Date(`2000-01-01T${time}`), "HH:mm");
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum agendamento encontrado.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Horário</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow 
              key={order.id} 
              className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
              onClick={() => onRowClick?.(order)}
            >
              <TableCell className="font-medium">
                {order.id.slice(0, 8)}...
              </TableCell>
              <TableCell>{formatDate(order.scheduled_date)}</TableCell>
              <TableCell>{formatTime(order.scheduled_time)}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(order.status)}>
                  {getStatusLabel(order.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {order.status === 'agendado' && (
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(order.id, 'reagendado');
                        }}
                        disabled={isUpdating}
                      >
                        Aceitar
                      </DropdownMenuItem>
                    )}
                    {order.status === 'reagendado' && (
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(order.id, 'finalizado');
                        }}
                        disabled={isUpdating}
                      >
                        Concluir
                      </DropdownMenuItem>
                    )}
                    {order.status !== 'cancelado' && order.status !== 'finalizado' && (
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(order.id, 'cancelado');
                        }}
                        disabled={isUpdating}
                      >
                        Cancelar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}