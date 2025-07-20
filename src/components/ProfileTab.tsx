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
      // --- AJUSTE 1: Exibir o número de telefone sem o DDI +55 ---
      // Remove o prefixo +55 antes de colocar o número no formulário.
      const localPhone = profile.phone ? profile.phone.replace(/^\+55/, '') : '';

      setFormData({
        name: profile.name || '',
        phone: localPhone, // Usa o número local
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

      if (!formData.name || formData.name.trim() === '') {
        toast.error('Nome é obrigatório');
        setSaving(false);
        return;
      }

      // --- AJUSTE 2: Lógica de salvamento do telefone ---

      // 2a. Limpa o telefone para conter apenas dígitos
      const rawPhone = formData.phone.replace(/\D/g, '');

      if (!rawPhone || rawPhone.trim() === '') {
        toast.error('Telefone é obrigatório');
        setSaving(false);
        return;
      }

      // 2b. Valida o formato brasileiro (10 ou 11 dígitos)
      if (!rawPhone.match(/^\d{10,11}$/)) {
        toast.error('Formato do telefone inválido. Use DDD + número, com 10 ou 11 dígitos.');
        setSaving(false);
        return;
      }

      // 2c. Adiciona o DDI +55 antes de salvar
      const phoneToSave = `+55${rawPhone}`;

      const result = await updateProfile({
        name: formData.name || null,
        phone: phoneToSave || null, // Salva o número formatado
        avatar_url: formData.avatar_url || null
      });

      if (result?.error === 'Phone already in use') {
        return; // Toast já foi mostrado no hook
      }

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
                placeholder="11999999999"
                required
              />
              {/* --- AJUSTE 3: Mensagem de ajuda atualizada --- */}
              <p className="text-xs text-muted-foreground mt-1">
                Formato: DDD + Número (apenas dígitos). Ex: 11999999999
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

      {/* <BonusCelebration
        show={showCelebration}
        onComplete={handleCelebrationComplete}
      /> */}
    </>
  );
};

export default ProfileTab;