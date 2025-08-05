
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Users, Calendar, Settings, LogOut, CalendarCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { signOut } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/propostas', icon: FileText, label: 'Propostas' },
    { path: '/clientes', icon: Users, label: 'Clientes' },
    { path: '/ordens-de-servico', icon: CalendarCheck, label: 'Ordens de Serviço' },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b">
            <Link to="/dashboard" className="text-xl font-bold text-blue-600">
              BoraFecharAI
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={() => signOut()}
            >
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
