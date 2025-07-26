
import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  FileText,
  Users,
  Settings,
  BarChart3,
  LogOut,
  Bot,
  PlusCircle,
  Menu,
  X,
  Send,
  Calculator
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/hooks/useProfiles';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import BoraFecharLogo from './BoraFecharLogo';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout = ({ children }: MobileLayoutProps) => {
  const { signOut, user } = useAuth();
  const { profile } = useProfiles();
  const { isAdmin, canCreateProposal } = useUserPermissions();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const handleTelegramBot = () => {
    // Abrir o bot do Telegram
    window.open('https://t.me/borafecharai_bot', '_blank');
    closeMenu();
  };

  const getInitials = () => {
    if (profile?.name) {
      return profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    // Chat Proposta temporariamente oculto
    // { path: '/chat-proposta', icon: Bot, label: 'Chat Proposta', highlight: true },
    { path: '/propostas', icon: FileText, label: 'Propostas' },
    // ...(canCreateProposal ? [{ path: '/nova-proposta', icon: PlusCircle, label: 'Nova Proposta' }] : []),
    { path: '/clientes', icon: Users, label: 'Clientes' },
    { path: '/modelos-orcamento', icon: Calculator, label: 'Modelos Orçamento' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Header - altura reduzida para otimizar espaço */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between p-3 h-12">
          <div className="flex items-center gap-2">
            <BoraFecharLogo size="sm" />
            <h1 className="text-base sm:text-lg font-bold text-primary truncate">BoraFecharAI</h1>
          </div>

          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt="Avatar" />
              ) : (
                <AvatarFallback className="text-xs">
                  {getInitials()}
                </AvatarFallback>
              )}
            </Avatar>

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0 flex flex-col max-h-screen">
                <div className="flex flex-col h-full overflow-hidden">
                  {/* Menu Header - altura reduzida */}
                  <div className="p-3 border-b border-border flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BoraFecharLogo size="sm" />
                        <h2 className="font-semibold text-sm">Menu</h2>
                      </div>
                      <Button variant="ghost" size="sm" onClick={closeMenu} className="p-1">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Telegram Bot Highlight - Novo destaque */}
                  <div className="p-3 border-b border-border flex-shrink-0">
                    <Button
                      onClick={handleTelegramBot}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white gap-2 min-h-[44px]"
                    >
                      <Send className="w-5 h-5" />
                      <span>Assistente no Telegram</span>
                    </Button>
                  </div>

                  {/* Navigation - área scrollável */}
                  <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;

                      return (
                        <NavLink
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
                        </NavLink>
                      );
                    })}
                  </nav>

                  {/* User Profile & Logout - área fixa no rodapé */}
                  <div className="p-3 border-t border-border flex-shrink-0">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-9 h-9 flex-shrink-0">
                        {profile?.avatar_url ? (
                          <AvatarImage src={profile.avatar_url} alt="Avatar" />
                        ) : (
                          <AvatarFallback className="text-sm">
                            {getInitials()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {profile?.name || user?.email || 'Usuário'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground min-h-[44px]"
                    >
                      <LogOut className="w-4 w-4" />
                      Sair
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Content - altura ajustada para header menor */}
      <div className="flex-1 pt-12 overflow-hidden">
        <main className="h-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MobileLayout;
