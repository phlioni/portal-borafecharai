
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, Crown, RefreshCw } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SubscriptionStatus: React.FC = () => {
  const { subscribed, subscription_tier, subscription_end, loading, checkSubscription, openCustomerPortal } = useSubscription();

  const getTierColor = (tier: string | null) => {
    switch (tier) {
      case 'basico':
        return 'bg-blue-100 text-blue-800';
      case 'profissional':
        return 'bg-purple-100 text-purple-800';
      case 'equipes':
        return 'bg-gold-100 text-gold-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierName = (tier: string | null) => {
    switch (tier) {
      case 'basico':
        return 'Básico';
      case 'profissional':
        return 'Profissional';
      case 'equipes':
        return 'Equipes';
      default:
        return 'Gratuito';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Verificando assinatura...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span>Status da Assinatura</span>
            </CardTitle>
            <CardDescription>
              Gerencie sua assinatura e veja os detalhes do seu plano
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkSubscription}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Atualizar</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${subscribed ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="font-medium">
              {subscribed ? 'Assinatura Ativa' : 'Sem Assinatura'}
            </span>
          </div>
          <Badge className={getTierColor(subscription_tier)}>
            {getTierName(subscription_tier)}
          </Badge>
        </div>

        {subscribed && subscription_end && (
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              Próxima cobrança: {format(new Date(subscription_end), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          </div>
        )}

        {subscribed && (
          <div className="flex space-x-2">
            <Button
              onClick={openCustomerPortal}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <CreditCard className="h-4 w-4" />
              <span>Gerenciar Pagamento</span>
            </Button>
          </div>
        )}

        {!subscribed && (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">
              Você está no plano gratuito. Assine um plano para acessar recursos premium.
            </p>
            <Button
              onClick={() => window.location.href = '/planos'}
              className="flex items-center space-x-2"
            >
              <Crown className="h-4 w-4" />
              <span>Ver Planos</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;
