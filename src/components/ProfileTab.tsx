
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/hooks/useProfiles';
import ProfileAvatarUpload from '@/components/ProfileAvatarUpload';
import BonusCelebration from '@/components/BonusCelebration';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { toast } from 'sonner';

const ProfileTab = () => {
  const { user } = useAuth();
  const { profile, loading, updateProfile, uploadAvatar } = useProfiles();
  const { data: status, isLoading, claimBonus, isClaiming, showCelebration, handleCelebrationComplete } = useProfileCompletion();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar_url: ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      console.log('Carregando dados do perfil no formulário:', profile);
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  // Reivindicar automaticamente quando o bônus estiver disponível
  useEffect(() => {
    if (status?.canClaimBonus && !isClaiming) {
      console.log('Bônus disponível - reivindicando automaticamente');
      claimBonus();
    }
  }, [status?.canClaimBonus, claimBonus, isClaiming]);

  const handleInputChange = (field: string, value: string) => {
    console.log('Alterando campo:', field, 'para:', value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpdate = (avatarUrl: string | null) => {
    console.log('Atualizando avatar URL:', avatarUrl);
    setFormData(prev => ({ ...prev, avatar_url: avatarUrl || '' }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      console.log('Salvando perfil com dados:', formData);
      
      // Validar dados obrigatórios
      if (!formData.name || formData.name.trim() === '') {
        toast.error('Nome é obrigatório');
        return;
      }

      if (!formData.phone || formData.phone.trim() === '') {
        toast.error('Telefone é obrigatório');
        return;
      }
      
      // Validar formato do telefone se fornecido
      if (formData.phone && !formData.phone.match(/^\+\d{1,3}\d{10,11}$/)) {
        toast.error('Formato do telefone inválido. Use o formato: +DDIDDDxxxxxxxx');
        return;
      }

      const result = await updateProfile({
        name: formData.name || null,
        phone: formData.phone || null,
        avatar_url: formData.avatar_url || null
      });

      if (result?.error === 'Phone already in use') {
        return; // Toast já foi mostrado no hook
      }

      // Se chegou até aqui, deu certo
      if (!result?.error) {
        toast.success('Perfil salvo com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <p>Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Informações do Perfil</CardTitle>
          <CardDescription>Gerencie suas informações pessoais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProfileAvatarUpload
            currentAvatarUrl={formData.avatar_url}
            userName={formData.name}
            userEmail={user?.email}
            onAvatarUpdate={handleAvatarUpdate}
            onUpload={uploadAvatar}
          />

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                O e-mail não pode ser alterado
              </p>
            </div>

            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite seu nome completo"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+5511999999999"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Formato: +[código do país][DDD][número] (ex: +5511999999999)
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de celebração de bônus */}
      <BonusCelebration 
        show={showCelebration} 
        onComplete={handleCelebrationComplete} 
      />
    </>
  );
};

export default ProfileTab;
