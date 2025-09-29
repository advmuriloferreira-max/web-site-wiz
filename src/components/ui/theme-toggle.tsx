import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
  const [theme, setTheme] = React.useState<"light" | "dark">(
    () => {
      if (typeof window !== "undefined") {
        return localStorage.getItem("theme") === "dark" ? "dark" : "light";
      }
      return "light";
    }
  );

  React.useEffect(() => {
    const root = window.document.documentElement;
    
    // Add smooth transition for theme change
    root.style.setProperty('transition', 'color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease');
    
    if (theme === "dark") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    // Remove transition after animation completes
    setTimeout(() => {
      root.style.removeProperty('transition');
    }, 300);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-9 w-9", 
    lg: "h-10 w-10",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:bg-accent/50",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "dark:hover:bg-accent/20",
        sizeClasses[size],
        className
      )}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {/* Sun icon for light mode */}
      <Sun 
        className={cn(
          "absolute transition-all duration-500 ease-in-out",
          iconSizes[size],
          theme === "light" 
            ? "rotate-0 scale-100 opacity-100" 
            : "rotate-90 scale-0 opacity-0"
        )} 
      />
      
      {/* Moon icon for dark mode */}
      <Moon 
        className={cn(
          "absolute transition-all duration-500 ease-in-out", 
          iconSizes[size],
          theme === "dark" 
            ? "rotate-0 scale-100 opacity-100" 
            : "-rotate-90 scale-0 opacity-0"
        )} 
      />
      
      {/* Glow effect for dark mode */}
      {theme === "dark" && (
        <div className="absolute inset-0 rounded-md bg-primary/10 animate-pulse" />
      )}
    </Button>
  );
}

// Hook for theme awareness in components
export function useTheme() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Set initial theme
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");

    return () => observer.disconnect();
  }, []);

  return theme;
}

// Context-aware color utility
export function getContextualColor(section: "contratos" | "clientes" | "relatorios" | "configuracoes") {
  const colors = {
    contratos: "text-blue-500 bg-blue-50 dark:bg-blue-950 dark:text-blue-400",
    clientes: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400", 
    relatorios: "text-purple-500 bg-purple-50 dark:bg-purple-950 dark:text-purple-400",
    configuracoes: "text-slate-500 bg-slate-50 dark:bg-slate-950 dark:text-slate-400",
  };
  
  return colors[section];
}