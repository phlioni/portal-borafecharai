
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, CheckCircle, AlertCircle } from 'lucide-react';

const TelegramBotUserGuide = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Como usar o Bot do Telegram
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Bot Disponível</h4>
                <p className="text-blue-700 text-sm">
                  O bot do Telegram já está configurado e pronto para uso. 
                  Você pode receber notificações sobre suas propostas diretamente no Telegram.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Funcionalidades disponíveis:</h4>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Send className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-gray-900">Notificações de Propostas</h5>
                  <p className="text-sm text-gray-600">
                    Receba notificações quando suas propostas forem visualizadas pelos clientes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-gray-900">Status das Propostas</h5>
                  <p className="text-sm text-gray-600">
                    Acompanhe quando suas propostas são aceitas ou rejeitadas
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-green-700 border-green-300">
                Ativo
              </Badge>
              <span className="text-sm text-gray-600">
                Bot configurado e funcionando
              </span>
            </div>
            <p className="text-xs text-gray-500">
              As notificações serão enviadas automaticamente quando houver atividade em suas propostas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TelegramBotUserGuide;
