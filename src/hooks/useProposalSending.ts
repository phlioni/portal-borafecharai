import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useProposalSending = () => {
  const [isSending, setIsSending] = useState(false);

  const sendProposal = async (proposal: any, emailData: any) => {
    setIsSending(true);
    try {
      // Usar hash público ou criar token temporário para acesso público
      const hash = proposal.public_hash || btoa(proposal.id);
      const publicUrl = `${window.location.origin}/proposta/${hash}`;

      // Preparar dados para envio
      const emailContent = emailData.emailMessage.replace('[LINK_DA_PROPOSTA]', publicUrl);

      const response = await supabase.functions.invoke('send-proposal-email', {
        body: {
          proposalId: proposal.id,
          recipientEmail: emailData.recipientEmail,
          recipientName: emailData.recipientName,
          emailSubject: emailData.emailSubject,
          emailMessage: emailContent,
          publicUrl: publicUrl
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('Proposta enviada por email com sucesso!');
      
      // Atualizar status da proposta
      await supabase
        .from('proposals')
        .update({ status: 'enviada' })
        .eq('id', proposal.id);

      return true;
    } catch (error) {
      console.error('Erro ao enviar proposta:', error);
      toast.error('Erro ao enviar proposta por email');
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return { sendProposal, isSending };
};