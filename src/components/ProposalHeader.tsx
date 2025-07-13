import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Send,
  Download,
  Edit,
  ExternalLink
} from 'lucide-react';

interface ProposalHeaderProps {
  proposal: any;
  onBack: () => void;
  onViewPublic: () => void;
  onDownloadPDF: () => void;
  onEdit: () => void;
  onSend: () => void;
}

const ProposalHeader = ({ 
  proposal, 
  onBack, 
  onViewPublic, 
  onDownloadPDF, 
  onEdit, 
  onSend 
}: ProposalHeaderProps) => {
  const getStatusBadge = (status: string) => {
    const variants = {
      'rascunho': 'bg-gray-100 text-gray-800',
      'enviada': 'bg-blue-100 text-blue-800',
      'aceita': 'bg-green-100 text-green-800',
      'rejeitada': 'bg-red-100 text-red-800'
    };
    
    return variants[status as keyof typeof variants] || variants.rascunho;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'rascunho': 'Rascunho',
      'enviada': 'Enviada',
      'aceita': 'Aceita',
      'rejeitada': 'Rejeitada'
    };
    
    return labels[status as keyof typeof labels] || 'Rascunho';
  };

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between bg-white rounded-lg p-4 shadow-sm gap-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visualizar Proposta</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-600">#{proposal.id.substring(0, 8)}</p>
            <Badge className={getStatusBadge(proposal.status || 'rascunho')}>
              {getStatusLabel(proposal.status || 'rascunho')}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onViewPublic}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Ver Pública
        </Button>
        <Button variant="outline" onClick={onDownloadPDF}>
          <Download className="h-4 w-4 mr-2" />
          Baixar PDF
        </Button>
        <Button variant="outline" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white" 
          onClick={onSend}
        >
          <Send className="h-4 w-4 mr-2" />
          Enviar
        </Button>
      </div>
    </div>
  );
};

export default ProposalHeader;