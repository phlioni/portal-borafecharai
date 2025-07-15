
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Save } from 'lucide-react';
import { useCompanies, useUpdateCompany, useCreateCompany } from '@/hooks/useCompanies';
import { toast } from 'sonner';

export const CompanySettings = () => {
  const { data: companies, isLoading } = useCompanies();
  const updateCompanyMutation = useUpdateCompany();
  const createCompanyMutation = useCreateCompany();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    cnpj: '',
    description: ''
  });

  const company = companies?.[0];

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        website: company.website || '',
        address: company.address || '',
        city: company.city || '',
        state: company.state || '',
        zip_code: company.zip_code || '',
        cnpj: company.cnpj || '',
        description: company.description || ''
      });
    }
  }, [company]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      if (company) {
        await updateCompanyMutation.mutateAsync({ id: company.id, updates: formData });
      } else {
        await createCompanyMutation.mutateAsync(formData);
      }
      toast.success('Informações da empresa salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar informações da empresa');
    }
  };

  const isSaving = updateCompanyMutation.isPending || createCompanyMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Informações do Negócio
        </CardTitle>
        <CardDescription>
          Configure as informações da sua empresa que aparecerão nas propostas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome da Empresa *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Sua Empresa Ltda"
              disabled={isLoading || isSaving}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="contato@empresa.com"
              disabled={isLoading || isSaving}
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(11) 99999-9999"
              disabled={isLoading || isSaving}
            />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://www.empresa.com"
              disabled={isLoading || isSaving}
            />
          </div>
          <div>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={formData.cnpj}
              onChange={(e) => handleInputChange('cnpj', e.target.value)}
              placeholder="00.000.000/0000-00"
              disabled={isLoading || isSaving}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição da Empresa</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Breve descrição do seu negócio..."
            rows={3}
            disabled={isLoading || isSaving}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Rua, número"
              disabled={isLoading || isSaving}
            />
          </div>
          <div>
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="São Paulo"
              disabled={isLoading || isSaving}
            />
          </div>
          <div>
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="SP"
              disabled={isLoading || isSaving}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={isLoading || isSaving} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? 'Salvando...' : 'Salvar Informações'}
        </Button>
      </CardContent>
    </Card>
  );
};
