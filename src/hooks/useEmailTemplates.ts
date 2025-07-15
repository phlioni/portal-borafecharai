
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  user_id: string;
  email_subject_template: string;
  email_message_template: string;
  email_signature: string;
  created_at: string;
  updated_at: string;
}

export const useEmailTemplates = () => {
  const { user } = useAuth();
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const defaultTemplate = {
    email_subject_template: 'Sua proposta para o projeto [NOME_PROJETO] está pronta',
    email_message_template: `Olá [NOME_CLIENTE],

Espero que esteja bem!

Sua proposta para o projeto "[NOME_PROJETO]" está finalizada e disponível para visualização.

Preparamos esta proposta cuidadosamente para atender às suas necessidades específicas. Para acessar todos os detalhes, clique no botão abaixo:

[LINK_DA_PROPOSTA]

Resumo do que incluímos:
• Análise detalhada do seu projeto
• Cronograma personalizado
• Investimento transparente
• Suporte durante toda a execução

Fico à disposição para esclarecer qualquer dúvida e discutir os próximos passos.

Aguardo seu retorno!

[ASSINATURA_EMPRESA]`,
    email_signature: `Atenciosamente,
[NOME_EMPRESA]

📧 [EMAIL_EMPRESA]
📱 [TELEFONE_EMPRESA]
🌐 [WEBSITE_EMPRESA]

💡 Esta proposta foi criada de forma inteligente com BoraFecharAI - a ferramenta que está revolucionando a forma como profissionais criam propostas. Que tal conhecer também?`
  };

  const loadTemplate = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar template:', error);
        throw error;
      }

      if (data) {
        setTemplate(data);
      } else {
        // Criar template padrão se não existir
        const { data: newTemplate, error: createError } = await supabase
          .from('email_templates')
          .insert([{
            user_id: user.id,
            ...defaultTemplate,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) {
          console.error('Erro ao criar template padrão:', createError);
          throw createError;
        }

        setTemplate(newTemplate);
      }
    } catch (error) {
      console.error('Erro ao carregar template:', error);
      toast.error('Erro ao carregar template de email');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = async (templateData: Partial<EmailTemplate>) => {
    if (!user || !template) return false;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .update({
          ...templateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', template.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar template:', error);
        throw error;
      }

      setTemplate(data);
      toast.success('Template de email salvo com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast.error('Erro ao salvar template de email');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getProcessedTemplate = (companyData: any, proposalTitle: string, clientName: string) => {
    if (!template) return defaultTemplate;

    const processTemplate = (text: string) => {
      return text
        .replace(/\[NOME_PROJETO\]/g, proposalTitle)
        .replace(/\[NOME_CLIENTE\]/g, clientName)
        .replace(/\[NOME_EMPRESA\]/g, companyData?.name || 'Sua Empresa')
        .replace(/\[EMAIL_EMPRESA\]/g, companyData?.email || '')
        .replace(/\[TELEFONE_EMPRESA\]/g, companyData?.phone || '')
        .replace(/\[WEBSITE_EMPRESA\]/g, companyData?.website || '');
    };

    return {
      email_subject_template: processTemplate(template.email_subject_template),
      email_message_template: processTemplate(template.email_message_template),
      email_signature: processTemplate(template.email_signature)
    };
  };

  useEffect(() => {
    if (user) {
      loadTemplate();
    }
  }, [user]);

  return {
    template,
    isLoading,
    saveTemplate,
    loadTemplate,
    getProcessedTemplate,
    defaultTemplate
  };
};
