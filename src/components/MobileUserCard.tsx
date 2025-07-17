
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import UserStatusBadges from '@/components/UserStatusBadges';
import UserActionsDropdown from '@/components/UserActionsDropdown';

interface User {
  id: string;
  email: string;
  created_at: string;
  role?: string;
  subscriber?: {
    subscribed: boolean;
    subscription_tier?: string;
    trial_end_date?: string;
    trial_proposals_used?: number;
    trial_start_date?: string;
    bonus_proposals_current_month?: number;
  };
  trial_limits?: {
    trial_proposals_limit: number;
    trial_days_limit: number;
  };
}

interface MobileUserCardProps {
  user: User;
  onResetProposals: (userId: string) => Promise<void>;
  onResetTrial: (userId: string) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onChangeRole: (userId: string, role: 'user' | 'guest' | 'admin') => Promise<void>;
}

const MobileUserCard = ({ 
  user, 
  onResetProposals, 
  onResetTrial, 
  onDeleteUser,
  onChangeRole 
}: MobileUserCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(user.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <UserActionsDropdown
            user={user}
            onResetProposals={onResetProposals}
            onResetTrial={onResetTrial}
            onDeleteUser={onDeleteUser}
            onChangeRole={onChangeRole}
          />
        </div>
        <UserStatusBadges user={user} />
      </CardContent>
    </Card>
  );
};

export default MobileUserCard;
