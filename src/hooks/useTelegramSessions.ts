
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TelegramSession {
  id: string;
  telegram_user_id: number;
  chat_id: number;
  step: string;
  session_data: any;
  phone: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

export const useTelegramSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<TelegramSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('telegram_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching telegram sessions:', error);
        toast.error('Erro ao carregar sessões do Telegram');
        return;
      }

      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching telegram sessions:', error);
      toast.error('Erro ao carregar sessões do Telegram');
    } finally {
      setLoading(false);
    }
  };

  const clearExpiredSessions = async () => {
    try {
      const { data, error } = await supabase
        .rpc('cleanup_expired_telegram_sessions');

      if (error) {
        console.error('Error cleaning up expired sessions:', error);
        return 0;
      }

      console.log(`Cleaned up ${data} expired sessions`);
      await fetchSessions(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('telegram_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        console.error('Error deleting session:', error);
        toast.error('Erro ao deletar sessão');
        return false;
      }

      toast.success('Sessão deletada com sucesso');
      await fetchSessions();
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Erro ao deletar sessão');
      return false;
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  return {
    sessions,
    loading,
    fetchSessions,
    clearExpiredSessions,
    deleteSession
  };
};
