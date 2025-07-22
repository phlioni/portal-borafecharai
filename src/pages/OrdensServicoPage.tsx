
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Table } from 'lucide-react';
import { ServiceOrdersCalendar } from '@/components/ServiceOrdersCalendar';
import { ServiceOrdersTable } from '@/components/ServiceOrdersTable';
import { EditServiceOrderModal } from '@/components/EditServiceOrderModal';
import { useServiceOrders, ServiceOrder } from '@/hooks/useServiceOrders';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const OrdensServicoPage = () => {
  const { orders, loading, updateOrder, deleteOrder, completeOrder } = useServiceOrders();
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [completeOrderId, setCompleteOrderId] = useState<string | null>(null);

  const handleEditOrder = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleSaveOrder = async (orderId: string, updates: Partial<ServiceOrder>) => {
    await updateOrder(orderId, updates);
  };

  const handleDeleteOrder = async () => {
    if (deleteOrderId) {
      await deleteOrder(deleteOrderId);
      setDeleteOrderId(null);
    }
  };

  const handleCompleteOrder = async () => {
    if (completeOrderId) {
      await completeOrder(completeOrderId);
      setCompleteOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
        <p className="text-muted-foreground">
          Gerencie seus agendamentos e ordens de serviço
        </p>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Tabela
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <ServiceOrdersCalendar
            orders={orders}
            onSelectOrder={handleEditOrder}
          />
        </TabsContent>

        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Ordens de Serviço</CardTitle>
              <CardDescription>
                Visualize e gerencie todas as suas ordens de serviço
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ServiceOrdersTable
                orders={orders}
                onEditOrder={handleEditOrder}
                onDeleteOrder={setDeleteOrderId}
                onCompleteOrder={setCompleteOrderId}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditServiceOrderModal
        order={selectedOrder}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedOrder(null);
        }}
        onSave={handleSaveOrder}
      />

      <AlertDialog open={!!deleteOrderId} onOpenChange={() => setDeleteOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!completeOrderId} onOpenChange={() => setCompleteOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar Ordem de Serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja finalizar esta ordem de serviço? O cliente será notificado sobre a conclusão.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteOrder}>
              Finalizar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrdensServicoPage;
