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

const provisionamentoItems = [
  { title: "Painel de Controle", url: "/", icon: LegalIcons.dashboard },
  { title: "Clientes", url: "/clientes", icon: LegalIcons.clients, dataTour: "sidebar-clientes" },
  { title: "Contratos", url: "/contratos", icon: LegalIcons.contract, dataTour: "sidebar-contratos" },
  { title: "Processos Judiciais", url: "/processos", icon: LegalIcons.process },
  { title: "Acordos", url: "/acordos", icon: LegalIcons.agreement, dataTour: "sidebar-acordos" },
  { title: "Provisões", url: "/calculos", icon: LegalIcons.calculations, dataTour: "sidebar-calculos" },
  { title: "Indicadores", url: "/relatorios", icon: LegalIcons.reports, dataTour: "sidebar-relatorios" },
  { title: "Análises Avançadas", url: "/relatorios-avancados", icon: LegalIcons.reports },
];

const jurosItems = [
  { title: "Clientes", url: "/juros/clientes", icon: LegalIcons.clients },
  { title: "Contratos", url: "/juros/contratos", icon: LegalIcons.contract },
  { title: "Calculadora de Juros", url: "/calculadora-juros", icon: LegalIcons.calculations },
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
    const isHighlight = item.highlight === true;
    
    const content = (
      <NavLink 
        to={item.url} 
        end 
        data-tour={item.dataTour}
        className={`
          flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg transition-all duration-200 font-extrabold
          ${active
            ? 'bg-sidebar-accent text-white font-black'
            : 'text-white hover:text-white hover:bg-sidebar-accent/50'
          }
        `}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        {!isCollapsed && (
          <>
            <span className="flex-1 truncate">{item.title}</span>
            {item.badge && (
              <Badge 
                variant="secondary" 
                className="text-[10px] px-1.5 py-0 font-bold bg-sidebar-primary/20 text-sidebar-primary border-sidebar-primary/30"
              >
                {item.badge}
              </Badge>
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
        "bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
       {/* Header Executivo - Provisionamento */}
       <div className="flex items-center justify-between h-16 px-4 border-b-2 border-sidebar-border">
         {!isCollapsed ? (
           <div className="flex items-center justify-between w-full gap-2">
             <h2 className="text-sm font-extrabold text-sidebar-foreground leading-tight tracking-wider flex-1 text-center">
               SISTEMA JURÍDICO BANCÁRIO
             </h2>
             <Button
               variant="ghost"
               size="sm"
               onClick={toggleSidebar}
               className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 flex-shrink-0"
             >
               <LegalIcons.collapse className="h-4 w-4" />
             </Button>
           </div>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="w-10 h-10 bg-sidebar-primary/20 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-sidebar-primary">SJB</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            >
              <LegalIcons.expand className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <SidebarContent className="px-0 overflow-y-auto">
        {/* Provisionamento Bancário */}
        <SidebarGroup className="py-3">
          {!isCollapsed && (
            <>
              <SidebarGroupLabel className="text-sm uppercase tracking-wider text-sidebar-foreground/80 px-4 py-2 font-black">
                Provisionamento
              </SidebarGroupLabel>
              <div className="h-1 bg-accent mx-4 rounded-full"></div>
            </>
          )}
          <SidebarGroupContent>
            <div className="space-y-1 px-2">
              {provisionamentoItems.map((item) => (
                <MenuItem key={item.title} item={item} tooltip />
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Separador */}
        <div className="mx-4 my-2 border-t border-sidebar-border/50" />

        {/* Análise de Abusividade de Juros */}
        <SidebarGroup className="py-3">
          {!isCollapsed && (
            <>
              <SidebarGroupLabel className="text-sm uppercase tracking-wider text-sidebar-foreground/80 px-4 py-2 font-black">
                Análise de Juros
              </SidebarGroupLabel>
              <div className="h-1 bg-accent mx-4 rounded-full"></div>
            </>
          )}
          <SidebarGroupContent>
            <div className="space-y-1 px-2">
              {jurosItems.map((item) => (
                <MenuItem key={item.title} item={item} tooltip />
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer com Informações de Confiança */}
        <div className="mt-auto border-t border-sidebar-border p-3">
          
          {/* Sistema Status Compacto */}
          <div className="flex items-center justify-center mb-3">
          {!isCollapsed ? (
            <div className="flex items-center gap-2 text-xs text-sidebar-foreground/80 font-black">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Sistema Seguro</span>
              <Badge variant="outline" className="ml-2 bg-sidebar-primary/20 text-sidebar-primary text-[10px] px-1.5 py-0 font-bold">
                BCB 352/2023
              </Badge>
            </div>
          ) : (
            <div className="w-2 h-2 bg-success rounded-full mx-auto"></div>
          )}
          </div>

          {/* User Profile Compacto */}
          {profile && (
            <div className={cn(
              "flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50 transition-all duration-200 hover:bg-sidebar-accent",
              isCollapsed ? 'justify-center' : ''
            )}>
              <Avatar className="h-8 w-8 ring-2 ring-sidebar-primary/30">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                  {profile.nome ? getInitials(profile.nome) : <LegalIcons.user className="h-3 w-3" />}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-sidebar-foreground truncate">
                    {profile.nome}
                  </p>
                  <p className="text-xs text-sidebar-foreground/70 truncate font-extrabold">
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
                  className="flex-1 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors duration-200 h-8 font-extrabold"
                >
                  <NavLink to="/configuracoes">
                    <LegalIcons.settings className="h-4 w-4" />
                    {!isCollapsed && <span className="ml-2 text-xs font-extrabold">Configurações</span>}
                  </NavLink>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                Configurações
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}