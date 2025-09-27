import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

// Determina a direção da transição baseada na rota
function getTransitionDirection(pathname: string, previousPath?: string) {
  const routes = ['/', '/clientes', '/contratos', '/calculos', '/relatorios', '/acordos', '/configuracoes'];
  const currentIndex = routes.findIndex(route => pathname.startsWith(route));
  const previousIndex = previousPath ? routes.findIndex(route => previousPath.startsWith(route)) : -1;
  
  if (currentIndex > previousIndex) {
    return 'forward';
  } else if (currentIndex < previousIndex) {
    return 'backward';
  }
  
  return 'fade';
}

const pageVariants = {
  forward: {
    initial: { opacity: 0, x: 50, scale: 0.98 },
    in: { opacity: 1, x: 0, scale: 1 },
    out: { opacity: 0, x: -50, scale: 1.02 }
  },
  backward: {
    initial: { opacity: 0, x: -50, scale: 0.98 },
    in: { opacity: 1, x: 0, scale: 1 },
    out: { opacity: 0, x: 50, scale: 1.02 }
  },
  fade: {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    in: { opacity: 1, y: 0, scale: 1 },
    out: { opacity: 0, y: -20, scale: 1.02 }
  }
};

const pageTransition = {
  type: "spring" as const,
  damping: 25,
  stiffness: 300,
  mass: 0.8
};

let previousPath: string | undefined;

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  const location = useLocation();
  const direction = getTransitionDirection(location.pathname, previousPath);
  const variants = pageVariants[direction];
  
  React.useEffect(() => {
    previousPath = location.pathname;
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={variants}
        transition={pageTransition}
        className={`min-h-screen ${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Componente para animações de lista
interface ListAnimationProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function ListAnimation({ children, className = "", delay = 0 }: ListAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Componente para animações de fade
export function FadeInOut({ 
  children, 
  show = true, 
  className = "" 
}: { 
  children: React.ReactNode; 
  show?: boolean; 
  className?: string; 
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Componente para animações de escala
export function ScaleAnimation({ 
  children, 
  className = "",
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.2, 
        delay,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Hook para animações sequenciais
export function useStaggeredAnimation(itemCount: number, staggerDelay: number = 0.1) {
  return Array.from({ length: itemCount }, (_, i) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { 
      duration: 0.3, 
      delay: i * staggerDelay,
      ease: "easeOut"
    }
  }));
}