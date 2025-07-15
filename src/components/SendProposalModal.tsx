
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { useCompanies } from '@/hooks/useCompanies';

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
  const { getProcessedTemplate } = useEmailTemplates();
  const { data: companies } = useCompanies();
  
  const [formData, setFormData] = useState({
    recipientEmail: '',
    recipientName: '',
    emailSubject: '',
    emailMessage: ''
  });

  // Atualizar dados do formulário quando props mudarem
  useEffect(() => {
    const companyData = companies?.[0]; // Primeira empresa do usuário
    
    if (companyData && getProcessedTemplate) {
      const processedTemplate = getProcessedTemplate(companyData, proposalTitle, clientName || 'Cliente');
      
      // Processar o template de mensagem para incluir a assinatura
      const fullMessage = processedTemplate.email_message_template.replace(
        '[ASSINATURA_EMPRESA]', 
        processedTemplate.email_signature
      );
      
      setFormData({
        recipientEmail: clientEmail || '',
        recipientName: clientName || '',
        emailSubject: processedTemplate.email_subject_template,
        emailMessage: fullMessage
      });
    } else {
      // Fallback para template padrão
      setFormData({
        recipientEmail: clientEmail || '',
        recipientName: clientName || '',
        emailSubject: `Sua proposta para o projeto ${proposalTitle} está pronta`,
        emailMessage: `Olá ${clientName || 'Cliente'},\n\nEspero que esteja bem!\n\nSua proposta para o projeto "${proposalTitle}" está finalizada e disponível para visualização.\n\nPreparamos esta proposta cuidadosamente para atender às suas necessidades específicas. Para acessar todos os detalhes, clique no link abaixo:\n\n[LINK_DA_PROPOSTA]\n\nResumo do que incluímos:\n• Análise detalhada do seu projeto\n• Cronograma personalizado\n• Investimento transparente\n• Suporte durante toda a execução\n\nFico à disposição para esclarecer qualquer dúvida e discutir os próximos passos.\n\nAguardo seu retorno!\n\nAtenciosamente,\n[SEU_NOME]\nBora Fechar AI`
      });
    }
  }, [proposalTitle, clientName, clientEmail, companies, getProcessedTemplate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSend = () => {
    console.log('Tentando enviar proposta com dados:', formData);
    
    if (!formData.recipientEmail.trim()) {
      toast.error('Email do destinatário é obrigatório');
      return;
    }
    
    if (!formData.recipientName.trim()) {
      toast.error('Nome do destinatário é obrigatório');
      return;
    }

    onSend(formData);
  };

  const isFormValid = formData.recipientEmail.trim() && formData.recipientName.trim();

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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500 mt-1">
                O botão da proposta será inserido automaticamente onde estiver escrito [LINK_DA_PROPOSTA]
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
                  {formData.emailMessage
                    ?.replace('[LINK_DA_PROPOSTA]', '[ 📄 Botão: "Visualizar Proposta" ]') || 
                    'Mensagem do email aparecerá aqui...'}
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
            disabled={!isFormValid || isLoading}
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
