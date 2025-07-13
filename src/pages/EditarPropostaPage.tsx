import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUpdateProposal } from '@/hooks/useProposals';
import { useCompanies } from '@/hooks/useCompanies';
import { toast } from 'sonner';

const EditarPropostaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const updateProposal = useUpdateProposal();
  const { data: companies } = useCompanies();

  const [formData, setFormData] = useState({
    title: '',
    company_id: '',
    service_description: '',
    detailed_description: '',
    value: '',
    delivery_time: '',
    validity_date: '',
    observations: '',
    template_id: 'moderno'
  });

  const { data: proposal, isLoading } = useQuery({
    queryKey: ['proposal', id],
    queryFn: async () => {
      if (!id) throw new Error('ID da proposta não fornecido');
      
      const { data, error } = await supabase
        .from('proposals')
        .select(`*, companies(*)`)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (proposal) {
      setFormData({
        title: proposal.title || '',
        company_id: proposal.company_id || '',
        service_description: proposal.service_description || '',
        detailed_description: proposal.detailed_description || '',
        value: proposal.value?.toString() || '',
        delivery_time: proposal.delivery_time || '',
        validity_date: proposal.validity_date || '',
        observations: proposal.observations || '',
        template_id: proposal.template_id || 'moderno'
      });
    }
  }, [proposal]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!id || !formData.title) {
      toast.error('Título é obrigatório');
      return;
    }

    try {
      await updateProposal.mutateAsync({
        id,
        updates: {
          title: formData.title,
          company_id: formData.company_id || null,
          service_description: formData.service_description || null,
          detailed_description: formData.detailed_description || null,
          value: formData.value ? parseFloat(formData.value.replace(/[^\d,]/g, '').replace(',', '.')) : null,
          delivery_time: formData.delivery_time || null,
          validity_date: formData.validity_date || null,
          observations: formData.observations || null,
          template_id: formData.template_id
        }
      });

      toast.success('Proposta atualizada com sucesso!');
      navigate('/propostas');
    } catch (error) {
      console.error('Erro ao atualizar proposta:', error);
      toast.error('Erro ao atualizar proposta');
    }
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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/propostas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Proposta</h1>
            <p className="text-gray-600 mt-1">Modifique os dados da proposta</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/propostas/${id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={updateProposal.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título da Proposta</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="company">Cliente</Label>
              <select
                id="company"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.company_id}
                onChange={(e) => handleInputChange('company_id', e.target.value)}
              >
                <option value="">Selecione um cliente</option>
                {companies?.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="service_description">Resumo do Serviço</Label>
              <Input
                id="service_description"
                value={formData.service_description}
                onChange={(e) => handleInputChange('service_description', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="detailed_description">Descrição Detalhada</Label>
              <Textarea
                id="detailed_description"
                rows={4}
                value={formData.detailed_description}
                onChange={(e) => handleInputChange('detailed_description', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="value">Valor</Label>
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="delivery_time">Prazo de Entrega</Label>
                <Input
                  id="delivery_time"
                  value={formData.delivery_time}
                  onChange={(e) => handleInputChange('delivery_time', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="validity_date">Validade</Label>
              <Input
                id="validity_date"
                type="date"
                value={formData.validity_date}
                onChange={(e) => handleInputChange('validity_date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                rows={3}
                value={formData.observations}
                onChange={(e) => handleInputChange('observations', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditarPropostaPage;