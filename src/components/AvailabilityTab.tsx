
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { useServiceAvailability, useCreateServiceAvailability, useUpdateServiceAvailability, useDeleteServiceAvailability } from '@/hooks/useServiceAvailability';

const daysOfWeek = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
];

const AvailabilityTab = () => {
  const { data: availability, isLoading } = useServiceAvailability();
  const createAvailability = useCreateServiceAvailability();
  const updateAvailability = useUpdateServiceAvailability();
  const deleteAvailability = useDeleteServiceAvailability();

  const [newSlot, setNewSlot] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    is_available: true
  });

  const handleAddSlot = async () => {
    if (!newSlot.start_time || !newSlot.end_time) {
      return;
    }

    await createAvailability.mutateAsync(newSlot);
    setNewSlot({
      day_of_week: 1,
      start_time: '09:00',
      end_time: '17:00',
      is_available: true
    });
  };

  const handleToggleAvailability = async (id: string, is_available: boolean) => {
    await updateAvailability.mutateAsync({
      id,
      updates: { is_available }
    });
  };

  const handleDeleteSlot = async (id: string) => {
    await deleteAvailability.mutateAsync(id);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  const groupedAvailability = availability?.reduce((acc, slot) => {
    if (!acc[slot.day_of_week]) {
      acc[slot.day_of_week] = [];
    }
    acc[slot.day_of_week].push(slot);
    return acc;
  }, {} as Record<number, typeof availability>) || {};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurar Agenda de Disponibilidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Adicionar novo horário */}
          <div className="p-4 border rounded-lg space-y-4">
            <h3 className="font-medium">Adicionar Horário</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="day">Dia da Semana</Label>
                <select
                  id="day"
                  value={newSlot.day_of_week}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, day_of_week: parseInt(e.target.value) }))}
                  className="w-full p-2 border rounded-md"
                >
                  {daysOfWeek.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="start_time">Horário Início</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={newSlot.start_time}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end_time">Horário Fim</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={newSlot.end_time}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddSlot} disabled={createAvailability.isPending}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de horários por dia */}
          <div className="space-y-4">
            {daysOfWeek.map(day => (
              <div key={day.value} className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">{day.label}</h3>
                {groupedAvailability[day.value]?.length > 0 ? (
                  <div className="space-y-2">
                    {groupedAvailability[day.value].map(slot => (
                      <div key={slot.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <div className="flex items-center space-x-4">
                          <span>
                            {slot.start_time} - {slot.end_time}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={slot.is_available}
                              onCheckedChange={(checked) => handleToggleAvailability(slot.id, checked)}
                            />
                            <Label>Disponível</Label>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSlot(slot.id)}
                          disabled={deleteAvailability.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum horário configurado</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvailabilityTab;
