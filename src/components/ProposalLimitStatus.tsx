
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Infinity } from 'lucide-react';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface ProposalLimitStatusProps {
  className?: string;
  showDetails?: boolean;
}

const ProposalLimitStatus: React.FC<ProposalLimitStatusProps> = ({ 
  className = '', 
  showDetails = true 
}) => {
  const { 
    monthlyProposalCount, 
    monthlyProposalLimit, 
    getRemainingProposals, 
    getUsagePercentage,
    isAdmin,
    loading 
  } = useUserPermissions();

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const remaining = getRemainingProposals();
  const usagePercentage = getUsagePercentage();
  const isUnlimited = isAdmin || monthlyProposalLimit === null;
  const isNearLimit = !isUnlimited && remaining !== null && remaining <= 2;
  const isAtLimit = !isUnlimited && remaining === 0;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Propostas este mês</h3>
          {isUnlimited ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Infinity className="h-3 w-3 mr-1" />
              Ilimitado
            </Badge>
          ) : isAtLimit ? (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Limite atingido
            </Badge>
          ) : isNearLimit ? (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Quase no limite
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Dentro do limite
            </Badge>
          )}
        </div>

        {showDetails && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                {monthlyProposalCount} {isUnlimited ? 'criadas' : `de ${monthlyProposalLimit}`}
              </span>
              {!isUnlimited && (
                <span className="text-sm font-medium text-gray-900">
                  {remaining} restantes
                </span>
              )}
            </div>

            {!isUnlimited && (
              <Progress 
                value={usagePercentage} 
                className="h-2"
                // Color based on usage
                color={usagePercentage >= 90 ? 'red' : usagePercentage >= 70 ? 'yellow' : 'blue'}
              />
            )}

            {!isUnlimited && isAtLimit && (
              <p className="text-xs text-red-600 mt-2">
                Faça upgrade do seu plano para criar mais propostas
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProposalLimitStatus;
