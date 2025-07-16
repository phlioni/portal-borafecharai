
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
  
  // Um usuário está em trial se:
  // 1. Tem trial_end_date
  // 2. trial_end_date é maior que agora
  // 3. NÃO está subscrito
  const isTrialActive = trialEndDate && trialEndDate > now && !user.subscriber?.subscribed;
  
  const trialProposalsUsed = user.subscriber?.trial_proposals_used || 0;
  const trialProposalsRemaining = Math.max(0, 20 - trialProposalsUsed);

  // Formattar data de término do trial
  const formatTrialEndDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  console.log('UserStatusBadges - calculated values:', {
    isTrialActive,
    trialProposalsUsed,
    trialProposalsRemaining,
    subscribed: user.subscriber?.subscribed,
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
      
      {user.subscriber?.subscribed ? (
        <Badge variant="default" className="text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          {user.subscriber.subscription_tier || 'Assinante'}
        </Badge>
      ) : isTrialActive ? (
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
      ) : user.subscriber?.trial_end_date && trialEndDate && trialEndDate < now ? (
        <Badge variant="destructive" className="text-xs">
          <XCircle className="h-3 w-3 mr-1" />
          Trial Expirado
        </Badge>
      ) : user.subscriber && user.subscriber.trial_start_date ? (
        <Badge variant="secondary" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          Trial Inativo
        </Badge>
      ) : (
        <Badge variant="secondary" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          Sem Trial
        </Badge>
      )}
    </div>
  );
};

export default UserStatusBadges;
