
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export const TelegramBotSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Configurações do Telegram Bot
        </CardTitle>
        <CardDescription>
          Configure seu bot do Telegram para receber notificações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">
          Funcionalidade do Telegram Bot em desenvolvimento.
        </p>
      </CardContent>
    </Card>
  );
};
