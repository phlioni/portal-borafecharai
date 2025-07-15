
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Save, RotateCcw, Info } from 'lucide-react';
import { useEmailTemplates, EmailTemplate } from '@/hooks/useEmailTemplates';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EmailTemplateSettings = () => {
  const { 
    templates, 
    isLoading, 
    createTemplate, 
    updateTemplate, 
    getTemplate,
    defaultTemplate 
  } = useEmailTemplates();

  const [formData, setFormData] = useState<EmailTemplate>(defaultTemplate);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const currentTemplate = getTemplate();
    setFormData(currentTemplate);
    setIsEditing(!!currentTemplate.id);
  }, [templates]);

  const handleInputChange = (field: keyof EmailTemplate, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      if (isEditing && formData.id) {
        await updateTemplate.mutateAsync({
          id: formData.id,
          updates: {
            email_subject_template: formData.email_subject_template,
            email_message_template: formData.email_message_template,
            email_signature: formData.email_signature
          }
        });
      } else {
        await createTemplate.mutateAsync({
          email_subject_template: formData.email_subject_template,
          email_message_template: formData.email_message_template,
          email_signature: formData.email_signature
        });
      }
    } catch (error) {
      console.error('Erro ao salvar template:', error);
    }
  };

  const handleReset = () => {
    setFormData(defaultTemplate);
  };

  const isSaving = createTemplate.isPending || updateTemplate.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Templates de Email
        </CardTitle>
        <CardDescription>
          Configure o modelo padrão dos emails enviados com as propostas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Variáveis disponíveis:</strong> {'{CLIENTE_NOME}'}, {'{PROJETO_NOME}'}, {'{SEU_NOME}'}, 
            {'{EMPRESA_NOME}'}, {'{EMPRESA_TELEFONE}'}, {'{EMPRESA_EMAIL}'}, {'{BOTAO_PROPOSTA}'}
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="emailSubject">Assunto do Email</Label>
            <Input
              id="emailSubject"
              value={formData.email_subject_template}
              onChange={(e) => handleInputChange('email_subject_template', e.target.value)}
              placeholder="Assunto do email"
              disabled={isLoading || isSaving}
            />
          </div>

          <div>
            <Label htmlFor="emailMessage">Mensagem do Email</Label>
            <Textarea
              id="emailMessage"
              value={formData.email_message_template}
              onChange={(e) => handleInputChange('email_message_template', e.target.value)}
              placeholder="Corpo da mensagem do email"
              rows={12}
              className="resize-none"
              disabled={isLoading || isSaving}
            />
          </div>

          <div>
            <Label htmlFor="emailSignature">Assinatura do Email</Label>
            <Textarea
              id="emailSignature"
              value={formData.email_signature}
              onChange={(e) => handleInputChange('email_signature', e.target.value)}
              placeholder="Sua assinatura personalizada"
              rows={6}
              className="resize-none"
              disabled={isLoading || isSaving}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={isLoading || isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar Template'}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isLoading || isSaving}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Restaurar Padrão
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailTemplateSettings;
