import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { AuthUser, Student, AgentProfile } from '../types';

interface AuthContextValue {
  currentUser: AuthUser | null;
  studentProfile: Student | null;
  agentProfile: AgentProfile | null;
  loading: boolean;
  isDemo: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [studentProfile, setStudentProfile] = useState<Student | null>(null);
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemo = !isSupabaseConfigured();

  const loadProfile = useCallback(async (userId: string) => {
    // Try student record first
    const { data: studentData } = await supabase
      .from('students')
      .select('*')
      .eq('auth_user_id', userId)
      .single();

    if (studentData) {
      setStudentProfile(studentData as Student);
      setAgentProfile(null);
      return 'student';
    }

    // Try agent record
    const { data: agentData } = await supabase
      .from('transport_agents')
      .select('*, vehicles(*)')
      .eq('auth_user_id', userId)
      .single();

    if (agentData) {
      setAgentProfile(agentData as AgentProfile);
      setStudentProfile(null);
      return 'agent';
    }

    return null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (isDemo || !currentUser) return;
    await loadProfile(currentUser.id);
  }, [isDemo, currentUser, loadProfile]);

  useEffect(() => {
    if (isDemo) {
      // Demo mode: no auth
      setCurrentUser(null);
      setStudentProfile(null);
      setAgentProfile(null);
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const role = await loadProfile(session.user.id);
        if (role) {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email ?? '',
            role: role as 'student' | 'agent',
          });
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const role = await loadProfile(session.user.id);
        if (role) {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email ?? '',
            role: role as 'student' | 'agent',
          });
        } else {
          setCurrentUser(null);
          setStudentProfile(null);
          setAgentProfile(null);
        }
      } else {
        setCurrentUser(null);
        setStudentProfile(null);
        setAgentProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isDemo, loadProfile]);

  const signOut = async () => {
    if (!isDemo) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setStudentProfile(null);
    setAgentProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        studentProfile,
        agentProfile,
        loading,
        isDemo,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
