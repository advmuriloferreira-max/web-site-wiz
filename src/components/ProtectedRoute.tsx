import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, usuarioEscritorio, loading, isEscritorioAtivo, hasPermission } = useAuth();

  console.log('🔐 ProtectedRoute - Estado:', { 
    user: user?.email, 
    usuarioEscritorio: usuarioEscritorio?.nome, 
    loading,
    path: window.location.pathname 
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-72 mx-auto" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ Sem usuário - redirecionando para /auth');
    return <Navigate to="/auth" replace />;
  }

  // Verificar se usuário tem escritório vinculado
  if (!usuarioEscritorio) {
    // Se não tem escritório, permitir apenas acesso à página de cadastro
    if (window.location.pathname.startsWith('/cadastro')) {
      console.log('✅ Permitindo acesso ao cadastro');
      return <>{children}</>;
    }
    console.log('⚠️ Sem escritório - redirecionando para /sem-escritorio');
    return <Navigate to="/sem-escritorio" replace />;
  }

  // Verificar se escritório está ativo
  if (!isEscritorioAtivo()) {
    console.log('⚠️ Escritório inativo - redirecionando para /escritorio-suspenso');
    return <Navigate to="/escritorio-suspenso" replace />;
  }

  // Verificar se usuário está ativo
  if (usuarioEscritorio.status !== 'ativo') {
    console.log('⚠️ Usuário inativo - redirecionando para /usuario-inativo');
    return <Navigate to="/usuario-inativo" replace />;
  }

  // Verificar se requer permissão de admin
  if (requireAdmin && !hasPermission('admin')) {
    console.log('⚠️ Sem permissão admin - redirecionando para /sem-permissao');
    return <Navigate to="/sem-permissao" replace />;
  }

  console.log('✅ Acesso permitido');
  return <>{children}</>;
}