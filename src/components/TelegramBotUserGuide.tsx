
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, CheckCircle, AlertCircle, Bot, FileText, Bell, Users, ExternalLink, Copy } from 'lucide-react';
import { toast } from 'sonner';

const TelegramBotUserGuide = () => {
  const copyBotUsername = () => {
    navigator.clipboard.writeText('@borafecharai_bot');
    toast.success('Username do bot copiado!');
  };

  const openTelegramBot = () => {
    window.open('https://t.me/borafecharai_bot', '_blank');
  };

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
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 mb-1">Bot Disponível - @borafecharai_bot</h4>
                <p className="text-green-700 text-sm mb-3">
                  O bot do Telegram já está configurado e pronto para uso. 
                  Você pode criar propostas e receber notificações diretamente no Telegram.
                </p>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    onClick={openTelegramBot}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Abrir Bot
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={copyBotUsername}
                    className="border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copiar @borafecharai_bot
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">🚀 Funcionalidades disponíveis:</h4>
            
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Bot className="h-6 w-6 text-blue-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-blue-900">Criar Proposta Completa</h5>
                  <p className="text-sm text-blue-700 mt-1">
                    Crie propostas profissionais conversando com o bot. Ele coletará informações do cliente, 
                    serviços, valores e prazos de forma intuitiva.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <Bell className="h-6 w-6 text-orange-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-orange-900">Notificações em Tempo Real</h5>
                  <p className="text-sm text-orange-700 mt-1">
                    Receba notificações instantâneas quando suas propostas forem visualizadas, 
                    aceitas ou rejeitadas pelos clientes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <FileText className="h-6 w-6 text-purple-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-purple-900">Consultar Status</h5>
                  <p className="text-sm text-purple-700 mt-1">
                    Acompanhe o status de todas as suas propostas diretamente no Telegram, 
                    com informações completas sobre cada uma.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-2">📋 Como começar:</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="bg-yellow-100 text-yellow-800 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium">1</span>
                    <p className="text-sm text-yellow-800">
                      Procure por <strong>@borafecharai_bot</strong> no Telegram ou clique no botão "Abrir Bot" acima
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-yellow-100 text-yellow-800 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium">2</span>
                    <p className="text-sm text-yellow-800">
                      Inicie uma conversa enviando <code className="bg-yellow-100 px-1 rounded">/start</code>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-yellow-100 text-yellow-800 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium">3</span>
                    <p className="text-sm text-yellow-800">
                      Compartilhe seu telefone quando solicitado (para identificação da sua conta)
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-yellow-100 text-yellow-800 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium">4</span>
                    <p className="text-sm text-yellow-800">
                      Escolha "🆕 Criar Nova Proposta" e siga as instruções do bot
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">💡 Dicas importantes:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Certifique-se de que seu telefone está cadastrado em "Configurações {'>'}  Meu Negócio"</li>
              <li>• O bot funciona 24/7 - você pode criar propostas a qualquer hora</li>
              <li>• Todas as propostas criadas pelo bot são salvas automaticamente no sistema</li>
              <li>• Você pode acompanhar e editar as propostas também pelo painel web</li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default" className="bg-green-100 text-green-700 border-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ativo
              </Badge>
              <span className="text-sm text-gray-600">
                Bot configurado e funcionando
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TelegramBotUserGuide;
