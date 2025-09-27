import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { 
  DashboardCardSkeleton, 
  ListItemSkeleton, 
  TableSkeleton, 
  FormSkeleton, 
  ChartSkeleton 
} from "./skeleton-screens";

interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  type?: 'spinner' | 'skeleton';
  delay?: number;
}

// Componente principal para estados de loading
export function LoadingState({ 
  isLoading, 
  children, 
  skeleton, 
  type = 'skeleton',
  delay = 0 
}: LoadingStateProps) {
  const [showLoading, setShowLoading] = useState(!delay);

  useEffect(() => {
    if (delay && isLoading) {
      const timer = setTimeout(() => setShowLoading(true), delay);
      return () => clearTimeout(timer);
    }
    setShowLoading(isLoading);
  }, [isLoading, delay]);

  if (!showLoading && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    );
  }

  if (showLoading && isLoading) {
    if (type === 'spinner') {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center p-8"
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {skeleton}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// Componentes específicos para diferentes tipos de conteúdo
export function DashboardLoading({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) {
  return (
    <LoadingState
      isLoading={isLoading}
      skeleton={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <DashboardCardSkeleton />
          </motion.div>
        ))}
        </div>
      }
    >
      {children}
    </LoadingState>
  );
}

export function ListLoading({ 
  isLoading, 
  children, 
  itemCount = 5 
}: { 
  isLoading: boolean; 
  children: React.ReactNode;
  itemCount?: number;
}) {
  return (
    <LoadingState
      isLoading={isLoading}
      skeleton={
        <div className="space-y-4">
          {Array.from({ length: itemCount }).map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      }
    >
      {children}
    </LoadingState>
  );
}

export function TableLoading({ 
  isLoading, 
  children,
  rows = 5,
  columns = 4
}: { 
  isLoading: boolean; 
  children: React.ReactNode;
  rows?: number;
  columns?: number;
}) {
  return (
    <LoadingState
      isLoading={isLoading}
      skeleton={<TableSkeleton rows={rows} columns={columns} />}
    >
      {children}
    </LoadingState>
  );
}

export function FormLoading({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) {
  return (
    <LoadingState
      isLoading={isLoading}
      skeleton={<FormSkeleton />}
    >
      {children}
    </LoadingState>
  );
}

export function ChartLoading({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) {
  return (
    <LoadingState
      isLoading={isLoading}
      skeleton={<ChartSkeleton />}
    >
      {children}
    </LoadingState>
  );
}

// Hook para gerenciar estados de loading múltiplos
export function useLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = (key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: isLoading }));
  };

  const isAnyLoading = Object.values(loadingStates).some(Boolean);

  return {
    loadingStates,
    setLoading,
    isAnyLoading,
    isLoading: (key: string) => loadingStates[key] ?? false
  };
}