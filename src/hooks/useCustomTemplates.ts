
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CustomTemplate {
  id: string;
  name: string;
  description: string | null;
  template_id: string;
  html_content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useCustomTemplates = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    if (!user) {
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
        console.error('Error fetching templates:', error);
        toast.error('Erro ao carregar templates');
        return;
      }

      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Omit<CustomTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('custom_proposal_templates')
      .insert({
        ...templateData,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      throw error;
    }

    await fetchTemplates();
    return data;
  };

  const updateTemplate = async (id: string, templateData: Partial<Omit<CustomTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    const { data, error } = await supabase
      .from('custom_proposal_templates')
      .update(templateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating template:', error);
      throw error;
    }

    await fetchTemplates();
    return data;
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase
      .from('custom_proposal_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting template:', error);
      throw error;
    }

    await fetchTemplates();
  };

  const getTemplateById = (templateId: string) => {
    return templates.find(template => template.template_id === templateId);
  };

  // Função para obter todos os templates disponíveis (padrão + personalizados)
  const getAllAvailableTemplates = () => {
    const defaultTemplates = [
      { id: 'moderno', name: 'Moderno', description: 'Template moderno e limpo' },
      { id: 'classico', name: 'Clássico', description: 'Template tradicional e profissional' },
      { id: 'minimalista', name: 'Minimalista', description: 'Template simples e direto' },
      { id: 'corporativo', name: 'Corporativo', description: 'Template formal para empresas' }
    ];

    const customTemplates = templates.map(template => ({
      id: template.template_id,
      name: template.name,
      description: template.description || 'Template personalizado',
      isCustom: true
    }));

    return [...defaultTemplates, ...customTemplates];
  };

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateById,
    getAllAvailableTemplates,
    refetch: fetchTemplates
  };
};
