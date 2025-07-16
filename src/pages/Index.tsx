
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user && session) {
        // Se o usuário está autenticado, vai para o dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // Se não está autenticado, vai para o login
        navigate('/login', { replace: true });
      }
    }
  }, [loading, user, session, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Fallback redirect baseado no estado atual
  if (user && session) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default Index;
