
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bot, User, FileText, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ProposalData {
  title: string;
  company_name?: string;
  service_description?: string;
  detailed_description?: string;
  value?: number;
  delivery_time?: string;
  validity_date?: string;
  observations?: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  budget_items?: Array<{
    type: 'material' | 'labor';
    description: string;
    quantity: number;
    unit_price: number;
  }>;
}

const ChatPropostaPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou seu assistente para criação de propostas comerciais. Vou te ajudar a criar uma proposta profissional. Para começar, me conte sobre o projeto ou serviço que você quer propor.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  const [proposalData, setProposalData] = useState<ProposalData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('Enviando mensagem para chat-proposal:', {
        message: input.trim(),
        conversation_history: messages
      });

      const response = await supabase.functions.invoke('chat-proposal', {
        body: {
          message: input.trim(),
          conversation_history: messages
        }
      });

      console.log('Resposta recebida:', response);

      if (response.error) {
        throw response.error;
      }

      const { message, show_generate_button } = response.data;

      const assistantMessage: Message = {
        role: 'assistant',
        content: message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (show_generate_button) {
        setShowGenerateButton(true);
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao processar mensagem. Tente novamente.');
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Pode repetir sua mensagem?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateProposal = async () => {
    // Por enquanto, apenas navegar para a página de nova proposta
    // TODO: Implementar geração automática baseada na conversa
    toast.info('Redirecionando para criar proposta...');
    navigate('/propostas/nova');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const tips = [
    "Seja específico sobre o escopo do projeto",
    "Mencione prazos e entregas esperadas",
    "Inclua informações sobre o cliente",
    "Detalhe os serviços ou produtos",
    "Especifique valores e condições de pagamento",
    "Adicione observações importantes"
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Chat Principal */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto">
        <div className="bg-white border-b p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Assistente de Propostas</h1>
              <p className="text-gray-600 text-sm">Vamos criar sua proposta comercial juntos</p>
            </div>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  {message.role === 'assistant' && (
                    <Bot className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  )}
                  {message.role === 'user' && (
                    <User className="h-5 w-5 text-white mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border shadow-sm rounded-lg p-4 max-w-[80%]">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Botão de Gerar Proposta */}
        {showGenerateButton && (
          <div className="p-4 bg-yellow-50 border-t border-yellow-200">
            <Button 
              onClick={handleGenerateProposal}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <FileText className="h-5 w-5 mr-2" />
              Gerar Proposta
            </Button>
          </div>
        )}

        {/* Input de Mensagem */}
        <div className="p-4 bg-white border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Painel de Dicas - Lado Direito */}
      <div className="w-80 bg-white border-l">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <h2 className="font-semibold">Dicas para uma boa proposta</h2>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                {index + 1}
              </div>
              <p className="text-sm text-gray-700">{tip}</p>
            </div>
          ))}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-600">
            💡 <strong>Dica:</strong> Quanto mais detalhes você fornecer, melhor será sua proposta!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPropostaPage;
