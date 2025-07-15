
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Shield, UserX } from 'lucide-react';

interface MobileUserCardProps {
  user: {
    id: string;
    email: string;
    created_at: string;
    role?: string;
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
          {user.role && (
            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              {user.role}
            </Badge>
          )}
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
