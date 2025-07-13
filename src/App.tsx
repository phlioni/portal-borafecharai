
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Propostas from "./pages/Propostas";
import NovaPropostaPage from "./pages/NovaPropostaPage";
import Planos from "./pages/Planos";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Simulando estado de autenticação
const isAuthenticated = false; // Mudar para true para testar as páginas autenticadas

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          
          {/* Rotas protegidas */}
          {isAuthenticated ? (
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="propostas" element={<Propostas />} />
              <Route path="propostas/nova" element={<NovaPropostaPage />} />
              <Route path="planos" element={<Planos />} />
              <Route path="configuracoes" element={<div className="p-6"><h1 className="text-2xl font-bold">Configurações</h1><p className="text-gray-600 mt-2">Página em desenvolvimento</p></div>} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
          
          {/* Página 404 para rotas inexistentes quando autenticado */}
          {isAuthenticated && <Route path="*" element={<NotFound />} />}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
