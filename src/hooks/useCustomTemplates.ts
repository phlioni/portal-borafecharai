
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CustomTemplate {
  id: string;
  template_id: string;
  name: string;
  description?: string;
  html_content: string;
  created_at: string;
}

export const useCustomTemplates = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    if (!user) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_proposal_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching custom templates:', error);
        return;
      }

      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching custom templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async (template: Omit<CustomTemplate, 'id' | 'created_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('custom_proposal_templates')
        .insert({
          ...template,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving template:', error);
        throw error;
      }

      await fetchTemplates();
      return data;
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('custom_proposal_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting template:', error);
        throw error;
      }

      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  return {
    templates,
    loading,
    fetchTemplates,
    saveTemplate,
    deleteTemplate
  };
};
