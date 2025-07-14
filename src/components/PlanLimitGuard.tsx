
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

  // Debug para propostas
  if (feature === 'createProposal') {
    console.log('PlanLimitGuard - canCreateProposal:', canCreateProposal);
    console.log('PlanLimitGuard - isAdmin:', isAdmin);
    console.log('PlanLimitGuard - monthlyProposalCount:', monthlyProposalCount);
    console.log('PlanLimitGuard - monthlyProposalLimit:', monthlyProposalLimit);
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
          description: monthlyProposalLimit 
            ? `Você já criou ${monthlyProposalCount} de ${monthlyProposalLimit} propostas este mês.`
            : 'Você precisa de uma assinatura para criar propostas.',
          icon: Lock,
          upgradeText: 'Upgrade para Profissional para propostas ilimitadas'
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
    <Card className="border-dashed border-2 border-muted-foreground/25">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <IconComponent className="w-6 h-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg">{featureInfo.title}</CardTitle>
        <CardDescription>{featureInfo.description}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Link to="/planos">
          <Button variant="outline" className="w-full">
            {featureInfo.upgradeText}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default PlanLimitGuard;
