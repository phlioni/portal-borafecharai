
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useProposalSending = () => {
  const [isSending, setIsSending] = useState(false);

  const sendProposal = async (proposal: any, emailData: any) => {
    setIsSending(true);
    try {
      console.log('Iniciando envio da proposta:', proposal.id);
      console.log('Dados do email:', emailData);

      // Verificar se a proposta tem um hash público
      let publicHash = proposal.public_hash;
      
      if (!publicHash) {
        console.log('Hash público não encontrado, gerando um novo...');
        // Gerar um hash baseado no ID da proposta
        publicHash = btoa(`${proposal.id}-${Date.now()}`).replace(/[+=\/]/g, '').substring(0, 16);
        
        // Atualizar a proposta com o novo hash
        const { error: updateError } = await supabase
          .from('proposals')
          .update({ 
            public_hash: publicHash,
            updated_at: new Date().toISOString()
          })
          .eq('id', proposal.id);
          
        if (updateError) {
          console.error('Erro ao atualizar hash público:', updateError);
          throw new Error('Erro ao gerar link público da proposta');
        }
      }

      const publicUrl = `${window.location.origin}/proposta/${publicHash}`;
      console.log('URL pública da proposta:', publicUrl);

      // Preparar o conteúdo do email
      const emailContent = emailData.emailMessage.replace('[LINK_DA_PROPOSTA]', publicUrl);

      console.log('Enviando email via edge function...');

      const { data, error } = await supabase.functions.invoke('send-proposal-email', {
        body: {
          proposalId: proposal.id,
          recipientEmail: emailData.recipientEmail,
          recipientName: emailData.recipientName,
          emailSubject: emailData.emailSubject,
          emailMessage: emailContent,
          publicUrl: publicUrl
        }
      });

      console.log('Resposta da função:', { data, error });

      if (error) {
        console.error('Erro no envio:', error);
        throw new Error(error.message || 'Erro ao enviar proposta');
      }

      toast.success('Proposta enviada por email com sucesso!');
      
      // Atualizar status da proposta para enviada apenas se ela ainda estava como rascunho
      if (proposal.status === 'rascunho' || !proposal.status) {
        const { error: statusUpdateError } = await supabase
          .from('proposals')
          .update({ 
            status: 'enviada',
            updated_at: new Date().toISOString()
          })
          .eq('id', proposal.id);

        if (statusUpdateError) {
          console.error('Erro ao atualizar status:', statusUpdateError);
          // Não falhar por isso, apenas logar
        }
      }

      return true;
    } catch (error) {
      console.error('Erro completo ao enviar proposta:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao enviar proposta';
      toast.error(`Erro ao enviar proposta: ${errorMessage}`);
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return { sendProposal, isSending };
};
