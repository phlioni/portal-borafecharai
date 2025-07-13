import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/Login';
import Propostas from '@/pages/Propostas';
import NovaPropostaPage from '@/pages/NovaPropostaPage';
import ChatPropostaPage from '@/pages/ChatPropostaPage';
import VisualizarPropostaPage from '@/pages/VisualizarPropostaPage';
import ClientesPage from '@/pages/ClientesPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import Planos from '@/pages/Planos';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Toaster />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="propostas" element={<Propostas />} />
              <Route path="propostas/nova" element={<NovaPropostaPage />} />
              <Route path="propostas/chat" element={<ChatPropostaPage />} />
              <Route path="propostas/:id" element={<VisualizarPropostaPage />} />
              <Route path="clientes" element={<ClientesPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="planos" element={<Planos />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
