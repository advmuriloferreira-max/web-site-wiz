import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UsuarioEscritorio {
  id: string;
  escritorio_id: string;
  nome: string;
  email: string;
  cargo: string | null;
  permissoes: {
    read: boolean;
    write: boolean;
    admin: boolean;
  };
  status: string;
  escritorio: {
    id: string;
    nome: string;
    plano: string;
    status: string;
    data_vencimento: string | null;
    limite_usuarios: number;
    limite_clientes: number;
    limite_contratos: number;
  } | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  usuarioEscritorio: UsuarioEscritorio | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, nome: string) => Promise<{ error: any }>;
  createUser: (email: string, password: string, nome: string, role: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasPermission: (permission: 'read' | 'write' | 'admin') => boolean;
  isEscritorioAtivo: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [usuarioEscritorio, setUsuarioEscritorio] = useState<UsuarioEscritorio | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === 'admin' || usuarioEscritorio?.permissoes?.admin === true;

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user profile when logged in
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
            loadUsuarioEscritorio(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUsuarioEscritorio(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
        loadUsuarioEscritorio(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const loadUsuarioEscritorio = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios_escritorio')
        .select(`
          *,
          escritorio:escritorios(
            id,
            nome,
            plano,
            status,
            data_vencimento,
            limite_usuarios,
            limite_clientes,
            limite_contratos
          )
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setUsuarioEscritorio(data as unknown as UsuarioEscritorio);
      } else {
        setUsuarioEscritorio(null);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setUsuarioEscritorio(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signUp = async (email: string, password: string, nome: string) => {
    // Registro público desabilitado - apenas para compatibilidade
    return { error: { message: 'Registro público desabilitado. Contate o administrador.' } };
  };

  const createUser = async (email: string, password: string, nome: string, role: string = 'assistente') => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          nome: nome,
          role: role
        }
      }
    });

    // Se usuário foi criado com sucesso, definir o role
    if (!error && data.user) {
      // O trigger handle_new_user já criará o profile
      // Vamos aguardar um pouco e então definir o role
      setTimeout(async () => {
        try {
          await supabase.from('user_roles').insert([{
            user_id: data.user!.id,
            role: role as 'admin' | 'advogado' | 'assistente',
            created_by: user?.id
          }]);
        } catch (roleError) {
          console.error('Error setting user role:', roleError);
        }
      }, 1000);
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUsuarioEscritorio(null);
  };

  const hasPermission = (permission: 'read' | 'write' | 'admin'): boolean => {
    if (!usuarioEscritorio) return false;
    return usuarioEscritorio.permissoes[permission] ?? false;
  };

  const isEscritorioAtivo = (): boolean => {
    if (!usuarioEscritorio?.escritorio) return false;
    
    const { status, data_vencimento } = usuarioEscritorio.escritorio;
    
    if (status !== 'ativo') return false;
    
    if (!data_vencimento) return true;
    
    const vencimento = new Date(data_vencimento);
    const hoje = new Date();
    
    return vencimento > hoje;
  };

  return {
    user,
    session,
    profile,
    usuarioEscritorio,
    loading,
    isAdmin,
    signIn,
    signUp,
    createUser,
    signOut,
    hasPermission,
    isEscritorioAtivo
  };
}

export { AuthContext };