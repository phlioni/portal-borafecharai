
import React, { useState } from 'react';
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
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/hooks/useProfiles';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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
    { path: '/propostas/chat', icon: MessageSquare, label: 'Chat Proposta', highlight: true },
    { path: '/propostas', icon: FileText, label: 'Propostas' },
    ...(canCreateProposal ? [{ path: '/propostas/nova', icon: PlusCircle, label: 'Nova Proposta' }] : []),
    { path: '/clientes', icon: Users, label: 'Clientes' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-bold text-primary">BoraFecharAI</h1>
          
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
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
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  {/* Menu Header */}
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold">Menu</h2>
                      <Button variant="ghost" size="sm" onClick={closeMenu}>
                        <X className="h-4 w-4" />
                      </Button>
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
                          onClick={closeMenu}
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : item.highlight 
                                ? 'bg-accent text-accent-foreground hover:bg-accent/80'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${item.highlight && !isActive ? 'animate-pulse' : ''}`} />
                          {item.label}
                          {item.highlight && !isActive && (
                            <span className="ml-auto text-xs font-medium bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                              Novo
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </nav>

                  {/* User Profile & Logout */}
                  <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-10 h-10">
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
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-16 overflow-hidden">
        <main className="h-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MobileLayout;
