
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Save, RotateCcw, Info } from 'lucide-react';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EmailTemplateSettings = () => {
  const { template, isLoading, saveTemplate, defaultTemplate } = useEmailTemplates();
  const [formData, setFormData] = useState({
    email_subject_template: '',
    email_message_template: '',
    email_signature: ''
  });

  useEffect(() => {
    if (template) {
      setFormData({
        email_subject_template: template.email_subject_template,
        email_message_template: template.email_message_template,
        email_signature: template.email_signature
      });
    }
  }, [template]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    const success = await saveTemplate(formData);
    if (success) {
      // Template salvo com sucesso
    }
  };

  const handleReset = () => {
    setFormData({
      email_subject_template: defaultTemplate.email_subject_template,
      email_message_template: defaultTemplate.email_message_template,
      email_signature: defaultTemplate.email_signature
    });
  };

  const placeholders = [
    '[NOME_PROJETO] - Nome do projeto/proposta',
    '[NOME_CLIENTE] - Nome do cliente',
    '[NOME_EMPRESA] - Nome da sua empresa',
    '[EMAIL_EMPRESA] - Email da sua empresa',
    '[TELEFONE_EMPRESA] - Telefone da sua empresa',
    '[WEBSITE_EMPRESA] - Website da sua empresa',
    '[LINK_DA_PROPOSTA] - Será substituído pelo botão da proposta',
    '[ASSINATURA_EMPRESA] - Sua assinatura personalizada'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Template de Email para Propostas
          </CardTitle>
          <CardDescription>
            Personalize como seus emails de proposta serão enviados para os clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Use os placeholders abaixo para personalizar seus emails. Eles serão automaticamente substituídos pelas informações reais ao enviar.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email_subject">Assunto do Email</Label>
                <Input
                  id="email_subject"
                  value={formData.email_subject_template}
                  onChange={(e) => handleInputChange('email_subject_template', e.target.value)}
                  placeholder="Sua proposta para o projeto [NOME_PROJETO] está pronta"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="email_message">Mensagem do Email</Label>
                <Textarea
                  id="email_message"
                  value={formData.email_message_template}
                  onChange={(e) => handleInputChange('email_message_template', e.target.value)}
                  placeholder="Conteúdo da mensagem..."
                  rows={12}
                  className="resize-none"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="email_signature">Assinatura</Label>
                <Textarea
                  id="email_signature"
                  value={formData.email_signature}
                  onChange={(e) => handleInputChange('email_signature', e.target.value)}
                  placeholder="Sua assinatura personalizada..."
                  rows={6}
                  className="resize-none"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-3">Placeholders Disponíveis:</h4>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                  {placeholders.map((placeholder, index) => (
                    <div key={index} className="text-gray-600">
                      <code className="bg-gray-200 px-2 py-1 rounded text-xs mr-2">
                        {placeholder.split(' - ')[0]}
                      </code>
                      {placeholder.split(' - ')[1]}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Pré-visualização:</h4>
                <div className="bg-white p-3 rounded border text-xs space-y-2">
                  <div><strong>Assunto:</strong> {formData.email_subject_template || 'Assunto aparecerá aqui'}</div>
                  <div className="border-t pt-2">
                    <div className="whitespace-pre-line max-h-32 overflow-y-auto">
                      {formData.email_message_template || 'Mensagem aparecerá aqui...'}
                    </div>
                    {formData.email_signature && (
                      <div className="border-t pt-2 mt-2 whitespace-pre-line">
                        {formData.email_signature}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {isLoading ? 'Salvando...' : 'Salvar Template'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReset} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Restaurar Padrão
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTemplateSettings;
