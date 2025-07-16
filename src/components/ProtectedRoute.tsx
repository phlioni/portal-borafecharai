
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();

  console.log('ProtectedRoute - user:', user?.email, 'session:', !!session, 'loading:', loading);

  useEffect(() => {
    // Se não está carregando e não tem usuário ou sessão, redireciona
    if (!loading && (!user || !session)) {
      console.log('No valid auth found, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [loading, user, session, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Verificação rigorosa: precisa ter tanto user quanto session
  if (!user || !session) {
    console.log('Missing user or session, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Verificação adicional: session deve ter access_token válido
  if (!session.access_token || session.expires_at && session.expires_at < Date.now() / 1000) {
    console.log('Invalid or expired session, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
