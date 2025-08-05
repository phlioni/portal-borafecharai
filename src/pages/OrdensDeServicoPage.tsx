
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, List, Loader2, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkOrders } from "@/hooks/useWorkOrders";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { WorkOrdersTable } from "@/components/WorkOrdersTable";
import { ScheduleModal } from "@/components/ScheduleModal";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function OrdensDeServicoPage() {
  const { workOrders, isLoading, error, updateWorkOrderStatus, isUpdating } = useWorkOrders();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  if (isLoading) {
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

  const calendarEvents = workOrders.map(order => ({
    title: `${order.address.substring(0, 25)}...`,
    start: order.scheduled_at,
    id: order.id,
    backgroundColor: order.status === 'approved' ? '#3b82f6' : 
                     order.status === 'completed' ? '#10b981' :
                     order.status === 'canceled' ? '#ef4444' : '#6b7280',
    borderColor: order.status === 'approved' ? '#3b82f6' : 
                 order.status === 'completed' ? '#10b981' :
                 order.status === 'canceled' ? '#ef4444' : '#6b7280',
    extendedProps: order,
  }));

  const handleEventClick = (info: any) => {
    const order = info.event.extendedProps;
    toast({
      title: `Ordem de Serviço`,
      description: `Endereço: ${order.address}\nStatus: ${order.status}`,
    });
  };

  const handleStatusChange = (id: string, status: 'pending_approval' | 'approved' | 'rescheduled' | 'completed' | 'canceled') => {
    updateWorkOrderStatus({ id, status });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
        <Button onClick={() => setIsScheduleModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Ordem
        </Button>
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
          <WorkOrdersTable 
            orders={workOrders} 
            onStatusChange={handleStatusChange}
            isUpdating={isUpdating}
          />
        </TabsContent>
      </Tabs>

      <ScheduleModal
        clientId="temp-client-id" // This should be dynamic based on your needs
        open={isScheduleModalOpen}
        onOpenChange={setIsScheduleModalOpen}
      />
    </div>
  );
}
