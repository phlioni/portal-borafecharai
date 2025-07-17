
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Loader2 } from 'lucide-react';

const TelegramBotSettings = () => {
  const [loading, setLoading] = useState(false);
  const [botToken, setBotToken] = useState('');

  const handleSave = async () => {
    setLoading(true);
    // Placeholder para funcionalidade futura
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bot_token">Token do Bot</Label>
          <Input
            id="bot_token"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            placeholder="Digite o token do seu bot do Telegram"
          />
        </div>
      </div>

      <Button 
        onClick={handleSave}
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Bot className="mr-2 h-4 w-4" />
            Salvar Configurações
          </>
        )}
      </Button>
    </div>
  );
};

export default TelegramBotSettings;
