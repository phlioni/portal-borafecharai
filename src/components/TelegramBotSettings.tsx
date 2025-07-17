
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Bot, ExternalLink, Copy } from 'lucide-react';
import { useTelegramBot } from '@/hooks/useTelegramBot';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const TelegramBotSettings = () => {
  const { settings, loading, saveSettings } = useTelegramBot();
  const [formData, setFormData] = useState({
    bot_token: '',
    bot_username: ''
  });
  const [isConfiguring, setIsConfiguring] = useState(false);
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
        toast.error('Bot salvo, mas erro ao configurar webhook');
      } else {
        console.log('Webhook configurado:', data);
        
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
      toast.error('Erro ao configurar bot');
    } finally {
      setIsConfiguring(false);
    }
  };

  const testBot = async () => {
    if (!formData.bot_token) {
      toast.error('Configure o bot primeiro');
      return;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${formData.bot_token}/getMe`);
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
      <div className="flex items-center justify-center p-8">
        <Bot className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status */}
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
          <Badge variant="outline" className="flex items-center gap-1">
            <Bot className="h-4 w-4" />
            @{formData.bot_username}
          </Badge>
        )}
      </div>

      {/* Configuration Form */}
      <div className="space-y-4">
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
      </div>
    </div>
  );
};

export default TelegramBotSettings;
