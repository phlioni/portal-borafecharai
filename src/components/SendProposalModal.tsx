
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send, X } from 'lucide-react';

interface SendProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: { recipientEmail: string; recipientName: string; emailSubject: string; emailMessage: string }) => void;
  proposalTitle: string;
  clientName?: string;
  clientEmail?: string;
  isLoading?: boolean;
}

const SendProposalModal = ({ 
  isOpen, 
  onClose, 
  onSend, 
  proposalTitle, 
  clientName = '', 
  clientEmail = '',
  isLoading = false 
}: SendProposalModalProps) => {
  const [formData, setFormData] = useState({
    recipientEmail: clientEmail,
    recipientName: clientName,
    emailSubject: `Nova Proposta Comercial - ${proposalTitle}`,
    emailMessage: `Olá ${clientName || 'Cliente'},\n\nEspero que esteja bem!\n\nTenho o prazer de apresentar nossa proposta comercial para "${proposalTitle}".\n\nPrepareamos esta proposta especialmente para atender às suas necessidades. Clique no link abaixo para visualizar todos os detalhes:\n\n[LINK_DA_PROPOSTA]\n\nDestaco alguns pontos importantes:\n• Proposta elaborada especificamente para seu projeto\n• Valores competitivos e condições facilitadas\n• Prazo de entrega otimizado\n• Suporte completo durante todo o processo\n\nEstou à disposição para esclarecer qualquer dúvida e discutir os próximos passos.\n\nAguardo seu retorno!\n\nAtenciosamente,\nEquipe Comercial\nBora Fechar AI`
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSend = () => {
    if (!formData.recipientEmail || !formData.recipientName) return;
    onSend(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Enviar Proposta por Email
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipientName">Nome do Destinatário *</Label>
                <Input
                  id="recipientName"
                  value={formData.recipientName}
                  onChange={(e) => handleInputChange('recipientName', e.target.value)}
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <Label htmlFor="recipientEmail">Email do Destinatário *</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  value={formData.recipientEmail}
                  onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
                  placeholder="cliente@empresa.com"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="emailSubject">Assunto do Email</Label>
              <Input
                id="emailSubject"
                value={formData.emailSubject}
                onChange={(e) => handleInputChange('emailSubject', e.target.value)}
                placeholder="Assunto do email"
              />
            </div>
            
            <div>
              <Label htmlFor="emailMessage">Mensagem do Email</Label>
              <Textarea
                id="emailMessage"
                value={formData.emailMessage}
                onChange={(e) => handleInputChange('emailMessage', e.target.value)}
                placeholder="Mensagem personalizada"
                rows={8}
                className="resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                O link da proposta será inserido automaticamente onde estiver escrito [LINK_DA_PROPOSTA]
              </p>
            </div>
          </div>

          {/* Pré-visualização */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3">Pré-visualização do Email:</h4>
            <div className="bg-white p-4 rounded border text-sm space-y-2">
              <div className="border-b pb-2">
                <p><strong>Para:</strong> {formData.recipientEmail || 'email@cliente.com'}</p>
                <p><strong>Assunto:</strong> {formData.emailSubject || 'Assunto do email'}</p>
              </div>
              <div className="max-h-48 overflow-y-auto">
                <p className="whitespace-pre-line text-sm leading-relaxed">
                  {formData.emailMessage || 'Mensagem do email aparecerá aqui...'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="order-2 sm:order-1">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={!formData.recipientEmail || !formData.recipientName || isLoading}
            className="bg-blue-600 hover:bg-blue-700 order-1 sm:order-2"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Enviando...' : 'Enviar Proposta'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendProposalModal;
