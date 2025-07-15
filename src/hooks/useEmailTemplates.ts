
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmailTemplate {
  id?: string;
  user_id?: string;
  email_subject_template: string;
  email_message_template: string;
  email_signature: string;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_EMAIL_TEMPLATE: EmailTemplate = {
  email_subject_template: 'Sua proposta para o projeto {PROJETO_NOME} está pronta',
  email_message_template: `Olá {CLIENTE_NOME},

Espero que esteja bem!

Sua proposta para o projeto "{PROJETO_NOME}" está finalizada e disponível para visualização.

Preparamos esta proposta cuidadosamente para atender às suas necessidades específicas. Para acessar todos os detalhes, clique no botão abaixo:

{BOTAO_PROPOSTA}

Resumo do que incluímos:
• Análise detalhada do seu projeto
• Cronograma personalizado
• Investimento transparente
• Suporte durante toda a execução

Fico à disposição para esclarecer qualquer dúvida e discutir os próximos passos.

Aguardo seu retorno!`,
  email_signature: `Atenciosamente,
{SEU_NOME}
{EMPRESA_NOME}
{EMPRESA_TELEFONE}
{EMPRESA_EMAIL}

---
Esta proposta foi criada com BoraFechar AI - A inteligência que acelera seus negócios`
};

export const useEmailTemplates = () => {
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (template: Omit<EmailTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          ...template,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template de email salvo com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao salvar template:', error);
      toast.error('Erro ao salvar template de email');
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EmailTemplate> }) => {
      const { data, error } = await supabase
        .from('email_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template de email atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar template:', error);
      toast.error('Erro ao atualizar template de email');
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Template de email excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir template:', error);
      toast.error('Erro ao excluir template de email');
    },
  });

  const getTemplate = () => {
    if (templates && templates.length > 0) {
      return templates[0];
    }
    return DEFAULT_EMAIL_TEMPLATE;
  };

  const processTemplate = (template: string, variables: Record<string, string>) => {
    let processed = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      processed = processed.replace(regex, value || '');
    });
    return processed;
  };

  return {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
    processTemplate,
    defaultTemplate: DEFAULT_EMAIL_TEMPLATE
  };
};
