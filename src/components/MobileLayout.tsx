
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
  FileStack,
  Calculator,
  Bot,
  Calendar
} from 'lucide-react';
import UserActionsDropdown from '@/components/UserActionsDropdown';
import BoraFecharLogo from '@/components/BoraFecharLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminOperations } from '@/hooks/useAdminOperations';

const MobileLayout = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { resetUserData, deleteUser, changeUserRole } = useAdminOperations();

  const menuItems = [
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/propostas', icon: FileText, label: 'Propostas' },
    { path: '/ordens-servico', icon: Calendar, label: 'Ordens de Serviço' },
    { path: '/clientes', icon: Users, label: 'Clientes' },
    // { path: '/chat-proposta', icon: MessageSquare, label: 'Chat Proposta', highlight: true },
    { path: '/modelos-orcamento', icon: Calculator, label: 'Modelos de Orçamento' },
    { path: '/templates-personalizados', icon: FileStack, label: 'Templates Personalizados' },
    { path: '/telegram-bot', icon: Bot, label: 'Bot do Telegram' },
    { path: '/whatsapp-bot', icon: Bot, label: 'Bot do WhatsApp' },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  const handleResetProposals = async (userId: string) => {
    await resetUserData(userId, 'proposals');
  };

  const handleResetTrial = async (userId: string) => {
    await resetUserData(userId, 'trial');
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
  };

  const handleChangeRole = async (userId: string, role: 'user' | 'guest' | 'admin') => {
    await changeUserRole(userId, role);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="flex flex-col h-full">
                {/* Header do Menu */}
                <div className="flex items-center justify-between p-4 border-b">
                  <BoraFecharLogo />
                </div>
                
                {/* Navegação */}
                <nav className="flex-1 overflow-y-auto py-4">
                  <div className="space-y-2 px-3">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={closeMenu}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${isActive
                              ? 'bg-primary text-primary-foreground'
                              : (item as any).highlight
                                ? 'bg-accent text-accent-foreground hover:bg-accent/80'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                        >
                          <Icon className={`w-5 h-5 flex-shrink-0 ${(item as any).highlight && !isActive ? 'animate-pulse' : ''}`} />
                          <span className="truncate">{item.label}</span>
                          {(item as any).highlight && !isActive && (
                            <span className="ml-auto text-xs font-medium bg-primary/20 text-primary px-1.5 py-0.5 rounded-full flex-shrink-0">
                              IA
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1 flex justify-center">
            <BoraFecharLogo />
          </div>

          {user && (
            <UserActionsDropdown 
              user={{
                id: user.id,
                email: user.email || '',
                created_at: user.created_at || new Date().toISOString(),
                role: 'user'
              }}
              onResetProposals={handleResetProposals}
              onResetTrial={handleResetTrial}
              onDeleteUser={handleDeleteUser}
              onChangeRole={handleChangeRole}
            />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-14 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MobileLayout;
