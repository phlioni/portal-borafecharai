import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Bot, 
  Phone, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  Settings,
  Smartphone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TelegramBotPage = () => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [webhookConfigured, setWebhookConfigured] = useState(false);

  const configureWebhook = async () => {
    setIsConfiguring(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('setup-telegram-webhook');
      
      if (error) {
        console.error('Erro ao configurar webhook:', error);
        toast.error('Erro ao configurar webhook do Telegram');
        return;
      }

      if (data?.success) {
        setWebhookConfigured(true);
        toast.success('Webhook do Telegram configurado com sucesso!');
      } else {
        toast.error(data?.error || 'Erro ao configurar webhook');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro na configuração do webhook');
    } finally {
      setIsConfiguring(false);
    }
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

          {!webhookConfigured && (
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
                  Configurar Webhook
                </>
              )}
            </Button>
          )}
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

      {/* Informações do Bot */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">📱 Identificação por Telefone</h4>
            <p className="text-sm text-blue-800">
              O bot identifica usuários pelo telefone cadastrado na tabela de empresas/clientes. 
              Certifique-se de que os telefones estão cadastrados corretamente.
            </p>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">🤖 Templates Disponíveis</h4>
            <p className="text-sm text-green-800">
              O bot oferece os mesmos templates do sistema: Moderno, Executivo e Criativo.
            </p>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">⚡ Funcionalidade Completa</h4>
            <p className="text-sm text-purple-800">
              Coleta todas as informações: tipo de negócio, serviço, cliente, valores, prazos e observações.
            </p>
          </div>

          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">💾 Salvamento Automático</h4>
            <p className="text-sm text-orange-800">
              As propostas são salvas como rascunho e ficam disponíveis no sistema para revisão.
            </p>
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