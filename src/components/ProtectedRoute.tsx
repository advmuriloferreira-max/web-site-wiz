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
    return <Navigate to="/auth" replace />;
  }

  // Verificar se usuário tem escritório vinculado
  if (!usuarioEscritorio) {
    // Se não tem escritório, permitir apenas acesso à página de cadastro
    if (window.location.pathname.startsWith('/cadastro')) {
      return <>{children}</>;
    }
    return <Navigate to="/sem-escritorio" replace />;
  }

  // Verificar se escritório está ativo
  if (!isEscritorioAtivo()) {
    return <Navigate to="/escritorio-suspenso" replace />;
  }

  // Verificar se usuário está ativo
  if (usuarioEscritorio.status !== 'ativo') {
    return <Navigate to="/usuario-inativo" replace />;
  }

  // Verificar se requer permissão de admin
  if (requireAdmin && !hasPermission('admin')) {
    return <Navigate to="/sem-permissao" replace />;
  }

  return <>{children}</>;
}