import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  isLoading: boolean;
  duration?: number;
  label?: string;
  className?: string;
}

export function ProgressBar({ 
  isLoading, 
  duration = 3000, 
  label = "Carregando...",
  className = "" 
}: ProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        const increment = Math.random() * 15 + 5;
        return Math.min(prev + increment, 95);
      });
    }, duration / 20);

    return () => clearInterval(interval);
  }, [isLoading, duration]);

  useEffect(() => {
    if (!isLoading && progress > 0) {
      setProgress(100);
      const timeout = setTimeout(() => setProgress(0), 500);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, progress]);

  if (!isLoading && progress === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b ${className}`}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1" />
      </div>
    </motion.div>
  );
}

// Hook para gerenciar progresso automático
export function useProgressBar(isLoading: boolean, options?: {
  minDuration?: number;
  label?: string;
}) {
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowProgress(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowProgress(true);
    }, options?.minDuration ?? 2000);

    return () => clearTimeout(timer);
  }, [isLoading, options?.minDuration]);

  return {
    showProgress: showProgress && isLoading,
    ProgressBarComponent: (props: Omit<ProgressBarProps, 'isLoading'>) => (
      <ProgressBar isLoading={showProgress && isLoading} {...props} />
    )
  };
}