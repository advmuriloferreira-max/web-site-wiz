import React from "react";
import { Link, LinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AnimatedLinkProps extends LinkProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "muted";
  className?: string;
}

export function AnimatedLink({ 
  children, 
  variant = "default", 
  className, 
  ...props 
}: AnimatedLinkProps) {
  const variantClasses = {
    default: "text-foreground hover:text-primary",
    primary: "text-primary hover:text-primary-hover",
    muted: "text-muted-foreground hover:text-foreground",
  };

  return (
    <Link
      className={cn(
        "interactive-link focus-ring relative inline-block",
        "after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5", 
        "after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right",
        "after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

// Componente para links externos
interface AnimatedExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  variant?: "default" | "primary" | "muted";
}

export function AnimatedExternalLink({ 
  children, 
  variant = "default", 
  className, 
  ...props 
}: AnimatedExternalLinkProps) {
  const variantClasses = {
    default: "text-foreground hover:text-primary",
    primary: "text-primary hover:text-primary-hover",
    muted: "text-muted-foreground hover:text-foreground",
  };

  return (
    <a
      className={cn(
        "interactive-link focus-ring relative inline-block",
        "after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5", 
        "after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right",
        "after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}