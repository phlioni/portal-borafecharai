
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useProposalSending = () => {
  const [isSending, setIsSending] = useState(false);

  const sendProposal = async (proposal: any, emailData: any) => {
    setIsSending(true);
    try {
      console.log('Iniciando envio da proposta:', proposal.id);

      // Usar o hash público se existir, senão criar um baseado no ID
      let publicHash = proposal.public_hash;
      
      if (!publicHash) {
        console.log('Hash público não encontrado, criando um novo...');
        // Se não tiver hash público, atualizar a proposta para ter um
        const { data: updatedProposal, error: updateError } = await supabase
          .from('proposals')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', proposal.id)
          .select()
          .single();
          
        if (updateError) {
          console.error('Erro ao gerar hash público:', updateError);
          // Fallback para base64 do ID
          publicHash = btoa(proposal.id);
        } else {
          publicHash = updatedProposal.public_hash || btoa(proposal.id);
        }
      }

      const publicUrl = `${window.location.origin}/proposta/${publicHash}`;
      console.log('URL pública da proposta:', publicUrl);

      // Preparar dados para envio
      const emailContent = emailData.emailMessage.replace('[LINK_DA_PROPOSTA]', publicUrl);

      console.log('Dados para envio:', {
        proposalId: proposal.id,
        recipientEmail: emailData.recipientEmail,
        publicUrl
      });

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
      
      // Atualizar status da proposta
      const { error: updateError } = await supabase
        .from('proposals')
        .update({ 
          status: 'enviada',
          updated_at: new Date().toISOString()
        })
        .eq('id', proposal.id);

      if (updateError) {
        console.error('Erro ao atualizar status:', updateError);
      }

      return true;
    } catch (error) {
      console.error('Erro ao enviar proposta:', error);
      toast.error('Erro ao enviar proposta por email: ' + error.message);
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return { sendProposal, isSending };
};
