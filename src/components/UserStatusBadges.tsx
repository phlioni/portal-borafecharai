
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';

interface UserStatusBadgesProps {
  user: {
    role?: string;
    subscriber?: {
      subscribed: boolean;
      subscription_tier?: string;
      trial_end_date?: string;
      trial_proposals_used?: number;
      trial_start_date?: string;
    };
  };
}

const UserStatusBadges = ({ user }: UserStatusBadgesProps) => {
  console.log('UserStatusBadges - user data:', user);
  
  const now = new Date();
  const trialEndDate = user.subscriber?.trial_end_date ? new Date(user.subscriber.trial_end_date) : null;
  const trialStartDate = user.subscriber?.trial_start_date ? new Date(user.subscriber.trial_start_date) : null;
  
  // Lógica principal: usuários com role 'user' devem estar em trial se não têm assinatura ativa
  const isUserRole = user.role === 'user';
  const hasActiveSubscription = user.subscriber?.subscribed && user.subscriber?.subscription_tier;
  
  // Usuário role 'user' sem assinatura ativa DEVE estar em trial
  const shouldBeInTrial = isUserRole && !hasActiveSubscription;
  
  // Trial está ativo se:
  // 1. É role 'user' sem assinatura E tem data de fim válida E ainda não expirou
  // 2. OU se é role 'user' sem assinatura (mesmo sem dados de trial configurados)
  const isTrialActive = shouldBeInTrial && (!trialEndDate || trialEndDate > now);
  
  const trialProposalsUsed = user.subscriber?.trial_proposals_used || 0;
  const trialProposalsRemaining = Math.max(0, 20 - trialProposalsUsed);

  // Formattar data de término do trial
  const formatTrialEndDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  console.log('UserStatusBadges - calculated values:', {
    isTrialActive,
    shouldBeInTrial,
    isUserRole,
    hasActiveSubscription,
    trialProposalsUsed,
    trialProposalsRemaining,
    subscribed: user.subscriber?.subscribed,
    subscription_tier: user.subscriber?.subscription_tier,
    trial_end_date: user.subscriber?.trial_end_date,
    trial_start_date: user.subscriber?.trial_start_date,
    trialEndDate: trialEndDate?.toISOString(),
    trialStartDate: trialStartDate?.toISOString(),
    now: now.toISOString()
  });

  return (
    <div className="flex flex-wrap gap-1">
      {user.role && (
        <Badge 
          variant={
            user.role === 'admin' ? 'default' : 
            user.role === 'guest' ? 'outline' : 
            'secondary'
          } 
          className="text-xs"
        >
          <Shield className="h-3 w-3 mr-1" />
          {user.role}
        </Badge>
      )}
      
      {hasActiveSubscription ? (
        <Badge variant="default" className="text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          {user.subscriber.subscription_tier || 'Assinante'}
        </Badge>
      ) : isUserRole ? (
        // Para usuários role 'user' sempre mostrar status de trial
        <>
          {isTrialActive ? (
            <>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <Clock className="h-3 w-3 mr-1" />
                Trial Ativo ({trialProposalsRemaining} restantes)
              </Badge>
              {user.subscriber?.trial_end_date && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  <Calendar className="h-3 w-3 mr-1" />
                  Até {formatTrialEndDate(user.subscriber.trial_end_date)}
                </Badge>
              )}
            </>
          ) : trialEndDate && trialEndDate < now ? (
            <Badge variant="destructive" className="text-xs">
              <XCircle className="h-3 w-3 mr-1" />
              Trial Expirado
            </Badge>
          ) : (
            // Se não tem dados de trial configurados mas deveria ter
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Trial não configurado
            </Badge>
          )}
        </>
      ) : (
        // Para outras roles (admin, guest) que não precisam de trial
        <Badge variant="secondary" className="text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          Acesso Completo
        </Badge>
      )}
    </div>
  );
};

export default UserStatusBadges;
