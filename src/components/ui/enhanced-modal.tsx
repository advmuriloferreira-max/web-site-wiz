import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface EnhancedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnBackdrop?: boolean;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function EnhancedModal({
  isOpen,
  onClose,
  children,
  className,
  size = "md",
  closeOnBackdrop = true,
}: EnhancedModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop com blur progressivo */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ backdropFilter: "blur(0px)" }}
            animate={{ backdropFilter: "blur(8px)" }}
            exit={{ backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Modal content */}
          <motion.div
            className={cn(
              "relative w-full mx-4 bg-background rounded-lg shadow-premium-2xl border",
              sizeClasses[size],
              className
            )}
            initial={{ 
              opacity: 0, 
              scale: 0.95, 
              y: 20 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.95, 
              y: 20 
            }}
            transition={{ 
              type: "spring",
              damping: 20,
              stiffness: 300,
            }}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-muted transition-colors duration-200 z-10"
            >
              <X className="w-4 h-4" />
            </button>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.2 }}
            >
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}