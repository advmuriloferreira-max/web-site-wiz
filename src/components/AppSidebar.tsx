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
        title: "Gestão de Passivo Bancário",
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
        title: "Gestão de Passivo Bancário",
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
    <Sidebar className="border-r bg-white dark:bg-gray-950">
      <SidebarContent className="bg-white dark:bg-gray-950">
        {/* Cabeçalho com melhor contraste */}
        <div className="px-6 py-5 border-b bg-gradient-to-r from-blue-600 to-blue-700">
          <h1 className="text-xl font-bold text-white">INTELLBANK</h1>
          <p className="text-xs text-blue-100">Direito Bancário</p>
        </div>

        {menuItems.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex} className="px-3 py-2">
            {group.section && (
              <SidebarGroupLabel className="px-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {group.section}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        className={`
                          ${isActive 
                            ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold border-l-4 border-blue-600' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                          }
                          transition-all duration-200 rounded-r-lg
                        `}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                          <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                          <span className="text-sm">{item.title}</span>
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