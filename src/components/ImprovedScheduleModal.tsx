import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { Loader2, Clock, MapPin } from 'lucide-react';
import { useServiceOrders } from '@/hooks/useServiceOrders';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMediaQuery } from '@/hooks/use-media-query';

const scheduleSchema = z.object({
  address: z
    .string()
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
  address?: string | null;
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
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
];

export function ImprovedScheduleModal({
  proposalId,
  clientId,
  userId,
  open,
  onOpenChange,
  existingOrder,
}: ImprovedScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const { createServiceOrder, updateServiceOrder, isCreating, isUpdating } =
    useServiceOrders();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
  });

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

  const { data: existingOrders = [] } = useQuery({
    queryKey: ['existingOrders', userId, selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];
      const { data, error } = await supabase
        .from('service_orders')
        .select('scheduled_date, scheduled_time')
        .eq('user_id', userId)
        .eq('scheduled_date', format(selectedDate, 'yyyy-MM-dd'))
        .in('status', ['agendado', 'reagendado']);
      if (error) throw error;
      return data as ServiceOrder[];
    },
    enabled: !!userId && open && !!selectedDate,
  });

  useEffect(() => {
    if (!selectedDate || !availability.length) {
      setAvailableTimes([]);
      return;
    }
    const dayOfWeek = selectedDate.getDay();
    const dayAvailability = availability.filter(a => a.day_of_week === dayOfWeek);
    if (dayAvailability.length === 0) {
      setAvailableTimes([]);
      return;
    }
    const times: string[] = [];
    dayAvailability.forEach(slot => {
      const startHour = parseInt(slot.start_time.split(':')[0]);
      const startMinute = parseInt(slot.start_time.split(':')[1]);
      const endHour = parseInt(slot.end_time.split(':')[0]);
      const endMinute = parseInt(slot.end_time.split(':')[1]);
      const clientsPerDay = slot.clients_per_day || 1;
      const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
      const slotDurationMinutes = Math.floor(totalMinutes / clientsPerDay);

      for (let i = 0; i < clientsPerDay; i++) {
        const slotStartTotalMinutes = startHour * 60 + startMinute + i * slotDurationMinutes;
        const slotStartHour = Math.floor(slotStartTotalMinutes / 60);
        const slotStartMin = slotStartTotalMinutes % 60;
        const startTimeStr = `${slotStartHour.toString().padStart(2, '0')}:${slotStartMin.toString().padStart(2, '0')}`;
        const isBooked = existingOrders.some(order => order.scheduled_time.startsWith(startTimeStr));
        if (!isBooked) {
          times.push(startTimeStr);
        }
      }
    });
    setAvailableTimes(times.sort());
    setSelectedTime('');
  }, [selectedDate, availability, existingOrders]);

  const getAvailableDays = () => [...new Set(availability.map(a => a.day_of_week))];
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    return !getAvailableDays().includes(date.getDay());
  };

  useEffect(() => {
    if (open) {
      if (existingOrder) {
        const orderDate = new Date(existingOrder.scheduled_date + 'T00:00:00Z');
        setSelectedDate(orderDate);
        setSelectedTime(existingOrder.scheduled_time.substring(0, 5));
        setValue('address', existingOrder.address || '');
        setValue('client_notes', existingOrder.client_notes || '');
      } else {
        reset();
        setSelectedDate(undefined);
        setSelectedTime('');
        setValue('address', '');
        setValue('client_notes', '');
      }
    }
  }, [existingOrder, open, reset, setValue]);

  const handleServiceOrderSubmit = async (data: ScheduleForm) => {
    if (!selectedDate || !selectedTime) {
      toast({ title: 'Erro', description: 'Por favor, selecione uma data e horário.', variant: 'destructive' });
      return;
    }
    const orderData = {
      scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
      scheduled_time: `${selectedTime}:00`,
      address: data.address,
      client_notes: data.client_notes,
      status: existingOrder ? 'reagendado' : 'agendado',
    };
    const options = {
      onSuccess: () => {
        toast({ title: 'Sucesso!', description: `Agendamento ${existingOrder ? 'atualizado' : 'confirmado'}.` });
        onOpenChange(false);
        // Adicione refetch das queries se necessário, para atualizar a UI em outras partes da aplicação
      },
      onError: (error: any) => {
        toast({ title: 'Erro', description: error.message || 'Não foi possível salvar o agendamento.', variant: 'destructive' });
      },
    };
    if (existingOrder) {
      updateServiceOrder({ id: existingOrder.id, ...orderData }, options);
    } else {
      createServiceOrder({ ...orderData, proposal_id: proposalId, client_id: clientId, user_id: userId }, options);
    }
  };

  const FormContent = (
    <form id="schedule-form" onSubmit={handleSubmit(handleServiceOrderSubmit)} className="space-y-4 md:space-y-6 px-4 md:px-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="flex flex-col items-center space-y-2">
          <Label className="self-start font-semibold">1. Escolha a data</Label>
          <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border w-full" disabled={isDateDisabled} locale={ptBR} />
        </div>
        <div className="space-y-4">
          <div>
            <Label className="font-semibold">2. Horários disponíveis</Label>
            {!selectedDate ? (
              <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/50 mt-2">Selecione uma data para ver os horários.</div>
            ) : availableTimes.length > 0 ? (
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Selecione um horário" /></SelectTrigger>
                <SelectContent>
                  {availableTimes.map(time => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{time}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/50 mt-2">Nenhum horário disponível para esta data.</div>
            )}
          </div>
          <div>
            <Label htmlFor="address" className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4" />3. Endereço do atendimento</Label>
            <Input id="address" placeholder="Rua, número, bairro, cidade..." {...register('address')} className="mt-2" />
            {errors.address && <p className="text-destructive text-sm mt-1">{errors.address.message}</p>}
          </div>
          <div>
            <Label htmlFor="client_notes" className='font-semibold'>Observações (opcional)</Label>
            <Textarea id="client_notes" placeholder="Ponto de referência, informações adicionais..." className="min-h-[80px] mt-2" {...register('client_notes')} />
          </div>
        </div>
      </div>
      {availability.length === 0 && open && (
        <div className="p-4 bg-yellow-50 border-yellow-200 rounded-lg text-yellow-800 text-sm">
          <p className="font-medium">O prestador de serviços ainda não configurou seus horários de atendimento.</p>
        </div>
      )}
    </form>
  );

  const isSubmitting = isCreating || isUpdating;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-w-[95vw]">
          <DialogHeader><DialogTitle>{existingOrder ? 'Editar Agendamento' : 'Agendar Atendimento'}</DialogTitle></DialogHeader>
          {FormContent}
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" form="schedule-form" disabled={isSubmitting || !selectedDate || !selectedTime}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {existingOrder ? 'Atualizar Agendamento' : 'Confirmar Agendamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{existingOrder ? 'Editar Agendamento' : 'Agendar Atendimento'}</DrawerTitle>
          <DrawerDescription>Preencha as informações abaixo para agendar o serviço.</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto max-h-[70vh]">{FormContent}</div>
        <DrawerFooter className="pt-4">
          <Button type="submit" form="schedule-form" disabled={isSubmitting || !selectedDate || !selectedTime}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingOrder ? 'Atualizar Agendamento' : 'Confirmar Agendamento'}
          </Button>
          <DrawerClose asChild><Button variant="outline" disabled={isSubmitting}>Cancelar</Button></DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}