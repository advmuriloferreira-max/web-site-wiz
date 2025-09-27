import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface PremiumSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "gradient" | "dots" | "pulse";
}

export function PremiumSpinner({ 
  className, 
  size = "md", 
  variant = "default" 
}: PremiumSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
  };

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center space-x-1", className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              "rounded-full bg-primary",
              size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : "w-3 h-3"
            )}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <motion.div
        className={cn(
          "rounded-full bg-primary/20 border-2 border-primary",
          sizeClasses[size],
          className
        )}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    );
  }

  if (variant === "gradient") {
    return (
      <motion.div
        className={cn(
          "rounded-full bg-gradient-button animate-gradient",
          sizeClasses[size],
          className
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        style={{
          background: "conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))",
        }}
      >
        <div className="w-full h-full rounded-full bg-background m-0.5" />
      </motion.div>
    );
  }

  return (
    <Loader2 
      className={cn("animate-spin text-primary", sizeClasses[size], className)} 
    />
  );
}