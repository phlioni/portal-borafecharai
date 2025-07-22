
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceOrder } from '@/hooks/useServiceOrders';

interface EditServiceOrderModalProps {
  order: ServiceOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderId: string, updates: Partial<ServiceOrder>) => void;
}

export const EditServiceOrderModal: React.FC<EditServiceOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onSave,
}) => {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [status, setStatus] = useState<ServiceOrder['status']>('agendado');
  const [providerNotes, setProviderNotes] = useState('');

  useEffect(() => {
    if (order) {
      setScheduledDate(order.scheduled_date);
      setScheduledTime(order.scheduled_time);
      setStatus(order.status);
      setProviderNotes(order.provider_notes || '');
    }
  }, [order]);

  const handleSave = () => {
    if (!order) return;

    onSave(order.id, {
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      status,
      provider_notes: providerNotes,
    });

    onClose();
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Ordem de Serviço</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="client">Cliente</Label>
            <Input
              id="client"
              value={order.proposals?.clients?.name || 'Cliente não informado'}
              disabled
            />
          </div>

          <div>
            <Label htmlFor="service">Serviço</Label>
            <Input
              id="service"
              value={order.proposals?.title || ''}
              disabled
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: ServiceOrder['status']) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="reagendado">Reagendado</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Observações do Prestador</Label>
            <Textarea
              id="notes"
              value={providerNotes}
              onChange={(e) => setProviderNotes(e.target.value)}
              placeholder="Adicione suas observações sobre este agendamento..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
