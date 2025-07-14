
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle, Bot, CheckCircle, AlertTriangle, Settings } from 'lucide-react';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useTelegramBot } from '@/hooks/useTelegramBot';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TelegramBotUserGuide from '@/components/TelegramBotUserGuide';

const TelegramBotPage = () => {
  const { isAdmin } = useUserPermissions();
  const { settings, loading, saveSettings } = useTelegramBot();
  const [formData, setFormData] = useState({
    bot_token: '',
    bot_username: ''
  });
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<'pending' | 'success' | 'error'>('pending');

  useEffect(() => {
    if (settings.bot_token) {
      setFormData({
        bot_token: settings.bot_token,
        bot_username: settings.bot_username || ''
      });
    }
  }, [settings]);

  const handleSave = async () => {
    if (!formData.bot_token.trim()) {
      toast.error('Token do bot é obrigatório');
      return;
    }

    setIsConfiguring(true);
    try {
      await saveSettings({
        bot_token: formData.bot_token,
        bot_username: formData.bot_username,
        webhook_configured: false
      });

      // Configure webhook
      const { data, error } = await supabase.functions.invoke('setup-telegram-webhook', {
        body: {
          bot_token: formData.bot_token
        }
      });

      if (error) {
        console.error('Erro ao configurar webhook:', error);
        setWebhookStatus('error');
        toast.error('Bot salvo, mas erro ao configurar webhook');
      } else {
        console.log('Webhook configurado:', data);
        setWebhookStatus('success');
        
        // Update webhook status in database
        await saveSettings({
          bot_token: formData.bot_token,
          bot_username: formData.bot_username,
          webhook_configured: true
        });
        
        toast.success('Bot configurado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setWebhookStatus('error');
      toast.error('Erro ao configurar bot');
    } finally {
      setIsConfiguring(false);
    }
  };

  const testBot = async () => {
    if (!settings.bot_token) {
      toast.error('Configure o bot primeiro');
      return;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${settings.bot_token}/getMe`);
      const data = await response.json();

      if (data.ok) {
        toast.success(`Bot "${data.result.first_name}" está funcionando!`);
        setFormData(prev => ({
          ...prev,
          bot_username: data.result.username || ''
        }));
      } else {
        toast.error('Token inválido ou bot não encontrado');
      }
    } catch (error) {
      console.error('Erro ao testar bot:', error);
      toast.error('Erro ao conectar com o Telegram');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" asChild>
            <Link to="/configuracoes?tab=integrações">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-blue-600" />
              Bot do Telegram
            </h1>
            <p className="text-gray-600">
              {isAdmin ? 'Configure e gerencie o bot do Telegram' : 'Como usar o bot do Telegram'}
            </p>
          </div>
        </div>

        {/* Admin Configuration */}
        {isAdmin ? (
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Status da Configuração
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {settings.bot_token ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Bot Configurado
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Bot Não Configurado
                    </Badge>
                  )}
                  
                  {settings.webhook_configured ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Webhook Ativo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Webhook Pendente
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Configuration Form */}
            <Card>
              <CardHeader>
                <CardTitle>Configuração do Bot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bot_token">Token do Bot</Label>
                  <Input
                    id="bot_token"
                    type="password"
                    value={formData.bot_token}
                    onChange={(e) => setFormData({...formData, bot_token: e.target.value})}
                    placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Obtenha o token conversando com @BotFather no Telegram
                  </p>
                </div>

                <div>
                  <Label htmlFor="bot_username">Username do Bot (opcional)</Label>
                  <Input
                    id="bot_username"
                    value={formData.bot_username}
                    onChange={(e) => setFormData({...formData, bot_username: e.target.value})}
                    placeholder="meu_bot"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave} 
                    disabled={isConfiguring}
                    className="flex items-center gap-2"
                  >
                    {isConfiguring ? (
                      <>
                        <Bot className="h-4 w-4 animate-spin" />
                        Configurando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Salvar Configuração
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={testBot}
                    disabled={!formData.bot_token}
                  >
                    Testar Bot
                  </Button>
                </div>

                {webhookStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Bot configurado com sucesso!</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      O webhook foi configurado e o bot está pronto para enviar notificações.
                    </p>
                  </div>
                )}

                {webhookStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-medium">Erro na configuração do webhook</span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">
                      O bot foi salvo, mas houve um problema ao configurar o webhook. 
                      Verifique se o token está correto.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Como criar um bot no Telegram</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>1.</strong> Abra o Telegram e procure por @BotFather
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>2.</strong> Envie o comando /newbot
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>3.</strong> Escolha um nome para seu bot
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>4.</strong> Escolha um username (deve terminar com 'bot')
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>5.</strong> Copie o token fornecido e cole no campo acima
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* User Guide */
          <TelegramBotUserGuide />
        )}
      </div>
    </div>
  );
};

export default TelegramBotPage;
