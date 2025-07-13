
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Propostas from "./pages/Propostas";
import NovaPropostaPage from "./pages/NovaPropostaPage";
import Planos from "./pages/Planos";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
      
      {/* Rotas protegidas */}
      {user ? (
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="propostas" element={<Propostas />} />
          <Route path="propostas/nova" element={<NovaPropostaPage />} />
          <Route path="planos" element={<Planos />} />
          <Route path="configuracoes" element={<div className="p-6"><h1 className="text-2xl font-bold">Configurações</h1><p className="text-gray-600 mt-2">Página em desenvolvimento</p></div>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
