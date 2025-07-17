
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, User, Building2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';

const ProfileCompletionAlert = () => {
  const { data: status, isLoading } = useProfileCompletion();

  // Não mostrar nada se estiver carregando
  if (isLoading) {
    return null;
  }

  // Não mostrar se não há dados ou se já reivindicou o bônus
  if (!status || status.bonusAlreadyClaimed) {
    return null;
  }

  // Se perfil não está completo, mostrar aviso para completar
  if (!status.isProfileComplete) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Gift className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-blue-800">Complete seu perfil e ganhe 5 propostas extras!</h3>
                  <Badge variant="outline" className="border-blue-200 text-blue-700">
                    <Gift className="h-3 w-3 mr-1" />
                    Bônus Disponível
                  </Badge>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Preencha todas as informações do seu perfil e da sua empresa para ganhar propostas extras este mês.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <User className="h-3 w-3" />
                    <span>Perfil: Nome e Telefone</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <Building2 className="h-3 w-3" />
                    <span>Empresa: Nome, Email, Telefone, Endereço, Cidade, Segmento e Tipo de Negócio</span>
                  </div>
                </div>
              </div>
            </div>
            <Button asChild variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-100 shrink-0">
              <Link to="/configuracoes">
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Agora
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se chegou aqui, o perfil está completo mas ainda não foi processado
  // Não mostra nada na dashboard, pois a celebração aparecerá nas configurações
  return null;
};

export default ProfileCompletionAlert;
