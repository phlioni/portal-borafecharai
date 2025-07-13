
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Calendar,
  DollarSign,
  Building,
  Mail,
  Phone,
  FileText,
  Send,
  Download,
  Edit
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const VisualizarPropostaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: proposal, isLoading } = useQuery({
    queryKey: ['proposal', id],
    queryFn: async () => {
      if (!id) throw new Error('ID da proposta não fornecido');
      
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          companies (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      'rascunho': 'bg-gray-100 text-gray-800',
      'enviada': 'bg-blue-100 text-blue-800',
      'aceita': 'bg-green-100 text-green-800',
      'rejeitada': 'bg-red-100 text-red-800'
    };
    
    return variants[status as keyof typeof variants] || variants.rascunho;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'rascunho': 'Rascunho',
      'enviada': 'Enviada',
      'aceita': 'Aceita',
      'rejeitada': 'Rejeitada'
    };
    
    return labels[status as keyof typeof labels] || 'Rascunho';
  };

  const getTemplateStyle = (templateId: string) => {
    const styles = {
      'moderno': 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200',
      'executivo': 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300',
      'criativo': 'bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200'
    };
    
    return styles[templateId as keyof typeof styles] || styles.moderno;
  };

  const handleSendProposal = async () => {
    if (!proposal) return;

    try {
      const response = await fetch('/functions/v1/send-proposal-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proposalId: proposal.id })
      });

      if (response.ok) {
        toast.success('Proposta enviada por email com sucesso!');
      } else {
        toast.error('Erro ao enviar proposta por email');
      }
    } catch (error) {
      console.error('Erro ao enviar proposta:', error);
      toast.error('Erro ao enviar proposta');
    }
  };

  const handleDownloadPDF = () => {
    toast.info('Funcionalidade de download em desenvolvimento');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Proposta não encontrada</h1>
        <Button asChild>
          <Link to="/propostas">Voltar para Propostas</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/propostas')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Visualizar Proposta</h1>
              <p className="text-gray-600">#{proposal.id.substring(0, 8)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button variant="outline" onClick={() => navigate(`/propostas/editar/${proposal.id}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSendProposal}>
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          </div>
        </div>

        {/* Proposal Preview */}
        <Card className={`${getTemplateStyle(proposal.template_id || 'moderno')} border-2`}>
          <CardHeader className="text-center pb-8">
            <div className="flex justify-between items-start mb-6">
              <Badge className={getStatusBadge(proposal.status || 'rascunho')}>
                {getStatusLabel(proposal.status || 'rascunho')}
              </Badge>
              <div className="text-right text-sm text-gray-600">
                <p>Data: {format(new Date(proposal.created_at), 'dd/MM/yyyy', { locale: ptBR })}</p>
                {proposal.validity_date && (
                  <p>Válida até: {format(new Date(proposal.validity_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                )}
              </div>
            </div>
            
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              {proposal.title}
            </CardTitle>
            
            {proposal.service_description && (
              <p className="text-lg text-gray-700 mb-6">
                {proposal.service_description}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Client Information */}
            {proposal.companies && (
              <div className="bg-white/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informações do Cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{proposal.companies.name}</p>
                  </div>
                  {proposal.companies.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{proposal.companies.email}</span>
                    </div>
                  )}
                  {proposal.companies.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{proposal.companies.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Service Details */}
            {proposal.detailed_description && (
              <div className="bg-white/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Descrição do Serviço
                </h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">
                    {proposal.detailed_description}
                  </p>
                </div>
              </div>
            )}

            {/* Financial Information */}
            <div className="bg-white/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Informações Financeiras
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {proposal.value && (
                  <div className="text-center md:text-left">
                    <p className="text-sm text-gray-600 mb-1">Valor Total</p>
                    <p className="text-3xl font-bold text-blue-600">
                      R$ {proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
                
                {proposal.delivery_time && (
                  <div className="text-center md:text-left">
                    <p className="text-sm text-gray-600 mb-1">Prazo de Entrega</p>
                    <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {proposal.delivery_time}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Observations */}
            {proposal.observations && (
              <div className="bg-white/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Observações Adicionais
                </h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {proposal.observations}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-8 border-t border-gray-200">
              <p className="text-gray-600">
                Esta proposta foi gerada automaticamente pelo sistema
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Template: {proposal.template_id || 'Moderno'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VisualizarPropostaPage;
