import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './src/config/supabaseClient';
import { User, Session, AuthError } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const cleanHashFragment = () => {
  if (window.location.hash && (
    window.location.hash.includes('access_token') ||
    window.location.hash.includes('error_description')
  )) {
    console.log('[Auth] Cleaning hash fragment');
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
};

const getSessionWithTimeout = async (timeoutMs = 8000): Promise<Session | null> => {
  const timeoutPromise = new Promise<null>((_, reject) => 
    setTimeout(() => reject(new Error('getSession timeout')), timeoutMs)
  );
  try {
    const result = await Promise.race([
      supabase.auth.getSession(),
      timeoutPromise
    ]) as { data: { session: Session | null }; error: AuthError | null };
    if (result.error) {
      console.error('[Auth] getSession error:', result.error.message);
      return null;
    }
    return result.data.session;
  } catch (e) {
    console.error('[Auth] getSession exception:', e);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string): Promise<string> => {
    console.log('[Auth] Fetching profile for:', userId);
    try {
      const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single();
      if (data && !error) {
        console.log('[Auth] Profile role:', data.role);
        return data.role;
      }
      return 'user';
    } catch (e) {
      console.error('[Auth] Profile fetch exception:', e);
      return 'user';
    }
  }, []);

  const processSession = useCallback(async (sess: Session | null) => {
    console.log('[Auth] Processing session:', sess ? 'valid' : 'null');
    setSession(sess);
    setUser(sess?.user ?? null);
    if (sess?.user) {
      const role = await fetchProfile(sess.user.id);
      setUserRole(role);
      console.log('[Auth] Session processed - user:', sess.user.email, 'role:', role);
    } else {
      setUserRole(null);
    }
    setLoading(false);
  }, [fetchProfile]);

  useEffect(() => {
    console.log('[Auth] AuthProvider mounted');
    let mounted = true;

    const initAuth = async () => {
      try {
        cleanHashFragment();
        console.log('[Auth] Initializing auth...');
        const sess = await getSessionWithTimeout(8000);
        if (!mounted) return;
        await processSession(sess);
      } catch (e) {
        console.error('[Auth] Init auth exception:', e);
        if (mounted) {
          setError('Erreur de connexion. Veuillez rafraîchir la page.');
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data } = supabase.auth.onAuthStateChange(async (event, sess) => {
      console.log('[Auth] Auth state changed:', event);
      if (!mounted) return;
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        cleanHashFragment();
      }
      await processSession(sess);
    });

    return () => {
      console.log('[Auth] AuthProvider unmounting');
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [processSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('[Auth] signIn:', email);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { console.error('[Auth] signIn error:', error.message); setError(error.message); }
      return { error };
    } catch (e: any) {
      const msg = e.message || 'Erreur de connexion';
      console.error('[Auth] signIn exception:', msg);
      setError(msg);
      return { error: { message: msg, status: 500 } as AuthError };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    console.log('[Auth] signUp:', email);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin }
      });
      if (error) { console.error('[Auth] signUp error:', error.message); setError(error.message); }
      return { error };
    } catch (e: any) {
      const msg = e.message || "Erreur d'inscription";
      console.error('[Auth] signUp exception:', msg);
      setError(msg);
      return { error: { message: msg, status: 500 } as AuthError };
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    console.log('[Auth] signInWithGoogle');
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) { console.error('[Auth] signInWithGoogle error:', error.message); setError(error.message); }
      return { error };
    } catch (e: any) {
      const msg = e.message || 'Erreur Google';
      console.error('[Auth] signInWithGoogle exception:', msg);
      setError(msg);
      return { error: { message: msg, status: 500 } as AuthError };
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log('[Auth] signOut');
    try {
      await supabase.auth.signOut();
      setUser(null); setSession(null); setUserRole(null);
      localStorage.removeItem('factureset_session');
      localStorage.removeItem('factureset_active_tab');
    } catch (e) { console.error('[Auth] signOut exception:', e); }
  }, []);

  console.log('[Auth] Render - user:', user?.email ?? 'null', 'loading:', loading, 'role:', userRole, 'error:', error);

  return (
    <AuthContext.Provider value={{ user, session, userRole, signIn, signUp, signInWithGoogle, signOut, loading, error }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
