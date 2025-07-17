
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface WhatsAppSession {
  id: string;
  phone_number: string;
  step: string;
  session_data: any;
  created_at: string;
  updated_at: string;
}

export const useWhatsAppSessions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['whatsapp-sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('Fetching WhatsApp sessions for user:', user.id);

      const { data, error } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching WhatsApp sessions:', error);
        throw error;
      }

      console.log('WhatsApp sessions found:', data);
      return data || [];
    },
    enabled: !!user,
  });
};

export const useWhatsAppConfig = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateConfig = useMutation({
    mutationFn: async (config: { webhook_url?: string; verify_token?: string; access_token?: string }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Updating WhatsApp config:', config);

      // This would typically be stored in a system settings table
      const { data, error } = await supabase
        .from('system_settings')
        .upsert({
          user_id: user.id,
          setting_key: 'whatsapp_config',
          setting_value: config
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating WhatsApp config:', error);
        throw error;
      }

      console.log('WhatsApp config updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      toast.success('Configuração do WhatsApp atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['whatsapp-config'] });
    },
    onError: (error: any) => {
      console.error('Error updating WhatsApp config:', error);
      toast.error(error.message || 'Erro ao atualizar configuração do WhatsApp');
    },
  });

  return {
    updateConfig
  };
};

export const useTestWhatsAppBot = () => {
  const testBot = useMutation({
    mutationFn: async (testData: { phone_number: string; message: string }) => {
      console.log('Testing WhatsApp bot:', testData);

      const { data, error } = await supabase.functions.invoke('whatsapp-bot', {
        body: {
          entry: [{
            changes: [{
              value: {
                messages: [{
                  from: testData.phone_number,
                  type: 'text',
                  text: {
                    body: testData.message
                  }
                }]
              }
            }]
          }]
        }
      });

      if (error) {
        console.error('Error testing WhatsApp bot:', error);
        throw error;
      }

      console.log('WhatsApp bot test completed:', data);
      return data;
    },
    onSuccess: () => {
      toast.success('Teste do bot WhatsApp executado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error testing WhatsApp bot:', error);
      toast.error(error.message || 'Erro ao testar bot do WhatsApp');
    },
  });

  return {
    testBot
  };
};
