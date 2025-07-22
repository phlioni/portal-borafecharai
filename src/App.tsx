
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NovaPropostaPage from "./pages/NovaPropostaPage";
import Propostas from "./pages/Propostas";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import ClientesPage from "./pages/ClientesPage";
import VisualizarPropostaPage from "./pages/VisualizarPropostaPage";
import EditarPropostaPage from "./pages/EditarPropostaPage";
import PropostaPublicaPage from "./pages/PropostaPublicaPage";
import Planos from "./pages/Planos";
import AnalyticsPage from "./pages/AnalyticsPage";
import GerenciamentoUsuariosPage from "./pages/GerenciamentoUsuariosPage";
import ModelosOrcamentoPage from "./pages/ModelosOrcamentoPage";
import TemplatesPersonalizadosPage from "./pages/TemplatesPersonalizadosPage";
import TelegramBotPage from "./pages/TelegramBotPage";
import WhatsAppBotPage from "./pages/WhatsAppBotPage";
import ChatPropostaPage from "./pages/ChatPropostaPage";
import TestBusinessSegments from "./pages/TestBusinessSegments";
import NotFound from "./pages/NotFound";
import TermosDeUso from "./pages/TermosDeUso";
import LandingPage from "./pages/LandingPage";
import OrdensDeServicoPage from "./pages/OrdensDeServicoPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/termos-de-uso" element={<TermosDeUso />} />
              <Route path="/proposta-publica/:hash" element={<PropostaPublicaPage />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/nova-proposta" element={
                <ProtectedRoute>
                  <NovaPropostaPage />
                </ProtectedRoute>
              } />
              <Route path="/propostas" element={
                <ProtectedRoute>
                  <Propostas />
                </ProtectedRoute>
              } />
              <Route path="/ordens-de-servico" element={
                <ProtectedRoute>
                  <OrdensDeServicoPage />
                </ProtectedRoute>
              } />
              <Route path="/configuracoes" element={
                <ProtectedRoute>
                  <ConfiguracoesPage />
                </ProtectedRoute>
              } />
              <Route path="/clientes" element={
                <ProtectedRoute>
                  <ClientesPage />
                </ProtectedRoute>
              } />
              <Route path="/visualizar-proposta/:id" element={
                <ProtectedRoute>
                  <VisualizarPropostaPage />
                </ProtectedRoute>
              } />
              <Route path="/editar-proposta/:id" element={
                <ProtectedRoute>
                  <EditarPropostaPage />
                </ProtectedRoute>
              } />
              <Route path="/planos" element={
                <ProtectedRoute>
                  <Planos />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              } />
              <Route path="/gerenciamento-usuarios" element={
                <ProtectedRoute>
                  <GerenciamentoUsuariosPage />
                </ProtectedRoute>
              } />
              <Route path="/modelos-orcamento" element={
                <ProtectedRoute>
                  <ModelosOrcamentoPage />
                </ProtectedRoute>
              } />
              <Route path="/templates-personalizados" element={
                <ProtectedRoute>
                  <TemplatesPersonalizadosPage />
                </ProtectedRoute>
              } />
              <Route path="/telegram-bot" element={
                <ProtectedRoute>
                  <TelegramBotPage />
                </ProtectedRoute>
              } />
              <Route path="/whatsapp-bot" element={
                <ProtectedRoute>
                  <WhatsAppBotPage />
                </ProtectedRoute>
              } />
              <Route path="/chat-proposta" element={
                <ProtectedRoute>
                  <ChatPropostaPage />
                </ProtectedRoute>
              } />
              <Route path="/test-business-segments" element={
                <ProtectedRoute>
                  <TestBusinessSegments />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
