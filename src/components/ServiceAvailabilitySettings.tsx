
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useServiceAvailability } from '@/hooks/useServiceAvailability';

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

export const ServiceAvailabilitySettings = () => {
  const { availability, loading, saveAvailability } = useServiceAvailability();
  const [changes, setChanges] = useState<Record<number, {
    start_time: string;
    end_time: string;
    is_available: boolean;
  }>>({});

  const getAvailabilityForDay = (dayOfWeek: number) => {
    const existing = availability.find(a => a.day_of_week === dayOfWeek);
    const change = changes[dayOfWeek];
    
    return {
      start_time: change?.start_time ?? existing?.start_time ?? '09:00',
      end_time: change?.end_time ?? existing?.end_time ?? '18:00',
      is_available: change?.is_available ?? existing?.is_available ?? false,
    };
  };

  const handleChange = (dayOfWeek: number, field: string, value: any) => {
    setChanges(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...getAvailabilityForDay(dayOfWeek),
        [field]: value,
      }
    }));
  };

  const handleSave = async (dayOfWeek: number) => {
    const config = getAvailabilityForDay(dayOfWeek);
    await saveAvailability(dayOfWeek, config.start_time, config.end_time, config.is_available);
    
    // Remove from changes after saving
    setChanges(prev => {
      const newChanges = { ...prev };
      delete newChanges[dayOfWeek];
      return newChanges;
    });
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Configuração de Agendamento</h3>
        <p className="text-sm text-muted-foreground">
          Configure seus dias e horários de disponibilidade para agendamentos.
        </p>
      </div>

      <div className="space-y-4">
        {DAYS_OF_WEEK.map((dayName, dayOfWeek) => {
          const config = getAvailabilityForDay(dayOfWeek);
          const hasChanges = dayOfWeek in changes;

          return (
            <Card key={dayOfWeek}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Label className="w-24 font-medium">{dayName}</Label>
                    <Switch
                      checked={config.is_available}
                      onCheckedChange={(checked) => handleChange(dayOfWeek, 'is_available', checked)}
                    />
                  </div>

                  {config.is_available && (
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">De:</Label>
                      <Input
                        type="time"
                        value={config.start_time}
                        onChange={(e) => handleChange(dayOfWeek, 'start_time', e.target.value)}
                        className="w-32"
                      />
                      <Label className="text-sm">Até:</Label>
                      <Input
                        type="time"
                        value={config.end_time}
                        onChange={(e) => handleChange(dayOfWeek, 'end_time', e.target.value)}
                        className="w-32"
                      />
                    </div>
                  )}

                  {hasChanges && (
                    <Button onClick={() => handleSave(dayOfWeek)} size="sm">
                      Salvar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
