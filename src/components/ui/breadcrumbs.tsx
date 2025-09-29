import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

const rotasConfig = {
  "/": { titulo: "Dashboard", icone: Home },
  "/clientes": { titulo: "Clientes", icone: null },
  "/novo-cliente": { titulo: "Novo Cliente", icone: null, parent: "/clientes" },
  "/contratos": { titulo: "Contratos", icone: null },
  "/novo-contrato": { titulo: "Novo Contrato", icone: null, parent: "/contratos" },
  "/processos": { titulo: "Processos", icone: null },
  "/acordos": { titulo: "Acordos", icone: null },
  "/calculos": { titulo: "Calculadora", icone: null },
  "/relatorios": { titulo: "Relatórios", icone: null },
  "/configuracoes": { titulo: "Configurações", icone: null },
  "/workspace": { titulo: "Workspace", icone: null },
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathname = location.pathname;

  // Não mostrar breadcrumbs na home
  if (pathname === "/") {
    return null;
  }

  const construirBreadcrumbs = () => {
    const breadcrumbs = [];
    
    // Sempre adicionar Home como primeiro item
    breadcrumbs.push({
      titulo: "Dashboard",
      rota: "/",
      icone: Home,
      ativo: false
    });

    // Verificar se é uma rota de detalhes (contém ID)
    if (pathname.includes("/contratos/") && pathname !== "/contratos") {
      // Página de detalhes do contrato
      breadcrumbs.push({
        titulo: "Contratos",
        rota: "/contratos", 
        icone: null,
        ativo: false
      });
      breadcrumbs.push({
        titulo: "Detalhes do Contrato",
        rota: pathname,
        icone: null,
        ativo: true
      });
    } else if (pathname.includes("/clientes/") && pathname !== "/clientes") {
      // Página de detalhes do cliente (se existir)
      breadcrumbs.push({
        titulo: "Clientes",
        rota: "/clientes",
        icone: null,
        ativo: false
      });
      breadcrumbs.push({
        titulo: "Detalhes do Cliente",
        rota: pathname,
        icone: null,
        ativo: true
      });
    } else {
      // Rotas normais
      const config = rotasConfig[pathname as keyof typeof rotasConfig];
      if (config) {
        // Verificar se tem parent
        if (config.parent) {
          const parentConfig = rotasConfig[config.parent as keyof typeof rotasConfig];
          if (parentConfig) {
            breadcrumbs.push({
              titulo: parentConfig.titulo,
              rota: config.parent,
              icone: parentConfig.icone,
              ativo: false
            });
          }
        }

        breadcrumbs.push({
          titulo: config.titulo,
          rota: pathname,
          icone: config.icone,
          ativo: true
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = construirBreadcrumbs();

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
      {breadcrumbs.map((item, index) => (
        <Fragment key={item.rota}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          )}
          
          <div className="flex items-center">
            {item.ativo ? (
              <span className="font-medium text-foreground flex items-center gap-1">
                {item.icone && <item.icone className="h-4 w-4" />}
                {item.titulo}
              </span>
            ) : (
              <Link
                to={item.rota}
                className="hover:text-foreground transition-colors flex items-center gap-1"
              >
                {item.icone && <item.icone className="h-4 w-4" />}
                {item.titulo}
              </Link>
            )}
          </div>
        </Fragment>
      ))}
    </nav>
  );
}

// Componente para páginas que precisam de breadcrumbs customizados
interface CustomBreadcrumbsProps {
  items: Array<{
    titulo: string;
    rota?: string;
    ativo?: boolean;
  }>;
}

export function CustomBreadcrumbs({ items }: CustomBreadcrumbsProps) {
  const breadcrumbs = [
    { titulo: "Dashboard", rota: "/", ativo: false },
    ...items
  ];

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
      {breadcrumbs.map((item, index) => (
        <Fragment key={`${item.rota}-${index}`}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          )}
          
          <div className="flex items-center">
            {item.ativo || !item.rota ? (
              <span className="font-medium text-foreground">
                {item.titulo}
              </span>
            ) : (
              <Link
                to={item.rota}
                className="hover:text-foreground transition-colors"
              >
                {item.titulo}
              </Link>
            )}
          </div>
        </Fragment>
      ))}
    </nav>
  );
}