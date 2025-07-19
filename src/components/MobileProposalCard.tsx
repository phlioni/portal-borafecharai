
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Copy, Send, Trash2, FileText, User, Calendar } from 'lucide-react';

interface Proposal {
  id: string;
  title: string;
  status?: string;
  created_at: string;
  clients?: {
    name: string;
  };
}

interface MobileProposalCardProps {
  proposal: Proposal;
  onPreview: (proposal: Proposal) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSend: (id: string) => void;
  onDelete: (id: string) => void;
}

const MobileProposalCard = ({ 
  proposal, 
  onPreview, 
  onEdit, 
  onDuplicate, 
  onSend, 
  onDelete 
}: MobileProposalCardProps) => {
  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{proposal.title}</span>
        </div>

        {proposal.clients && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{proposal.clients.name}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>

        {proposal.status && (
          <div>
            <Badge variant="secondary">{proposal.status}</Badge>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(proposal)}
            className="flex items-center gap-1"
          >
            <Eye className="h-3 w-3" />
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(proposal.id)}
            className="flex items-center gap-1"
          >
            <Edit className="h-3 w-3" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDuplicate(proposal.id)}
            className="flex items-center gap-1"
          >
            <Copy className="h-3 w-3" />
            Duplicar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSend(proposal.id)}
            className="flex items-center gap-1"
          >
            <Send className="h-3 w-3" />
            Enviar
          </Button>
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(proposal.id)}
          className="w-full mt-2"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </Button>
      </CardContent>
    </Card>
  );
};

export default MobileProposalCard;
