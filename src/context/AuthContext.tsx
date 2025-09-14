import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User } from "../types";
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signup: (data: { name: string; email: string; password: string; role: 'SUPERVISOR' | 'AGENT'; photo_url?: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pegar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserProfile(authUser: SupabaseUser) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Usuário não existe na tabela users, criar um perfil básico
        const newUser = {
          id: authUser.id,
          email: authUser.email!,
          name: authUser.user_metadata?.name || authUser.email!.split('@')[0],
          role: 'AGENT' as const,
          photo_url: authUser.user_metadata?.avatar_url || null
        };

        const { data: insertedUser, error: insertError } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single();

        if (insertError) throw insertError;
        setUser(insertedUser);
      } else if (error) {
        throw error;
      } else {
        setUser(data);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signup({ name, email, password, role, photo_url }: { name: string; email: string; password: string; role: 'SUPERVISOR' | 'AGENT'; photo_url?: string }) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          avatar_url: photo_url
        }
      }
    });

    if (authError) throw authError;

    if (authData.user) {
      // Criar perfil do usuário
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email,
          name,
          role,
          photo_url: photo_url || null
        }]);

      if (profileError) throw profileError;
    }
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  const value = { user, session, signup, login, logout, loading };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
