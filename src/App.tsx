
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Propostas from "@/pages/Propostas";
import NovaPropostaPage from "@/pages/NovaPropostaPage";
import EditarPropostaPage from "@/pages/EditarPropostaPage";
import VisualizarPropostaPage from "@/pages/VisualizarPropostaPage";
import PropostaPublicaPage from "@/pages/PropostaPublicaPage";
import ClientesPage from "@/pages/ClientesPage";
import ConfiguracoesPage from "@/pages/ConfiguracoesPage";
import ChatPropostaPage from "@/pages/ChatPropostaPage";
import TelegramBotPage from "@/pages/TelegramBotPage";
import WhatsAppBotPage from "@/pages/WhatsAppBotPage";
import TemplatesPersonalizadosPage from "@/pages/TemplatesPersonalizadosPage";
import ModelosOrcamentoPage from "@/pages/ModelosOrcamentoPage";
import OrdensServicoPage from "@/pages/OrdensServicoPage";
import GerenciamentoUsuariosPage from "@/pages/GerenciamentoUsuariosPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import Planos from "@/pages/Planos";
import LandingPage from "@/pages/LandingPage";
import TermosDeUso from "@/pages/TermosDeUso";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/planos" element={<Planos />} />
              <Route path="/termos-de-uso" element={<TermosDeUso />} />
              <Route path="/proposta/:hash" element={<PropostaPublicaPage />} />
              
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="propostas" element={<Propostas />} />
                <Route path="nova-proposta" element={<NovaPropostaPage />} />
                <Route path="editar-proposta/:id" element={<EditarPropostaPage />} />
                <Route path="visualizar-proposta/:id" element={<VisualizarPropostaPage />} />
                <Route path="clientes" element={<ClientesPage />} />
                <Route path="configuracoes" element={<ConfiguracoesPage />} />
                <Route path="chat-proposta" element={<ChatPropostaPage />} />
                <Route path="telegram-bot" element={<TelegramBotPage />} />
                <Route path="whatsapp-bot" element={<WhatsAppBotPage />} />
                <Route path="templates-personalizados" element={<TemplatesPersonalizadosPage />} />
                <Route path="modelos-orcamento" element={<ModelosOrcamentoPage />} />
                <Route path="ordens-servico" element={<OrdensServicoPage />} />
                <Route path="gerenciamento-usuarios" element={<GerenciamentoUsuariosPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
