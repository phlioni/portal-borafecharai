
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ServiceOrder } from '@/hooks/useServiceOrders';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ServiceOrdersCalendarProps {
  orders: ServiceOrder[];
  onSelectOrder: (order: ServiceOrder) => void;
}

export const ServiceOrdersCalendar: React.FC<ServiceOrdersCalendarProps> = ({
  orders,
  onSelectOrder,
}) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  const getOrdersForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return orders.filter(order => order.scheduled_date === dateStr);
  };

  const selectedDateOrders = selectedDate ? getOrdersForDate(selectedDate) : [];

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendário</CardTitle>
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
            modifiersStyles={{
              hasOrders: { backgroundColor: 'hsl(var(--primary))' },
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Agendamentos para {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione uma data'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {selectedDateOrders.length === 0 ? (
              <p className="text-muted-foreground">Nenhum agendamento para esta data.</p>
            ) : (
              selectedDateOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectOrder(order)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{order.proposals?.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {order.proposals?.clients?.name} - {order.scheduled_time}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
