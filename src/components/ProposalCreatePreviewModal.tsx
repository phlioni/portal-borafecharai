
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Save, Send, FileText } from 'lucide-react';
import StandardProposalTemplate from '@/components/StandardProposalTemplate';

interface ProposalCreatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAsDraft: () => void;
  onSendEmail: () => void;
  proposal: any;
  companyLogo: string;
  isLoading?: boolean;
}

const ProposalCreatePreviewModal = ({
  isOpen,
  onClose,
  onSaveAsDraft,
  onSendEmail,
  proposal,
  companyLogo,
  isLoading = false
}: ProposalCreatePreviewModalProps) => {

  console.log('ProposalCreatePreviewModal - Dados da proposta:', {
    value: proposal?.value,
    title: proposal?.title,
    template: proposal?.template_id,
    budgetItems: proposal?.proposal_budget_items
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Pré-visualização da Proposta</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Título:</strong> {proposal?.title || 'Sem título'}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Cliente:</strong> {proposal?.clients?.name || 'Não informado'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Valor:</strong> {proposal?.value
                ? `R$ ${proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : 'Não informado'
              }
            </p>
          </div>

          {/* Proposal Preview */}
          <div className="border rounded-lg p-1 bg-white shadow-inner">
            <div className="transform scale-90 origin-top">
              {proposal && (
                <StandardProposalTemplate proposal={proposal} companyLogo={companyLogo} />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t bg-gray-50 -mx-6 -mb-6 px-6 py-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="order-3 sm:order-1"
          >
            Cancelar
          </Button>

          <Button
            variant="outline"
            onClick={onSaveAsDraft}
            disabled={isLoading}
            className="order-2 sm:order-2"
          >
            <FileText className="h-4 w-4 mr-2" />
            Salvar como Rascunho
          </Button>

          <Button
            onClick={onSendEmail}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 order-1 sm:order-3"
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar por E-mail
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalCreatePreviewModal;
