
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useServiceAvailability } from '@/hooks/useServiceAvailability';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const DAYS_OF_WEEK = [
  { key: 0, name: 'Domingo' },
  { key: 1, name: 'Segunda-feira' },
  { key: 2, name: 'Terça-feira' },
  { key: 3, name: 'Quarta-feira' },
  { key: 4, name: 'Quinta-feira' },
  { key: 5, name: 'Sexta-feira' },
  { key: 6, name: 'Sábado' },
];

const SchedulingSettings = () => {
  const { availability, loading, saveAvailability } = useServiceAvailability();
  const [formData, setFormData] = React.useState<Record<number, { isAvailable: boolean; startTime: string; endTime: string }>>({});

  React.useEffect(() => {
    if (availability.length > 0) {
      const data: Record<number, { isAvailable: boolean; startTime: string; endTime: string }> = {};
      availability.forEach(item => {
        data[item.day_of_week] = {
          isAvailable: item.is_available,
          startTime: item.start_time,
          endTime: item.end_time,
        };
      });
      setFormData(data);
    } else {
      // Initialize with default values
      const defaultData: Record<number, { isAvailable: boolean; startTime: string; endTime: string }> = {};
      DAYS_OF_WEEK.forEach(day => {
        defaultData[day.key] = {
          isAvailable: day.key >= 1 && day.key <= 5, // Monday to Friday by default
          startTime: '09:00',
          endTime: '18:00',
        };
      });
      setFormData(defaultData);
    }
  }, [availability]);

  const handleSave = async () => {
    for (const [dayOfWeek, data] of Object.entries(formData)) {
      await saveAvailability(
        parseInt(dayOfWeek),
        data.startTime,
        data.endTime,
        data.isAvailable
      );
    }
  };

  const updateDay = (dayOfWeek: number, field: string, value: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        [field]: value,
      },
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Agendamento</CardTitle>
        <CardDescription>
          Configure seus dias e horários de trabalho para permitir que clientes agendem serviços
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day.key} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-2">
              <Switch
                id={`day-${day.key}`}
                checked={formData[day.key]?.isAvailable || false}
                onCheckedChange={(checked) => updateDay(day.key, 'isAvailable', checked)}
              />
              <Label htmlFor={`day-${day.key}`} className="font-medium">
                {day.name}
              </Label>
            </div>
            {formData[day.key]?.isAvailable && (
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={formData[day.key]?.startTime || '09:00'}
                  onChange={(e) => updateDay(day.key, 'startTime', e.target.value)}
                  className="px-3 py-1 border rounded-md"
                />
                <span>até</span>
                <input
                  type="time"
                  value={formData[day.key]?.endTime || '18:00'}
                  onChange={(e) => updateDay(day.key, 'endTime', e.target.value)}
                  className="px-3 py-1 border rounded-md"
                />
              </div>
            )}
          </div>
        ))}
        <Button onClick={handleSave} className="w-full">
          Salvar Configurações
        </Button>
      </CardContent>
    </Card>
  );
};

export default SchedulingSettings;
