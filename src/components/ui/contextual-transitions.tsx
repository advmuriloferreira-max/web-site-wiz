import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

interface ContextualPageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

// Determina a direção da transição baseada na rota
function getTransitionDirection(pathname: string, previousPath?: string) {
  const routes = ['/', '/clientes', '/contratos', '/calculos', '/relatorios', '/acordos', '/configuracoes'];
  const currentIndex = routes.findIndex(route => pathname.startsWith(route));
  const previousIndex = previousPath ? routes.findIndex(route => previousPath.startsWith(route)) : -1;
  
  if (currentIndex > previousIndex) {
    return 'forward'; // slide da direita para esquerda
  } else if (currentIndex < previousIndex) {
    return 'backward'; // slide da esquerda para direita
  }
  
  return 'fade'; // fade simples para rotas desconhecidas
}

const pageVariants = {
  forward: {
    initial: { opacity: 0, x: 100, scale: 0.98 },
    in: { opacity: 1, x: 0, scale: 1 },
    out: { opacity: 0, x: -100, scale: 1.02 }
  },
  backward: {
    initial: { opacity: 0, x: -100, scale: 0.98 },
    in: { opacity: 1, x: 0, scale: 1 },
    out: { opacity: 0, x: 100, scale: 1.02 }
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
  mass: 1
};

let previousPath: string | undefined;

export function ContextualPageTransition({ 
  children, 
  className = "" 
}: ContextualPageTransitionProps) {
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

// Componente para transições de tabs
interface TabTransitionProps {
  activeTab: string;
  children: React.ReactNode;
  direction?: "left" | "right";
}

export function TabTransition({ 
  activeTab, 
  children, 
  direction = "right" 
}: TabTransitionProps) {
  const slideDirection = direction === "right" ? 1 : -1;
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 * slideDirection }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 * slideDirection }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 300,
          duration: 0.3
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Componente para sidebar collapse com reorganização suave
interface SidebarTransitionProps {
  isCollapsed: boolean;
  children: React.ReactNode;
}

export function SidebarTransition({ 
  isCollapsed, 
  children 
}: SidebarTransitionProps) {
  return (
    <motion.div
      animate={{
        width: isCollapsed ? 64 : 280,
      }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 300,
      }}
      className="relative overflow-hidden"
    >
      <motion.div
        animate={{
          opacity: isCollapsed ? 0 : 1,
          scale: isCollapsed ? 0.8 : 1,
        }}
        transition={{
          delay: isCollapsed ? 0 : 0.1,
          duration: 0.2,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}