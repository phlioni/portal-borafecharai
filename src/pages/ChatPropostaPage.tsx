import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User, 
  Wand2,
  Palette,
  Eye,
  Save,
  MessageSquare,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreateProposal } from '@/hooks/useProposals';
import { useCreateCompany } from '@/hooks/useCompanies';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ProposalTemplatePreview from '@/components/ProposalTemplatePreview';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  showGenerateButton?: boolean;
};

const ChatPropostaPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createProposal = useCreateProposal();
  const createCompany = useCreateCompany();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Vou te ajudar a criar uma proposta profissional. Para começar, me conte sobre o projeto que você quer propor. Qual é o tipo de serviço ou produto?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('moderno');
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposalData, setProposalData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const templates = [
    {
      id: 'moderno',
      name: 'Moderno',
      description: 'Design limpo e profissional',
      color: 'bg-blue-500'
    },
    {
      id: 'executivo',
      name: 'Executivo',
      description: 'Estilo corporativo',
      color: 'bg-gray-800'
    },
    {
      id: 'criativo',
      name: 'Criativo',
      description: 'Visual diferenciado',
      color: 'bg-purple-500'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-proposal', {
        body: { 
          messages: newMessages,
          action: 'chat'
        }
      });

      if (error) {
        console.error('Erro na função chat-proposal:', error);
        throw error;
      }

      if (data?.content) {
        // Verificar se a IA sugeriu gerar a proposta com a frase específica
        const showGenerateButton = data.content.includes('Parece que já temos as informações principais! Quer que eu gere a proposta para você revisar?');
        
        const assistantMessage = { 
          role: 'assistant' as const, 
          content: data.content,
          showGenerateButton 
        };
        
        setMessages([...newMessages, assistantMessage]);
      } else {
        throw new Error('Resposta vazia da IA');
      }
    } catch (error) {
      console.error('Erro no chat:', error);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
      
      // Adicionar uma resposta de fallback
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: 'Desculpe, houve um erro. Pode repetir sua pergunta? Estou aqui para ajudar com sua proposta.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateProposalPreview = async () => {    
    setIsGenerating(true);
    
    try {
      console.log('Gerando preview com mensagens:', messages);
      
      const { data, error } = await supabase.functions.invoke('chat-proposal', {
        body: { 
          messages: messages,
          action: 'generate'
        }
      });

      if (error) {
        console.error('Erro na função chat-proposal (generate):', error);
        throw error;
      }

      console.log('Resposta da função generate:', data);

      if (data?.content) {
        try {
          const parsedData = JSON.parse(data.content);
          console.log('Dados parseados:', parsedData);
          
          setProposalData(parsedData);
          setShowPreview(true);
          toast.success('Proposta gerada! Revise as informações antes de confirmar.');
        } catch (parseError) {
          console.error('Erro ao processar dados:', parseError);
          console.log('Conteúdo que falhou no parse:', data.content);
          
          // Tentar criar dados de fallback baseados na conversa
          const fallbackData = {
            titulo: 'Proposta Comercial',
            cliente: 'Cliente',
            servico: 'Serviço solicitado',
            descricao: 'Descrição baseada na conversa',
            valor: '0',
            prazo: 'A definir'
          };
          
          setProposalData(fallbackData);
          setShowPreview(true);
          toast.warning('Preview gerado com dados básicos. Revise e ajuste conforme necessário.');
        }
      } else {
        throw new Error('Resposta vazia da função de geração');
      }
    } catch (error) {
      console.error('Erro ao gerar proposta:', error);
      toast.error('Erro ao gerar proposta. Tente novamente ou continue a conversa.');
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmAndCreateProposal = async () => {
    if (!user || !proposalData) {
      toast.error('Dados insuficientes para criar a proposta');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      let companyId = null;
      if (proposalData.cliente && proposalData.cliente !== 'Cliente') {
        const companyResult = await createCompany.mutateAsync({
          user_id: user.id,
          name: proposalData.cliente,
          email: proposalData.email || null,
          phone: proposalData.telefone || null
        });
        companyId = companyResult.id;
      }

      const proposalValue = proposalData.valor ? 
        parseFloat(proposalData.valor.toString().replace(/[^\d,]/g, '').replace(',', '.')) : 
        null;

      await createProposal.mutateAsync({
        user_id: user.id,
        company_id: companyId,
        title: proposalData.titulo || 'Proposta Comercial',
        service_description: proposalData.servico || 'Serviço',
        detailed_description: proposalData.descricao || 'Descrição do serviço',
        value: proposalValue,
        delivery_time: proposalData.prazo || 'A definir',
        observations: proposalData.observacoes || null,
        template_id: selectedTemplate,
        status: 'rascunho'
      });

      toast.success('Proposta criada com sucesso!');
      navigate('/propostas');
    } catch (error) {
      console.error('Erro ao criar proposta:', error);
      toast.error('Erro ao criar proposta. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setProposalData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" asChild>
            <Link to="/propostas" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Chat IA - Criação de Proposta</h1>
            <p className="text-gray-600 mt-1">Converse com a IA para criar sua proposta automaticamente</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Assistente de Propostas
                </CardTitle>
              </CardHeader>
              
              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' ? 'bg-blue-600' : 'bg-gray-200'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                       <div className={`rounded-lg p-3 ${
                         message.role === 'user' 
                           ? 'bg-blue-600 text-white' 
                           : 'bg-gray-100 text-gray-800'
                       }`}>
                         <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                         {message.showGenerateButton && (
                           <div className="mt-3 pt-3 border-t border-gray-200">
                             <Button
                               onClick={generateProposalPreview}
                               disabled={isGenerating}
                               className="w-full bg-green-600 hover:bg-green-700 text-white"
                               size="sm"
                             >
                               {isGenerating ? (
                                 <>
                                   <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                   Gerando Proposta...
                                 </>
                               ) : (
                                 <>
                                   <Wand2 className="h-3 w-3 mr-2" />
                                   ✨ Gerar Proposta Agora
                                 </>
                               )}
                             </Button>
                           </div>
                         )}
                       </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </CardContent>
              
              {/* Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={isLoading || !input.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Template
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      selectedTemplate === template.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${template.color}`} />
                      <div>
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-gray-600">{template.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Generate Preview Button */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Pré-visualizar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={generateProposalPreview}
                  disabled={isGenerating || messages.length < 3}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Gerar Preview
                    </>
                  )}
                </Button>
                {messages.length < 3 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Continue conversando para coletar mais informações
                  </p>
                )}
                {messages.length >= 3 && (
                  <p className="text-xs text-green-700 mt-2 font-medium">
                    ✅ Pronto para gerar proposta!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 text-sm">💡 Dicas</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-800 space-y-2">
                <p>• Seja específico sobre o serviço</p>
                <p>• Mencione valores e prazos</p>
                <p>• Inclua dados do cliente</p>
                <p>• Detalhe o que será entregue</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && proposalData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Pré-visualização da Proposta</h2>
                  <Button variant="ghost" onClick={closePreview} className="p-2">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="mb-6">
                  <ProposalTemplatePreview
                    data={{
                      title: proposalData.titulo || 'Título da Proposta',
                      client: proposalData.cliente || 'Nome do Cliente',
                      value: proposalData.valor ? parseFloat(proposalData.valor.toString().replace(/[^\d,]/g, '').replace(',', '.')) : undefined,
                      deliveryTime: proposalData.prazo || 'A definir',
                      description: proposalData.descricao || proposalData.servico || 'Descrição do serviço',
                      template: selectedTemplate
                    }}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <Button variant="outline" onClick={closePreview}>
                    Voltar ao Chat
                  </Button>
                  <Button
                    onClick={confirmAndCreateProposal}
                    disabled={isGenerating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Criando...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Confirmar e Criar Proposta
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPropostaPage;