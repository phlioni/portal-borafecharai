
import React from 'react';

interface BoraFecharLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const BoraFecharLogo = ({ size = 'md', className = '' }: BoraFecharLogoProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <img 
      src="/lovable-uploads/b448e5d6-3483-4c6e-850d-a7f464ab8d5e.png" 
      alt="BoraFecharAI Logo" 
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

export default BoraFecharLogo;
