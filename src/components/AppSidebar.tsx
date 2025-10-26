import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  FileText,
  Calculator,
  TrendingDown,
  PiggyBank,
  BarChart3,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    section: null,
    items: [
      {
        title: "Dashboard",
        url: "/app",
        icon: Home,
      },
    ],
  },
  {
    section: "GESTÃO",
    items: [
      {
        title: "Clientes",
        url: "/app/clientes",
        icon: Users,
      },
      {
        title: "Contratos",
        url: "/app/contratos",
        icon: FileText,
      },
    ],
  },
  {
    section: "ANÁLISE RÁPIDA",
    items: [
      {
        title: "Provisionamento",
        url: "/app/quick/provisionamento",
        icon: Calculator,
      },
      {
        title: "Juros Abusivos",
        url: "/app/quick/juros-abusivos",
        icon: TrendingDown,
      },
      {
        title: "Superendividamento",
        url: "/app/quick/superendividamento",
        icon: PiggyBank,
      },
    ],
  },
  {
    section: "ANÁLISES SALVAS",
    items: [
      {
        title: "Provisionamento",
        url: "/app/analises/provisionamento",
        icon: BarChart3,
      },
      {
        title: "Juros Abusivos",
        url: "/app/analises/juros-abusivos",
        icon: TrendingDown,
      },
      {
        title: "Superendividamento",
        url: "/app/analises/superendividamento",
        icon: PiggyBank,
      },
    ],
  },
  {
    section: "CONFIGURAÇÕES",
    items: [
      {
        title: "Meu Escritório",
        url: "/app/configuracoes",
        icon: Settings,
      },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-bold text-primary">INTELLBANK</h1>
          <p className="text-xs text-muted-foreground">Direito Bancário</p>
        </div>

        {menuItems.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            {group.section && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.section}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}