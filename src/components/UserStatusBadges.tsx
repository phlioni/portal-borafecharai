
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, CheckCircle, XCircle } from 'lucide-react';

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
  const isTrialActive = user.subscriber?.trial_end_date && 
    new Date(user.subscriber.trial_end_date) > new Date();
  
  const trialProposalsUsed = user.subscriber?.trial_proposals_used || 0;
  const trialProposalsRemaining = Math.max(0, 20 - trialProposalsUsed);

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
        <Badge variant="outline" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          Trial ({trialProposalsRemaining} restantes)
        </Badge>
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
