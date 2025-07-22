
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BudgetTemplate {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface BudgetTemplateItem {
  id: number;
  template_id: string;
  user_id: string;
  type: 'material' | 'labor' | null;
  description: string;
  created_at: string;
}

export interface CreateTemplateData {
  name: string;
}

export interface CreateTemplateItemData {
  template_id: string;
  type: 'material' | 'labor';
  description: string;
}

const MAX_TEMPLATES_LIMIT = 15;

export const useBudgetTemplates = () => {
  const queryClient = useQueryClient();

  // Buscar templates
  const {
    data: templates,
    isLoading: isLoadingTemplates,
    error: templatesError,
  } = useQuery({
    queryKey: ['budget-templates'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('budget_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BudgetTemplate[];
    },
  });

  // Buscar itens dos templates
  const {
    data: templateItems,
    isLoading: isLoadingItems,
    error: itemsError,
  } = useQuery({
    queryKey: ['budget-template-items'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('budget_template_items')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as BudgetTemplateItem[];
    },
  });

  // Verificar se atingiu o limite
  const hasReachedLimit = (templates?.length || 0) >= MAX_TEMPLATES_LIMIT;
  const remainingTemplates = MAX_TEMPLATES_LIMIT - (templates?.length || 0);

  // Criar template
  const createTemplate = useMutation({
    mutationFn: async (templateData: CreateTemplateData) => {
      // Verificar limite antes de criar
      if (hasReachedLimit) {
        throw new Error(`Você pode ter no máximo ${MAX_TEMPLATES_LIMIT} modelos de orçamento`);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await (supabase as any)
        .from('budget_templates')
        .insert([
          {
            user_id: user.id,
            name: templateData.name,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-templates'] });
    },
  });

  // Deletar template
  const deleteTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await (supabase as any)
        .from('budget_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-templates'] });
      queryClient.invalidateQueries({ queryKey: ['budget-template-items'] });
    },
  });

  // Criar item do template
  const createTemplateItem = useMutation({
    mutationFn: async (itemData: CreateTemplateItemData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await (supabase as any)
        .from('budget_template_items')
        .insert([
          {
            template_id: itemData.template_id,
            user_id: user.id,
            type: itemData.type,
            description: itemData.description,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-template-items'] });
    },
  });

  // Deletar item do template
  const deleteTemplateItem = useMutation({
    mutationFn: async (itemId: number) => {
      const { error } = await (supabase as any)
        .from('budget_template_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-template-items'] });
    },
  });

  return {
    templates,
    templateItems,
    isLoading: isLoadingTemplates || isLoadingItems,
    error: templatesError || itemsError,
    createTemplate,
    deleteTemplate,
    createTemplateItem,
    deleteTemplateItem,
    hasReachedLimit,
    remainingTemplates,
    maxTemplatesLimit: MAX_TEMPLATES_LIMIT,
  };
};
