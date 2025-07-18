
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Bot, User, Loader, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCreateProposal } from '@/hooks/useProposals';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatPropostaPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createProposal = useCreateProposal();
  const { canCreateProposal, loading: permissionsLoading } = useUserPermissions();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou seu assistente especializado em criar propostas comerciais. Vou te ajudar a coletar todas as informações necessárias para criar uma proposta profissional. Vamos começar! Me conte sobre o projeto ou serviço que você quer propor.',
      timestamp: new Date()
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

  // Verificar se o usuário pode criar propostas
  useEffect(() => {
    if (!permissionsLoading && !canCreateProposal) {
      toast.error('Você não tem permissão para criar propostas. Verifique seu plano ou trial.');
      // Removido o redirecionamento automático - usuário permanece na página
    }
  }, [canCreateProposal, permissionsLoading]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Verificar novamente se pode criar propostas antes de enviar mensagem
    if (!canCreateProposal) {
      toast.error('Você não tem permissão para criar propostas. Verifique seu plano ou trial.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke('chat-proposal', {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          action: 'chat',
          user_id: user?.id
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao processar mensagem');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Verificar se a resposta contém a frase específica para mostrar o botão de gerar
      if (response.data.content.includes('Parece que já temos as informações principais! Quer que eu gere a proposta para você revisar?')) {
        setShowGenerateButton(true);
      }

    } catch (error) {
      console.error('Erro no chat:', error);
      
      // Se for erro de limite, mostrar mensagem específica
      if (error.message && error.message.includes('Limite de')) {
        toast.error(error.message);
        return;
      }
      
      toast.error('Erro ao processar sua mensagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateProposal = async () => {
    if (!canCreateProposal) {
      toast.error('Você não tem permissão para criar propostas. Verifique seu plano ou trial.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('chat-proposal', {
        body: {
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          action: 'generate',
          user_id: user?.id
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao gerar proposta');
      }

      const proposalData = JSON.parse(response.data.content);
      
      // Calcular valor total baseado nos itens do orçamento
      const totalValue = proposalData.budget_items?.reduce((total: number, item: any) => {
        return total + (item.quantity * item.unit_price);
      }, 0) || 0;

      // Buscar ou criar cliente se fornecido
      let clientId = null;
      if (proposalData.cliente && proposalData.cliente !== '') {
        // Tentar encontrar cliente existente
        const { data: existingClients } = await supabase
          .from('clients')
          .select('id')
          .eq('user_id', user!.id)
          .eq('name', proposalData.cliente)
          .maybeSingle();

        if (existingClients) {
          clientId = existingClients.id;
        } else {
          // Criar novo cliente
          const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert({
              user_id: user!.id,
              name: proposalData.cliente,
              email: proposalData.email || null,
              phone: proposalData.telefone || null
            })
            .select('id')
            .single();

          if (clientError) {
            console.error('Erro ao criar cliente:', clientError);
          } else {
            clientId = newClient.id;
          }
        }
      }

      // Criar proposta
      const newProposal = await createProposal.mutateAsync({
        title: proposalData.titulo,
        client_id: clientId,
        service_description: proposalData.servico,
        detailed_description: proposalData.descricao,
        value: totalValue > 0 ? totalValue : null,
        delivery_time: proposalData.prazo,
        validity_date: null,
        observations: proposalData.observacoes || null,
        status: 'rascunho',
        user_id: user!.id
      });

      // Salvar itens do orçamento se existirem
      if (proposalData.budget_items && proposalData.budget_items.length > 0) {
        const budgetItems = proposalData.budget_items.map((item: any) => ({
          proposal_id: newProposal.id,
          type: item.type,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        }));

        const { error: budgetError } = await supabase
          .from('proposal_budget_items')
          .insert(budgetItems);

        if (budgetError) {
          console.error('Erro ao salvar itens do orçamento:', budgetError);
        }
      }

      toast.success('Proposta gerada com sucesso!');
      navigate(`/propostas/${newProposal.id}/visualizar`);

    } catch (error) {
      console.error('Erro ao gerar proposta:', error);
      
      // Se for erro de limite, mostrar mensagem específica
      if (error.message && error.message.includes('Limite de')) {
        toast.error(error.message);
        return;
      }
      
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

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="h-8 w-8 text-blue-600" />
            Chat para Proposta
          </h1>
          <p className="text-gray-600 mt-1">Converse com nosso assistente para criar sua proposta</p>
        </div>
      </div>

      {/* Chat Container */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Assistente IA para Propostas
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-blue-600' : 'bg-gray-200'}`}>
                    {message.role === 'user' ? 
                      <User className="h-4 w-4 text-white" /> : 
                      <Bot className="h-4 w-4 text-gray-600" />
                    }
                  </div>
                  <div className={`rounded-lg p-3 ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Processando...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Generate Button */}
          {showGenerateButton && !isLoading && (
            <div className="p-4 border-t bg-green-50">
              <Button 
                onClick={generateProposal}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!canCreateProposal}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Proposta Agora
              </Button>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                onKeyPress={handleKeyPress}
                disabled={isLoading || !canCreateProposal}
                className="flex-1"
              />
              <Button 
                onClick={sendMessage} 
                disabled={isLoading || !inputMessage.trim() || !canCreateProposal}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatPropostaPage;
