
import React from 'react';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlanLimitGuardProps {
  feature: 'createProposal' | 'analytics' | 'premiumTemplates';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PlanLimitGuard: React.FC<PlanLimitGuardProps> = ({ 
  feature, 
  children, 
  fallback 
}) => {
  const {
    canCreateProposal,
    canAccessAnalytics,
    canAccessPremiumTemplates,
    monthlyProposalCount,
    monthlyProposalLimit,
    loading,
    isAdmin
  } = useUserPermissions();

  if (loading) {
    return <div>Carregando...</div>;
  }

  const hasAccess = () => {
    switch (feature) {
      case 'createProposal':
        return canCreateProposal;
      case 'analytics':
        return canAccessAnalytics;
      case 'premiumTemplates':
        return canAccessPremiumTemplates;
      default:
        return false;
    }
  };

  const getFeatureInfo = () => {
    switch (feature) {
      case 'createProposal':
        return {
          title: 'Limite de Propostas Atingido',
          description: 'Você precisa de uma assinatura para criar propostas.',
          icon: Lock,
          upgradeText: 'Upgrade para Profissional'
        };
      case 'analytics':
        return {
          title: 'Analytics Disponível no Plano Profissional',
          description: 'Acesse relatórios detalhados e insights sobre suas propostas.',
          icon: Crown,
          upgradeText: 'Upgrade para Profissional'
        };
      case 'premiumTemplates':
        return {
          title: 'Templates Premium',
          description: 'Acesse templates avançados e personalizáveis.',
          icon: Crown,
          upgradeText: 'Upgrade para Profissional'
        };
      default:
        return {
          title: 'Recurso Bloqueado',
          description: 'Este recurso não está disponível no seu plano atual.',
          icon: Lock,
          upgradeText: 'Fazer Upgrade'
        };
    }
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const featureInfo = getFeatureInfo();
  const IconComponent = featureInfo.icon;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{featureInfo.title}</h1>
        <p className="text-muted-foreground">{featureInfo.description}</p>
      </div>

      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-6 max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <IconComponent className="w-8 h-8 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{featureInfo.title}</h2>
            <p className="text-muted-foreground">{featureInfo.description}</p>
          </div>

          <Link to="/planos">
            <Button className="w-full">
              {featureInfo.upgradeText}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlanLimitGuard;
