
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, Users, BarChart3, Settings, Menu, X, MessageSquare, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout = ({ children }: MobileLayoutProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin, isGuest } = useUserPermissions();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/login');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao realizar logout');
    }
    setIsOpen(false);
  };

  const navItems = [
    { 
      href: '/dashboard', 
      icon: Home, 
      label: 'Dashboard' 
    },
    { 
      href: '/propostas', 
      icon: FileText, 
      label: 'Propostas' 
    },
    { 
      href: '/clientes', 
      icon: Users, 
      label: 'Clientes' 
    },
    { 
      href: '/analytics', 
      icon: BarChart3, 
      label: 'Analytics' 
    },
    // Só mostrar planos para usuários não-guest
    ...(!isGuest ? [{ 
      href: '/planos', 
      icon: BarChart3, 
      label: 'Planos' 
    }] : []),
    // Só mostrar configurações para usuários não-guest
    ...(!isGuest ? [{ 
      href: '/configuracoes', 
      icon: Settings, 
      label: 'Configurações' 
    }] : []),
    // Só mostrar gerenciamento de usuários para admin
    ...(isAdmin ? [{ 
      href: '/gerenciamento-usuarios', 
      icon: Users, 
      label: 'Usuários' 
    }] : []),
    // Destaque para o Telegram Bot
    {
      href: '#telegram',
      icon: MessageSquare,
      label: 'Assistente Telegram',
      isSpecial: true,
      onClick: () => {
        window.open('https://t.me/borafecharai_bot', '_blank');
        setIsOpen(false);
      }
    }
  ];

  const isActivePath = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (item: any) => {
    if (item.onClick) {
      item.onClick();
    } else {
      navigate(item.href);
      setIsOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Header móvel */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1.5">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold">Menu</h2>
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="p-1">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {user?.email && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{user.email}</p>
                  )}
                </div>
                
                <nav className="flex-1 p-2 space-y-1">
                  {navItems.map((item) => (
                    <Button
                      key={item.href}
                      variant={isActivePath(item.href) && !item.isSpecial ? "secondary" : "ghost"}
                      className={`w-full justify-start text-sm h-10 ${
                        item.isSpecial 
                          ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20' 
                          : ''
                      }`}
                      onClick={() => handleNavigation(item)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  ))}
                </nav>

                <div className="p-2 border-t border-border">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm h-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <h1 className="text-base font-bold text-center flex-1">
            Bora Fechar Aí
          </h1>

          <div className="w-8" />
        </div>
      </div>

      {/* Conteúdo principal */}
      <main className="flex-1 pt-16 pb-4 px-2 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default MobileLayout;
