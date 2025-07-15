
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Bot, 
  Phone, 
  FileText, 
  Mic, 
  Mail, 
  Sparkles,
  CheckCircle,
  AlertCircle,
  Clock,
  User
} from 'lucide-react';

const TelegramBotUserGuideEnhanced = () => {
  return (
    <div className="space-y-6">
      {/* Introdução */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            Como usar o Bot do Telegram
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Bot Inteligente com IA</h4>
                  <p className="text-sm text-blue-800">
                    Nosso bot usa inteligência artificial para criar propostas automaticamente a partir 
                    de suas descrições em texto ou áudio, identificando informações importantes e 
                    solicitando dados que ainda faltam.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primeiro Acesso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-600" />
            Primeiro Acesso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">1</Badge>
              <div>
                <p className="font-medium text-gray-900">Iniciar conversa</p>
                <p className="text-sm text-gray-600">
                  Envie <code className="bg-gray-100 px-1 rounded">/start</code> para o bot
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">2</Badge>
              <div>
                <p className="font-medium text-gray-900">Compartilhar telefone</p>
                <p className="text-sm text-gray-600">
                  Clique no botão "📱 Compartilhar Telefone" que aparecerá
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">3</Badge>
              <div>
                <p className="font-medium text-gray-900">Autenticação automática</p>
                <p className="text-sm text-gray-600">
                  O bot verificará se seu telefone está cadastrado no seu perfil do sistema
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900 mb-1">Importante:</h4>
                <p className="text-sm text-amber-800">
                  Certifique-se de que seu número de telefone está cadastrado no seu perfil 
                  do sistema web antes de usar o bot.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Criando Propostas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Criando Propostas com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">1</Badge>
              <div>
                <p className="font-medium text-gray-900">Escolher "Criar Nova Proposta"</p>
                <p className="text-sm text-gray-600">
                  No menu principal, clique em "📝 Criar Nova Proposta"
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">2</Badge>
              <div>
                <p className="font-medium text-gray-900">Descrever o projeto</p>
                <p className="text-sm text-gray-600 mb-2">
                  Envie uma mensagem de texto ou áudio descrevendo:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Qual serviço será prestado</li>
                  <li>• Valor da proposta (se souber)</li>
                  <li>• Prazo de entrega</li>
                  <li>• Detalhes importantes</li>
                  <li>• Informações do cliente</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">3</Badge>
              <div>
                <p className="font-medium text-gray-900">IA processa automaticamente</p>
                <p className="text-sm text-gray-600">
                  A IA analisará sua descrição e extrairá as informações estruturadas
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">4</Badge>
              <div>
                <p className="font-medium text-gray-900">Completar informações</p>
                <p className="text-sm text-gray-600">
                  Se faltar alguma informação, o bot pedirá especificamente o que precisa
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">5</Badge>
              <div>
                <p className="font-medium text-gray-900">Confirmar e criar</p>
                <p className="text-sm text-gray-600">
                  Revise o resumo e confirme a criação da proposta
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Mic className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-900 mb-1">Suporte a Áudio:</h4>
                <p className="text-sm text-purple-800">
                  Você pode enviar mensagens de voz! O bot irá transcrever automaticamente 
                  usando IA e processar as informações da mesma forma que texto.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enviando por Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-600" />
            Enviando Propostas por Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">1</Badge>
              <div>
                <p className="font-medium text-gray-900">Após criar a proposta</p>
                <p className="text-sm text-gray-600">
                  O bot oferecerá a opção "📧 Enviar por Email"
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">2</Badge>
              <div>
                <p className="font-medium text-gray-900">Informar email do cliente</p>
                <p className="text-sm text-gray-600">
                  Digite o email do cliente que receberá a proposta
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">3</Badge>
              <div>
                <p className="font-medium text-gray-900">Confirmar envio</p>
                <p className="text-sm text-gray-600">
                  Confirme o email e a proposta será enviada automaticamente
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-indigo-900 mb-1">O que o cliente recebe:</h4>
                <p className="text-sm text-indigo-800">
                  Um email com link para visualizar a proposta online, onde poderá 
                  aceitar, rejeitar ou solicitar alterações.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recursos Avançados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-emerald-600" />
            Recursos Avançados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                <span className="font-medium text-gray-900">Transcrição de Áudio</span>
              </div>
              <p className="text-sm text-gray-600">
                Mensagens de voz são automaticamente transcritas e processadas pela IA
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span className="font-medium text-gray-900">Análise Inteligente</span>
              </div>
              <p className="text-sm text-gray-600">
                IA identifica automaticamente informações faltantes na proposta
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-600" />
                <span className="font-medium text-gray-900">Perfil Integrado</span>
              </div>
              <p className="text-sm text-gray-600">
                Usa automaticamente seu nome e dados do perfil nas propostas
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600" />
                <span className="font-medium text-gray-900">Sessões Persistentes</span>
              </div>
              <p className="text-sm text-gray-600">
                Mantém o contexto da conversa entre as mensagens
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comandos Úteis */}
      <Card>
        <CardHeader>
          <CardTitle>Comandos Úteis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <code className="bg-white px-2 py-1 rounded text-sm">/start</code>
                <p className="text-sm text-gray-600 mt-1">Reinicia a conversa e volta ao menu principal</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="bg-white px-2 py-1 rounded text-sm">📝 Criar Nova Proposta</span>
                <p className="text-sm text-gray-600 mt-1">Inicia o processo de criação com IA</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="bg-white px-2 py-1 rounded text-sm">📋 Minhas Propostas</span>
                <p className="text-sm text-gray-600 mt-1">Lista suas últimas propostas criadas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TelegramBotUserGuideEnhanced;
