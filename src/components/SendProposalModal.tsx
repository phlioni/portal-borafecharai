
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { useUserCompany } from '@/hooks/useUserCompany';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/hooks/useProfiles';

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
  const { data: userCompany, isLoading: userCompanyLoading } = useUserCompany();
  const { getTemplate, processTemplate, templates, isLoading: templatesLoading } = useEmailTemplates();
  const { profile } = useProfiles();

  const [formData, setFormData] = useState({
    recipientEmail: '',
    recipientName: '',
    emailSubject: '',
    emailMessage: ''
  });

  // Carregar e processar template quando modal abrir ou dados mudarem
  useEffect(() => {
    if (isOpen && !templatesLoading && !userCompanyLoading) {
      console.log('Modal aberto, processando template...');
      console.log('Templates disponíveis:', templates);
      console.log('Empresa do usuário:', userCompany);

      const template = getTemplate();
      console.log('Template obtido:', template);

      // Preparar variáveis para substituição no template usando dados da empresa do usuário
      const variables = {
        CLIENTE_NOME: clientName || 'Cliente',
        NOME_CLIENTE: clientName || 'Cliente',
        PROJETO_NOME: proposalTitle || 'Projeto',
        NOME_PROJETO: proposalTitle || 'Projeto',
        SEU_NOME: user?.user_metadata?.name || profile?.name || 'Equipe',
        EMPRESA_NOME: userCompany?.name || 'Sua Empresa',
        EMPRESA_TELEFONE: userCompany?.phone ? `📱 ${userCompany.phone}` : '',
        EMPRESA_EMAIL: userCompany?.email ? `📧 ${userCompany.email}` : '',
        BOTAO_PROPOSTA: '[LINK_DA_PROPOSTA]'
      };

      console.log('Variáveis para substituição:', variables);

      // Processar templates com as variáveis
      const processedSubject = processTemplate(template.email_subject_template || '', variables);
      const processedMessage = processTemplate(template.email_message_template || '', variables);

      // Processar assinatura
      let processedSignature = processTemplate(template.email_signature || '', variables);

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
  }, [isOpen, proposalTitle, clientName, clientEmail, user, userCompany, templates, templatesLoading, userCompanyLoading, getTemplate, processTemplate]);

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

  // Função melhorada para gerar preview do email com melhor espaçamento
  const generatePreviewMessage = () => {
    const paragraphs = formData.emailMessage.split('\n\n').filter(p => p.trim());

    const htmlContent = paragraphs.map(paragraph => {
      if (paragraph.includes('[LINK_DA_PROPOSTA]')) {
        const beforeButton = paragraph.split('[LINK_DA_PROPOSTA]')[0];
        const afterButton = paragraph.split('[LINK_DA_PROPOSTA]')[1];

        return `
          ${beforeButton ? `<p style="margin: 0 0 10px 0; line-height: 1.6; color: #374151; font-size: 16px;">${beforeButton.replace(/\n/g, '<br><br>')}</p>` : ''}
          <div style="text-align: center; margin: 5px 0;">
            <div style="display: inline-block; 
                        background-color: #2563eb; 
                        color: #ffffff !important; 
                        padding: 16px 32px; 
                        border-radius: 8px; 
                        font-weight: 600; 
                        font-size: 16px; 
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              📄 Visualizar Proposta
            </div>
          </div>
          ${afterButton ? `<p style="margin: 5px 0 30px 0; color: #374151; font-size: 16px;">${afterButton.replace(/\n/g, '<br><br>')}</p>` : ''}
        `;
      } else {
        return `<p style="margin: 0 0 30px 0; line-height: 1.1; color: #374151; font-size: 16px;">${paragraph.replace(/\n/g, '<br><br>')}</p>`;
      }
    }).join('');

    // Adicionar o footer do BoraFecharAI na preview
    const footerHtml = `
      <div style="margin-top: 50px; text-align: center; padding: 24px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px; font-weight: 500;">
          ✨ Esta proposta foi criada com
        </p>
        <div style="color: #2563eb; font-size: 18px; font-weight: 700; padding: 8px 16px; border-radius: 6px; background: rgba(37, 99, 235, 0.1);">
          🚀 BoraFecharAI
        </div>
        <p style="margin: 12px 0 0 0; color: #64748b; font-size: 12px;">
          A plataforma que transforma suas propostas em fechamentos
        </p>
      </div>
    `;

    return (htmlContent || 'Mensagem do email aparecerá aqui...') + footerHtml;
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
                O botão "Visualizar Proposta" será inserido automaticamente onde estiver escrito [LINK_DA_PROPOSTA]
              </p>
            </div>
          </div>

          {/* Pré-visualização melhorada */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3">Pré-visualização do Email:</h4>
            <div className="bg-white p-4 rounded border text-sm space-y-2">
              <div className="border-b pb-2 mb-3">
                <p><strong>Para:</strong> {formData.recipientEmail || 'email@cliente.com'}</p>
                <p><strong>Assunto:</strong> {formData.emailSubject || 'Assunto do email'}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-t text-center">
                <h5 className="font-semibold">📋 Proposta Comercial</h5>
              </div>
              <div className="max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-b">
                <div
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: generatePreviewMessage()
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
