
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, List, Loader2, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkOrders } from "@/hooks/useWorkOrders";
import { useServiceOrders } from "@/hooks/useServiceOrders";
import { useClients } from "@/hooks/useClients";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { WorkOrdersTable } from "@/components/WorkOrdersTable";
import { WorkOrderModal } from "@/components/WorkOrderModal";
import { ScheduleModal } from "@/components/ScheduleModal";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function OrdensDeServicoPage() {
  const { workOrders, isLoading, error, updateWorkOrderStatus, isUpdating } = useWorkOrders();
  const { serviceOrders, updateServiceOrder, isUpdating: isServiceUpdating } = useServiceOrders();
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderType, setOrderType] = useState<'work_order' | 'service_order'>('work_order');

  if (isLoading || clientsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive text-center p-8">
        <p>Erro ao carregar ordens de serviço:</p>
        <p className="text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  // Combinar work_orders e service_orders no calendário
  const workOrderEvents = workOrders.map(order => ({
    title: `${order.address.substring(0, 25)}...`,
    start: order.scheduled_at,
    id: `work_${order.id}`,
    backgroundColor: order.status === 'approved' ? '#3b82f6' : 
                     order.status === 'completed' ? '#10b981' :
                     order.status === 'canceled' ? '#ef4444' : '#6b7280',
    borderColor: order.status === 'approved' ? '#3b82f6' : 
                 order.status === 'completed' ? '#10b981' :
                 order.status === 'canceled' ? '#ef4444' : '#6b7280',
    extendedProps: { ...order, type: 'work_order' },
  }));

  const serviceOrderEvents = serviceOrders.map(order => ({
    title: `Agendamento ${order.scheduled_time}`,
    start: `${order.scheduled_date}T${order.scheduled_time}`,
    id: `service_${order.id}`,
    backgroundColor: order.status === 'confirmado' ? '#3b82f6' : 
                     order.status === 'concluido' ? '#10b981' :
                     order.status === 'cancelado' ? '#ef4444' : '#f59e0b',
    borderColor: order.status === 'confirmado' ? '#3b82f6' : 
                 order.status === 'concluido' ? '#10b981' :
                 order.status === 'cancelado' ? '#ef4444' : '#f59e0b',
    extendedProps: { ...order, type: 'service_order' },
  }));

  const calendarEvents = [...workOrderEvents, ...serviceOrderEvents];

  const handleEventClick = (info: any) => {
    const order = info.event.extendedProps;
    setSelectedOrder(order);
    setOrderType(order.type);
    setIsOrderModalOpen(true);
  };

  const handleStatusChange = (id: string, status: 'pending_approval' | 'approved' | 'rescheduled' | 'completed' | 'canceled') => {
    updateWorkOrderStatus({ id, status });
  };

  const handleServiceOrderStatusChange = (id: string, status: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado') => {
    updateServiceOrder({ id, status });
    
    // Enviar email se status for 'confirmado'
    if (status === 'confirmado') {
      // Implementar chamada para edge function de envio de email
      console.log('Enviando email de confirmação para o cliente');
    }
  };

  const handleModalStatusChange = (id: string, status: any) => {
    if (orderType === 'work_order') {
      handleStatusChange(id, status);
    } else {
      handleServiceOrderStatusChange(id, status);
    }
    setIsOrderModalOpen(false);
  };

  const handleNewOrderClick = () => {
    if (!selectedClientId) {
      toast({
        title: "Atenção",
        description: "Por favor, selecione um cliente antes de criar uma ordem de serviço.",
        variant: "destructive",
      });
      return;
    }
    setIsScheduleModalOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-2">
            <Label>Selecionar Cliente</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleNewOrderClick}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Ordem
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="table">
            <List className="mr-2 h-4 w-4" />
            Listagem
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="p-4 border rounded-lg bg-card">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              locale="pt-br"
              buttonText={{ 
                today: "Hoje",
                month: "Mês",
                week: "Semana",
                day: "Dia"
              }}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
              }}
              eventClick={handleEventClick}
              height="auto"
              dayMaxEvents={3}
              moreLinkClick="popover"
            />
          </div>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Ordens de Serviço</h3>
              <WorkOrdersTable 
                orders={workOrders} 
                onStatusChange={handleStatusChange}
                isUpdating={isUpdating}
                onRowClick={(order) => {
                  setSelectedOrder(order);
                  setOrderType('work_order');
                  setIsOrderModalOpen(true);
                }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {selectedClientId && (
        <ScheduleModal
          clientId={selectedClientId}
          open={isScheduleModalOpen}
          onOpenChange={setIsScheduleModalOpen}
        />
      )}

      <WorkOrderModal
        order={selectedOrder}
        open={isOrderModalOpen}
        onOpenChange={setIsOrderModalOpen}
        onStatusChange={handleModalStatusChange}
        isUpdating={isUpdating || isServiceUpdating}
        type={orderType}
      />
    </div>
  );
}
