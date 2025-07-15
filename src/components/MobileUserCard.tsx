
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, UserX } from 'lucide-react';
import UserActionsDropdown from '@/components/UserActionsDropdown';
import UserStatusBadges from '@/components/UserStatusBadges';

interface MobileUserCardProps {
  user: {
    id: string;
    email: string;
    created_at: string;
    role?: string;
    subscriber?: {
      subscribed: boolean;
      subscription_tier?: string;
      trial_end_date?: string;
      trial_proposals_used?: number;
    };
  };
  onDeleteUser: (userId: string) => void;
  isDeleting: boolean;
}

const MobileUserCard = ({ user, onDeleteUser, isDeleting }: MobileUserCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">ID: {user.id.slice(0, 8)}...</span>
          </div>
          <div className="flex items-center gap-2">
            <UserActionsDropdown user={user} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Criado em: {formatDate(user.created_at)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <UserStatusBadges user={user} />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteUser(user.id)}
            disabled={isDeleting}
            className="w-full"
          >
            <UserX className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deletando...' : 'Deletar Usuário'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileUserCard;
