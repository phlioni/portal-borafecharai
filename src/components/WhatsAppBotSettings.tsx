
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Settings, 
  TestTube, 
  Webhook,
  Phone,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useWhatsAppConfig, useTestWhatsAppBot, useWhatsAppSessions } from '@/hooks/useWhatsAppBot';

const WhatsAppBotSettings = () => {
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [accessToken, setAccessToken] = useState('');

  const { updateConfig } = useWhatsAppConfig();
  const { testBot } = useTestWhatsAppBot();
  const { data: sessions, isLoading } = useWhatsAppSessions();

  const handleSaveConfig = () => {
    updateConfig.mutate({
      webhook_url: webhookUrl,
      verify_token: verifyToken,
      access_token: accessToken
    });
  };

  const handleTestBot = () => {
    if (!testPhone || !testMessage) {
      return;
    }

    testBot.mutate({
      phone_number: testPhone,
      message: testMessage
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-green-600" />
        <h2 className="text-2xl font-bold">Bot WhatsApp</h2>
      </div>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração
          </CardTitle>
          <CardDescription>
            Configure as credenciais do WhatsApp Business API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://sua-url.com/whatsapp-bot"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verify-token">Verify Token</Label>
              <Input
                id="verify-token"
                placeholder="whatsapp_verify_token"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="access-token">Access Token</Label>
            <Input
              id="access-token"
              type="password"
              placeholder="Seu token de acesso do WhatsApp"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleSaveConfig}
            disabled={updateConfig.isPending}
            className="w-full md:w-auto"
          >
            <Webhook className="h-4 w-4 mr-2" />
            {updateConfig.isPending ? 'Salvando...' : 'Salvar Configuração'}
          </Button>
        </CardContent>
      </Card>

      {/* Test Bot Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Testar Bot
          </CardTitle>
          <CardDescription>
            Simule uma conversa com o bot para testar as funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-phone">Número de Teste</Label>
              <Input
                id="test-phone"
                placeholder="+5511999999999"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-message">Mensagem de Teste</Label>
              <Input
                id="test-message"
                placeholder="Digite uma mensagem..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
              />
            </div>
          </div>
          <Button 
            onClick={handleTestBot}
            disabled={testBot.isPending || !testPhone || !testMessage}
            className="w-full md:w-auto"
          >
            <Send className="h-4 w-4 mr-2" />
            {testBot.isPending ? 'Enviando...' : 'Testar Bot'}
          </Button>
        </CardContent>
      </Card>

      {/* Features Card */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades do Bot</CardTitle>
          <CardDescription>
            Recursos disponíveis no bot do WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Para Usuários (PMEs/Autônomos)
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full" />
                  Criar nova proposta
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full" />
                  Visualizar propostas existentes
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full" />
                  Enviar proposta por email
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full" />
                  Gerenciar clientes
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                Para Clientes
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full" />
                  Visualizar propostas recebidas
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full" />
                  Aceitar ou recusar propostas
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full" />
                  Acesso direto via WhatsApp
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-2 h-2 p-0 rounded-full" />
                  Notificações automáticas
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Sessões Ativas
          </CardTitle>
          <CardDescription>
            Conversas em andamento no WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Carregando sessões...</div>
          ) : sessions && sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session: any) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{session.phone_number}</div>
                    <div className="text-sm text-gray-500">
                      Etapa: {session.step} • {new Date(session.updated_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <Badge variant={session.step === 'start' ? 'secondary' : 'default'}>
                    {session.step === 'start' ? 'Inativo' : 'Ativo'}
                  </Badge>
                </div>
              ))}
              {sessions.length > 5 && (
                <div className="text-center text-sm text-gray-500 pt-2">
                  E mais {sessions.length - 5} sessões...
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma sessão ativa no momento</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Instruções de Configuração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <h4 className="font-semibold">1. Configurar Webhook no WhatsApp Business API</h4>
            <p className="text-sm text-gray-600 mb-3">
              Configure a URL do webhook no painel do WhatsApp Business API:
            </p>
            <code className="block p-2 bg-gray-100 rounded text-xs mb-4">
              https://pakrraqbjbkkbdnwkkbt.supabase.co/functions/v1/whatsapp-bot
            </code>

            <h4 className="font-semibold">2. Variáveis de Ambiente Necessárias</h4>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>• <code>WHATSAPP_ACCESS_TOKEN</code> - Token de acesso do WhatsApp</li>
              <li>• <code>WHATSAPP_PHONE_NUMBER_ID</code> - ID do número do WhatsApp Business</li>
            </ul>

            <h4 className="font-semibold">3. Como Usar</h4>
            <p className="text-sm text-gray-600">
              Os usuários podem enviar mensagens diretamente para o número do WhatsApp Business configurado. 
              O bot identificará automaticamente se é um usuário cadastrado ou um cliente e direcionará 
              para o fluxo apropriado.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppBotSettings;
