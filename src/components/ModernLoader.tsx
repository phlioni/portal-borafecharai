
import React from 'react';

interface ModernLoaderProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ModernLoader = ({ 
  message = "Carregando...", 
  fullScreen = false,
  size = 'md' 
}: ModernLoaderProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center'
    : 'flex flex-col items-center justify-center p-8 space-y-4';

  return (
    <div className={containerClasses}>
      <div className="relative">
        {/* Spinner animado */}
        <div className={`${sizeClasses[size]} relative`}>
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        
        {/* Pulso interno */}
        <div className={`absolute inset-2 bg-blue-100 rounded-full animate-pulse`}></div>
      </div>
      
      {message && (
        <div className="text-center space-y-2">
          <p className="text-gray-700 font-medium">{message}</p>
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};
