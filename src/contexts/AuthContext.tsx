
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  subscription: {
    subscribed: boolean;
    subscription_tier: string | null;
    subscription_end: string | null;
  };
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState({
    subscribed: false,
    subscription_tier: null as string | null,
    subscription_end: null as string | null,
  });

  const clearAuthState = () => {
    console.log('Clearing auth state...');
    setUser(null);
    setSession(null);
    setSubscription({
      subscribed: false,
      subscription_tier: null,
      subscription_end: null,
    });
  };

  const refreshSubscription = async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!error && data) {
        setSubscription({
          subscribed: data.subscribed || false,
          subscription_tier: data.subscription_tier || null,
          subscription_end: data.subscription_end || null,
        });
      }
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    }
  };

  useEffect(() => {
    console.log('Setting up auth listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('User signed out or session is null, clearing all state');
          clearAuthState();
          setLoading(false);
          return;
        }

        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
          console.log('Setting session and user:', session?.user?.email);
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);

          // Refresh subscription data when user logs in
          if (session?.user && event === 'SIGNED_IN') {
            setTimeout(() => {
              refreshSubscription();
            }, 1000);
          }
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          clearAuthState();
        } else if (session) {
          console.log('Initial session found:', session?.user?.email);
          setSession(session);
          setUser(session?.user ?? null);
          
          // Refresh subscription for initial session
          setTimeout(() => {
            refreshSubscription();
          }, 1000);
        } else {
          console.log('No initial session found');
          clearAuthState();
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        clearAuthState();
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Auto-refresh subscription periodically when user is logged in
  useEffect(() => {
    if (!user || !session) return;

    const interval = setInterval(() => {
      refreshSubscription();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user, session]);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
      } else {
        console.log('Sign in successful:', data.user?.email);
      }
      
      return { error };
    } catch (err) {
      console.error('Unexpected error during sign in:', err);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log('Attempting sign up for:', email);
    const redirectUrl = `${window.location.origin}/`;
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
      } else {
        console.log('Sign up successful:', data.user?.email);
      }
      
      return { error };
    } catch (err) {
      console.error('Unexpected error during sign up:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    console.log('Starting sign out process...');
    try {
      // Clear local state first
      clearAuthState();

      // Clear localStorage completely
      localStorage.clear();
      
      // Clear sessionStorage as well
      sessionStorage.clear();

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'global' // This ensures all sessions are terminated
      });
      
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      } else {
        console.log('Signed out successfully');
      }

      // Force a hard refresh to ensure no cached data remains
      window.location.href = '/login';
    } catch (err) {
      console.error('Unexpected error during sign out:', err);
      // Even if there's an error, clear everything and redirect
      clearAuthState();
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
      throw err;
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    subscription,
    refreshSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
