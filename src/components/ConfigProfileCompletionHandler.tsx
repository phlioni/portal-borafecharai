
import React, { useEffect } from 'react';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import BonusCelebration from './BonusCelebration';

const ConfigProfileCompletionHandler = () => {
  const { data: status, isLoading, claimBonus, isClaiming, showCelebration, handleCelebrationComplete } = useProfileCompletion();

  useEffect(() => {
    // Reivindicar automaticamente quando o bônus estiver disponível
    // Mas apenas se estivermos na página de configurações
    if (status?.canClaimBonus && !isClaiming) {
      console.log('ConfigProfileCompletionHandler - Bônus disponível - reivindicando automaticamente');
      claimBonus();
    }
  }, [status?.canClaimBonus, claimBonus, isClaiming]);

  // Só mostrar se houver celebração ativa
  if (!showCelebration) {
    return null;
  }

  return (
    <BonusCelebration 
      show={showCelebration} 
      onComplete={handleCelebrationComplete} 
    />
  );
};

export default ConfigProfileCompletionHandler;
