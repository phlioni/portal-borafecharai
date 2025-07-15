
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
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { getTemplate, processTemplate, templates, isLoading: templatesLoading } = useEmailTemplates();
  
  const [formData, setFormData] = useState({
    recipientEmail: '',
    recipientName: '',
    emailSubject: '',
    emailMessage: ''
  });

  // Carregar e processar template quando modal abrir ou dados mudarem
  useEffect(() => {
    if (isOpen && !templatesLoading && !companiesLoading) {
      console.log('Modal aberto, processando template...');
      console.log('Templates disponíveis:', templates);
      console.log('Empresas disponíveis:', companies);
      
      const template = getTemplate();
      console.log('Template obtido:', template);
      
      const company = companies?.[0];
      console.log('Empresa selecionada:', company);
      
      // Preparar variáveis para substituição no template usando dados da empresa
      const variables = {
        CLIENTE_NOME: clientName || 'Cliente',
        NOME_CLIENTE: clientName || 'Cliente',
        PROJETO_NOME: proposalTitle || 'Projeto',
        NOME_PROJETO: proposalTitle || 'Projeto',
        SEU_NOME: user?.user_metadata?.name || company?.name || 'Equipe',
        EMPRESA_NOME: company?.name || 'Sua Empresa',
        EMPRESA_TELEFONE: company?.phone || '',
        EMPRESA_EMAIL: company?.email || user?.email || '',
        BOTAO_PROPOSTA: '[LINK_DA_PROPOSTA]'
      };

      console.log('Variáveis para substituição:', variables);

      // Processar templates com as variáveis
      const processedSubject = processTemplate(template.email_subject_template || '', variables);
      const processedMessage = processTemplate(template.email_message_template || '', variables);
      const processedSignature = processTemplate(template.email_signature || '', variables);
      
      console.log('Subject processado:', processedSubject);
      console.log('Message processada:', processedMessage);
      console.log('Signature processada:', processedSignature);
      
      // Combinar mensagem e assinatura
      const fullMessage = processedSignature ? 
        `${processedMessage}\n\n${processedSignature}` : 
        processedMessage;

      const newFormData = {
        recipientEmail: clientEmail || '',
        recipientName: clientName || '',
        emailSubject: processedSubject,
        emailMessage: fullMessage
      };

      console.log('Atualizando FormData com:', newFormData);
      setFormData(newFormData);
    }
  }, [isOpen, proposalTitle, clientName, clientEmail, user, companies, templates, templatesLoading, companiesLoading, getTemplate, processTemplate]);

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

  // Função para gerar preview do email com botão estilizado em azul com texto branco
  const generatePreviewMessage = () => {
    return formData.emailMessage.replace(
      '[LINK_DA_PROPOSTA]',
      `
      <div style="text-align: center; margin: 20px 0;">
        <a href="#" style="
          display: inline-block;
          background: #2563eb;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        ">
          📄 Visualizar Proposta
        </a>
      </div>
      `
    );
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
                rows={12}
                className="resize-none"
                disabled={isLoading}
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
                <div 
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: generatePreviewMessage().replace(/\n/g, '<br>') || 'Mensagem do email aparecerá aqui...' 
                  }}
                />
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
            className="bg-blue-600 hover:bg-blue-700 text-white order-1 sm:order-2"
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
