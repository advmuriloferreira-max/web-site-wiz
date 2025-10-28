import { Link } from "react-router-dom";
import { Users, FileText, Calculator, TrendingDown, ArrowRight } from "lucide-react";

const quickActions = [
  {
    title: "Novo Cliente",
    description: "Cadastrar novo cliente",
    href: "/app/clientes/novo",
    icon: Users,
    gradient: "from-blue-600 to-blue-700",
  },
  {
    title: "Análise de Passivo",
    description: "Gestão de passivo bancário",
    href: "/app/quick/provisionamento",
    icon: Calculator,
    gradient: "from-emerald-600 to-emerald-700",
  },
  {
    title: "Juros Abusivos",
    description: "Calcular abusividade de juros",
    href: "/app/quick/juros-abusivos",
    icon: TrendingDown,
    gradient: "from-red-600 to-red-700",
  },
  {
    title: "Superendividamento",
    description: "Análise e plano de pagamento",
    href: "/app/quick/superendividamento", 
    icon: FileText,
    gradient: "from-amber-600 to-amber-700",
  }
];

export function QuickActionsSection() {
  return (
    <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
      <div className="bg-muted/50 p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">
          Ações Rápidas
        </h3>
      </div>
      
      <div className="p-6 bg-background">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.href}
              className={`group relative overflow-hidden rounded-xl p-6 text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-gradient-to-br ${action.gradient}`}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <action.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold mb-1">{action.title}</h4>
                  <p className="text-sm text-white/80">{action.description}</p>
                </div>
                
                <ArrowRight className="h-5 w-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              
              {/* Shine effect */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}