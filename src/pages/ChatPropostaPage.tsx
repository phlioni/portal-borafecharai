
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Send, MessageCircle, Bot, Sparkles, Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import ProposalTemplatePreview from '@/components/ProposalTemplatePreview';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatPropostaPage = () => {
  const { user } = useAuth();
  const { canCreateProposal, monthlyProposalCount, monthlyProposalLimit } = useUserPermissions();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🎯 Olá! Sou sua IA especializada em criar propostas comerciais profissionais.\n\n✨ **Como funciona:**\n• Descreva o projeto/serviço que você quer propor\n• Inclua informações do cliente, valor, prazo, etc.\n• Eu criarei uma proposta estruturada e atrativa\n\n💡 **Dica:** Quanto mais detalhes você fornecer, melhor será a proposta gerada!\n\nVamos começar? Me conte sobre o projeto que você quer propor!',
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  const [proposalData, setProposalData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    if (!canCreateProposal) {
      toast.error(`Limite de ${monthlyProposalLimit} propostas por mês atingido. Faça upgrade para o plano Professional.`);
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke('chat-proposal', {
        body: {
          messages: [...messages, { role: 'user', content: userMessage }],
          action: 'chat'
        }
      });

      if (response.error) {
        throw response.error;
      }

      const aiResponse = response.data.content;
      addMessage('assistant', aiResponse);

      // Verificar se a IA disse que pode gerar a proposta
      if (aiResponse.includes('Parece que já temos as informações principais! Quer que eu gere a proposta para você revisar?')) {
        setShowGenerateButton(true);
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao processar mensagem. Tente novamente.');
      addMessage('assistant', 'Desculpe, ocorreu um erro. Pode repetir sua mensagem?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateProposal = async () => {
    if (!canCreateProposal) {
      toast.error(`Limite de ${monthlyProposalLimit} propostas por mês atingido.`);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await supabase.functions.invoke('chat-proposal', {
        body: {
          messages: messages,
          action: 'generate'
        }
      });

      if (response.error) {
        throw response.error;
      }

      const proposalJson = JSON.parse(response.data.content);
      console.log('Proposta gerada:', proposalJson);

      // Criar proposta no banco
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .insert({
          user_id: user?.id,
          title: proposalJson.titulo,
          service_description: proposalJson.servico,
          detailed_description: proposalJson.descricao,
          value: proposalJson.valor ? parseFloat(proposalJson.valor) : null,
          delivery_time: proposalJson.prazo,
          observations: proposalJson.observacoes,
          template_id: 'moderno',
          status: 'rascunho'
        })
        .select()
        .single();

      if (proposalError) {
        throw proposalError;
      }

      // Preparar dados para preview
      const previewData = {
        title: proposalJson.titulo,
        client: proposalJson.cliente,
        value: proposalJson.valor ? parseFloat(proposalJson.valor) : undefined,
        deliveryTime: proposalJson.prazo,
        description: proposalJson.descricao,
        responsible: proposalJson.responsavel,
        email: proposalJson.email,
        phone: proposalJson.telefone,
        paymentMethod: proposalJson.pagamento
      };

      setProposalData(previewData);
      
      addMessage('assistant', `🎉 **Proposta criada com sucesso!**\n\n✅ Sua proposta foi salva como rascunho\n📝 Título: ${proposalJson.titulo}\n👤 Cliente: ${proposalJson.cliente}\n\nVocê pode visualizar o preview abaixo e depois:\n• Acessar suas propostas para editar\n• Enviar diretamente para o cliente\n• Criar uma nova proposta`);
      
      setShowGenerateButton(false);
      toast.success('Proposta criada com sucesso!');

    } catch (error) {
      console.error('Erro ao gerar proposta:', error);
      toast.error('Erro ao gerar proposta. Tente novamente.');
      addMessage('assistant', 'Desculpe, ocorreu um erro ao gerar a proposta. Pode tentar novamente?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={index} className="font-semibold text-gray-900 my-1">{line.slice(2, -2)}</div>;
      }
      if (line.startsWith('• ')) {
        return <div key={index} className="ml-4 text-gray-700">{line}</div>;
      }
      if (line.startsWith('🎯') || line.startsWith('✨') || line.startsWith('💡') || line.startsWith('🎉')) {
        return <div key={index} className="font-medium text-blue-700 my-2">{line}</div>;
      }
      return <div key={index} className="text-gray-700">{line}</div>;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Chat Proposta IA</h1>
                  <p className="text-sm text-gray-600">Crie propostas profissionais com inteligência artificial</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="hidden sm:flex">
                {monthlyProposalLimit ? `${monthlyProposalCount}/${monthlyProposalLimit}` : `${monthlyProposalCount}/∞`} propostas
              </Badge>
              
              <Button variant="outline" size="sm" asChild>
                <Link to="/nova-proposta">
                  <Plus className="h-4 w-4 mr-2" />
                  Manual
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="grid gap-6">
          {/* Chat */}
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                Conversa com IA
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4 h-96 overflow-y-auto mb-4 p-3 bg-gray-50 rounded-lg">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-medium text-blue-600">IA Assistant</span>
                        </div>
                      )}
                      
                      <div className={`text-sm ${message.role === 'user' ? 'text-white' : 'text-gray-700'}`}>
                        {message.role === 'assistant' ? formatMessage(message.content) : message.content}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-blue-600" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              <div className="space-y-3">
                {showGenerateButton && (
                  <Button
                    onClick={handleGenerateProposal}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Proposta Agora
                  </Button>
                )}

                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem... (pressione Enter para enviar)"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview da proposta */}
          {proposalData && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Preview da Proposta</h2>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link to="/propostas">Ver Todas as Propostas</Link>
                  </Button>
                  <Button onClick={() => setProposalData(null)} variant="ghost">
                    Fechar Preview
                  </Button>
                </div>
              </div>
              
              <ProposalTemplatePreview data={proposalData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPropostaPage;
