import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Users, 
  FileText, 
  Calculator,
  Plus,
  Search,
  Bell,
  Menu,
  X,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEnterpriseNavigation } from "@/hooks/useEnterpriseNavigation";

const navigationItems = [
  { 
    id: "home",
    title: "Dashboard", 
    url: "/", 
    icon: BarChart3,
    color: "blue"
  },
  { 
    id: "clients",
    title: "Clientes", 
    url: "/clientes", 
    icon: Users,
    badge: 2,
    color: "green"
  },
  { 
    id: "contracts",
    title: "Contratos", 
    url: "/contratos", 
    icon: FileText,
    badge: 5,
    color: "purple"
  },
  { 
    id: "calculations",
    title: "Cálculos", 
    url: "/calculos", 
    icon: Calculator,
    color: "orange"
  },
];

interface FloatingAction {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  color: string;
}

export function EnterpriseMobileNav() {
  const location = useLocation();
  const { recentPages } = useEnterpriseNavigation();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFAB, setShowFAB] = useState(true);
  const [fabActions] = useState<FloatingAction[]>([
    {
      id: "new-client",
      title: "Novo Cliente", 
      icon: Users,
      url: "/clientes/novo",
      color: "green"
    },
    {
      id: "new-contract", 
      title: "Novo Contrato",
      icon: FileText,
      url: "/contratos/novo", 
      color: "blue"
    },
    {
      id: "search",
      title: "Buscar",
      icon: Search,
      url: "#",
      color: "purple"
    }
  ]);
  
  const [lastScrollY, setLastScrollY] = useState(0);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Pull to refresh functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.touches[0].clientY;
    
    // Check if pulling down from top
    if (window.scrollY === 0 && touchEndY.current > touchStartY.current + 50) {
      setIsRefreshing(true);
    }
  };

  const handleTouchEnd = () => {
    if (isRefreshing) {
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      // Simulate refresh
      setTimeout(() => {
        setIsRefreshing(false);
        window.location.reload();
      }, 1000);
    }
  };

  // Hide/show navigation on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;
      
      setShowFAB(!isScrollingDown || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Swipe gestures for navigation
  useEffect(() => {
    const handleSwipe = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchStartX = e.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX;
      
      if (Math.abs(deltaX) > 100) {
        // Haptic feedback for swipe
        if ('vibrate' in navigator) {
          navigator.vibrate(25);
        }
        
        // Navigate based on swipe direction
        const currentIndex = navigationItems.findIndex(item => isActive(item.url));
        if (deltaX > 0 && currentIndex > 0) {
          // Swipe right - go to previous
          window.location.href = navigationItems[currentIndex - 1].url;
        } else if (deltaX < 0 && currentIndex < navigationItems.length - 1) {
          // Swipe left - go to next
          window.location.href = navigationItems[currentIndex + 1].url;
        }
      }
    };

    document.addEventListener('touchend', handleSwipe);
    return () => document.removeEventListener('touchend', handleSwipe);
  }, [location.pathname]);

  const getItemColor = (color: string) => {
    const colors = {
      blue: "text-blue-500 bg-blue-50 dark:bg-blue-950",
      green: "text-green-500 bg-green-50 dark:bg-green-950", 
      purple: "text-purple-500 bg-purple-50 dark:bg-purple-950",
      orange: "text-orange-500 bg-orange-50 dark:bg-orange-950",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getFABColor = (color: string) => {
    const colors = {
      blue: "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/25",
      green: "bg-green-500 hover:bg-green-600 text-white shadow-green-500/25",
      purple: "bg-purple-500 hover:purple-600 text-white shadow-purple-500/25",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <>
      {/* Pull to Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground text-center py-2 text-sm animate-slide-down">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            <span>Atualizando...</span>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md",
          "border-t border-slate-200 dark:border-slate-700 md:hidden transition-transform duration-300",
          showFAB ? "translate-y-0" : "translate-y-full"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Swipe Indicator */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
        
        <div className="grid grid-cols-4 h-16">
          {navigationItems.map((item, index) => {
            const active = isActive(item.url);
            
            return (
              <NavLink
                key={item.id}
                to={item.url}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 transition-all duration-300 relative",
                  "min-h-[44px] px-2 py-2 group active:scale-95 focus:scale-105",
                  "animate-fade-in",
                  active
                    ? "text-primary scale-110"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:scale-105"
                )}
                style={{ animationDelay: `${index * 75}ms` }}
                onClick={() => {
                  // Haptic feedback on tap
                  if ('vibrate' in navigator) {
                    navigator.vibrate(30);
                  }
                }}
              >
                {/* Active Indicator */}
                {active && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full animate-scale-in" />
                )}
                
                {/* Icon with notification badge */}
                <div className="relative">
                  <div className={cn(
                    "p-1.5 rounded-lg transition-all duration-200",
                    active && getItemColor(item.color)
                  )}>
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-transform duration-200",
                        active && "scale-110"
                      )} 
                    />
                  </div>
                  
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center animate-pulse"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                
                {/* Label */}
                <span className={cn(
                  "text-xs font-medium leading-none transition-colors duration-200 text-center",
                  active ? "text-primary" : "text-slate-500 dark:text-slate-400"
                )}>
                  {item.title}
                </span>

                {/* Touch Ripple Effect */}
                <div className="absolute inset-0 rounded-lg bg-primary/10 opacity-0 transition-opacity duration-150 active:opacity-100" />
              </NavLink>
            );
          })}
        </div>
        
        {/* Safe area padding */}
        <div className="h-safe-area-inset-bottom bg-white/95 dark:bg-slate-900/95" />
      </nav>

      {/* Floating Action Button */}
      <div className={cn(
        "fixed bottom-20 right-4 z-50 transition-all duration-300",
        showFAB ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0",
        "md:hidden"
      )}>
        {/* Main FAB */}
        <div className="relative">
          <Button
            size="lg"
            className={cn(
              "h-14 w-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95",
              getFABColor("blue")
            )}
            onClick={() => {
              // Haptic feedback
              if ('vibrate' in navigator) {
                navigator.vibrate(50);
              }
              
              // Open global search
              const event = new CustomEvent('open-global-search');
              window.dispatchEvent(event);
            }}
          >
            <Search className="h-6 w-6" />
          </Button>

          {/* Quick Actions */}
          <div className="absolute bottom-full right-0 mb-4 space-y-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {fabActions.slice(0, 2).map((action, index) => (
              <NavLink
                key={action.id}
                to={action.url}
                className={cn(
                  "flex items-center justify-center h-12 w-12 rounded-full shadow-xl transition-all duration-300",
                  "hover:scale-110 active:scale-95 animate-scale-in",
                  getFABColor(action.color)
                )}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => {
                  if ('vibrate' in navigator) {
                    navigator.vibrate(40);
                  }
                }}
              >
                <action.icon className="h-5 w-5" />
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Pages Quick Access (swipe up gesture) */}
      {recentPages.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden">
          <div className="bg-white/10 backdrop-blur-sm p-2 transform translate-y-full transition-transform duration-300 hover:translate-y-0">
            <div className="flex items-center space-x-2 overflow-x-auto">
              <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0" />
              {recentPages.slice(0, 5).map((page) => (
                <NavLink
                  key={page.id}
                  to={page.url}
                  className="flex-shrink-0 text-xs text-slate-600 dark:text-slate-300 hover:text-primary"
                >
                  {page.title}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}