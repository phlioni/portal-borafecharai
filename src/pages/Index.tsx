
import React from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redireciona para a página de login por padrão
  return <Navigate to="/login" replace />;
};

export default Index;
