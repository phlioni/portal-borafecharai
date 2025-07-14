import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Bot, 
  Phone, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  Settings,
  Smartphone,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TelegramBotPage = () => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookConfigured, setWebhookConfigured] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [botUsername, setBotUsername] = useState('');

  // URL do webhook
  const webhookEndpoint = `https://pakrraqbjbkkbdnwkkbt.supabase.co/functions/v1/telegram-bot-webhook`;

  const configureWebhook = async () => {
    setIsConfiguring(true);
    
    try {
      console.log('Configurando webhook do Telegram...');
      const { data, error } = await supabase.functions.invoke('setup-telegram-webhook');
      
      console.log('Resposta da configuração:', data, error);
      
      if (error) {
        console.error('Erro ao configurar webhook:', error);
        toast.error(`Erro ao configurar webhook: ${error.message}`);
        return;
      }

      if (data?.success) {
        setWebhookConfigured(true);
        setWebhookUrl(data.webhook_url);
        toast.success('Webhook do Telegram configurado com sucesso!');
      } else {
        toast.error(data?.error || 'Erro ao configurar webhook');
        console.error('Erro na resposta:', data);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      toast.error('Erro na configuração do webhook');
    } finally {
      setIsConfiguring(false);
    }
  };

  const testWebhook = async () => {
    setIsTestingWebhook(true);
    
    try {
      // Fazer uma requisição de teste para o webhook
      const response = await fetch(webhookEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseText = await response.text();
      console.log('Resposta do teste:', response.status, responseText);

      if (response.ok) {
        toast.success('Webhook está funcionando! Status: ' + response.status);
      } else {
        toast.error('Webhook com problema. Status: ' + response.status);
      }
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
      toast.error('Erro ao conectar com o webhook');
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  const getWebhookInfo = () => {
    // Fazer requisição para obter informações do webhook
    return fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN || 'SEU_TOKEN'}/getWebhookInfo`)
      .then(res => res.json())
      .then(data => {
        console.log('Info do webhook:', data);
        return data;
      });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link to="/configuracoes" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Bot do Telegram</h1>
          <p className="text-gray-600 mt-1">Configure e gerencie seu bot de propostas no Telegram</p>
        </div>
      </div>

      {/* Debug Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Settings className="h-5 w-5" />
            Informações de Debug
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-blue-900 font-medium">URL do Webhook:</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input 
                value={webhookEndpoint} 
                readOnly 
                className="bg-white"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(webhookEndpoint)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={testWebhook}
              disabled={isTestingWebhook}
            >
              {isTestingWebhook ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Testar Webhook
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            Status do Bot
          </CardTitle>
          <CardDescription>
            Configure o webhook para começar a receber mensagens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Webhook do Telegram</span>
            </div>
            <div className="flex items-center gap-2">
              {webhookConfigured ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Configurado
                  </Badge>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <Badge variant="secondary">
                    Não Configurado
                  </Badge>
                </>
              )}
            </div>
          </div>

          <Button 
            onClick={configureWebhook}
            disabled={isConfiguring}
            className="w-full"
          >
            {isConfiguring ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Configurando...
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                {webhookConfigured ? 'Reconfigurar Webhook' : 'Configurar Webhook'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Passos para configurar o bot */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <MessageSquare className="h-5 w-5" />
            Passos para Configurar o Bot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-orange-200 text-orange-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-medium text-orange-900">Criar Bot no Telegram</p>
                <p className="text-sm text-orange-800">Envie /newbot para @BotFather no Telegram</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-orange-200 text-orange-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="font-medium text-orange-900">Copiar Token</p>
                <p className="text-sm text-orange-800">Guarde o token que o BotFather fornecer</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-orange-200 text-orange-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-medium text-orange-900">Adicionar Token no Supabase</p>
                <p className="text-sm text-orange-800">TELEGRAM_BOT_TOKEN nos secrets do Supabase</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-orange-200 text-orange-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <p className="font-medium text-orange-900">Configurar Webhook</p>
                <p className="text-sm text-orange-800">Clique no botão "Configurar Webhook" acima</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Como Funciona */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            Como Funciona
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-600" />
                <span className="font-medium">1. Identificação</span>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                O usuário compartilha o telefone para ser identificado na base de dados
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-green-600" />
                <span className="font-medium">2. Conversa Guiada</span>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                Bot coleta todas as informações necessárias para a proposta
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-600" />
                <span className="font-medium">3. Geração Automática</span>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                Proposta é criada automaticamente na conta do usuário
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-orange-600" />
                <span className="font-medium">4. Finalização</span>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                Usuário pode revisar e enviar a proposta pelo sistema web
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comandos do Bot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Comandos do Bot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <code className="text-sm font-mono">/start</code>
              <span className="text-sm text-gray-600">Inicia uma nova conversa</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <code className="text-sm font-mono">📱 Compartilhar Telefone</code>
              <span className="text-sm text-gray-600">Identifica o usuário no sistema</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <code className="text-sm font-mono">pular</code>
              <span className="text-sm text-gray-600">Pula campos opcionais</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TelegramBotPage;