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
  { title: "Painel de Controle", url: "/app", icon: LegalIcons.dashboard },
  { title: "Painel do Cliente", url: "/app/painel-cliente", icon: LegalIcons.clients, badge: "NOVO", highlight: true },
  { title: "Clientes", url: "/app/clientes", icon: LegalIcons.clients, dataTour: "sidebar-clientes" },
  { title: "Contratos", url: "/app/contratos", icon: LegalIcons.contract, dataTour: "sidebar-contratos" },
  { title: "Processos Judiciais", url: "/app/processos", icon: LegalIcons.process },
  { title: "Acordos", url: "/app/acordos", icon: LegalIcons.agreement, dataTour: "sidebar-acordos" },
  { title: "Provisões", url: "/app/calculos", icon: LegalIcons.calculations, dataTour: "sidebar-calculos" },
  { title: "Indicadores", url: "/app/relatorios", icon: LegalIcons.reports, dataTour: "sidebar-relatorios" },
  { title: "Análises Avançadas", url: "/app/relatorios-avancados", icon: LegalIcons.reports },
];

const jurosItems = [
  { title: "Clientes", url: "/app/juros/clientes", icon: LegalIcons.clients },
  { title: "Contratos", url: "/app/juros/contratos", icon: LegalIcons.contract },
  { title: "Calculadora de Juros", url: "/app/calculadora-juros", icon: LegalIcons.calculations },
];

const superendividamentoItems = [
  { title: "Dashboard", url: "/app/superendividamento", icon: LegalIcons.dashboard },
  { title: "Clientes", url: "/app/superendividamento/clientes", icon: LegalIcons.clients },
  { title: "Análise Socioeconômica", url: "/app/superendividamento/analise", icon: LegalIcons.calculations },
  { title: "Planos de Pagamento", url: "/app/superendividamento/planos", icon: LegalIcons.agreement },
  { title: "Calculadora Rápida", url: "/app/superendividamento/calculadora", icon: LegalIcons.calculations },
];

const adminItems = [
  { title: "Dashboard Admin", url: "/app/admin", icon: LegalIcons.settings },
  { title: "Gerenciar Escritório", url: "/app/configuracoes/escritorio", icon: LegalIcons.settings },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const { profile, usuarioEscritorio, signOut } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";
  const isAdmin = usuarioEscritorio?.permissoes?.admin || profile?.role === 'admin';

  const escritorio = usuarioEscritorio?.escritorio;
  const getStatusBadge = () => {
    if (!escritorio) return null;
    const dataVencimento = new Date(escritorio.data_vencimento);
    const hoje = new Date();
    const isExpired = dataVencimento < hoje;
    const isTrial = (dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24) <= 30;

    if (isExpired) return { label: 'VENCIDO', color: 'bg-destructive' };
    if (isTrial) return { label: 'TRIAL', color: 'bg-warning' };
    return { label: 'ATIVO', color: 'bg-success' };
  };

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
            : isHighlight 
            ? 'text-white hover:text-white bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-400/30 hover:from-blue-600/30 hover:to-purple-600/30'
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
                className={cn(
                  "text-[10px] px-1.5 py-0 font-bold",
                  isHighlight 
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none animate-pulse" 
                    : "bg-sidebar-primary/20 text-sidebar-primary border-sidebar-primary/30"
                )}
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

        {/* Separador */}
        <div className="mx-4 my-2 border-t border-sidebar-border/50" />

        {/* Superendividamento - Lei 14.181/2021 */}
        <SidebarGroup className="py-3">
          {!isCollapsed && (
            <>
              <SidebarGroupLabel className="text-sm uppercase tracking-wider text-sidebar-foreground/80 px-4 py-2 font-black">
                Superendividamento
              </SidebarGroupLabel>
              <div className="h-1 bg-accent mx-4 rounded-full"></div>
            </>
          )}
          <SidebarGroupContent>
            <div className="space-y-1 px-2">
              {superendividamentoItems.map((item) => (
                <MenuItem key={item.title} item={item} tooltip />
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administração - Apenas para Admins */}
        {isAdmin && (
          <>
            {/* Separador */}
            <div className="mx-4 my-2 border-t border-sidebar-border/50" />
            
            <SidebarGroup className="py-3">
              {!isCollapsed && (
                <>
                  <SidebarGroupLabel className="text-sm uppercase tracking-wider text-sidebar-foreground/80 px-4 py-2 font-black">
                    Administração
                  </SidebarGroupLabel>
                  <div className="h-1 bg-destructive mx-4 rounded-full"></div>
                </>
              )}
              <SidebarGroupContent>
                <div className="space-y-1 px-2">
                  {adminItems.map((item) => (
                    <MenuItem key={item.title} item={item} tooltip />
                  ))}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

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

          {/* Escritório Info */}
          {escritorio && !isCollapsed && (
            <div className="mb-3 p-3 rounded-lg bg-sidebar-primary/10 border border-sidebar-primary/20">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sidebar-foreground/70">Escritório</span>
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 font-bold", getStatusBadge()?.color)}>
                    {getStatusBadge()?.label}
                  </Badge>
                </div>
                <p className="text-sm font-black text-sidebar-foreground truncate">
                  {escritorio.nome}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sidebar-foreground/70 font-semibold">Plano</span>
                  <span className="text-sidebar-foreground font-bold uppercase">{escritorio.plano}</span>
                </div>
              </div>
            </div>
          )}

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
                    {usuarioEscritorio?.cargo || 'Usuário Autorizado'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Ações - Configurações e Logout */}
          <div className="flex items-center gap-1 mt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex-1 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors duration-200 h-8 font-extrabold"
                >
                  <NavLink to="/app/configuracoes">
                    <LegalIcons.settings className="h-4 w-4" />
                    {!isCollapsed && <span className="ml-2 text-xs font-extrabold">Configurações</span>}
                  </NavLink>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                Configurações
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="flex-1 text-sidebar-foreground/80 hover:text-destructive hover:bg-destructive/10 transition-colors duration-200 h-8 font-extrabold"
                >
                  <LegalIcons.logout className="h-4 w-4" />
                  {!isCollapsed && <span className="ml-2 text-xs font-extrabold">Sair</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                Sair do Sistema
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}