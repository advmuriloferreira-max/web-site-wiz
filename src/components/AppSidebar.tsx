import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  FileText,
  TrendingDown,
  PiggyBank,
  Settings,
  CheckCircle,
  BarChart3,
  List,
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
    section: "PAINEL DO ADVOGADO",
    items: [
      {
        title: "Visão Geral",
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
    ],
  },
  {
    section: "GESTÃO DE PASSIVO BANCÁRIO",
    items: [
      {
        title: "Dashboard",
        url: "/app/gestao-passivo/dashboard",
        icon: BarChart3,
      },
      {
        title: "Nova Análise",
        url: "/app/gestao-passivo/nova",
        icon: FileText,
      },
      {
        title: "Lista de Análises",
        url: "/app/gestao-passivo/lista",
        icon: List,
      },
      {
        title: "Teste de Conformidade",
        url: "/app/gestao-passivo/teste-provisao",
        icon: CheckCircle,
      },
    ],
  },
  {
    section: "SUPERENDIVIDAMENTO",
    items: [
      {
        title: "Dashboard",
        url: "/app/superendividamento/dashboard",
        icon: Home,
      },
      {
        title: "Novo Relatório Socioeconômico",
        url: "/app/superendividamento/novo-relatorio",
        icon: FileText,
      },
      {
        title: "Novo Plano de Pagamento",
        url: "/app/superendividamento/novo-plano",
        icon: PiggyBank,
      },
      {
        title: "Lista de Análises Completas",
        url: "/app/superendividamento/lista-analises",
        icon: List,
      },
      {
        title: "Simulação Rápida",
        url: "/app/superendividamento/simulacao-rapida",
        icon: CheckCircle,
      },
    ],
  },
  {
    section: "ANÁLISE RÁPIDA",
    items: [
      {
        title: "Juros Abusivos",
        url: "/app/quick/juros-abusivos",
        icon: TrendingDown,
      },
    ],
  },
  {
    section: "ANÁLISES SALVAS",
    items: [
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
          <SidebarGroup key={groupIndex} className="px-3 py-3 mt-2">
            {group.section && (
              <SidebarGroupLabel className="px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-2 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm border-l-4 border-blue-500">
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