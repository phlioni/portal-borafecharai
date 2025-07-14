
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Settings, Image, Save, Trash2, Crown, Palette, Building, MapPin, Globe, MessageSquare, Bot, Phone } from 'lucide-react';
import { toast } from 'sonner';
import SubscriptionPlanCard from '@/components/SubscriptionPlanCard';
import SubscriptionStatus from '@/components/SubscriptionStatus';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ConfiguracoesPage = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'meu-negocio';
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  const [companyLogo, setCompanyLogo] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado para dados completos da empresa
  const [companyData, setCompanyData] = useState({
    name: '',
    cnpj: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    countryCode: '+55',
    phone: '',
    email: '',
    website: '',
    description: '',
  });

  const [existingCompanyId, setExistingCompanyId] = useState<string | null>(null);

  const plans = [
    {
      title: 'Essencial',
      description: 'Ideal para freelancers e pequenos projetos',
      price: 'R$ 49,90',
      productId: 'prod_SfuTlv2mX4TfJe',
      priceId: 'price_1RkYeSIjvuQQ47Sw8EnT7Ojm', // Será substituído por busca dinâmica
      planTier: 'basico' as const,
      features: [
        { text: 'Até 10 propostas por mês', included: true },
        { text: 'Templates básicos', included: true },
        { text: 'Gestão de clientes', included: true },
        { text: 'Suporte por email', included: true },
        { text: 'Analytics básico', included: false },
        { text: 'Templates premium', included: false },
        { text: 'Suporte prioritário', included: false },
      ],
    },
    {
      title: 'Profissional',
      description: 'Para empresas que precisam de mais recursos',
      price: 'R$ 89,90',
      productId: 'prod_SfuTErakRcHMsq',
      priceId: 'price_1RkYeiIjvuQQ47SwXpP3Zhum', // Será substituído por busca dinâmica
      planTier: 'profissional' as const,
      popular: true,
      features: [
        { text: 'Propostas ilimitadas', included: true },
        { text: 'Templates básicos', included: true },
        { text: 'Templates premium', included: true },
        { text: 'Gestão avançada de clientes', included: true },
        { text: 'Analytics completo', included: true },
        { text: 'Suporte prioritário', included: true },
        { text: 'Colaboração em equipe', included: false },
      ],
    },
    {
      title: 'Equipes',
      description: 'Para equipes que precisam colaborar',
      price: 'R$ 149,90',
      productId: 'prod_SfuTPAmInfb3sD',
      priceId: 'price_1RkYetIjvuQQ47SwZ2whIJpy', // Será substituído por busca dinâmica
      planTier: 'equipes' as const,
      features: [
        { text: 'Propostas ilimitadas', included: true },
        { text: 'Todos os templates', included: true },
        { text: 'Gestão avançada de clientes', included: true },
        { text: 'Analytics completo', included: true },
        { text: 'Colaboração em equipe', included: true },
        { text: 'Usuários ilimitados', included: true },
        { text: 'Suporte premium 24/7', included: true },
      ],
    },
  ];

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Converter para base64 para preview (em produção, usaria Supabase Storage)
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setCompanyLogo(base64);
        localStorage.setItem('company_logo', base64);
        toast.success('Logo carregada com sucesso!');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao fazer upload da logo:', error);
      toast.error('Erro ao carregar a logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('company_name', companyName);
    toast.success('Configurações salvas com sucesso!');
  };
  
  // Carregar dados da empresa do Supabase
  const loadCompanyData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

      if (error) {
        console.error('Erro ao carregar dados da empresa:', error);
        return;
      }

      if (data && data.length > 0) {
        const company = data[0];
        setExistingCompanyId(company.id);
        setCompanyData({
          name: company.name || '',
          cnpj: company.cnpj || '',
          address: company.address || '',
          city: company.city || '',
          state: company.state || '',
          zipCode: company.zip_code || '',
          countryCode: company.country_code || '+55',
          phone: company.phone || '',
          email: company.email || '',
          website: company.website || '',
          description: company.description || '',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error);
    }
  };

  const handleSaveCompanyData = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    setIsSaving(true);

    try {
      const companyDataToSave = {
        user_id: user.id,
        name: companyData.name,
        cnpj: companyData.cnpj,
        address: companyData.address,
        city: companyData.city,
        state: companyData.state,
        zip_code: companyData.zipCode,
        country_code: companyData.countryCode,
        phone: companyData.phone,
        email: companyData.email,
        website: companyData.website,
        description: companyData.description,
      };

      let result;
      
      if (existingCompanyId) {
        // Atualizar empresa existente
        result = await supabase
          .from('companies')
          .update(companyDataToSave)
          .eq('id', existingCompanyId)
          .select();
      } else {
        // Criar nova empresa
        result = await supabase
          .from('companies')
          .insert(companyDataToSave)
          .select();
      }

      if (result.error) {
        console.error('Erro ao salvar dados da empresa:', result.error);
        toast.error('Erro ao salvar dados da empresa');
        return;
      }

      if (result.data && result.data.length > 0) {
        setExistingCompanyId(result.data[0].id);
      }

      toast.success('Dados da empresa salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar dados da empresa:', error);
      toast.error('Erro ao salvar dados da empresa');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveLogo = () => {
    setCompanyLogo('');
    localStorage.removeItem('company_logo');
    toast.success('Logo removida com sucesso!');
  };

  // Verificar se o usuário é admin
  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.email === 'admin@borafecharai.com') {
        setIsAdmin(true);
      } else {
        // Verificar se o usuário tem role de admin
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user?.id)
          .eq('role', 'admin')
          .single();
          
        if (userRoles) {
          setIsAdmin(true);
        }
      }
    };
    
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  React.useEffect(() => {
    // Carregar configurações salvas do localStorage (logo)
    const savedLogo = localStorage.getItem('company_logo');
    const savedName = localStorage.getItem('company_name');

    if (savedLogo) setCompanyLogo(savedLogo);
    if (savedName) setCompanyName(savedName);

    // Carregar dados da empresa do Supabase
    if (user) {
      loadCompanyData();
    }
  }, [user]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Configurações
          </h1>
          <p className="text-gray-600 mt-1">Gerencie sua empresa, planos e configurações</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : 'grid-cols-2'}`}>
          <TabsTrigger value="meu-negocio">
            <Building className="h-4 w-4 mr-2" />
            Meu Negócio
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="bot-telegram">
              <MessageSquare className="h-4 w-4 mr-2" />
              Bot Telegram
            </TabsTrigger>
          )}
          <TabsTrigger value="planos">
            <Crown className="h-4 w-4 mr-2" />
            Planos
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin">
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </TabsTrigger>
          )}
        </TabsList>


        {/* Meu Negócio Tab */}
        <TabsContent value="meu-negocio" className="space-y-6">
          {/* Logo da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Logo da Empresa
              </CardTitle>
              <CardDescription>
                Sua logo aparecerá em todas as propostas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Logo da Empresa</Label>
                <div className="mt-2 space-y-4">
                  {/* Logo Preview */}
                  {companyLogo && (
                    <div className="relative inline-block">
                      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <img
                          src={companyLogo}
                          alt="Logo da empresa"
                          className="h-24 w-auto object-contain"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2"
                        onClick={handleRemoveLogo}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      ) : (
                        <Upload className="h-8 w-8 text-gray-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {companyLogo ? 'Clique para alterar a logo' : 'Clique para fazer upload da logo'}
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG até 5MB
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {companyLogo && (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">
                    Exemplo de Proposta
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Para: Cliente Exemplo
                  </p>
                  <div className="mt-4 p-4 bg-white rounded border">
                    <p className="text-sm text-gray-600 mb-2">Sua logo aparecerá assim:</p>
                    <img
                      src={companyLogo}
                      alt="Preview da logo"
                      className="h-12 w-auto mx-auto"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dados Completos da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Dados Completos da Empresa
              </CardTitle>
              <CardDescription>
                Complete as informações da sua empresa para usar nas propostas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyNameFull">Nome da Empresa</Label>
                  <Input
                    id="companyNameFull"
                    value={companyData.name}
                    onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                    placeholder="Nome completo da empresa"
                  />
                </div>
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={companyData.cnpj}
                    onChange={(e) => setCompanyData({ ...companyData, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Endereço Completo</Label>
                <Input
                  id="address"
                  value={companyData.address}
                  onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={companyData.city}
                    onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={companyData.state}
                    onChange={(e) => setCompanyData({ ...companyData, state: e.target.value })}
                    placeholder="UF"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={companyData.zipCode}
                    onChange={(e) => setCompanyData({ ...companyData, zipCode: e.target.value })}
                    placeholder="00000-000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyPhone">Telefone</Label>
                  <div className="flex gap-2">
                    <Select
                      value={companyData.countryCode}
                      onValueChange={(value) => setCompanyData({ ...companyData, countryCode: value })}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+55">🇧🇷 +55</SelectItem>
                        <SelectItem value="+1">🇺🇸 +1</SelectItem>
                        <SelectItem value="+54">🇦🇷 +54</SelectItem>
                        <SelectItem value="+34">🇪🇸 +34</SelectItem>
                        <SelectItem value="+351">🇵🇹 +351</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="companyPhone"
                      className="flex-1"
                      value={companyData.phone}
                      onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    <Phone className="h-3 w-3 inline mr-1" />
                    Este telefone será usado pelo bot do Telegram para identificar você
                  </p>
                </div>
                <div>
                  <Label htmlFor="companyEmail">E-mail</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companyData.email}
                    onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                    placeholder="contato@empresa.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={companyData.website}
                  onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                  placeholder="https://www.empresa.com"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição da Empresa</Label>
                <textarea
                  id="description"
                  className="w-full p-3 border border-input rounded-md resize-none"
                  rows={4}
                  value={companyData.description}
                  onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                  placeholder="Descreva sua empresa, serviços e diferenciais..."
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSaveSettings} variant="outline" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Logo
                </Button>
                <Button onClick={handleSaveCompanyData} className="flex-1" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Salvando...' : 'Salvar Dados da Empresa'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bot Telegram Tab */}
        <TabsContent value="bot-telegram" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                Bot do Telegram
              </CardTitle>
              <CardDescription>
                Configure seu bot para criar propostas via Telegram
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bot className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Configure seu Bot do Telegram</h3>
                <p className="text-gray-600 mb-6">
                  Permita que seus clientes criem propostas diretamente pelo Telegram
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link to="/telegram-bot">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Configurar Bot
                  </Link>
                </Button>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Como funciona:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Cliente inicia conversa com o bot</li>
                  <li>• Bot identifica o cliente pelo telefone</li>
                  <li>• Coleta todas as informações da proposta</li>
                  <li>• Cria proposta automaticamente no sistema</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Planos Tab */}
        <TabsContent value="planos" className="space-y-6">
          {/* Subscription Status */}
          <SubscriptionStatus />

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <SubscriptionPlanCard
                key={index}
                title={plan.title}
                description={plan.description}
                price={plan.price}
                priceId={plan.priceId}
                productId={plan.productId}
                planTier={plan.planTier}
                features={plan.features}
                popular={plan.popular}
              />
            ))}
          </div>

          {/* Advanced Features */}
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-600" />
                Recursos Avançados
              </CardTitle>
              <CardDescription>
                Recursos exclusivos para planos premium
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <h4 className="font-medium">Templates Personalizados</h4>
                    <p className="text-sm text-gray-600">
                      Crie templates únicos para suas propostas
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Plano Equipes</Badge>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      <Link to="/templates-personalizados">
                        Acessar
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg border opacity-60">
                  <div>
                    <h4 className="font-medium">Integração API</h4>
                    <p className="text-sm text-gray-600">
                      Conecte com seus sistemas
                    </p>
                  </div>
                  <Badge variant="outline">Em breve</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle>Perguntas Frequentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Posso cancelar minha assinatura a qualquer momento?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Sim, você pode cancelar sua assinatura a qualquer momento através do portal do cliente.
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Existe período de teste gratuito?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Sim, oferecemos 15 dias de teste gratuito com até 20 propostas para novos usuários.
                  </p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Posso alterar meu plano depois?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Tab */}
        <TabsContent value="admin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-red-600" />
                Administração do Sistema
              </CardTitle>
              <CardDescription>
                Acesso restrito para administradores do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Gerenciamento de Usuários</h3>
                <p className="text-gray-600 mb-6">
                  Gerencie todos os usuários, permissões e configurações do sistema
                </p>
                <Button asChild className="bg-red-600 hover:bg-red-700">
                  <Link to="/gerenciamento-usuarios">
                    <Settings className="h-4 w-4 mr-2" />
                    Gerenciar Usuários
                  </Link>
                </Button>
              </div>
              
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">Funcionalidades disponíveis:</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Visualizar todos os usuários do sistema</li>
                  <li>• Ativar/inativar contas de usuários</li>
                  <li>• Gerenciar permissões e roles</li>
                  <li>• Configurar períodos de trial</li>
                  <li>• Excluir contas de usuários</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguracoesPage;
