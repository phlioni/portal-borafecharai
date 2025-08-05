
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useWorkOrders, CreateWorkOrderData } from '@/hooks/useWorkOrders';
import { cn } from '@/lib/utils';

const scheduleSchema = z.object({
  address: z.string()
    .min(10, 'O endereço deve ter no mínimo 10 caracteres.')
    .nonempty('O endereço é obrigatório.'),
});

type ScheduleForm = z.infer<typeof scheduleSchema>;

interface ScheduleModalProps {
  proposalId?: string;
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleModal({ proposalId, clientId, open, onOpenChange }: ScheduleModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { createWorkOrder, isCreating } = useWorkOrders();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
  });

  const handleCreateWorkOrder = async (data: ScheduleForm) => {
    if (!date) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma data para o agendamento.",
        variant: "destructive",
      });
      return;
    }

    const workOrderData: CreateWorkOrderData = {
      client_id: clientId,
      scheduled_at: date.toISOString(),
      address: data.address,
      ...(proposalId && { proposal_id: proposalId }),
    };

    createWorkOrder(workOrderData, {
      onSuccess: () => {
        reset();
        setDate(new Date());
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agendar Atendimento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleCreateWorkOrder)} className="space-y-4">
          <div className="flex flex-col items-center">
            <Label className="mb-2 self-start">Escolha a melhor data</Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className={cn("rounded-md border pointer-events-auto")}
              disabled={(d) => d < new Date(new Date().setDate(new Date().getDate() - 1))}
            />
          </div>
          <div>
            <Label htmlFor="address">Endereço completo do atendimento</Label>
            <Input 
              id="address" 
              placeholder="Ex: Rua das Flores, 123, Bairro, Cidade - SP" 
              {...register('address')} 
            />
            {errors.address && (
              <p className="text-destructive text-sm mt-1">{errors.address.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Ordem de Serviço
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
