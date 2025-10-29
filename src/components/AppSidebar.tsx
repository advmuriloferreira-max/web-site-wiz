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
  Scale,
  PlusCircle,
  Calculator,
  FileSearch,
  Sparkles,
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
        title: "Radar de Oportunidades",
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
    section: "AÇÕES REVISIONAIS",
    items: [
      {
        title: "Radar de Ações",
        url: "/app/acoes-revisionais/radar",
        icon: BarChart3,
      },
      {
        title: "Nova Análise Completa",
        url: "/app/acoes-revisionais/nova-analise",
        icon: PlusCircle,
      },
      {
        title: "Lista de Análises",
        url: "/app/acoes-revisionais/lista",
        icon: List,
      },
      {
        title: "Análise Rápida (30s)",
        url: "/app/acoes-revisionais/analise-rapida",
        icon: Calculator,
      },
      {
        title: "Simulador de Impacto Financeiro",
        url: "/app/acoes-revisionais/simulador",
        icon: FileSearch,
      },
      {
        title: "Gerar Petições ⭐",
        url: "/app/acoes-revisionais/gerar-peticoes",
        icon: Sparkles,
      },
    ],
  },
  {
    section: "SUPERENDIVIDAMENTO",
    items: [
      {
        title: "Visão Geral",
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
          <SidebarGroup key={groupIndex} className="px-4 py-2 mt-1">
            {group.section && (
              <SidebarGroupLabel className="px-4 py-2.5 text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-lg shadow-sm border-l-[3px] border-blue-500">
                {group.section}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent className="space-y-0.5">
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
                            ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold border-l-[3px] border-blue-600 shadow-sm' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100 border-l-[3px] border-transparent'
                          }
                          transition-all duration-200 rounded-lg my-0.5
                        `}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-2.5">
                          <item.icon className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                          <span className={`text-[13px] leading-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.title}</span>
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