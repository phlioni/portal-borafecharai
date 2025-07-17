import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSubscription } from './useSubscription';
import { useTrialStatus } from './useTrialStatus';

export const useProposalSending = () => {
  const [isSending, setIsSending] = useState(false);
  const { subscribed, subscription_tier } = useSubscription();
  const { isInTrial } = useTrialStatus();

  const checkProposalLimits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Usuários Professional têm propostas ilimitadas
      if (subscribed && subscription_tier === 'professional') {
        return { canCreate: true, remaining: Infinity };
      }

      // Verificar função do banco para validar se pode criar proposta
      const { data: canCreate, error } = await supabase.rpc('can_create_proposal', {
        _user_id: user.id
      });

      if (error) {
        console.error('Erro ao verificar limite de propostas:', error);
        throw new Error('Erro ao verificar limite de propostas');
      }

      if (!canCreate) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { data: monthlyCount } = await supabase.rpc('get_monthly_proposal_count', {
          _user_id: user.id,
          _month: currentMonth
        });

        // Buscar limite da tabela trial_limits se em trial
        let limit = 10; // padrão para plano básico
        if (isInTrial) {
          const { data: trialLimits } = await supabase
            .from('trial_limits')
            .select('trial_proposals_limit')
            .eq('user_id', user.id)
            .maybeSingle();
          
          const { data: subscriber } = await supabase
            .from('subscribers')
            .select('bonus_proposals_current_month')
            .eq('user_id', user.id)
            .maybeSingle();
          
          const baseLimit = trialLimits?.trial_proposals_limit || 20;
          const bonusProposals = subscriber?.bonus_proposals_current_month || 0;
          limit = baseLimit + bonusProposals;
        }

        return { 
          canCreate: false, 
          remaining: 0,
          used: monthlyCount || 0,
          limit 
        };
      }

      // Se pode criar, calcular quantas restam
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: monthlyCount } = await supabase.rpc('get_monthly_proposal_count', {
        _user_id: user.id,
        _month: currentMonth
      });

      // Buscar limite da tabela trial_limits se em trial
      let limit = 10; // padrão para plano básico
      if (isInTrial) {
        const { data: trialLimits } = await supabase
          .from('trial_limits')
          .select('trial_proposals_limit')
          .eq('user_id', user.id)
          .maybeSingle();
        
        const { data: subscriber } = await supabase
          .from('subscribers')
          .select('bonus_proposals_current_month')
          .eq('user_id', user.id)
          .maybeSingle();
        
        const baseLimit = trialLimits?.trial_proposals_limit || 20;
        const bonusProposals = subscriber?.bonus_proposals_current_month || 0;
        limit = baseLimit + bonusProposals;
      }

      const remaining = limit - (monthlyCount || 0);

      return { 
        canCreate: true, 
        remaining,
        used: monthlyCount || 0,
        limit 
      };
    } catch (error) {
      console.error('Erro ao verificar limites:', error);
      throw error;
    }
  };

  const sendProposal = async (proposal: any, emailData: any) => {
    setIsSending(true);
    try {
      console.log('Iniciando envio da proposta:', proposal.id);
      console.log('Dados do email:', emailData);

      // Verificar se a proposta tem um hash público válido
      let publicHash = proposal.public_hash;
      
      if (!publicHash || publicHash.length < 16) {
        console.log('Hash público não encontrado ou inválido, gerando um novo...');
        // Gerar um hash mais robusto baseado no ID da proposta
        publicHash = btoa(`${proposal.id}-${Date.now()}-${Math.random()}`).replace(/[+=\/]/g, '').substring(0, 32);
        
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
        
        console.log('Novo hash público gerado:', publicHash);
      }

      const publicUrl = `https://www.borafecharai.com/proposta/${publicHash}`;
      console.log('URL pública da proposta:', publicUrl);

      console.log('Enviando email via edge function...');

      const { data, error } = await supabase.functions.invoke('send-proposal-email', {
        body: {
          proposalId: proposal.id,
          recipientEmail: emailData.recipientEmail,
          recipientName: emailData.recipientName,
          emailSubject: emailData.emailSubject,
          emailMessage: emailData.emailMessage,
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

  return { sendProposal, isSending, checkProposalLimits };
};
