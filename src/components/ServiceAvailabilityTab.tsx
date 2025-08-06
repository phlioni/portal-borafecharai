
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Clock, Users } from 'lucide-react';
import { useServiceAvailability, CreateAvailabilityData } from '@/hooks/useServiceAvailability';
import { toast } from '@/hooks/use-toast';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

export function ServiceAvailabilityTab() {
  const { 
    availability, 
    isLoading, 
    createAvailability, 
    updateAvailability, 
    deleteAvailability,
    isCreating,
    isDeleting 
  } = useServiceAvailability();

  const [newAvailability, setNewAvailability] = useState<CreateAvailabilityData & { clients_per_day: number }>({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '18:00',
    is_available: true,
    clients_per_day: 1,
  });

  const handleAddAvailability = () => {
    if (newAvailability.start_time >= newAvailability.end_time) {
      toast({
        title: "Erro",
        description: "O horário de início deve ser anterior ao horário de fim.",
        variant: "destructive",
      });
      return;
    }

    createAvailability(newAvailability, {
      onSuccess: () => {
        setNewAvailability({
          day_of_week: 1,
          start_time: '09:00',
          end_time: '18:00',
          is_available: true,
          clients_per_day: 1,
        });
      },
    });
  };

  const handleToggleAvailability = (id: string, currentStatus: boolean) => {
    updateAvailability({ id, is_available: !currentStatus });
  };

  const getDayName = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(day => day.value === dayOfWeek)?.label || '';
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // Remove seconds if present
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horários de Atendimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulário para adicionar nova disponibilidade */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg bg-muted/50">
            <div>
              <Label htmlFor="day">Dia da Semana</Label>
              <Select
                value={newAvailability.day_of_week.toString()}
                onValueChange={(value) => setNewAvailability(prev => ({ 
                  ...prev, 
                  day_of_week: parseInt(value) 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start_time">Horário Início</Label>
              <Input
                id="start_time"
                type="time"
                value={newAvailability.start_time}
                onChange={(e) => setNewAvailability(prev => ({ 
                  ...prev, 
                  start_time: e.target.value 
                }))}
              />
            </div>

            <div>
              <Label htmlFor="end_time">Horário Fim</Label>
              <Input
                id="end_time"
                type="time"
                value={newAvailability.end_time}
                onChange={(e) => setNewAvailability(prev => ({ 
                  ...prev, 
                  end_time: e.target.value 
                }))}
              />
            </div>

            <div>
              <Label htmlFor="clients_per_day">Clientes/Dia</Label>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="clients_per_day"
                  type="number"
                  min="1"
                  max="10"
                  value={newAvailability.clients_per_day}
                  onChange={(e) => setNewAvailability(prev => ({ 
                    ...prev, 
                    clients_per_day: parseInt(e.target.value) || 1 
                  }))}
                  className="w-20"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleAddAvailability}
                disabled={isCreating}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>

          {/* Lista de disponibilidades */}
          <div className="space-y-3">
            {availability.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum horário de atendimento configurado.</p>
                <p className="text-sm">Adicione seus horários disponíveis para que os clientes possam agendar.</p>
              </div>
            ) : (
              availability.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium min-w-[120px]">
                      {getDayName(item.day_of_week)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(item.start_time)} - {formatTime(item.end_time)}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Users className="h-3 w-3 mr-1" />
                      {item.clients_per_day} cliente{item.clients_per_day > 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`available-${item.id}`} className="text-xs">
                        Disponível
                      </Label>
                      <Switch
                        id={`available-${item.id}`}
                        checked={item.is_available}
                        onCheckedChange={() => handleToggleAvailability(item.id, item.is_available)}
                      />
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAvailability(item.id)}
                      disabled={isDeleting}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {availability.length > 0 && (
            <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
              <p className="font-medium mb-2">Informações importantes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Os clientes só poderão agendar nos horários marcados como disponíveis.</li>
                <li>Horários já agendados não aparecerão para outros clientes.</li>
                <li>Você pode desabilitar temporariamente um horário sem removê-lo.</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
