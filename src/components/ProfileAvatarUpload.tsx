
import React, { useRef } from 'react';
import { Camera, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface ProfileAvatarUploadProps {
  currentAvatarUrl?: string | null;
  userName?: string | null;
  userEmail?: string;
  onAvatarUpdate: (avatarUrl: string | null) => void;
  onUpload: (file: File) => Promise<string | null>;
}

const ProfileAvatarUpload: React.FC<ProfileAvatarUploadProps> = ({
  currentAvatarUrl,
  userName,
  userEmail,
  onAvatarUpdate,
  onUpload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    try {
      console.log('Iniciando upload da imagem...', file.name);
      const avatarUrl = await onUpload(file);
      console.log('Upload concluído:', avatarUrl);
      
      if (avatarUrl) {
        onAvatarUpdate(avatarUrl);
        toast.success('Imagem atualizada com sucesso!');
      } else {
        toast.error('Erro ao fazer upload da imagem');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload da imagem');
    }
  };

  const getInitials = () => {
    if (userName) {
      return userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (userEmail) {
      return userEmail.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="w-24 h-24">
          {currentAvatarUrl ? (
            <AvatarImage src={currentAvatarUrl} alt="Avatar" />
          ) : (
            <AvatarFallback className="text-lg">
              {getInitials()}
            </AvatarFallback>
          )}
        </Avatar>
        
        <Button
          size="sm"
          variant="outline"
          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="w-3 h-3" />
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Clique no ícone da câmera para alterar sua foto
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Máximo 5MB - JPG, PNG ou GIF
        </p>
      </div>
    </div>
  );
};

export default ProfileAvatarUpload;
