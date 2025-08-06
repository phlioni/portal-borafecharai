import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { WorkOrder } from "@/hooks/useWorkOrders";
import { ServiceOrder } from "@/hooks/useServiceOrders";
import { MapPin, Calendar, Clock, User, FileText, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface WorkOrderModalProps {
  order: WorkOrder | ServiceOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, status: any) => void;
  isUpdating: boolean;
  type: 'work_order' | 'service_order';
}

export function WorkOrderModal({ 
  order, 
  open, 
  onOpenChange, 
  onStatusChange, 
  isUpdating,
  type 
}: WorkOrderModalProps) {
  if (!order) return null;

  // Buscar dados da proposta e cliente
  const { data: proposal } = useQuery({
    queryKey: ['proposal', order.proposal_id],
    queryFn: async () => {
      if (!order.proposal_id) return null;
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', order.proposal_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!order.proposal_id
  });

  const { data: client } = useQuery({
    queryKey: ['client', order.client_id],
    queryFn: async () => {
      if (!order.client_id) return null;
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', order.client_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!order.client_id
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
      case 'confirmado': return 'default';
      case 'completed':
      case 'concluido': return 'secondary';
      case 'pending_approval':
      case 'agendado': return 'secondary';
      case 'canceled':
      case 'cancelado': return 'destructive';
      case 'rescheduled':
      case 'em_andamento': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'Pendente';
      case 'approved': return 'Aprovado';
      case 'completed': return 'Concluído';
      case 'canceled': return 'Cancelado';
      case 'rescheduled': return 'Reagendado';
      case 'agendado': return 'Agendado';
      case 'confirmado': return 'Confirmado';
      case 'em_andamento': return 'Em Andamento';
      case 'concluido': return 'Concluído';
      default: return status;
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatDateTime = (datetime: string) => {
    return format(new Date(datetime), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatTime = (time: string) => {
    return format(new Date(`2000-01-01T${time}`), "HH:mm");
  };

  const isWorkOrder = type === 'work_order';
  const scheduledDate = isWorkOrder 
    ? (order as WorkOrder).scheduled_at 
    : (order as ServiceOrder).scheduled_date;
  const scheduledTime = isWorkOrder 
    ? format(new Date((order as WorkOrder).scheduled_at), "HH:mm")
    : (order as ServiceOrder).scheduled_time;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isWorkOrder ? 'Ordem de Serviço' : 'Agendamento'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant={getStatusVariant(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>

          <Separator />

          {/* Informações do Cliente */}
          {client && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Dados do Cliente</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm">Nome</p>
                  <p className="text-sm text-muted-foreground">{client.name}</p>
                </div>
                {client.email && (
                  <div>
                    <p className="font-medium text-sm">E-mail</p>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  </div>
                )}
                {client.phone && (
                  <div>
                    <p className="font-medium text-sm">Telefone</p>
                    <p className="text-sm text-muted-foreground">{client.phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Endereço</p>
                <p className="text-sm text-muted-foreground">
                  {isWorkOrder ? (order as WorkOrder).address : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Data Agendada</p>
                <p className="text-sm text-muted-foreground">
                  {isWorkOrder 
                    ? formatDateTime((order as WorkOrder).scheduled_at)
                    : formatDate((order as ServiceOrder).scheduled_date)
                  }
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Janela de Horário</p>
                <p className="text-sm text-muted-foreground">
                  {isWorkOrder 
                    ? scheduledTime
                    : `${(order as ServiceOrder).scheduled_time} - Agendamento realizado`
                  }
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Data do Pedido</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(order.created_at)}
                </p>
              </div>
            </div>

            {!isWorkOrder && (order as ServiceOrder).client_notes && (
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Observações do Cliente</p>
                  <p className="text-sm text-muted-foreground">
                    {(order as ServiceOrder).client_notes}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Resumo da Proposta */}
          {proposal && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Resumo da Proposta</h3>
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{proposal.title}</p>
                    {proposal.service_description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {proposal.service_description.length > 100 
                          ? `${proposal.service_description.substring(0, 100)}...`
                          : proposal.service_description
                        }
                      </p>
                    )}
                    {proposal.value && (
                      <p className="text-sm font-medium text-primary mt-2">
                        Valor: R$ {proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                </div>
                {proposal.public_hash && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/proposta/${proposal.public_hash}`, '_blank')}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Proposta Completa
                  </Button>
                )}
              </div>
            </>
          )}

          <Separator />

          <div className="flex flex-col gap-2">
            {/* Botões para Work Orders */}
            {isWorkOrder && (
              <>
                {order.status === 'pending_approval' && (
                  <Button 
                    onClick={() => onStatusChange(order.id, 'approved')}
                    disabled={isUpdating}
                    className="w-full"
                  >
                    Aprovar Agendamento
                  </Button>
                )}
                {(order.status === 'approved' || order.status === 'rescheduled') && (
                  <Button 
                    onClick={() => onStatusChange(order.id, 'completed')}
                    disabled={isUpdating}
                    className="w-full"
                  >
                    Marcar como Concluída
                  </Button>
                )}
                {order.status !== 'canceled' && order.status !== 'completed' && (
                  <Button 
                    variant="destructive"
                    onClick={() => onStatusChange(order.id, 'canceled')}
                    disabled={isUpdating}
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                )}
              </>
            )}

            {/* Botões para Service Orders */}
            {!isWorkOrder && (
              <>
                {order.status === 'agendado' && (
                  <Button 
                    onClick={() => onStatusChange(order.id, 'confirmado')}
                    disabled={isUpdating}
                    className="w-full"
                  >
                    Aceitar Agendamento
                  </Button>
                )}
                {(order.status === 'confirmado' || order.status === 'em_andamento') && (
                  <Button 
                    onClick={() => onStatusChange(order.id, 'concluido')}
                    disabled={isUpdating}
                    className="w-full"
                  >
                    Marcar como Concluído
                  </Button>
                )}
                {order.status !== 'cancelado' && order.status !== 'concluido' && (
                  <Button 
                    variant="destructive"
                    onClick={() => onStatusChange(order.id, 'cancelado')}
                    disabled={isUpdating}
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}