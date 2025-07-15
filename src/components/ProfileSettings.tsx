
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Save } from 'lucide-react';
import { useProfiles } from '@/hooks/useProfiles';
import { toast } from 'sonner';

export const ProfileSettings = () => {
  const { data: profiles, isLoading, createProfile, updateProfile } = useProfiles();
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  const profile = profiles?.[0];

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      if (profile) {
        await updateProfile.mutateAsync({ id: profile.id, ...formData });
      } else {
        await createProfile.mutateAsync(formData);
      }
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Informações Pessoais
        </CardTitle>
        <CardDescription>
          Configure suas informações pessoais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Seu nome completo"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(11) 99999-9999"
              disabled={isLoading}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {isLoading ? 'Salvando...' : 'Salvar Perfil'}
        </Button>
      </CardContent>
    </Card>
  );
};
