
import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  FileText,
  Users,
  Settings,
  BarChart3,
  LogOut,
  MessageSquare,
  PlusCircle,
  Send,
  Calculator
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/hooks/useProfiles';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileLayout from './MobileLayout';
import BoraFecharLogo from './BoraFecharLogo';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const { signOut, user } = useAuth();
  const { profile } = useProfiles();
  const { isAdmin, canCreateProposal } = useUserPermissions();
  const location = useLocation();
  const navigate = useNavigate();

  // Se for mobile, usa o MobileLayout
  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
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

  const handleTelegramBot = () => {
    // Abrir o bot do Telegram
    window.open('https://t.me/borafecharai_bot', '_blank');
  };

  // Reorganizamos os itens do menu para dar destaque ao Chat Proposta
  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    // Chat Proposta temporariamente oculto
    // { path: '/chat-proposta', icon: MessageSquare, label: 'Chat Proposta', highlight: true },
    { path: '/propostas', icon: FileText, label: 'Propostas' },
    // ...(canCreateProposal ? [{ path: '/nova-proposta', icon: PlusCircle, label: 'Nova Proposta' }] : []),
    { path: '/clientes', icon: Users, label: 'Clientes' },
    { path: '/modelos-orcamento', icon: Calculator, label: 'Modelos Orçamento' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <BoraFecharLogo size="md" />
            <h1 className="text-xl font-bold text-primary">BoraFecharAI</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
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
              </NavLink>
            );
          })}
          {/* Telegram Bot Highlight - Novo destaque */}
          <div>
            <Button
              onClick={handleTelegramBot}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white gap-2 min-h-[44px]"
            >
              <Send className="w-5 h-5" />
              <span>Assistente no Telegram</span>
            </Button>
          </div>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-8 h-8">
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
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
