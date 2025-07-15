
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Erro ao salvar perfil');
        return { error };
      }

      console.log('Perfil atualizado:', data);
      setProfile(data);
      toast.success('Perfil atualizado com sucesso!');
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
