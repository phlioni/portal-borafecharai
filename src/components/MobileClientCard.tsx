
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, Calendar, Edit, Trash2 } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

interface MobileClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
  isDeleting: boolean;
}

const MobileClientCard = ({ client, onEdit, onDelete, isDeleting }: MobileClientCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{client.name}</span>
        </div>

        {client.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{client.email}</span>
          </div>
        )}

        {client.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{client.phone}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Criado em: {formatDate(client.created_at)}
          </span>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(client)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(client.id)}
            disabled={isDeleting}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deletando...' : 'Deletar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileClientCard;
