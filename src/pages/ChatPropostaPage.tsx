
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Bot, User, FileText, ArrowLeft, Lightbulb } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateProposal } from '@/hooks/useProposals';
import { useCreateBudgetItem } from '@/hooks/useBudgetItems';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
}

const ChatPropostaPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createProposal = useCreateProposal();
  const createBudgetItem = useCreateBudgetItem();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Olá! Vou te ajudar a criar uma proposta comercial profissional. Para começar, me conte sobre o projeto ou serviço que você quer propor.'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-proposal', {
        body: {
          messages: [...messages, userMessage].map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          action: 'chat'
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.content
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Verificar se deve mostrar o botão de gerar proposta
      if (data.content.includes("Parece que já temos as informações principais! Quer que eu gere a proposta para você revisar?")) {
        setShowGenerateButton(true);
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao processar mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  const generateProposal = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    setIsLoading(true);
    setShowGenerateButton(false);

    try {
      const { data, error } = await supabase.functions.invoke('chat-proposal', {
        body: {
          messages: messages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          action: 'generate'
        }
      });

      if (error) throw error;

      console.log('Resposta da Edge Function:', data);

      let proposalData;
      try {
        // Tentar fazer parse do JSON, com tratamento para possíveis problemas
        const jsonString = data.content.trim();
        console.log('JSON string recebido:', jsonString);
        
        // Remover possíveis caracteres inválidos no início/fim
        const cleanJson = jsonString.replace(/^[^{]*({.*})[^}]*$/s, '$1');
        console.log('JSON limpo:', cleanJson);
        
        proposalData = JSON.parse(cleanJson);
        console.log('Dados parseados:', proposalData);
      } catch (parseError) {
        console.error('Erro ao fazer parse dos dados:', parseError);
        console.error('Conteúdo original:', data.content);
        toast.error('Erro ao processar dados da proposta. Dados recebidos em formato inválido.');
        return;
      }

      // Validar dados obrigatórios
      if (!proposalData.titulo) {
        toast.error('Título da proposta é obrigatório');
        return;
      }

      // Calcular valor total baseado nos itens do orçamento
      let totalValue = 0;
      if (proposalData.budget_items && Array.isArray(proposalData.budget_items)) {
        totalValue = proposalData.budget_items.reduce((total: number, item: any) => {
          const quantity = parseFloat(item.quantity) || 0;
          const unitPrice = parseFloat(item.unit_price) || 0;
          return total + (quantity * unitPrice);
        }, 0);
      }

      console.log('Valor total calculado:', totalValue);

      // Criar a proposta
      const newProposal = await createProposal.mutateAsync({
        title: proposalData.titulo,
        service_description: proposalData.servico || '',
        detailed_description: proposalData.descricao || '',
        value: totalValue > 0 ? totalValue : null,
        delivery_time: proposalData.prazo || '',
        observations: proposalData.observacoes || '',
        template_id: 'standard',
        user_id: user.id,
        status: 'enviada'
      });

      console.log('Proposta criada:', newProposal);

      // Criar itens de orçamento se existirem
      if (proposalData.budget_items && Array.isArray(proposalData.budget_items) && proposalData.budget_items.length > 0) {
        console.log('Criando itens de orçamento:', proposalData.budget_items);
        
        for (const item of proposalData.budget_items) {
          if (item.description && item.quantity && item.unit_price) {
            const budgetItem = await createBudgetItem.mutateAsync({
              proposal_id: newProposal.id,
              type: item.type === 'labor' ? 'labor' : 'material',
              description: item.description,
              quantity: parseFloat(item.quantity) || 1,
              unit_price: parseFloat(item.unit_price) || 0
            });
            console.log('Item de orçamento criado:', budgetItem);
          }
        }
      }

      toast.success('Proposta criada com sucesso!');
      navigate(`/propostas/visualizar/${newProposal.id}`);

    } catch (error) {
      console.error('Erro ao gerar proposta:', error);
      toast.error('Erro ao gerar proposta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const tips = [
    "💡 Seja específico sobre o serviço ou produto",
    "💰 Inclua informações sobre materiais e mão de obra",
    "⏰ Mencione prazos de entrega realistas",
    "📋 Detalhe bem o escopo do trabalho",
    "🎯 Informe o nome e dados do cliente"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar com dicas */}
        <div className="hidden lg:block w-80 bg-white border-r border-gray-200 p-6">
          <div className="sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-900">Dicas para sua proposta</h3>
            </div>
            <div className="space-y-3">
              {tips.map((tip, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
                  {tip}
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Como funciona?</h4>
              <p className="text-sm text-green-700">
                Converse naturalmente comigo e eu vou coletando as informações necessárias para criar sua proposta profissional automaticamente.
              </p>
            </div>
          </div>
        </div>

        {/* Chat principal */}
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" asChild>
              <Link to="/propostas">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-blue-600" />
                Chat para Proposta
              </h1>
              <p className="text-gray-600">Converse comigo para criar sua proposta comercial</p>
            </div>
          </div>

          <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                Assistente de Propostas
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex items-start gap-2 max-w-[85%] ${
                        message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-full flex-shrink-0 ${
                          message.type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {message.type === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={`p-3 rounded-lg break-words ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2">
                      <div className="p-2 rounded-full bg-gray-200 text-gray-700">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="p-3 rounded-lg bg-gray-100">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Generate Button */}
              {showGenerateButton && (
                <div className="mb-4">
                  <Button
                    onClick={generateProposal}
                    disabled={isLoading}
                    className="w-full flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <FileText className="h-4 w-4" />
                    Gerar Proposta
                  </Button>
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatPropostaPage;
