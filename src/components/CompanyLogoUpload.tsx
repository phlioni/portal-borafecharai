
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CompanyLogoUploadProps {
  currentLogoUrl: string | null;
  onLogoUpdate: (logoUrl: string | null) => void;
}

const CompanyLogoUpload: React.FC<CompanyLogoUploadProps> = ({
  currentLogoUrl,
  onLogoUpdate
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast.error('Você precisa estar logado para fazer upload');
      return;
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato de arquivo não suportado. Use JPEG, PNG, WebP ou SVG.');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setIsUploading(true);

    try {
      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      // Fazer upload do arquivo
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        toast.error('Erro ao fazer upload da imagem');
        return;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      // Atualizar a empresa com a nova URL da logo
      const { error: updateError } = await supabase
        .from('companies')
        .update({ logo_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Erro ao atualizar empresa:', updateError);
        toast.error('Erro ao salvar logo da empresa');
        return;
      }

      onLogoUpdate(publicUrl);
      toast.success('Logo atualizada com sucesso!');
    } catch (error) {
      console.error('Erro geral no upload:', error);
      toast.error('Erro inesperado no upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!user || !currentLogoUrl) return;

    try {
      // Remover do storage
      const fileName = `${user.id}/logo.${currentLogoUrl.split('.').pop()}`;
      await supabase.storage
        .from('company-logos')
        .remove([fileName]);

      // Atualizar empresa
      const { error } = await supabase
        .from('companies')
        .update({ logo_url: null })
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao remover logo:', error);
        toast.error('Erro ao remover logo');
        return;
      }

      onLogoUpdate(null);
      toast.success('Logo removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover logo:', error);
      toast.error('Erro ao remover logo');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <Label>Logo da Empresa</Label>
      
      {currentLogoUrl ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <img
                src={currentLogoUrl}
                alt="Logo da empresa"
                className="w-16 h-16 object-contain border rounded"
              />
              <div className="flex-1">
                <p className="font-medium">Logo atual</p>
                <p className="text-sm text-gray-500">
                  Esta logo será exibida em todas as suas propostas
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveLogo}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={`border-2 border-dashed transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
                <Camera className="h-full w-full" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Adicione a logo da sua empresa
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Arraste e solte uma imagem ou clique para selecionar
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="mb-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Arquivo
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500">
                Formatos: JPEG, PNG, WebP, SVG • Máximo: 5MB
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.svg"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default CompanyLogoUpload;
