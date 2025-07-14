
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanies, useCreateCompany, useUpdateCompany } from '@/hooks/useCompanies';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useSubscription } from '@/hooks/useSubscription';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { toast } from 'sonner';
import CompanyLogoUpload from '@/components/CompanyLogoUpload';
import TemplatesPersonalizadosPage from './TemplatesPersonalizadosPage';

const ConfiguracoesPage = () => {
  const { user } = useAuth();
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const createCompanyMutation = useCreateCompany();
  const updateCompanyMutation = useUpdateCompany();
  const { canAccessPremiumTemplates } = useUserPermissions();
  const { subscribed, subscription_tier } = useSubscription();
  const { isInTrial } = useTrialStatus();
  const [companyData, setCompanyData] = useState({
    name: '',
    email: '',
    phone: '',
    cnpj: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country_code: '+55',
    description: '',
    logo_url: ''
  });

  React.useEffect(() => {
    if (companies && companies.length > 0) {
      const company = companies[0];
      setCompanyData({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        cnpj: company.cnpj || '',
        website: company.website || '',
        address: company.address || '',
        city: company.city || '',
        state: company.state || '',
        zip_code: company.zip_code || '',
        country_code: company.country_code || '+55',
        description: company.description || '',
        logo_url: company.logo_url || ''
      });
    }
  }, [companies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (companies && companies.length > 0) {
        await updateCompanyMutation.mutateAsync({
          id: companies[0].id,
          updates: companyData
        });
      } else {
        await createCompanyMutation.mutateAsync(companyData);
      }
    } catch (error) {
      toast.error('Erro ao salvar empresa');
    }
  };

  const handleLogoUpload = (url: string) => {
    setCompanyData({ ...companyData, logo_url: url });
  };

  const getUserStatus = () => {
    if (subscribed) {
      return {
        status: 'Assinante',
        tier: subscription_tier === 'basico' ? 'Básico' : 'Profissional',
        variant: 'default' as const
      };
    } else if (isInTrial) {
      return {
        status: 'Trial',
        tier: '15 dias',
        variant: 'secondary' as const
      };
    } else {
      return {
        status: 'Gratuito',
        tier: 'Limitado',
        variant: 'outline' as const
      };
    }
  };

  const userStatus = getUserStatus();

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas informações e preferências</p>
        </div>
        <Badge variant={userStatus.variant}>
          {userStatus.status} - {userStatus.tier}
        </Badge>
      </div>

      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="usuario">Usuário</TabsTrigger>
          {canAccessPremiumTemplates && (
            <TabsTrigger value="templates">Templates</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="empresa">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Configure os dados da sua empresa que aparecerão nas propostas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="logo">Logo da Empresa</Label>
                    <CompanyLogoUpload 
                      currentLogoUrl={companyData.logo_url}
                      onLogoChange={handleLogoUpload}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome da Empresa *</Label>
                      <Input
                        id="name"
                        value={companyData.name}
                        onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        value={companyData.cnpj}
                        onChange={(e) => setCompanyData({ ...companyData, cnpj: e.target.value })}
                        placeholder="00.000.000/0001-00"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={companyData.email}
                        onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={companyData.phone}
                        onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={companyData.website}
                      onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                      placeholder="https://www.exemplo.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={companyData.address}
                      onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={companyData.city}
                        onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={companyData.state}
                        onChange={(e) => setCompanyData({ ...companyData, state: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="zip_code">CEP</Label>
                      <Input
                        id="zip_code"
                        value={companyData.zip_code}
                        onChange={(e) => setCompanyData({ ...companyData, zip_code: e.target.value })}
                        placeholder="00000-000"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição da Empresa</Label>
                    <Textarea
                      id="description"
                      value={companyData.description}
                      onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                      rows={3}
                      placeholder="Breve descrição da empresa..."
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={companiesLoading || createCompanyMutation.isPending || updateCompanyMutation.isPending}
                >
                  {(createCompanyMutation.isPending || updateCompanyMutation.isPending) ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuario">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Usuário</CardTitle>
              <CardDescription>
                Suas informações pessoais e preferências de conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled />
                </div>
                
                <div>
                  <Label>Status da Conta</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant={userStatus.variant}>
                      {userStatus.status} - {userStatus.tier}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {canAccessPremiumTemplates && (
          <TabsContent value="templates">
            <TemplatesPersonalizadosPage />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ConfiguracoesPage;
