import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileText, AlertCircle, CheckCircle, Clock, TrendingUp, Users, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      console.log('User is authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Show loading if auth is still initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render login form if user is authenticated
  if (user) {
    return null;
  }

  const handleGoogleLogin = async () => {
    console.log('Starting Google login process...');
    setIsGoogleLoading(true);
    setError(null);

    try {
      // Get current URL origin for redirect
      const redirectTo = `${window.location.origin}/dashboard`;
      console.log('Google login redirect URL:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      console.log('Google OAuth response:', { data, error });

      if (error) {
        console.error('Google login error:', error);
        if (error.message.includes('Invalid login credentials')) {
          setError('Erro de autenticação com Google. Verifique se o Google OAuth está configurado corretamente.');
        } else if (error.message.includes('redirect')) {
          setError('Erro de redirecionamento. Verifique se as URLs estão configuradas corretamente no Supabase.');
        } else {
          setError(`Erro ao fazer login com Google: ${error.message}`);
        }
      } else {
        console.log('Google login initiated successfully');
        // O redirecionamento será feito automaticamente pelo Supabase
      }
    } catch (err) {
      console.error('Unexpected error during Google login:', err);
      setError('Erro inesperado durante o login com Google. Tente novamente.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Starting email login process...');
    setIsLoading(true);
    setError(null);

    try {
      console.log('Login form submitted for email:', loginForm.email);
      const { error } = await signIn(loginForm.email, loginForm.password);
      
      if (error) {
        console.error('Login error:', error);
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos. Verifique suas credenciais.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.');
        } else if (error.message.includes('too_many_requests')) {
          setError('Muitas tentativas de login. Aguarde alguns minutos e tente novamente.');
        } else {
          setError(`Erro ao fazer login: ${error.message}`);
        }
      } else {
        console.log('Login successful, should redirect');
        // Redirecionamento será feito pelo useEffect
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Starting signup process...');
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (signupForm.password !== signupForm.confirmPassword) {
      setError('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }

    if (signupForm.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Signup form submitted for email:', signupForm.email);
      
      // Configurar o redirect URL para o dashboard
      const redirectTo = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            email_confirm: true
          }
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        if (error.message.includes('User already registered')) {
          setError('Este email já está cadastrado. Tente fazer login ou recuperar sua senha.');
        } else if (error.message.includes('Password should be at least 6 characters')) {
          setError('A senha deve ter pelo menos 6 caracteres.');
        } else if (error.message.includes('rate limit') || error.message.includes('429')) {
          setError('Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente.');
        } else if (error.message.includes('weak password')) {
          setError('Senha muito fraca. Use pelo menos 8 caracteres com letras e números.');
        } else {
          setError(`Erro ao criar conta: ${error.message}`);
        }
      } else {
        console.log('Signup successful', data);
        if (data.user && !data.user.email_confirmed_at) {
          setSuccess('✅ Conta criada com sucesso! Verifique seu email para confirmar o cadastro e fazer login.');
        } else {
          setSuccess('Conta criada com sucesso! Você já pode fazer login.');
        }
        setSignupForm({ email: '', password: '', confirmPassword: '' });
      }
    } catch (err) {
      console.error('Unexpected error during signup:', err);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: FileText,
      title: "Propostas Profissionais",
      description: "Crie propostas elegantes e personalizadas que impressionam seus clientes"
    },
    {
      icon: Clock,
      title: "Economia de Tempo", 
      description: "Reduza em 80% o tempo gasto criando propostas comerciais"
    },
    {
      icon: TrendingUp,
      title: "Aumente suas Vendas",
      description: "Propostas bem estruturadas aumentam suas chances de fechamento"
    },
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Organize todos seus clientes e propostas em um só lugar"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex">
      {/* Sidebar com informações - apenas desktop */}
      <div className="hidden xl:flex xl:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 text-white relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-48 -translate-x-48"></div>
        
        <div className="relative z-10 flex flex-col justify-center max-w-md">
          {/* Logo e título */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold">BoraFecharAI</h1>
                <p className="text-blue-100 text-sm">Propostas Inteligentes</p>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-3 leading-tight">
              A inteligência que falta para suas
              <span className="text-blue-200 block">propostas fecharem de vez</span>
            </h2>
            <p className="text-lg text-blue-100 leading-relaxed">
              Propostas comerciais inteligentes com IA avançada para converter mais clientes.
            </p>
          </div>

          {/* Features compactas */}
          <div className="space-y-4">
            {features.slice(0, 4).map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 group">
                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <feature.icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-white mb-0.5">{feature.title}</h3>
                  <p className="text-blue-100 text-xs">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">98%</div>
              <div className="text-blue-200 text-xs">Taxa de Aprovação</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">5min</div>
              <div className="text-blue-200 text-xs">Para Criar Proposta</div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de login */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Logo mobile - mais compacto */}
          <div className="xl:hidden text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">BoraFecharAI</h1>
            <p className="text-gray-600 text-sm">A inteligência que falta para suas propostas</p>
          </div>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center pb-4">
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Bem-vindo de volta</CardTitle>
              <CardDescription className="text-gray-600 text-sm">
                Faça login ou crie sua conta para começar
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <Tabs defaultValue="login" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 bg-blue-50 h-9">
                  <TabsTrigger value="login" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm">
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-sm">
                    Cadastrar
                  </TabsTrigger>
                </TabsList>

                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50 py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-800 text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50 py-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 text-sm">{success}</AlertDescription>
                  </Alert>
                )}

                {/* Botão de login com Google */}
                <Button 
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full h-10 border-gray-200 hover:bg-gray-50" 
                  disabled={isGoogleLoading || isLoading}
                >
                  {isGoogleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Continuar com Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">ou</span>
                  </div>
                </div>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-gray-700 text-sm">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        required
                        disabled={isLoading || isGoogleLoading}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-gray-700 text-sm">Senha</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Sua senha"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                        disabled={isLoading || isGoogleLoading}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-10"
                      />
                    </div>
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11" 
                        disabled={isLoading || isGoogleLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Entrando...
                          </>
                        ) : (
                          <>
                            <Zap className="mr-2 h-4 w-4" />
                            Entrar
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-gray-700 text-sm">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        required
                        disabled={isLoading || isGoogleLoading}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-gray-700 text-sm">Senha</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        required
                        disabled={isLoading || isGoogleLoading}
                        minLength={6}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm" className="text-gray-700 text-sm">Confirmar Senha</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="Confirme sua senha"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                        required
                        disabled={isLoading || isGoogleLoading}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-10"
                      />
                    </div>
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11" 
                        disabled={isLoading || isGoogleLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cadastrando...
                          </>
                        ) : (
                          <>
                            <Users className="mr-2 h-4 w-4" />
                            Criar Conta Gratuita
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="text-center mt-6 text-xs text-gray-500">
            <p>
              Ao criar uma conta, você concorda com nossos{' '}
              <Link to="/termos-de-uso" className="text-blue-600 hover:text-blue-800 underline">
                termos de uso
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
