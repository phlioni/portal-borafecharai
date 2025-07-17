
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Gift, Sparkles, Trophy } from 'lucide-react';

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
      }, 5000); // Aumentar para 5 segundos

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show && !isVisible) return null;

  const confettiPieces = Array.from({ length: 100 }, (_, i) => (
    <div
      key={i}
      className={`absolute animate-[confetti_4s_ease-out_forwards] ${
        i % 6 === 0 ? 'bg-yellow-400 w-3 h-3' :
        i % 6 === 1 ? 'bg-pink-400 w-2 h-4' :
        i % 6 === 2 ? 'bg-blue-400 w-4 h-2' : 
        i % 6 === 3 ? 'bg-green-400 w-3 h-3' :
        i % 6 === 4 ? 'bg-purple-400 w-2 h-2' : 'bg-orange-400 w-3 h-2'
      } rounded-sm opacity-90`}
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    />
  ));

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Confetes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiPieces}
      </div>

      {/* Modal de celebração */}
      <div
        className={`bg-gradient-to-br from-white to-green-50 rounded-3xl p-10 max-w-lg mx-4 text-center shadow-2xl border-2 border-green-200 transform transition-all duration-700 ${
          isVisible ? 'scale-100 rotate-0' : 'scale-75 rotate-12'
        }`}
      >
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center animate-bounce shadow-lg">
            <Trophy className="h-12 w-12 text-white" />
            <Sparkles className="h-8 w-8 text-white absolute -top-2 -right-2 animate-pulse" />
            <Gift className="h-6 w-6 text-white absolute -bottom-1 -left-1 animate-pulse" />
          </div>
          
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            🎉 PARABÉNS! 🎉
          </h2>
          
          <p className="text-xl font-semibold text-gray-800 mb-4">
            Perfil Completado com Sucesso!
          </p>
          
          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 mb-6 border border-green-200">
            <p className="text-lg text-gray-700 mb-2">
              Você ganhou
            </p>
            <p className="text-3xl font-bold text-green-600 mb-2">
              5 PROPOSTAS EXTRAS
            </p>
            <p className="text-sm text-gray-600">
              para usar neste mês!
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-3 text-sm text-gray-500 bg-white/50 rounded-full px-4 py-2">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="font-medium">Suas propostas extras já estão disponíveis!</span>
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BonusCelebration;
