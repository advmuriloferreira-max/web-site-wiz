import { useState } from "react";
import { Home, Users, Calculator, FileText, Settings, ChevronDown, ChevronRight } from "lucide-react";
import { LegalIcons } from "@/components/ui/legal-icons";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    path: "/app/home",
  },
  {
    title: "Gestão de Clientes",
    icon: Users,
    items: [
      { title: "Clientes", path: "/app/clientes" },
      { title: "Contratos", path: "/app/contratos" },
    ],
  },
  {
    title: "Módulos de Análise",
    icon: Calculator,
    items: [
      {
        title: "Provisionamento Bancário",
        path: "/app/analises/provisionamento",
        description: "Res. 4966 BACEN",
      },
      {
        title: "Juros Abusivos",
        path: "/app/analises/juros-abusivos",
        description: "Séries Temporais BACEN",
      },
      {
        title: "Superendividamento",
        path: "/app/analises/superendividamento",
        description: "Lei 14.181/2021",
      },
    ],
  },
  {
    title: "Configurações",
    icon: Settings,
    path: "/app/configuracoes",
  },
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

  // Estado para controlar grupos expandidos
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "Gestão de Clientes",
    "Módulos de Análise"
  ]);

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupTitle)
        ? prev.filter(t => t !== groupTitle)
        : [...prev, groupTitle]
    );
  };

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

  const isGroupActive = (items: any[]) => {
    return items.some(item => isActive(item.path));
  };

  const SimpleMenuItem = ({ item }: { item: any }) => {
    const active = isActive(item.path);
    
    const content = (
      <NavLink 
        to={item.path} 
        end 
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium",
          active
            ? 'bg-sidebar-accent text-white'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white'
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        {!isCollapsed && (
          <span className="flex-1 truncate">{item.title}</span>
        )}
      </NavLink>
    );

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  const GroupMenuItem = ({ group }: { group: any }) => {
    const isExpanded = expandedGroups.includes(group.title);
    const hasActiveItem = isGroupActive(group.items);

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 cursor-pointer">
              <group.icon className="h-5 w-5" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div>
              <p className="font-medium">{group.title}</p>
              {group.items.map((item: any) => (
                <p key={item.path} className="text-xs text-muted-foreground mt-1">
                  • {item.title}
                </p>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(group.title)}>
        <CollapsibleTrigger className="w-full">
          <div className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium",
            hasActiveItem 
              ? "bg-sidebar-accent/50 text-white" 
              : "text-sidebar-foreground hover:bg-sidebar-accent/30"
          )}>
            <group.icon className="h-5 w-5 flex-shrink-0" />
            <span className="flex-1 truncate text-left">{group.title}</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 space-y-1 ml-4">
          {group.items.map((item: any) => {
            const active = isActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col px-3 py-2 rounded-lg transition-all duration-200",
                  active
                    ? 'bg-sidebar-accent text-white'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white'
                )}
              >
                <span className="text-sm font-medium">{item.title}</span>
                {item.description && (
                  <span className="text-xs opacity-70">{item.description}</span>
                )}
              </NavLink>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const OldMenuItem = ({ item, tooltip }: { item: any; tooltip?: boolean }) => {
    const active = isActive(item.url);
    
    const content = (
      <NavLink 
        to={item.url} 
        end 
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium",
          active
            ? 'bg-sidebar-accent text-white'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white'
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        {!isCollapsed && (
          <span className="flex-1 truncate">{item.title}</span>
        )}
      </NavLink>
    );

    if (tooltip && isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right">
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
                ADVOCACIA BANCÁRIA ESTRATÉGICA
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
        {/* Menu Principal */}
        <SidebarGroup className="py-3">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/60 px-4 py-2 font-semibold">
              Menu Principal
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <div className="space-y-1 px-2">
              {menuItems.map((item) => (
                item.items ? (
                  <GroupMenuItem key={item.title} group={item} />
                ) : (
                  <SimpleMenuItem key={item.title} item={item} />
                )
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
                  <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/60 px-4 py-2 font-semibold">
                    Administração
                  </SidebarGroupLabel>
                  <div className="h-px bg-destructive/30 mx-4"></div>
                </>
              )}
              <SidebarGroupContent>
                <div className="space-y-1 px-2">
                  {adminItems.map((item) => (
                    <OldMenuItem key={item.title} item={item} tooltip />
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