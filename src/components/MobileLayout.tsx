
import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./LoadingSpinner";
import { 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  Menu,
  Calculator,
  MessageSquare,
  ClipboardList,
  Calendar
} from "lucide-react";

export const MobileLayout = () => {
  const { user, signOut, loading } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  if (loading) {
    return <LoadingSpinner />;
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Propostas", href: "/propostas", icon: FileText },
    { name: "Clientes", href: "/clientes", icon: Users },
    { name: "Chat Proposta", href: "/chat-proposta", icon: MessageSquare },
    { name: "Templates Personalizados", href: "/templates-personalizados", icon: ClipboardList },
    { name: "Modelos de Orçamento", href: "/modelos-orcamento", icon: Calculator },
    { name: "Ordens de Serviço", href: "/ordens-servico", icon: Calendar },
    { name: "Configurações", href: "/configuracoes", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <div className="flex items-center justify-center h-16 px-4 border-b">
                <Link 
                  to="/dashboard" 
                  className="text-xl font-bold text-blue-600"
                  onClick={() => setOpen(false)}
                >
                  BoraFecharAI
                </Link>
              </div>
              
              <nav className="mt-5 px-2">
                <div className="space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                          location.pathname === item.href
                            ? "bg-blue-100 text-blue-900"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </nav>

              <div className="absolute bottom-0 w-full p-4 border-t">
                <div className="flex items-center">
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {user?.email}
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={signOut} 
                  variant="outline" 
                  className="mt-3 w-full"
                >
                  Sair
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          
          <Link to="/dashboard" className="text-xl font-bold text-blue-600">
            BoraFecharAI
          </Link>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 pt-16 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};
