
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  CreditCard, 
  Crown, 
  RefreshCw, 
  AlertTriangle, 
  X,
  ExternalLink 
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const SubscriptionStatus: React.FC = () => {
  const { 
    subscribed, 
    subscription_tier, 
    subscription_end, 
    cancel_at_period_end,
    loading, 
    checkSubscription, 
    openCustomerPortal,
    cancelSubscription 
  } = useSubscription();
  
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [canceling, setCanceling] = useState(false);

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
        return 'Essencial';
      case 'profissional':
        return 'Professional';
      case 'equipes':
        return 'Equipes';
      default:
        return 'Gratuito';
    }
  };

  const handleCancelSubscription = async () => {
    setCanceling(true);
    try {
      await cancelSubscription();
      setShowCancelConfirm(false);
    } catch (error) {
      console.error('Error canceling subscription:', error);
    } finally {
      setCanceling(false);
    }
  };

  const handleOpenCustomerPortal = async () => {
    try {
      await openCustomerPortal();
    } catch (error) {
      // Erro já tratado no hook
      console.error('Error opening customer portal:', error);
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
            {cancel_at_period_end && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Cancelamento Agendado
              </Badge>
            )}
          </div>
          <Badge className={getTierColor(subscription_tier)}>
            {getTierName(subscription_tier)}
          </Badge>
        </div>

        {subscribed && subscription_end && (
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              {cancel_at_period_end 
                ? `Acesso até: ${format(new Date(subscription_end), 'dd/MM/yyyy', { locale: ptBR })}`
                : `Próxima cobrança: ${format(new Date(subscription_end), 'dd/MM/yyyy', { locale: ptBR })}`
              }
            </span>
          </div>
        )}

        {cancel_at_period_end && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Cancelamento Agendado</p>
                <p className="text-yellow-700">
                  Sua assinatura será cancelada no final do período atual. 
                  Você continuará tendo acesso a todos os recursos até lá.
                </p>
              </div>
            </div>
          </div>
        )}

        {subscribed && (
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleOpenCustomerPortal}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <CreditCard className="h-4 w-4" />
              <span>Gerenciar Planos</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
            
            {!cancel_at_period_end && (
              <Button
                onClick={() => setShowCancelConfirm(true)}
                variant="outline"
                className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
                <span>Cancelar Plano</span>
              </Button>
            )}
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

        {/* Modal de Confirmação de Cancelamento */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-red-100 rounded-full p-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Cancelar Assinatura
                </h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja cancelar sua assinatura? Você continuará tendo acesso 
                a todos os recursos até o final do período atual, mas não será cobrado novamente.
              </p>
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowCancelConfirm(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={canceling}
                >
                  Manter Assinatura
                </Button>
                <Button
                  onClick={handleCancelSubscription}
                  variant="destructive"
                  className="flex-1"
                  disabled={canceling}
                >
                  {canceling ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Cancelando...
                    </>
                  ) : (
                    'Confirmar Cancelamento'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;
