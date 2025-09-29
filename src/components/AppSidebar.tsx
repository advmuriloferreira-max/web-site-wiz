import { useState } from "react";
import { LegalIcons } from "@/components/ui/legal-icons";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const allNavigationItems = [
  { title: "Painel de Controle", url: "/", icon: LegalIcons.dashboard, badge: null },
  { title: "Clientes", url: "/clientes", icon: LegalIcons.clients, dataTour: "sidebar-clientes", badge: null },
  { title: "Contratos", url: "/contratos", icon: LegalIcons.contract, dataTour: "sidebar-contratos", badge: "3" },
  { title: "Processos Judiciais", url: "/processos", icon: LegalIcons.process, badge: null },
  { title: "Acordos", url: "/acordos", icon: LegalIcons.agreement, dataTour: "sidebar-acordos", badge: "2" },
  { title: "Provisões", url: "/calculos", icon: LegalIcons.calculations, dataTour: "sidebar-calculos", badge: null },
  { title: "Indicadores", url: "/relatorios", icon: LegalIcons.reports, dataTour: "sidebar-relatorios", badge: null },
  { title: "Análises Avançadas", url: "/relatorios-avancados", icon: LegalIcons.reports },
  { title: "Novo Cliente", url: "/clientes/novo", icon: LegalIcons.add },
  { title: "Novo Contrato", url: "/contratos/novo", icon: LegalIcons.contract },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const { profile } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  
  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const MenuItem = ({ item, tooltip }: { item: any; tooltip?: boolean }) => {
    const active = isActive(item.url);
    const isQuickAction = item.title === "Novo Cliente" || item.title === "Novo Contrato";
    
    const content = (
      <NavLink 
        to={item.url} 
        end 
        data-tour={item.dataTour}
        className={`
          flex items-center gap-3 px-3 py-3 mx-2 rounded-lg transition-all duration-200 font-medium border-l-4
          ${isQuickAction 
            ? active 
              ? 'bg-gradient-to-r from-green-500/30 to-green-400/20 text-green-400 border-green-400 shadow-lg shadow-green-400/20 scale-[1.02] ring-2 ring-green-400/30' 
              : 'bg-gradient-to-r from-green-500/20 to-green-400/10 text-green-400 hover:from-green-500/30 hover:to-green-400/20 hover:scale-[1.02] border-green-400/50 shadow-md shadow-green-400/10 hover:shadow-lg hover:shadow-green-400/20 ring-1 ring-green-400/20'
            : active 
              ? 'bg-accent/20 text-accent border-accent shadow-md shadow-accent/10 scale-[1.02]' 
              : 'text-sidebar-foreground/80 hover:bg-accent/10 hover:text-accent hover:scale-[1.01] border-transparent hover:border-accent/30'
          }
        `}
      >
        <item.icon className={`h-5 w-5 flex-shrink-0 ${isQuickAction ? 'text-green-400 drop-shadow-sm' : ''}`} />
        {!isCollapsed && (
          <>
            <span className={`font-medium truncate ${isQuickAction ? 'font-semibold' : ''}`}>{item.title}</span>
            {item.badge && (
              <Badge 
                variant="secondary" 
                className="ml-auto bg-accent/20 text-accent text-xs px-2 py-0.5 font-bold animate-pulse border border-accent/30"
              >
                {item.badge}
              </Badge>
            )}
            {isQuickAction && !active && (
              <div className="ml-auto">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
            )}
          </>
        )}
      </NavLink>
    );

    if (tooltip && isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <Sidebar 
      className={cn(
        "bg-gradient-sidebar border-r-2 border-accent/20 shadow-2xl backdrop-blur-sm transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
       {/* Header Executivo */}
       <div className="executive-header flex items-center justify-between p-4">
         {!isCollapsed ? (
           <div className="flex items-center gap-3 group">
             <div className="w-10 h-10 bg-accent rounded-sm flex items-center justify-center shadow-xl flex-shrink-0">
               <LegalIcons.justice className="h-6 w-6 text-primary" />
             </div>
             <div className="transition-all duration-300 min-w-0">
               <h2 className="text-sm font-bold text-white tracking-wide leading-tight">
                 PROVISIONAMENTO<br />BANCÁRIO INTELIGENTE
               </h2>
             </div>
           </div>
        ) : (
          <div className="w-10 h-10 bg-accent rounded-sm flex items-center justify-center shadow-xl mx-auto">
            <LegalIcons.justice className="h-6 w-6 text-primary" />
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="text-accent hover:text-white hover:bg-accent/20 transition-colors duration-200 border border-accent/30"
        >
          {isCollapsed ? <LegalIcons.expand className="h-4 w-4" /> : <LegalIcons.collapse className="h-4 w-4" />}
        </Button>
      </div>
      
      <SidebarContent className="px-0 overflow-y-auto bg-gradient-sidebar">
        {/* Navegação Única */}
        <SidebarGroup className="py-4">
          <SidebarGroupContent>
            <div className="space-y-1 px-2">
              {allNavigationItems.map((item) => (
                <MenuItem key={item.title} item={item} tooltip />
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer com Informações de Confiança */}
        <div className="mt-auto border-t border-slate-700/30 p-3">
          
          {/* Sistema Status Compacto */}
          <div className="flex items-center justify-center mb-3">
            {!isCollapsed ? (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span>Sistema Seguro</span>
                <Badge variant="outline" className="ml-2 bg-accent/20 text-accent text-xs px-2 py-0.5">
                  BCB 352/2023
                </Badge>
              </div>
            ) : (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mx-auto"></div>
            )}
          </div>

          {/* User Profile Compacto */}
          {profile && (
            <div className={cn(
              "flex items-center gap-3 p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-200 hover:bg-white/10",
              isCollapsed ? 'justify-center' : ''
            )}>
              <Avatar className="h-8 w-8 ring-2 ring-primary/30">
                <AvatarFallback className="bg-gradient-to-br from-accent to-accent/80 text-primary-foreground text-xs font-semibold">
                  {profile.nome ? getInitials(profile.nome) : <LegalIcons.user className="h-3 w-3" />}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {profile.nome}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    Usuário Autorizado
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Configurações Compacto */}
          <div className="flex items-center gap-1 mt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex-1 text-slate-400 hover:text-white hover:bg-white/10 transition-colors duration-200 h-7"
                >
                  <NavLink to="/configuracoes">
                    <LegalIcons.settings className="h-3 w-3" />
                    {!isCollapsed && <span className="ml-2 text-xs">Config</span>}
                  </NavLink>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700 text-xs">
                Configurações
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}