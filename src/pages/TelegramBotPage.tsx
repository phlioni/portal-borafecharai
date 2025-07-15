
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle, Bot, CheckCircle, AlertTriangle, Settings, Copy, ExternalLink, Trash2 } from 'lucide-react';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useTelegramBot } from '@/hooks/useTelegramBot';
import { useTelegramSessions } from '@/hooks/useTelegramSessions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TelegramBotUserGuideEnhanced from '@/components/TelegramBotUserGuideEnhanced';

const TelegramBotPage = () => {
  const { isAdmin } = useUserPermissions();
  const { settings, loading, saveSettings } = useTelegramBot();
  const { sessions, loading: sessionsLoading, clearExpiredSessions, deleteSession } = useTelegramSessions();
  const [formData, setFormData] = useState({
    bot_token: '',
    bot_username: ''
  });
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [showToken, setShowToken] = useState(false);

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
    setWebhookStatus('pending');
    
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

  const copyBotUsername = () => {
    if (formData.bot_username) {
      navigator.clipboard.writeText(`@${formData.bot_username}`);
      toast.success('Username do bot copiado!');
    }
  };

  const openTelegramBot = () => {
    if (formData.bot_username) {
      window.open(`https://t.me/${formData.bot_username}`, '_blank');
    }
  };

  const handleCleanupSessions = async () => {
    const cleaned = await clearExpiredSessions();
    if (cleaned > 0) {
      toast.success(`${cleaned} sessões expiradas removidas`);
    } else {
      toast.info('Nenhuma sessão expirada encontrada');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Tem certeza que deseja deletar esta sessão?')) {
      await deleteSession(sessionId);
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
      <div className="p-6 max-w-6xl mx-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Admin Configuration */}
          {isAdmin && (
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
                  <div className="flex items-center gap-4 flex-wrap">
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

                    {formData.bot_username && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Bot className="h-4 w-4" />
                          @{formData.bot_username}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={copyBotUsername}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={openTelegramBot}
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
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
                    <div className="relative">
                      <Input
                        id="bot_token"
                        type={showToken ? "text" : "password"}
                        value={formData.bot_token}
                        onChange={(e) => setFormData({...formData, bot_token: e.target.value})}
                        placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => setShowToken(!showToken)}
                      >
                        {showToken ? '👁️' : '🙈'}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Obtenha o token conversando com @BotFather no Telegram
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="bot_username">Username do Bot</Label>
                    <Input
                      id="bot_username"
                      value={formData.bot_username}
                      onChange={(e) => setFormData({...formData, bot_username: e.target.value})}
                      placeholder="meu_bot"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Será preenchido automaticamente ao testar o bot
                    </p>
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
                          Salvar e Configurar
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={testBot}
                      disabled={!formData.bot_token || isConfiguring}
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
                        O webhook foi configurado e o bot está pronto para receber mensagens.
                      </p>
                      {formData.bot_username && (
                        <div className="mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={openTelegramBot}
                            className="text-green-700 border-green-300 hover:bg-green-100"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Abrir no Telegram
                          </Button>
                        </div>
                      )}
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
                        Verifique se o token está correto e tente novamente.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sessions Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Sessões Ativas
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCleanupSessions}
                      disabled={sessionsLoading}
                    >
                      Limpar Expiradas
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sessionsLoading ? (
                    <p className="text-gray-500">Carregando sessões...</p>
                  ) : sessions.length === 0 ? (
                    <p className="text-gray-500">Nenhuma sessão ativa encontrada.</p>
                  ) : (
                    <div className="space-y-2">
                      {sessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">Usuário: {session.telegram_user_id}</p>
                            <p className="text-sm text-gray-600">
                              Step: {session.step} | 
                              Atualizado: {new Date(session.updated_at).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSession(session.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* User Guide */}
          <div>
            <TelegramBotUserGuideEnhanced />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramBotPage;
