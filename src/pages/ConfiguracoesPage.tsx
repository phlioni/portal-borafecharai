
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Settings, Image, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const ConfiguracoesPage = () => {
  const [companyLogo, setCompanyLogo] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Configurações
          </h1>
          <p className="text-gray-600 mt-1">Personalize sua empresa e propostas</p>
        </div>
      </div>

      {/* Company Settings */}
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
    </div>
  );
};

export default ConfiguracoesPage;
