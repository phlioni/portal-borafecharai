
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Propostas from '@/pages/Propostas';
import NovaPropostaPage from '@/pages/NovaPropostaPage';
import EditarPropostaPage from '@/pages/EditarPropostaPage';
import VisualizarPropostaPage from '@/pages/VisualizarPropostaPage';
import ClientesPage from '@/pages/ClientesPage';
import ConfiguracoesPage from '@/pages/ConfiguracoesPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import LandingPage from '@/pages/LandingPage';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import { Toaster } from '@/components/ui/toaster';
import BonusCelebration from '@/components/BonusCelebration';
import TermosDeUso from '@/pages/TermosDeUso';
import PropostaPublicaPage from '@/pages/PropostaPublicaPage';
import Planos from '@/pages/Planos';
import ChatPropostaPage from '@/pages/ChatPropostaPage';
import TemplatesPersonalizadosPage from '@/pages/TemplatesPersonalizadosPage';
import TelegramBotPage from '@/pages/TelegramBotPage';
import TestBusinessSegments from '@/pages/TestBusinessSegments';
import GerenciamentoUsuariosPage from '@/pages/GerenciamentoUsuariosPage';
import WhatsAppBotPage from '@/pages/WhatsAppBotPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/termos" element={<TermosDeUso />} />
              <Route path="/proposta/:hash" element={<PropostaPublicaPage />} />
              <Route path="/planos" element={<Planos />} />
              
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/propostas" element={<Propostas />} />
                <Route path="/nova-proposta" element={<NovaPropostaPage />} />
                <Route path="/propostas/nova" element={<NovaPropostaPage />} />
                <Route path="/propostas/editar/:id" element={<EditarPropostaPage />} />
                <Route path="/propostas/visualizar/:id" element={<VisualizarPropostaPage />} />
                <Route path="/clientes" element={<ClientesPage />} />
                <Route path="/configuracoes" element={<ConfiguracoesPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/chat-proposta" element={<ChatPropostaPage />} />
                <Route path="/templates-personalizados" element={<TemplatesPersonalizadosPage />} />
                <Route path="/telegram-bot" element={<TelegramBotPage />} />
                <Route path="/whatsapp-bot" element={<WhatsAppBotPage />} />
                <Route path="/test-business" element={<TestBusinessSegments />} />
                
                <Route element={<ProtectedRoute requiredRole="admin" />}>
                  <Route path="/admin/usuarios" element={<GerenciamentoUsuariosPage />} />
                </Route>
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <BonusCelebration />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
