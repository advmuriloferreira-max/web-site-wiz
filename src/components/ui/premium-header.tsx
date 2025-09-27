import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Brain, Search, Bell, ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserMenu } from "@/components/UserMenu";
import { cn } from "@/lib/utils";

interface PremiumHeaderProps {
  onSearchClick: () => void;
}

export function PremiumHeader({ onSearchClick }: PremiumHeaderProps) {
  const location = useLocation();
  const [notificationCount] = useState(3);
  
  // Mapear rotas para breadcrumbs
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbMap: Record<string, string> = {
      '': 'Dashboard',
      'clientes': 'Clientes',
      'contratos': 'Contratos',
      'calculos': 'Calculadoras',
      'processos': 'Processos',
      'acordos': 'Acordos',
      'relatorios': 'Relatórios',
      'relatorios-avancados': 'Relatórios Avançados',
      'configuracoes': 'Configurações',
      'novo': 'Novo'
    };
    
    const breadcrumbs = [{ name: 'Home', path: '/' }];
    
    segments.forEach((segment, index) => {
      const fullPath = '/' + segments.slice(0, index + 1).join('/');
      const name = breadcrumbMap[segment] || segment;
      breadcrumbs.push({ name, path: fullPath });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = getBreadcrumbs();
  
  return (
    <header className="h-16 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 px-6 shadow-lg backdrop-blur-sm sticky top-0 z-50">
      {/* Logo e Sidebar Toggle */}
      <div className="flex items-center space-x-4">
        <SidebarTrigger className="text-white hover:bg-white/10 transition-colors duration-200" />
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Brain className="h-8 w-8 text-blue-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full animate-ping opacity-75" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              INTELLBANK
            </h1>
            <p className="text-xs text-slate-300 font-light">
              Inteligência em Provisionamento Bancário
            </p>
          </div>
        </div>
      </div>
      
      {/* Breadcrumbs - Centro */}
      <div className="flex-1 flex justify-center">
        <nav className="flex items-center space-x-1 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.path} className="flex items-center">
              {index === 0 && <Home className="h-4 w-4 text-slate-400 mr-1" />}
              <span
                className={cn(
                  "px-2 py-1 rounded-md transition-all duration-200",
                  index === breadcrumbs.length - 1
                    ? "text-blue-400 font-medium bg-blue-500/10 border border-blue-500/20"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                )}
              >
                {crumb.name}
              </span>
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="h-4 w-4 text-slate-500 mx-1" />
              )}
            </div>
          ))}
        </nav>
      </div>
      
      {/* Área do usuário - Direita */}
      <div className="flex items-center space-x-3">
        {/* Busca com Glassmorphism */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onSearchClick}
          className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-slate-300 hover:text-white transition-all duration-300 hover:scale-105"
        >
          <Search className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
          <span className="hidden md:inline">Buscar</span>
          <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
        </Button>
        
        {/* Notificações */}
        <Button
          variant="ghost"
          size="sm"
          className="relative text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
        >
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-bounce bg-red-500 hover:bg-red-500"
            >
              {notificationCount}
            </Badge>
          )}
        </Button>
        
        {/* Menu do usuário */}
        <div className="relative">
          <UserMenu />
        </div>
      </div>
      
      {/* Indicador de página ativa - linha colorida na parte inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" />
    </header>
  );
}