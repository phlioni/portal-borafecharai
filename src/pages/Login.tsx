
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  FileText,
  BarChart3,
  Zap,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    name: ''
  });

  const features = [
    {
      icon: FileText,
      title: 'Propostas Profissionais',
      description: 'Templates elegantes e personalizáveis'
    },
    {
      icon: BarChart3,
      title: 'Analytics Detalhados',
      description: 'Acompanhe visualizações e conversões'
    },
    {
      icon: Zap,
      title: 'Envio Inteligente',
      description: 'Links rastreáveis e notificações automáticas'
    },
    {
      icon: Users,
      title: 'Colaboração',
      description: 'Trabalhe em equipe com facilidade'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica de autenticação aqui
    console.log(isLogin ? 'Login' : 'Cadastro', formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left side - Features */}
        <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-6">
              Propostas Inteligentes
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Crie propostas profissionais que convertem mais clientes para sua empresa
            </p>
            
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="bg-white/20 rounded-lg p-2">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                    <p className="text-blue-100">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-blue-100 mb-2">Mais de 10.000 empresas confiam em nós</p>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">95%</div>
                  <div className="text-xs text-blue-200">Taxa de Conversão</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">50k+</div>
                  <div className="text-xs text-blue-200">Propostas Enviadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">2.5x</div>
                  <div className="text-xs text-blue-200">Mais Vendas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile header */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Propostas Inteligentes
              </h1>
              <p className="text-gray-600">
                Entre na sua conta para continuar
              </p>
            </div>

            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  {isLogin ? 'Entrar na sua conta' : 'Criar conta gratuita'}
                </CardTitle>
                <CardDescription>
                  {isLogin 
                    ? 'Digite seus dados para acessar o dashboard' 
                    : 'Comece seu trial gratuito de 14 dias'
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div>
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="João Silva"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="company">Nome da Empresa</Label>
                        <Input
                          id="company"
                          type="text"
                          placeholder="Minha Empresa Ltda"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          required
                        />
                      </div>
                    </>
                  )}
                  
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {!isLogin && (
                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {isLogin && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-sm">
                        <input type="checkbox" className="rounded" />
                        <span className="text-gray-600">Lembrar de mim</span>
                      </label>
                      <Link to="/esqueci-senha" className="text-sm text-blue-600 hover:text-blue-800">
                        Esqueci minha senha
                      </Link>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                    {isLogin ? 'Entrar' : 'Criar Conta Gratuita'}
                  </Button>
                </form>

                {!isLogin && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 text-center">
                      ✅ Trial gratuito de 14 dias • Sem cartão de crédito
                    </p>
                  </div>
                )}

                <div className="mt-6">
                  <Separator className="mb-4" />
                  <p className="text-center text-sm text-gray-600">
                    {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {isLogin ? 'Criar conta gratuita' : 'Fazer login'}
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 text-center text-xs text-gray-500">
              Ao criar uma conta, você concorda com nossos{' '}
              <Link to="/termos" className="text-blue-600 hover:text-blue-800">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link to="/privacidade" className="text-blue-600 hover:text-blue-800">
                Política de Privacidade
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
