import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Clock, FileText, ChevronRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useTrialStatus } from '@/hooks/useTrialStatus';

const TrialCallToAction = () => {
  const navigate = useNavigate();
  const { isAdmin } = useUserPermissions();
  const { 
    isInTrial, 
    daysRemaining, 
    proposalsUsed, 
    proposalsRemaining, 
    loading 
  } = useTrialStatus();

  // Não mostrar para admins ou se estiver carregando
  if (isAdmin || loading) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {isInTrial ? 'Período de Teste Ativo' : 'Experimente Grátis'}
              </h3>
              {isInTrial && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <Calendar className="h-3 w-3 mr-1" />
                  {daysRemaining} dias restantes
                </Badge>
              )}
            </div>
            
            <p className="text-gray-600 mb-4">
              {isInTrial 
                ? `Você tem ${proposalsRemaining} propostas restantes e ${daysRemaining} dias do seu período de teste. O que acabar primeiro determina o fim do período gratuito.`
                : 'Comece sua jornada com 15 dias grátis e até 20 propostas! O que acabar primeiro determina o fim do período gratuito.'
              }
            </p>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span>
                  {isInTrial 
                    ? `${proposalsUsed}/20 propostas usadas`
                    : 'Até 20 propostas grátis'
                  }
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  {isInTrial 
                    ? `${daysRemaining} ${daysRemaining === 1 ? 'dia restante' : 'dias restantes'}`
                    : '15 dias de acesso'
                  }
                </span>
              </div>
            </div>

            {isInTrial && (
              <div className="space-y-2 mb-4">
                {/* Barra de progresso das propostas */}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Propostas utilizadas</span>
                  <span>{proposalsUsed}/20</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(proposalsUsed / 20) * 100}%` }}
                  />
                </div>
                
                {/* Barra de progresso dos dias */}
                <div className="flex justify-between text-xs text-gray-500 mt-3">
                  <span>Tempo restante</span>
                  <span>{daysRemaining}/15 dias</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((15 - daysRemaining) / 15) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="ml-4">
            <Button 
              onClick={() => navigate('/configuracoes?tab=planos')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isInTrial ? 'Escolher Plano' : 'Começar Grátis'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {!isInTrial && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-xs text-gray-500">
              ✨ Período gratuito automático • ✨ 15 dias ou 20 propostas • ✨ Acesso completo aos templates
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrialCallToAction;