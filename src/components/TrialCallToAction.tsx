import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Clock, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserPermissions } from '@/hooks/useUserPermissions';

const TrialCallToAction = () => {
  const navigate = useNavigate();
  const { isAdmin, monthlyProposalCount, monthlyProposalLimit } = useUserPermissions();

  // Não mostrar para admins
  if (isAdmin) return null;

  const isInTrial = monthlyProposalLimit === 20;
  const proposalsLeft = isInTrial ? (20 - monthlyProposalCount) : 0;

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
                  <Clock className="h-3 w-3 mr-1" />
                  15 dias grátis
                </Badge>
              )}
            </div>
            
            <p className="text-gray-600 mb-4">
              {isInTrial 
                ? `Você tem ${proposalsLeft} propostas restantes no seu período de teste.`
                : 'Comece sua jornada com 15 dias grátis e até 20 propostas!'
              }
            </p>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span>
                  {isInTrial 
                    ? `${monthlyProposalCount}/20 propostas usadas`
                    : 'Até 20 propostas grátis'
                  }
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>15 dias de acesso</span>
              </div>
            </div>

            {isInTrial && (
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(monthlyProposalCount / 20) * 100}%` }}
                />
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
              ✨ Sem cartão de crédito • ✨ Cancele a qualquer momento • ✨ Acesso completo aos templates
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrialCallToAction;