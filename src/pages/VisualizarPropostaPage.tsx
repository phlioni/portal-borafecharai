
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Send,
  Download,
  Edit,
  Eye,
  ExternalLink
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ModernoTemplate, ExecutivoTemplate, CriativoTemplate } from '@/components/ProposalTemplates';
import SendProposalModal from '@/components/SendProposalModal';
import { toast } from 'sonner';

const VisualizarPropostaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showSendModal, setShowSendModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string>('');

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

  React.useEffect(() => {
    // Carregar logo da empresa
    const savedLogo = localStorage.getItem('company_logo');
    if (savedLogo) {
      setCompanyLogo(savedLogo);
    }
  }, []);

  const handleSendProposal = async (emailData: any) => {
    if (!proposal) return;

    setIsSending(true);
    try {
      // Criar token temporário para acesso público
      const token = btoa(proposal.id);
      const publicUrl = `${window.location.origin}/proposta/${token}`;

      // Preparar dados para envio
      const emailContent = emailData.emailMessage.replace('[LINK_DA_PROPOSTA]', publicUrl);

      const response = await supabase.functions.invoke('send-proposal-email', {
        body: {
          proposalId: proposal.id,
          recipientEmail: emailData.recipientEmail,
          recipientName: emailData.recipientName,
          emailSubject: emailData.emailSubject,
          emailMessage: emailContent,
          publicUrl: publicUrl
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('Proposta enviada por email com sucesso!');
      setShowSendModal(false);
      
      // Atualizar status da proposta
      await supabase
        .from('proposals')
        .update({ status: 'enviada' })
        .eq('id', proposal.id);

    } catch (error) {
      console.error('Erro ao enviar proposta:', error);
      toast.error('Erro ao enviar proposta por email');
    } finally {
      setIsSending(false);
    }
  };

  const handleViewPublic = () => {
    if (!proposal) return;
    
    const token = btoa(proposal.id);
    const publicUrl = `/proposta/${token}`;
    window.open(publicUrl, '_blank');
  };

  const handleDownloadPDF = () => {
    if (!proposal) return;
    
    const token = btoa(proposal.id);
    const publicUrl = `/proposta/${token}`;
    window.open(publicUrl, '_blank');
    toast.info('A proposta foi aberta em uma nova aba. Use Ctrl+P para imprimir/salvar como PDF');
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

  const renderTemplate = () => {
    const templateId = proposal.template_id || 'moderno';
    
    switch (templateId) {
      case 'executivo':
        return <ExecutivoTemplate proposal={proposal} companyLogo={companyLogo} />;
      case 'criativo':
        return <CriativoTemplate proposal={proposal} companyLogo={companyLogo} />;
      default:
        return <ModernoTemplate proposal={proposal} companyLogo={companyLogo} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/propostas')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Visualizar Proposta</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-gray-600">#{proposal.id.substring(0, 8)}</p>
                <Badge className={getStatusBadge(proposal.status || 'rascunho')}>
                  {getStatusLabel(proposal.status || 'rascunho')}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleViewPublic}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Pública
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button variant="outline" onClick={() => navigate(`/propostas/editar/${proposal.id}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={() => setShowSendModal(true)}
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          </div>
        </div>

        {/* Proposal Preview */}
        <div className="bg-white rounded-lg shadow-sm p-1">
          <div className="transform scale-75 origin-top">
            {renderTemplate()}
          </div>
        </div>
      </div>

      {/* Send Modal */}
      <SendProposalModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        onSend={handleSendProposal}
        proposalTitle={proposal.title}
        clientName={proposal.companies?.name}
        clientEmail={proposal.companies?.email}
        isLoading={isSending}
      />
    </div>
  );
};

export default VisualizarPropostaPage;
