
import React, { useEffect } from 'react';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import BonusCelebration from './BonusCelebration';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg p-6 max-w-md mx-4">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={handleCelebrationComplete}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <BonusCelebration 
          show={showCelebration} 
          onComplete={handleCelebrationComplete} 
        />
      </div>
    </div>
  );
};

export default ConfigProfileCompletionHandler;
