
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NovaPropostaPage from "./pages/NovaPropostaPage";
import Propostas from "./pages/Propostas";
import EditarPropostaPage from "./pages/EditarPropostaPage";
import VisualizarPropostaPage from "./pages/VisualizarPropostaPage";
import PropostaPublicaPage from "./pages/PropostaPublicaPage";
import ClientesPage from "./pages/ClientesPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import TemplatesPersonalizadosPage from "./pages/TemplatesPersonalizadosPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import Planos from "./pages/Planos";
import TelegramBotPage from "./pages/TelegramBotPage";
import ChatPropostaPage from "./pages/ChatPropostaPage";
import GerenciamentoUsuariosPage from "./pages/GerenciamentoUsuariosPage";
import TermosDeUso from "./pages/TermosDeUso";
import LandingPage from "./pages/LandingPage";
import TestBusinessSegments from "./pages/TestBusinessSegments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* Rota da landing page */}
                <Route path="/" element={<LandingPage />} />
                
                {/* Rota de login */}
                <Route path="/login" element={<Login />} />

                {/* Rota de termos de uso */}
                <Route path="/termos" element={<TermosDeUso />} />

                {/* Rota para proposta pública (não protegida) */}
                <Route path="/proposta/:hash" element={<PropostaPublicaPage />} />

                {/* Rota para teste dos segmentos de negócio */}
                <Route path="/test-segments" element={<TestBusinessSegments />} />

                {/* Rotas protegidas */}
                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/nova-proposta" element={<NovaPropostaPage />} />
                  <Route path="/propostas" element={<Propostas />} />
                  <Route path="/propostas/:id/editar" element={<EditarPropostaPage />} />
                  <Route path="/propostas/:id" element={<VisualizarPropostaPage />} />
                  <Route path="/clientes" element={<ClientesPage />} />
                  <Route path="/configuracoes" element={<ConfiguracoesPage />} />
                  <Route path="/templates" element={<TemplatesPersonalizadosPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/planos" element={<Planos />} />
                  <Route path="/telegram" element={<TelegramBotPage />} />
                  <Route path="/chat-proposta" element={<ChatPropostaPage />} />
                  <Route path="/usuarios" element={<GerenciamentoUsuariosPage />} />
                </Route>

                {/* Rota 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
