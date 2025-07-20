import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUserCompany, useUpdateUserCompany } from '@/hooks/useUserCompany';
import { useBusinessSegments } from '@/hooks/useBusinessSegments';
import BonusCelebration from '@/components/BonusCelebration';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import CompanyLogoUpload from '@/components/CompanyLogoUpload';
import { toast } from 'sonner';

const CompanyTab = () => {
  const { data: company, isLoading: companyLoading } = useUserCompany();
  const { data: businessSegments } = useBusinessSegments();
  const updateCompanyMutation = useUpdateUserCompany();
  const { data: status, isLoading, claimBonus, isClaiming, showCelebration, handleCelebrationComplete } = useProfileCompletion();

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
    logo_url: '',
    website: '',
    description: '',
    cnpj: ''
  });

  // Reivindicar automaticamente quando o bônus estiver disponível
  useEffect(() => {
    if (status?.canClaimBonus && !isClaiming) {
      console.log('Bônus disponível - reivindicando automaticamente');
      claimBonus();
    }
  }, [status?.canClaimBonus, claimBonus, isClaiming]);

  React.useEffect(() => {
    if (company) {
      // --- AJUSTE 1: Exibir o telefone sem o DDI +55 ---
      const localPhone = company.phone ? company.phone.replace(/^\+55/, '') : '';

      setFormData({
        name: company.name || '',
        email: company.email || '',
        phone: localPhone, // Usa o número local
        address: company.address || '',
        city: company.city || '',
        state: company.state || '',
        zip_code: company.zip_code || '',
        business_segment: company.business_segment || '',
        business_type_detail: company.business_type_detail || '',
        logo_url: company.logo_url || '',
        website: company.website || '',
        description: company.description || '',
        cnpj: company.cnpj || ''
      });
    }
  }, [company]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpdate = (logoUrl: string | null) => {
    setFormData(prev => ({ ...prev, logo_url: logoUrl || '' }));
  };

  const handleSave = () => {
    if (!company?.id) return;

    // --- AJUSTE 2: Lógica de validação e salvamento do telefone ---
    const rawPhone = formData.phone.replace(/\D/g, '');

    if (!formData.name || !formData.email || !rawPhone) {
      toast.error('Nome da empresa, e-mail e telefone são obrigatórios.');
      return;
    }

    if (!rawPhone.match(/^\d{10,11}$/)) {
      toast.error('Formato do telefone inválido. Use DDD + número, com 10 ou 11 dígitos.');
      return;
    }

    const phoneToSave = `+55${rawPhone}`;

    const updatesWithFormattedPhone = {
      ...formData,
      phone: phoneToSave,
    };

    updateCompanyMutation.mutate({
      id: company.id,
      updates: updatesWithFormattedPhone
    });
  };

  if (companyLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <p>Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
          <CardDescription>Gerencie as informações da sua empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CompanyLogoUpload
            currentLogoUrl={formData.logo_url}
            onLogoUpdate={handleLogoUpdate}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-name">Nome da Empresa *</Label>
              <Input
                id="company-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite o nome da empresa"
                required
              />
            </div>

            <div>
              <Label htmlFor="company-email">E-mail *</Label>
              <Input
                id="company-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contato@empresa.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="company-phone">Telefone *</Label>
              <Input
                id="company-phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                // --- AJUSTE 3: Placeholder atualizado ---
                placeholder="11999999999"
                required
              />
            </div>

            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => handleInputChange('cnpj', e.target.value)}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div>
              <Label htmlFor="address">Endereço *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Rua, número, bairro"
                required
              />
            </div>

            <div>
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Digite a cidade"
                required
              />
            </div>

            <div>
              <Label htmlFor="state">Estado *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="Digite o estado"
                required
              />
            </div>

            <div>
              <Label htmlFor="zip-code">CEP *</Label>
              <Input
                id="zip-code"
                value={formData.zip_code}
                onChange={(e) => handleInputChange('zip_code', e.target.value)}
                placeholder="00000-000"
                required
              />
            </div>

            <div>
              <Label htmlFor="business-segment">Segmento de Negócio *</Label>
              <Select value={formData.business_segment} onValueChange={(value) => handleInputChange('business_segment', value)}>
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

            <div>
              <Label htmlFor="business-type">Tipo de Negócio *</Label>
              <Input
                id="business-type"
                value={formData.business_type_detail}
                onChange={(e) => handleInputChange('business_type_detail', e.target.value)}
                placeholder="Ex: Consultoria, E-commerce, SaaS..."
                required
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.empresa.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição da Empresa</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva sua empresa e seus serviços..."
              rows={4}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={updateCompanyMutation.isPending}
            className="w-full"
          >
            {updateCompanyMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </CardContent>
      </Card>

      {/* <BonusCelebration
        show={showCelebration}
        onComplete={handleCelebrationComplete}
      /> */}
    </>
  );
};

export default CompanyTab;