import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Users, 
  FileText, 
  Calculator,
  Plus
} from "lucide-react";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Contratos", url: "/contratos", icon: FileText },
  { title: "Cálculos", url: "/calculos", icon: Calculator },
  { title: "Novo", url: "/contratos/novo", icon: Plus },
];

export function BottomNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden animate-slide-up">
      <div className="grid grid-cols-5 h-16">
        {navigationItems.map((item, index) => {
          const active = isActive(item.url);
          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-all duration-200 relative",
                "min-h-[44px] px-2 py-2 interactive-button focus-ring",
                "animate-fade-in",
                active
                  ? "text-primary scale-110"
                  : "text-slate-500 hover:text-slate-700 hover:scale-105"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {active && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full animate-scale-in" />
              )}
              
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  active && "scale-110"
                )} 
              />
              
              <span className={cn(
                "text-xs font-medium leading-none transition-colors duration-200",
                active ? "text-primary" : "text-slate-500"
              )}>
                {item.title}
              </span>

              {/* Ripple effect for touch feedback */}
              <div className="absolute inset-0 rounded-lg bg-primary/10 opacity-0 transition-opacity duration-150 active:opacity-100" />
            </NavLink>
          );
        })}
      </div>
      
      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white/95" />
    </nav>
  );
}