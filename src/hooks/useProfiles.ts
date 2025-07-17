
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfiles = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      console.log('Buscando perfil para usuário:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Erro ao carregar perfil');
        return;
      }

      console.log('Perfil carregado:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const checkAndGrantBonus = async () => {
    if (!user?.id) return;

    try {
      console.log('Verificando elegibilidade para bônus de perfil completo');
      
      const { data: success, error } = await supabase
        .rpc('grant_profile_completion_bonus', { _user_id: user.id });

      if (error) {
        console.error('Erro ao verificar bônus:', error);
        return;
      }

      if (success) {
        console.log('Bônus de perfil completo concedido!');
        toast.success('🎉 Parabéns! Você ganhou 5 propostas extras por completar seu perfil!');
        
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: ['profile-completion'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
        queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      }
    } catch (error) {
      console.error('Erro ao verificar bônus:', error);
    }
  };

  const updateProfile = async (updates: Partial<Pick<Profile, 'name' | 'phone' | 'avatar_url'>>) => {
    if (!user) return;

    try {
      console.log('Atualizando perfil com:', updates);

      // Verificar se o telefone já está em uso por outro usuário
      if (updates.phone) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('phone', updates.phone)
          .neq('user_id', user.id)
          .maybeSingle();

        if (existingProfile) {
          toast.error('Este número já está sendo utilizado por outro usuário');
          return { error: 'Phone already in use' };
        }
      }

      // Primeiro, verificar se o perfil existe
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let data, error;

      if (currentProfile) {
        // Se o perfil existe, fazer UPDATE
        const result = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      } else {
        // Se o perfil não existe, fazer INSERT
        const result = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            ...updates,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Error updating profile:', error);
        
        // Verificar se é erro de telefone duplicado
        if (error.code === '23505' && error.message?.includes('profiles_phone_key')) {
          toast.error('Este número de telefone já está cadastrado no sistema. Por favor, utilize outro número.');
          return { error: 'Phone already exists' };
        }
        
        toast.error('Erro ao salvar perfil');
        return { error };
      }

      console.log('Perfil atualizado:', data);
      setProfile(data);
      toast.success('Perfil atualizado com sucesso!');
      
      // Verificar e conceder bônus após atualização do perfil
      setTimeout(() => {
        checkAndGrantBonus();
      }, 1000);
      
      return { data };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao salvar perfil');
      return { error };
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) {
      console.error('Usuário não autenticado');
      return null;
    }

    try {
      console.log('Iniciando upload do avatar para usuário:', user.id);
      
      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      console.log('Nome do arquivo:', fileName);

      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        toast.error('Erro ao fazer upload da imagem');
        return null;
      }

      // Obter URL pública
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('URL pública gerada:', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Erro ao fazer upload da imagem');
      return null;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
    fetchProfile
  };
};
