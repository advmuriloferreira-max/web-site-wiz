import { useState } from "react";
import { 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  Plus,
  TrendingUp,
  AlertTriangle,
  Calculator,
  Handshake,
  User,
  LineChart,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Zap
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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

const navigationItems = [
  { title: "Home", url: "/", icon: BarChart3, badge: null },
  { title: "Clientes", url: "/clientes", icon: Users, dataTour: "sidebar-clientes", badge: null },
  { title: "Contratos", url: "/contratos", icon: FileText, dataTour: "sidebar-contratos", badge: "3" },
  { title: "Processos", url: "/processos", icon: AlertTriangle, badge: null },
  { title: "Acordos", url: "/acordos", icon: Handshake, dataTour: "sidebar-acordos", badge: "2" },
  { title: "Cálculos", url: "/calculos", icon: Calculator, dataTour: "sidebar-calculos", badge: null },
];

const reportItems = [
  { title: "Relatórios", url: "/relatorios", icon: TrendingUp, dataTour: "sidebar-relatorios" },
  { title: "Relatórios Avançados", url: "/relatorios-avancados", icon: LineChart },
];

const quickActions = [
  { title: "Novo Cliente", url: "/clientes/novo", icon: Plus },
  { title: "Novo Contrato", url: "/contratos/novo", icon: Zap },
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
    const content = (
      <NavLink 
        to={item.url} 
        end 
        data-tour={item.dataTour}
        className={`
          flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg transition-all duration-200 interactive-button
          ${active 
            ? 'bg-primary text-primary-foreground border-l-4 border-primary/60 shadow-lg shadow-primary/20 scale-[1.02]' 
            : 'text-slate-300 hover:bg-white/10 hover:text-white hover:scale-[1.01]'
          }
        `}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        {!isCollapsed && (
          <>
            <span className="font-medium">{item.title}</span>
            {item.badge && (
              <Badge 
                variant="secondary" 
                className="ml-auto bg-primary text-primary-foreground text-xs px-1.5 py-0.5 h-5 animate-pulse"
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
      className={`
        bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700/50 
        ${isCollapsed ? "w-16" : "w-70"} 
        shadow-2xl backdrop-blur-sm
      `} 
      collapsible="icon"
    >
      {/* Header com Logo e Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/30">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 group">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center shadow-lg">
          <BarChart3 className="h-4 w-4 text-primary-foreground" />
        </div>
            <div className="transition-all duration-300 group-hover:scale-105">
              <h2 className="text-lg font-bold text-white tracking-wide">
                INTELLBANK
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Sistema de Gestão
              </p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center shadow-lg mx-auto">
            <BarChart3 className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="text-slate-400 hover:text-white hover:bg-white/10 transition-colors duration-200"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <SidebarContent className="px-0 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
        {/* Navegação Principal */}
        <SidebarGroup className="py-6">
          {!isCollapsed && (
            <SidebarGroupLabel className="px-4 text-xs uppercase tracking-wide text-slate-300 font-bold mb-4 flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
              NAVEGAÇÃO
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <MenuItem key={item.title} item={item} tooltip />
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Separador */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent my-6" />

        {/* Relatórios */}
        <SidebarGroup className="py-4">
          {!isCollapsed && (
            <SidebarGroupLabel className="px-4 text-xs uppercase tracking-wide text-slate-300 font-bold mb-4 flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              RELATÓRIOS
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <div className="space-y-2">
              {reportItems.map((item) => (
                <MenuItem key={item.title} item={item} tooltip />
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Separador */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent my-6" />

        {/* Ações Rápidas */}
        <SidebarGroup className="py-4">
          {!isCollapsed && (
            <SidebarGroupLabel className="px-4 text-xs uppercase tracking-wide text-slate-300 font-bold mb-4 flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              AÇÕES RÁPIDAS
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <div className="space-y-2">
              {quickActions.map((item) => (
                <MenuItem key={item.title} item={item} tooltip />
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer com usuário */}
        <div className="mt-auto border-t border-slate-700/30 p-4">
          {/* Status e Notificações */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {!isCollapsed ? (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Online</span>
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6 ml-auto text-slate-400 hover:text-white">
                  <Bell className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mx-auto"></div>
            )}
          </div>

          {/* User Profile */}
          {profile && (
            <div className={`flex items-center gap-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-200 hover:bg-white/10 ${isCollapsed ? 'justify-center' : ''}`}>
            <Avatar className="h-9 w-9 ring-2 ring-primary/30">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-hover text-primary-foreground text-sm font-semibold">
                  {profile.nome ? getInitials(profile.nome) : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {profile.nome}
                  </p>
                  {profile.cargo && (
                    <p className="text-xs text-slate-400 truncate">
                      {profile.cargo}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Configurações e Logout */}
          <div className="flex items-center gap-2 mt-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex-1 text-slate-400 hover:text-white hover:bg-white/10 transition-colors duration-200"
                >
                  <NavLink to="/configuracoes">
                    <Settings className="h-4 w-4" />
                    {!isCollapsed && <span className="ml-2">Configurações</span>}
                  </NavLink>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                Configurações
              </TooltipContent>
            </Tooltip>
            
            {!isCollapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700">
                  Sair
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}