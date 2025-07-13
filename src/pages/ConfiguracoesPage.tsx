
import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Settings, Image, Save, Trash2, Crown, Palette } from 'lucide-react';
import { toast } from 'sonner';
import SubscriptionPlanCard from '@/components/SubscriptionPlanCard';
import SubscriptionStatus from '@/components/SubscriptionStatus';

const ConfiguracoesPage = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'empresa';

  const [companyLogo, setCompanyLogo] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const plans = [
    {
      title: 'Essencial',
      description: 'Ideal para freelancers e pequenos projetos',
      price: 'R$ 49,90',
      productId: 'prod_SfuTlv2mX4TfJe',
      priceId: 'price_1234567890', // Será substituído por busca dinâmica
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
      priceId: 'price_0987654321', // Será substituído por busca dinâmica
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
      priceId: 'price_1122334455', // Será substituído por busca dinâmica
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

  const handleRemoveLogo = () => {
    setCompanyLogo('');
    localStorage.removeItem('company_logo');
    toast.success('Logo removida com sucesso!');
  };

  React.useEffect(() => {
    // Carregar configurações salvas
    const savedLogo = localStorage.getItem('company_logo');
    const savedName = localStorage.getItem('company_name');

    if (savedLogo) setCompanyLogo(savedLogo);
    if (savedName) setCompanyName(savedName);
  }, []);

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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="planos">
            <Crown className="h-4 w-4 mr-2" />
            Planos
          </TabsTrigger>
        </TabsList>

        {/* Empresa Tab */}
        <TabsContent value="empresa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Digite o nome da sua empresa"
                />
              </div>

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
                <p className="text-sm text-gray-500 mt-2">
                  Esta logo aparecerá em todas as suas propostas
                </p>
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>

          {/* Template Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Pré-visualização</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">
                  Exemplo de Proposta
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Para: Cliente Exemplo
                </p>
                {companyLogo && (
                  <div className="mt-4 p-4 bg-white rounded border">
                    <p className="text-sm text-gray-600 mb-2">Sua logo aparecerá assim:</p>
                    <img
                      src={companyLogo}
                      alt="Preview da logo"
                      className="h-12 w-auto mx-auto"
                    />
                  </div>
                )}
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
      </Tabs>
    </div>
  );
};

export default ConfiguracoesPage;
