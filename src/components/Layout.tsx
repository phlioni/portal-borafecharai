
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, FileText, Users, Settings, BarChart3, Calendar, LogOut, Plus, Bot, MessageCircle, Palette, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileLayout from '@/components/MobileLayout';
import SimpleUserMenu from '@/components/SimpleUserMenu';
import { TrialCallToActionWrapper } from '@/components/TrialCallToActionWrapper';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Plus, label: 'Nova Proposta', path: '/nova-proposta' },
    { icon: FileText, label: 'Propostas', path: '/propostas' },
    { icon: Calendar, label: 'Ordens de Serviço', path: '/ordens-de-servico' },
    { icon: Users, label: 'Clientes', path: '/clientes' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Palette, label: 'Modelos de Orçamento', path: '/modelos-orcamento' },
  ];

  const botMenuItems = [
    { icon: Bot, label: 'Bot Telegram', path: '/telegram-bot' },
    { icon: MessageCircle, label: 'Bot WhatsApp', path: '/whatsapp-bot' },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-primary">BoraFecharAI</h1>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          ))}
          
          <div className="pt-4">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Assistentes
            </h3>
            {botMenuItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Button>
            ))}
          </div>

          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                navigate('/configuracoes');
                setSidebarOpen(false);
              }}
            >
              <Settings className="mr-3 h-5 w-5" />
              Configurações
            </Button>
          </div>
        </nav>

        <div className="border-t p-4">
          <SimpleUserMenu />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex-1" />
          
          <div className="flex items-center space-x-4">
            <TrialCallToActionWrapper />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
