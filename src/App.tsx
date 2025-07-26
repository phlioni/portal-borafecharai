import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import MobileLayout from "@/components/MobileLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useIsMobile } from "@/hooks/use-mobile";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Propostas from "./pages/Propostas";
import NovaPropostaPage from "./pages/NovaPropostaPage";
import VisualizarPropostaPage from "./pages/VisualizarPropostaPage";
import EditarPropostaPage from "./pages/EditarPropostaPage";
import PropostaPublicaPage from "./pages/PropostaPublicaPage";
import OrdensServicoPage from "./pages/OrdensServicoPage";
import ClientesPage from "./pages/ClientesPage";
import ChatPropostaPage from "./pages/ChatPropostaPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import ModelosOrcamentoPage from "./pages/ModelosOrcamentoPage";
import TemplatesPersonalizadosPage from "./pages/TemplatesPersonalizadosPage";
import TelegramBotPage from "./pages/TelegramBotPage";
import WhatsAppBotPage from "./pages/WhatsAppBotPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import Planos from "./pages/Planos";
import TermosDeUso from "./pages/TermosDeUso";
import LandingPage from "./pages/LandingPage";
import GerenciamentoUsuariosPage from "./pages/GerenciamentoUsuariosPage";
import TestBusinessSegments from "./pages/TestBusinessSegments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const isMobile = useIsMobile();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/index" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/planos" element={<Planos />} />
              <Route path="/termos-de-uso" element={<TermosDeUso />} />
              <Route path="/proposta/:hash" element={<PropostaPublicaPage />} />
              <Route path="/test-business-segments" element={<TestBusinessSegments />} />

              {/* Protected routes with layout */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    {isMobile ? <MobileLayout /> : <Layout />}
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="propostas" element={<Propostas />} />
                <Route path="propostas/nova" element={<NovaPropostaPage />} />
                <Route path="propostas/:id" element={<VisualizarPropostaPage />} />
                <Route path="propostas/:id/editar" element={<EditarPropostaPage />} />
                <Route path="ordens-servico" element={<OrdensServicoPage />} />
                <Route path="clientes" element={<ClientesPage />} />
                <Route path="chat-proposta" element={<ChatPropostaPage />} />
                <Route path="configuracoes" element={<ConfiguracoesPage />} />
                <Route path="modelos-orcamento" element={<ModelosOrcamentoPage />} />
                <Route path="templates-personalizados" element={<TemplatesPersonalizadosPage />} />
                <Route path="telegram-bot" element={<TelegramBotPage />} />
                <Route path="whatsapp-bot" element={<WhatsAppBotPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="gerenciamento-usuarios" element={<GerenciamentoUsuariosPage />} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
