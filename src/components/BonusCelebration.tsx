
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Gift, Sparkles } from 'lucide-react';

interface BonusCelebrationProps {
  show: boolean;
  onComplete: () => void;
}

const BonusCelebration: React.FC<BonusCelebrationProps> = ({ show, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 500); // Aguarda a animação de saída
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show && !isVisible) return null;

  const confettiPieces = Array.from({ length: 50 }, (_, i) => (
    <div
      key={i}
      className={`absolute w-2 h-2 opacity-80 animate-[confetti_3s_ease-out_forwards] ${
        i % 4 === 0 ? 'bg-yellow-400' :
        i % 4 === 1 ? 'bg-pink-400' :
        i % 4 === 2 ? 'bg-blue-400' : 'bg-green-400'
      }`}
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    />
  ));

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Confetes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiPieces}
      </div>

      {/* Modal de celebração */}
      <div
        className={`bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl transform transition-all duration-500 ${
          isVisible ? 'scale-100 rotate-0' : 'scale-75 rotate-12'
        }`}
      >
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center animate-bounce">
            <Gift className="h-10 w-10 text-white" />
            <Sparkles className="h-6 w-6 text-white absolute -top-2 -right-2 animate-pulse" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            🎉 Parabéns! 🎉
          </h2>
          
          <p className="text-lg text-gray-600 mb-6">
            Você completou seu perfil e ganhou <br/>
            <span className="text-2xl font-bold text-green-600">5 propostas extras</span> <br/>
            para usar neste mês!
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Sparkles className="h-4 w-4" />
            <span>Suas propostas extras já estão disponíveis!</span>
            <Sparkles className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BonusCelebration;
