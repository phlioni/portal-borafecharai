
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useServiceOrders, ServiceOrder } from '@/hooks/useServiceOrders';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { format, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ServiceOrdersCalendar = () => {
  const { orders, loading } = useServiceOrders();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  const getOrdersForDate = (date: Date) => {
    return orders.filter(order => 
      isSameDay(parseISO(order.scheduled_date), date)
    );
  };

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

  if (loading) {
    return <LoadingSpinner />;
  }

  const selectedDateOrders = selectedDate ? getOrdersForDate(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendário de Ordens de Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              className="rounded-md border"
              modifiers={{
                hasOrders: (date) => getOrdersForDate(date).length > 0,
              }}
              modifiersClassNames={{
                hasOrders: "bg-primary/10 font-bold",
              }}
            />
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate 
                ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
                : "Selecione uma data"
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhuma ordem de serviço para esta data
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDateOrders.map((order) => (
                  <div key={order.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">
                        {order.proposals?.title || 'Proposta'}
                      </h4>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Cliente: {order.proposals?.clients?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Horário: {order.scheduled_time}
                    </p>
                    {order.proposals?.value && (
                      <p className="text-sm font-medium">
                        Valor: R$ {order.proposals.value.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceOrdersCalendar;
