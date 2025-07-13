import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ModernoTemplate, ExecutivoTemplate, CriativoTemplate } from '@/components/ProposalTemplates';

interface ProposalPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  proposal: any;
  companyLogo: string;
}

const ProposalPreviewModal = ({ 
  isOpen, 
  onClose, 
  onContinue, 
  proposal, 
  companyLogo 
}: ProposalPreviewModalProps) => {
  
  const renderTemplate = () => {
    const templateId = proposal.template_id || 'moderno';
    
    switch (templateId) {
      case 'executivo':
        return <ExecutivoTemplate proposal={proposal} companyLogo={companyLogo} />;
      case 'criativo':
        return <CriativoTemplate proposal={proposal} companyLogo={companyLogo} />;
      default:
        return <ModernoTemplate proposal={proposal} companyLogo={companyLogo} />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Pré-visualização da Proposta</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Template:</strong> {proposal.template_id === 'executivo' ? 'Executivo' : 
                                          proposal.template_id === 'criativo' ? 'Criativo' : 'Moderno'}
            </p>
            <p className="text-sm text-gray-600">
              Esta é a visualização de como sua proposta aparecerá para o cliente.
            </p>
          </div>
          
          {/* Proposal Preview */}
          <div className="border rounded-lg p-1 bg-white">
            <div className="transform scale-75 origin-top">
              {renderTemplate()}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onContinue} className="bg-blue-600 hover:bg-blue-700">
            Continuar para Envio
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalPreviewModal;