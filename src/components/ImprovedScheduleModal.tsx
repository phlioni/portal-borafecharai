
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { Loader2, Clock, MapPin } from 'lucide-react';
import { useServiceOrders, CreateServiceOrderData } from '@/hooks/useServiceOrders';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const scheduleSchema = z.object({
  address: z.string()
    .min(10, 'O endereço deve ter no mínimo 10 caracteres.')
    .nonempty('O endereço é obrigatório.'),
  client_notes: z.string().optional(),
});

type ScheduleForm = z.infer<typeof scheduleSchema>;

interface ImprovedScheduleModalProps {
  proposalId: string;
  clientId: string;
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingOrder?: ServiceOrderFromHook | null;
}

interface ServiceOrderFromHook {
  id: string;
  user_id: string;
  proposal_id: string;
  client_id: string | null;
  scheduled_date: string;
  scheduled_time: string;
  status: 'agendado' | 'reagendado' | 'finalizado' | 'cancelado';
  client_notes: string | null;
  provider_notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface ServiceAvailability {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  clients_per_day: number;
}

interface ServiceOrder {
  scheduled_date: string;
  scheduled_time: string;
}

const DAYS_OF_WEEK = [
  'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 
  'quinta-feira', 'sexta-feira', 'sábado'
];

export function ImprovedScheduleModal({ proposalId, clientId, userId, open, onOpenChange, existingOrder }: ImprovedScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  
  const { createServiceOrder, updateServiceOrder, isCreating, isUpdating } = useServiceOrders();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
  });

  // Buscar disponibilidade do usuário
  const { data: availability = [] } = useQuery({
    queryKey: ['userAvailability', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_availability')
        .select('*')
        .eq('user_id', userId)
        .eq('is_available', true);
      
      if (error) throw error;
      return data as ServiceAvailability[];
    },
    enabled: !!userId && open,
  });

  // Buscar agendamentos existentes
  const { data: existingOrders = [] } = useQuery({
    queryKey: ['existingOrders', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_orders')
        .select('scheduled_date, scheduled_time')
        .eq('user_id', userId)
        .in('status', ['agendado', 'reagendado']);
      
      if (error) throw error;
      return data as ServiceOrder[];
    },
    enabled: !!userId && open,
  });

  // Gerar horários disponíveis quando a data for selecionada
  useEffect(() => {
    if (!selectedDate || !availability.length) {
      setAvailableTimes([]);
      return;
    }

    const dayOfWeek = selectedDate.getDay();
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // Filtrar disponibilidade para o dia da semana
    const dayAvailability = availability.filter(a => a.day_of_week === dayOfWeek);
    
    if (dayAvailability.length === 0) {
      setAvailableTimes([]);
      return;
    }

    // Gerar horários disponíveis baseado na quantidade de clientes por dia
    const times: string[] = [];
    dayAvailability.forEach(slot => {
      const startHour = parseInt(slot.start_time.split(':')[0]);
      const startMinute = parseInt(slot.start_time.split(':')[1]);
      const endHour = parseInt(slot.end_time.split(':')[0]);
      const endMinute = parseInt(slot.end_time.split(':')[1]);
      
      // Calcular duração total em minutos
      const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
      const clientsPerDay = slot.clients_per_day || 1;
      const slotDurationMinutes = Math.floor(totalMinutes / clientsPerDay);
      
      // Gerar janelas de tempo baseado na quantidade de clientes
      for (let clientSlot = 0; clientSlot < clientsPerDay; clientSlot++) {
        const slotStartMinutes = startHour * 60 + startMinute + (clientSlot * slotDurationMinutes);
        const slotEndMinutes = slotStartMinutes + slotDurationMinutes;
        
        const slotStartHour = Math.floor(slotStartMinutes / 60);
        const slotStartMin = slotStartMinutes % 60;
        const slotEndHour = Math.floor(slotEndMinutes / 60);
        const slotEndMin = slotEndMinutes % 60;
        
        const startTimeStr = `${slotStartHour.toString().padStart(2, '0')}:${slotStartMin.toString().padStart(2, '0')}`;
        const endTimeStr = `${slotEndHour.toString().padStart(2, '0')}:${slotEndMin.toString().padStart(2, '0')}`;
        
        // Verificar se não há agendamento neste horário
        const isBooked = existingOrders.some(order => 
          order.scheduled_date === dateStr && order.scheduled_time === startTimeStr + ':00'
        );
        
        if (!isBooked) {
          times.push(`${startTimeStr}|${endTimeStr}`);
        }
      }
    });

    setAvailableTimes(times);
    setSelectedTime(''); // Reset selected time when date changes
  }, [selectedDate, availability, existingOrders]);

  // Filtrar datas disponíveis (apenas dias que têm disponibilidade configurada)
  const getAvailableDays = () => {
    const availableDaysOfWeek = [...new Set(availability.map(a => a.day_of_week))];
    return availableDaysOfWeek;
  };

  const isDateDisabled = (date: Date) => {
    // Não permitir datas passadas
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
    
    // Não permitir datas que não têm disponibilidade
    const dayOfWeek = date.getDay();
    return !getAvailableDays().includes(dayOfWeek);
  };

  // Carregar dados existentes quando modal abrir
  useEffect(() => {
    if (existingOrder && open) {
      const orderDate = new Date(existingOrder.scheduled_date + 'T00:00:00');
      setSelectedDate(orderDate);
      
      // Extrair apenas a parte do horário (HH:mm) do time completo
      const timeOnly = existingOrder.scheduled_time.substring(0, 5);
      setSelectedTime(timeOnly);
      
      // Preencher o formulário
      reset({
        client_notes: existingOrder.client_notes || '',
      });
    } else if (!existingOrder && open) {
      // Resetar quando não há order existente
      reset();
      setSelectedDate(undefined);
      setSelectedTime('');
    }
  }, [existingOrder, open, reset]);

  const handleCreateServiceOrder = async (data: ScheduleForm) => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma data e horário.",
        variant: "destructive",
      });
      return;
    }

    // Extrair apenas o horário de início se for uma janela de tempo
    const actualTime = selectedTime.includes('|') ? selectedTime.split('|')[0] : selectedTime;
    
    if (existingOrder) {
      // Atualizar agendamento existente
      updateServiceOrder({
        id: existingOrder.id,
        scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
        scheduled_time: actualTime + ':00',
        client_notes: data.client_notes,
      }, {
        onSuccess: () => {
          reset();
          setSelectedDate(undefined);
          setSelectedTime('');
          onOpenChange(false);
          toast({
            title: "Sucesso",
            description: "Agendamento atualizado com sucesso!",
          });
        },
      });
    } else {
      // Criar novo agendamento
      const serviceOrderData: CreateServiceOrderData & { user_id: string } = {
        proposal_id: proposalId,
        client_id: clientId,
        user_id: userId,
        scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
        scheduled_time: actualTime + ':00',
        client_notes: data.client_notes,
      };

      createServiceOrder(serviceOrderData, {
        onSuccess: () => {
          reset();
          setSelectedDate(undefined);
          setSelectedTime('');
          onOpenChange(false);
        },
      });
    }
  };

  const getDayName = (dayOfWeek: number) => {
    return DAYS_OF_WEEK[dayOfWeek];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existingOrder ? 'Editar Agendamento' : 'Agendar Atendimento'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleCreateServiceOrder)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Calendário */}
            <div className="flex flex-col items-center space-y-4">
              <Label className="self-start">Escolha a data</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className={cn("rounded-md border pointer-events-auto")}
                disabled={isDateDisabled}
                locale={ptBR}
              />
              
              {availability.length > 0 && (
                <div className="text-xs text-muted-foreground text-center">
                  <p>Dias disponíveis:</p>
                  <p>{getAvailableDays().map(day => getDayName(day)).join(', ')}</p>
                </div>
              )}
            </div>

            {/* Horários e outros campos */}
            <div className="space-y-4">
              {/* Horários disponíveis */}
              <div>
                <Label>Horários disponíveis</Label>
                {selectedDate ? (
                  availableTimes.length > 0 ? (
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um horário" />
                      </SelectTrigger>
                       <SelectContent>
                         {availableTimes.map((time) => {
                           const [startTime, endTime] = time.split('|');
                           const displayTime = endTime ? `${startTime} até ${endTime}` : startTime;
                           return (
                             <SelectItem key={time} value={startTime}>
                               <div className="flex items-center gap-2">
                                 <Clock className="h-4 w-4" />
                                 {displayTime}
                               </div>
                             </SelectItem>
                           );
                         })}
                       </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/50">
                      Nenhum horário disponível para esta data.
                    </div>
                  )
                ) : (
                  <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/50">
                    Primeiro selecione uma data.
                  </div>
                )}
              </div>

              {/* Endereço */}
              <div>
                <Label htmlFor="address" className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4" />
                  Endereço completo do atendimento
                </Label>
                <Input 
                  id="address" 
                  placeholder="Ex: Rua das Flores, 123, Bairro, Cidade - SP" 
                  {...register('address')} 
                />
                {errors.address && (
                  <p className="text-destructive text-sm mt-1">{errors.address.message}</p>
                )}
              </div>

              {/* Observações */}
              <div>
                <Label htmlFor="client_notes">Observações (opcional)</Label>
                <Textarea
                  id="client_notes"
                  placeholder="Informações adicionais sobre o atendimento..."
                  className="min-h-[80px]"
                  {...register('client_notes')}
                />
              </div>
            </div>
          </div>

          {/* Aviso sobre falta de disponibilidade */}
          {availability.length === 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
              <p className="font-medium">Horários não configurados</p>
              <p>O prestador de serviços ainda não configurou seus horários de atendimento.</p>
            </div>
          )}

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isCreating || isUpdating}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating || isUpdating || !selectedDate || !selectedTime || (!existingOrder && availableTimes.length === 0)}
            >
              {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {existingOrder ? 'Atualizar Agendamento' : 'Confirmar Agendamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
