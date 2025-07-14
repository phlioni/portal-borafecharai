
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface TelegramBotSettings {
  id?: string;
  bot_token?: string;
  bot_username?: string;
  webhook_configured?: boolean;
  chat_id?: number;
}

export const useTelegramBot = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<TelegramBotSettings>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user) {
      setSettings({});
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('telegram_bot_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching telegram settings:', error);
        return;
      }

      setSettings(data || {});
    } catch (error) {
      console.error('Error fetching telegram settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: TelegramBotSettings) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('telegram_bot_settings')
        .upsert({
          user_id: user.id,
          bot_token: newSettings.bot_token,
          bot_username: newSettings.bot_username,
          webhook_configured: newSettings.webhook_configured || false,
          chat_id: newSettings.chat_id
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving telegram settings:', error);
        throw error;
      }

      setSettings(data);
      return data;
    } catch (error) {
      console.error('Error saving telegram settings:', error);
      throw error;
    }
  };

  const cleanupExpiredSessions = async () => {
    try {
      const { data, error } = await supabase
        .rpc('cleanup_expired_telegram_sessions');

      if (error) {
        console.error('Error cleaning up expired sessions:', error);
        return 0;
      }

      console.log(`Cleaned up ${data} expired sessions`);
      return data;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  return {
    settings,
    loading,
    fetchSettings,
    saveSettings,
    cleanupExpiredSessions
  };
};
