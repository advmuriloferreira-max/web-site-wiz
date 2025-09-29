import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
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
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogOut,
  Bell,
  Zap,
  Edit3,
  MoreHorizontal,
  Star,
  Archive,
  Upload
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavigationSection {
  id: string;
  title: string;
  items: NavigationItem[];
  isCollapsed: boolean;
  badge?: number;
  color?: string;
}

interface NavigationItem {
  id: string;
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  quickActions?: QuickAction[];
  isNew?: boolean;
}

interface QuickAction {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

const defaultSections: NavigationSection[] = [
  {
    id: "main",
    title: "NAVEGAÇÃO PRINCIPAL",
    color: "blue",
    isCollapsed: false,
    items: [
      { 
        id: "home", 
        title: "Home", 
        url: "/", 
        icon: BarChart3,
        quickActions: [
          { id: "new-dashboard", title: "Novo Dashboard", icon: Plus, action: () => {} }
        ]
      },
      { 
        id: "clients", 
        title: "Clientes", 
        url: "/clientes", 
        icon: Users,
        badge: "2",
        quickActions: [
          { id: "new-client", title: "Novo Cliente", icon: Plus, action: () => {} },
          { id: "import-clients", title: "Importar", icon: Upload, action: () => {} }
        ]
      },
      { 
        id: "contracts", 
        title: "Contratos", 
        url: "/contratos", 
        icon: FileText,
        badge: "5",
        quickActions: [
          { id: "new-contract", title: "Novo Contrato", icon: Plus, action: () => {} },
          { id: "templates", title: "Templates", icon: Archive, action: () => {} }
        ]
      },
      { id: "processes", title: "Processos", url: "/processos", icon: AlertTriangle },
      { 
        id: "agreements", 
        title: "Acordos", 
        url: "/acordos", 
        icon: Handshake, 
        badge: "3",
        isNew: true
      },
      { id: "calculations", title: "Cálculos", url: "/calculos", icon: Calculator },
      { 
        id: "workspace", 
        title: "Workspace", 
        url: "/workspace", 
        icon: Layers,
        isNew: true,
        quickActions: [
          { id: "new-workspace", title: "Novo Workspace", icon: Plus, action: () => {} },
          { id: "import-workspace", title: "Importar", icon: Upload, action: () => {} }
        ]
      },
    ]
  },
  {
    id: "reports",
    title: "RELATÓRIOS & ANÁLISES",
    color: "purple",
    isCollapsed: false,
    items: [
      { id: "reports", title: "Relatórios", url: "/relatorios", icon: TrendingUp },
      { id: "advanced-reports", title: "Relatórios Avançados", url: "/relatorios-avancados", icon: LineChart },
    ]
  },
  {
    id: "quick-actions",
    title: "AÇÕES RÁPIDAS",
    color: "green",
    isCollapsed: false,
    items: [
      { id: "new-client-quick", title: "Novo Cliente", url: "/clientes/novo", icon: Plus },
      { id: "new-contract-quick", title: "Novo Contrato", url: "/contratos/novo", icon: Zap },
    ]
  }
];


export function PremiumSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const { profile } = useAuth();
  const location = useLocation();
  const isCollapsed = state === "collapsed";
  
  const [sections, setSections] = useState<NavigationSection[]>(defaultSections);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Load saved order from localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem('sidebar-sections-order');
    if (savedOrder) {
      try {
        setSections(JSON.parse(savedOrder));
      } catch (error) {
        console.error('Error loading sidebar order:', error);
      }
    }
  }, []);

  const isActive = (path: string) => location.pathname === path;
  
  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isCollapsed: !section.isCollapsed }
        : section
    ));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (result.type === 'section') {
      const newSections = Array.from(sections);
      const [reorderedSection] = newSections.splice(sourceIndex, 1);
      newSections.splice(destinationIndex, 0, reorderedSection);
      
      setSections(newSections);
      localStorage.setItem('sidebar-sections-order', JSON.stringify(newSections));
    } else if (result.type === 'item') {
      const sectionId = result.source.droppableId.replace('section-', '');
      const newSections = sections.map(section => {
        if (section.id === sectionId) {
          const newItems = Array.from(section.items);
          const [reorderedItem] = newItems.splice(sourceIndex, 1);
          newItems.splice(destinationIndex, 0, reorderedItem);
          return { ...section, items: newItems };
        }
        return section;
      });
      
      setSections(newSections);
      localStorage.setItem('sidebar-sections-order', JSON.stringify(newSections));
    }
  };

  const getSectionColor = (color: string) => {
    const colors = {
      blue: 'text-blue-400',
      purple: 'text-purple-400',
      green: 'text-green-400',
      red: 'text-red-400',
      yellow: 'text-yellow-400',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const QuickActionsMenu = ({ item }: { item: NavigationItem }) => {
    if (!item.quickActions || isCollapsed) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.preventDefault()}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="right">
          {item.quickActions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onClick={action.action}
              className="flex items-center"
            >
              <action.icon className="mr-2 h-3 w-3" />
              {action.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const MenuItem = ({ item, isDragging }: { item: NavigationItem; isDragging?: boolean }) => {
    const active = isActive(item.url);
    const isHovered = hoveredItem === item.id;
    
    return (
      <div 
        className={cn(
          "group relative transition-all duration-200",
          isDragging && "opacity-50"
        )}
        onMouseEnter={() => setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <NavLink 
          to={item.url} 
          end 
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg transition-all duration-200",
            "hover:scale-[1.02] focus:scale-[1.02]",
            active 
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 border-l-4 border-primary-light' 
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          )}
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          
          {!isCollapsed && (
            <>
              <span className="font-medium flex-1">{item.title}</span>
              
              {/* Badges and indicators */}
              <div className="flex items-center space-x-1">
                {item.isNew && (
                  <Badge variant="secondary" className="h-4 text-xs bg-green-500 text-white px-1">
                    NOVO
                  </Badge>
                )}
                
                {item.badge && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs px-1.5 py-0.5 h-5",
                      active ? "bg-primary-light text-primary-foreground" : "bg-primary text-primary-foreground animate-pulse"
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
                
                <QuickActionsMenu item={item} />
              </div>
            </>
          )}
        </NavLink>

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute inset-0" />
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
              <div>
                <div className="font-medium">{item.title}</div>
                {item.badge && (
                  <div className="text-xs text-slate-300">
                    {item.badge} notificações
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Hover quick actions */}
        {!isCollapsed && isHovered && item.quickActions && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1 bg-slate-800 rounded-md p-1 shadow-lg border border-slate-600">
            {item.quickActions.slice(0, 2).map((action) => (
              <Button
                key={action.id}
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  action.action();
                }}
                className="h-6 w-6 p-0 text-slate-300 hover:text-white"
              >
                <action.icon className="h-3 w-3" />
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Sidebar 
      className={cn(
        "bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700/50",
        "shadow-2xl backdrop-blur-sm transition-all duration-300",
        isCollapsed ? "w-16" : "w-72"
      )} 
      collapsible="icon"
    >
      {/* Header */}
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
                Enterprise Edition
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections" type="section">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {sections.map((section, sectionIndex) => (
                  <Draggable 
                    key={section.id} 
                    draggableId={section.id} 
                    index={sectionIndex}
                    isDragDisabled={isCollapsed}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          "py-4",
                          snapshot.isDragging && "opacity-75"
                        )}
                      >
                        <Collapsible
                          open={!section.isCollapsed}
                          onOpenChange={() => toggleSection(section.id)}
                        >
                          {!isCollapsed && (
                            <CollapsibleTrigger asChild>
                              <div 
                                {...provided.dragHandleProps}
                                className="flex items-center justify-between px-4 py-2 group cursor-pointer hover:bg-white/5 rounded-md mx-2"
                              >
                                <div className="flex items-center space-x-2">
                                  <div className={cn("w-2 h-2 rounded-full", getSectionColor(section.color || 'blue'))} />
                                  <span className="text-xs uppercase tracking-wide text-slate-300 font-bold">
                                    {section.title}
                                  </span>
                                  {section.badge && (
                                    <Badge variant="secondary" className="h-4 text-xs">
                                      {section.badge}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                  {section.isCollapsed ? (
                                    <ChevronDown className="h-3 w-3 text-slate-400" />
                                  ) : (
                                    <ChevronUp className="h-3 w-3 text-slate-400" />
                                  )}
                                </div>
                              </div>
                            </CollapsibleTrigger>
                          )}
                          
                          <CollapsibleContent>
                            <Droppable droppableId={`section-${section.id}`} type="item">
                              {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
                                  {section.items.map((item, itemIndex) => (
                                    <Draggable 
                                      key={item.id} 
                                      draggableId={item.id} 
                                      index={itemIndex}
                                      isDragDisabled={isCollapsed}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                        >
                                          <MenuItem item={item} isDragging={snapshot.isDragging} />
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </CollapsibleContent>
                        </Collapsible>
                        
                        {/* Section Separator */}
                        {sectionIndex < sections.length - 1 && (
                          <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent my-4" />
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* User Section */}
        <div className="mt-auto border-t border-slate-700/30 p-4">
          {/* Status */}
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
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10",
              "transition-all duration-200 hover:bg-white/10",
              isCollapsed && 'justify-center'
            )}>
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

          {/* Settings and Logout */}
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