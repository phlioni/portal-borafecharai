
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useServiceAvailability } from '@/hooks/useServiceAvailability';
import { useCreateServiceOrder } from '@/hooks/useServiceOrders';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ServiceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  clientId?: string;
  onSuccess: () => void;
}

const ServiceOrderModal = ({ isOpen, onClose, proposalId, clientId, onSuccess }: ServiceOrderModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientNotes, setClientNotes] = useState('');
  
  const { data: availability } = useServiceAvailability();
  const createServiceOrder = useCreateServiceOrder();

  const getAvailableTimesForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    return availability?.filter(slot => 
      slot.day_of_week === dayOfWeek && 
      slot.is_available
    ) || [];
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return;

    try {
      await createServiceOrder.mutateAsync({
        proposal_id: proposalId,
        client_id: clientId,
        scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
        scheduled_time: selectedTime,
        client_notes: clientNotes || undefined
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar ordem de serviço:', error);
    }
  };

  const availableTimes = selectedDate ? getAvailableTimesForDate(selectedDate) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agendar Serviço</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">Escolha a Data</Label>
            <div className="mt-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                className="rounded-md border"
              />
            </div>
          </div>

          {selectedDate && (
            <div>
              <Label className="text-base font-medium">Horários Disponíveis</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {availableTimes.length > 0 ? (
                  availableTimes.map((slot) => (
                    <Button
                      key={slot.id}
                      variant={selectedTime === slot.start_time ? "default" : "outline"}
                      onClick={() => setSelectedTime(slot.start_time)}
                      className="text-sm"
                    >
                      {slot.start_time} - {slot.end_time}
                    </Button>
                  ))
                ) : (
                  <p className="col-span-3 text-muted-foreground text-center py-4">
                    Nenhum horário disponível para esta data
                  </p>
                )}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              placeholder="Adicione observações sobre o serviço..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedDate || !selectedTime || createServiceOrder.isPending}
            >
              {createServiceOrder.isPending ? 'Agendando...' : 'Confirmar Agendamento'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceOrderModal;
