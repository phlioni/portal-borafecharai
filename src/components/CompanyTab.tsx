import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompanies, useUpdateCompany } from '@/hooks/useCompanies';
import { useBusinessSegments } from '@/hooks/useBusinessSegments';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import CompanyLogoUpload from './CompanyLogoUpload';

const CompanyTab = () => {
  const { data: companies, isLoading: loadingCompanies } = useCompanies();
  const { data: businessSegments, isLoading: loadingSegments } = useBusinessSegments();
  const updateCompanyMutation = useUpdateCompany();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    business_segment: '',
    business_type_detail: '',
    cnpj: '',
    website: '',
    description: '',
    logo_url: ''
  });

  const company = companies?.[0];

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        city: company.city || '',
        state: company.state || '',
        zip_code: company.zip_code || '',
        business_segment: company.business_segment || '',
        business_type_detail: company.business_type_detail || '',
        cnpj: company.cnpj || '',
        website: company.website || '',
        description: company.description || '',
        logo_url: company.logo_url || ''
      });
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!company) {
      toast.error('Erro: dados da empresa não encontrados');
      return;
    }

    // Validar campos obrigatórios
    if (!formData.name.trim()) {
      toast.error('Nome da empresa é obrigatório');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email é obrigatório');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Telefone é obrigatório');
      return;
    }

    if (!formData.address.trim()) {
      toast.error('Endereço é obrigatório');
      return;
    }

    if (!formData.city.trim()) {
      toast.error('Cidade é obrigatória');
      return;
    }

    if (!formData.business_segment.trim()) {
      toast.error('Segmento de Atuação é obrigatório');
      return;
    }

    if (!formData.business_type_detail.trim()) {
      toast.error('Tipo de Negócio é obrigatório');
      return;
    }

    console.log('Salvando dados da empresa:', formData);

    updateCompanyMutation.mutate({
      id: company.id,
      updates: formData
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loadingCompanies || loadingSegments) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <CompanyLogoUpload 
          currentLogoUrl={formData.logo_url} 
          onLogoUpdate={(url) => handleChange('logo_url', url)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Empresa *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Digite o nome da empresa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Digite o email da empresa"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Digite o telefone da empresa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={formData.cnpj}
              onChange={(e) => handleChange('cnpj', e.target.value)}
              placeholder="Digite o CNPJ (opcional)"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Endereço *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Digite o endereço completo"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Digite a cidade"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="Digite o estado"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip_code">CEP</Label>
            <Input
              id="zip_code"
              value={formData.zip_code}
              onChange={(e) => handleChange('zip_code', e.target.value)}
              placeholder="Digite o CEP"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="business_segment">Segmento de Atuação *</Label>
            <Select value={formData.business_segment} onValueChange={(value) => handleChange('business_segment', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o segmento" />
              </SelectTrigger>
              <SelectContent>
                {businessSegments?.map((segment) => (
                  <SelectItem key={segment.id} value={segment.segment_name}>
                    {segment.segment_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_type_detail">Tipo de Negócio *</Label>
            <Input
              id="business_type_detail"
              value={formData.business_type_detail}
              onChange={(e) => handleChange('business_type_detail', e.target.value)}
              placeholder="Ex: Consultoria, E-commerce, etc."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://www.exemplo.com.br (opcional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição da Empresa</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Descreva brevemente sua empresa (opcional)"
            rows={3}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={updateCompanyMutation.isPending}
        className="w-full"
      >
        {updateCompanyMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          'Salvar Alterações'
        )}
      </Button>
    </form>
  );
};

export default CompanyTab;
