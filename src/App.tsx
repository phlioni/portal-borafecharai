
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import NovaPropostaPage from '@/pages/NovaPropostaPage';
import Propostas from '@/pages/Propostas';
import VisualizarPropostaPage from '@/pages/VisualizarPropostaPage';
import ChatPropostaPage from '@/pages/ChatPropostaPage';
import ClientesPage from '@/pages/ClientesPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import ConfiguracoesPage from '@/pages/ConfiguracoesPage';
import PropostaPublicaPage from '@/pages/PropostaPublicaPage';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import Planos from '@/pages/Planos';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rota pública para visualizar propostas */}
            <Route path="/proposta/:token" element={<PropostaPublicaPage />} />
            
            {/* Rotas públicas */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/planos" element={<Planos />} />
            
            {/* Rotas autenticadas */}
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/propostas" element={<Layout><Propostas /></Layout>} />
            <Route path="/propostas/nova" element={<Layout><NovaPropostaPage /></Layout>} />
            <Route path="/propostas/visualizar/:id" element={<Layout><VisualizarPropostaPage /></Layout>} />
            <Route path="/propostas/editar/:id" element={<Layout><NovaPropostaPage /></Layout>} />
            <Route path="/propostas/chat" element={<Layout><ChatPropostaPage /></Layout>} />
            <Route path="/clientes" element={<Layout><ClientesPage /></Layout>} />
            <Route path="/analytics" element={<Layout><AnalyticsPage /></Layout>} />
            <Route path="/configuracoes" element={<Layout><ConfiguracoesPage /></Layout>} />
            
            {/* Redirect */}
            <Route path="/app" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
