
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
    };
  };
}

const UserStatusBadges = ({ user }: UserStatusBadgesProps) => {
  console.log('UserStatusBadges - user data:', user);
  
  const now = new Date();
  const isTrialActive = user.subscriber?.trial_end_date && 
    new Date(user.subscriber.trial_end_date) > now && 
    !user.subscriber.subscribed;
  
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
    trial_end_date: user.subscriber?.trial_end_date
  });

  return (
    <div className="flex flex-wrap gap-1">
      {user.role && (
        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
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
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Trial ({trialProposalsRemaining} restantes)
          </Badge>
          {user.subscriber?.trial_end_date && (
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              Até {formatTrialEndDate(user.subscriber.trial_end_date)}
            </Badge>
          )}
        </>
      ) : (
        <Badge variant="destructive" className="text-xs">
          <XCircle className="h-3 w-3 mr-1" />
          Expirado
        </Badge>
      )}
    </div>
  );
};

export default UserStatusBadges;
