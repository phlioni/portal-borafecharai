
import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  BarChart3, 
  FileText, 
  Users, 
  Settings, 
  Menu,
  MessageSquare,
  FileTemplate,
  Calculator,
  Bot,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import UserActionsDropdown from '@/components/UserActionsDropdown';
import BoraFecharLogo from '@/components/BoraFecharLogo';

const Layout = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/propostas', icon: FileText, label: 'Propostas' },
    { path: '/ordens-servico', icon: Calendar, label: 'Ordens de Serviço' },
    { path: '/clientes', icon: Users, label: 'Clientes' },
    // { path: '/chat-proposta', icon: MessageSquare, label: 'Chat Proposta', highlight: true },
    { path: '/modelos-orcamento', icon: Calculator, label: 'Modelos de Orçamento' },
    { path: '/templates-personalizados', icon: FileTemplate, label: 'Templates Personalizados' },
    { path: '/telegram-bot', icon: Bot, label: 'Bot do Telegram' },
    { path: '/whatsapp-bot', icon: Bot, label: 'Bot do WhatsApp' },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow border-r border-border bg-card overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 py-6">
            <BoraFecharLogo />
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : (item as any).highlight
                          ? 'bg-accent text-accent-foreground hover:bg-accent/80'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${(item as any).highlight && !isActive ? 'animate-pulse' : ''}`} />
                    {item.label}
                    {(item as any).highlight && !isActive && (
                      <span className="ml-auto text-xs font-medium bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                        Novo
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-16 px-4 border-b border-border bg-card">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col h-full">
                <div className="flex items-center px-2 py-4">
                  <BoraFecharLogo />
                </div>
                <nav className="flex-1 px-2 space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : (item as any).highlight
                              ? 'bg-accent text-accent-foreground hover:bg-accent/80'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${(item as any).highlight && !isActive ? 'animate-pulse' : ''}`} />
                        {item.label}
                        {(item as any).highlight && !isActive && (
                          <span className="ml-auto text-xs font-medium bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                            Novo
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <BoraFecharLogo />
          <UserActionsDropdown 
            user={user} 
            onResetProposals={() => {}} 
            onResetTrial={() => {}} 
            onDeleteUser={() => {}} 
            onChangeRole={() => {}} 
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 lg:pl-64">
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:h-16 lg:px-6 lg:border-b lg:border-border lg:bg-card">
          <div></div>
          <UserActionsDropdown 
            user={user} 
            onResetProposals={() => {}} 
            onResetTrial={() => {}} 
            onDeleteUser={() => {}} 
            onChangeRole={() => {}} 
          />
        </div>
        <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
