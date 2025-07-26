
import React, { useState } from 'react';
import { Calendar, CalendarProps } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Clock, User, FileText, CheckCircle2, AlertCircle, Calendar as CalendarLucide } from 'lucide-react';
import { useServiceOrders, useUpdateServiceOrder } from '@/hooks/useServiceOrders';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import type { ServiceOrder } from '@/hooks/useServiceOrders';

const statusColors = {
  agendado: 'bg-blue-100 text-blue-800',
  confirmado: 'bg-green-100 text-green-800',
  reagendamento_solicitado: 'bg-yellow-100 text-yellow-800',
  concluido: 'bg-gray-100 text-gray-800',
  cancelado: 'bg-red-100 text-red-800'
};

const statusLabels = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  reagendamento_solicitado: 'Reagendamento Solicitado',
  concluido: 'Concluído',
  cancelado: 'Cancelado'
};

const OrdensServicoPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [providerNotes, setProviderNotes] = useState('');

  const { data: orders, isLoading } = useServiceOrders();
  const updateOrder = useUpdateServiceOrder();

  const getOrdersForDate = (date: Date) => {
    return orders?.filter(order => 
      isSameDay(new Date(order.scheduled_date), date)
    ) || [];
  };

  const handleOrderClick = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setProviderNotes(order.provider_notes || '');
    setShowDetailsModal(true);
  };

  const handleConfirmOrder = async () => {
    if (!selectedOrder) return;

    try {
      await updateOrder.mutateAsync({
        id: selectedOrder.id,
        updates: {
          status: 'confirmado',
          provider_notes: providerNotes || undefined
        }
      });
      toast.success('Ordem de serviço confirmada!');
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Erro ao confirmar ordem:', error);
    }
  };

  const handleRequestReschedule = async () => {
    if (!selectedOrder) return;

    try {
      await updateOrder.mutateAsync({
        id: selectedOrder.id,
        updates: {
          status: 'reagendamento_solicitado',
          provider_notes: providerNotes || undefined
        }
      });
      toast.success('Solicitação de reagendamento enviada!');
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Erro ao solicitar reagendamento:', error);
    }
  };

  const handleCompleteOrder = async () => {
    if (!selectedOrder) return;

    try {
      await updateOrder.mutateAsync({
        id: selectedOrder.id,
        updates: {
          status: 'concluido',
          completed_at: new Date().toISOString(),
          provider_notes: providerNotes || undefined
        }
      });
      toast.success('Ordem de serviço concluída!');
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Erro ao concluir ordem:', error);
    }
  };

  const selectedDateOrders = getOrdersForDate(selectedDate);

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ordens de Serviço</h1>
        <p className="text-gray-600 mt-1">Gerencie seus agendamentos e compromissos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
              className="rounded-md border w-full"
              modifiers={{
                hasOrders: (date) => getOrdersForDate(date).length > 0
              }}
              modifiersStyles={{
                hasOrders: {
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  fontWeight: 'bold'
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Lista de ordens para a data selecionada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedDateOrders.length > 0 ? (
                selectedDateOrders.map(order => (
                  <div
                    key={order.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleOrderClick(order)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {order.proposals?.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.proposals?.clients?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.scheduled_time}
                        </p>
                      </div>
                      <Badge 
                        className={`text-xs ${statusColors[order.status]}`}
                        variant="secondary"
                      >
                        {statusLabels[order.status]}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma ordem de serviço para esta data
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Detalhes da Ordem */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Ordem de Serviço</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Cliente</Label>
                  <p className="mt-1">{selectedOrder.proposals?.clients?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Serviço</Label>
                  <p className="mt-1">{selectedOrder.proposals?.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Data</Label>
                  <p className="mt-1">
                    {format(new Date(selectedOrder.scheduled_date), "dd/MM/yyyy")}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Horário</Label>
                  <p className="mt-1">{selectedOrder.scheduled_time}</p>
                </div>
              </div>

              <div>
                <Badge 
                  className={`${statusColors[selectedOrder.status]}`}
                  variant="secondary"
                >
                  {statusLabels[selectedOrder.status]}
                </Badge>
              </div>

              {selectedOrder.client_notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Observações do Cliente</Label>
                  <p className="mt-1 p-3 bg-muted rounded-md">{selectedOrder.client_notes}</p>
                </div>
              )}

              <div>
                <Label htmlFor="provider_notes">Suas Observações</Label>
                <Textarea
                  id="provider_notes"
                  value={providerNotes}
                  onChange={(e) => setProviderNotes(e.target.value)}
                  placeholder="Adicione observações sobre o serviço..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                {selectedOrder.status === 'agendado' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleRequestReschedule}
                      disabled={updateOrder.isPending}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Solicitar Reagendamento
                    </Button>
                    <Button
                      onClick={handleConfirmOrder}
                      disabled={updateOrder.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Confirmar
                    </Button>
                  </>
                )}
                
                {selectedOrder.status === 'confirmado' && (
                  <Button
                    onClick={handleCompleteOrder}
                    disabled={updateOrder.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marcar como Concluído
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdensServicoPage;
