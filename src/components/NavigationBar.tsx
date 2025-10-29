import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { FileText, Home, PlusCircle, List, BarChart3 } from 'lucide-react';

export default function NavigationBar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo e Nome do Sistema */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight">INTELLIBANK</span>
            <span className="text-xs text-muted-foreground">Gestão de Passivo Bancário</span>
          </div>
        </div>

        {/* Links de Navegação */}
        <div className="flex items-center gap-2">
          <Link to="/app/gestao-passivo/dashboard">
            <Button 
              variant={isActive('/app/gestao-passivo/dashboard') ? 'default' : 'ghost'} 
              size="sm"
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>

          <Link to="/app/gestao-passivo/nova">
            <Button 
              variant={isActive('/app/gestao-passivo/nova') ? 'default' : 'ghost'} 
              size="sm"
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Nova Análise
            </Button>
          </Link>

          <Link to="/app/gestao-passivo/lista">
            <Button 
              variant={isActive('/app/gestao-passivo/lista') ? 'default' : 'ghost'} 
              size="sm"
              className="gap-2"
            >
              <List className="h-4 w-4" />
              Minhas Análises
            </Button>
          </Link>

          {/* Botão de Relatórios em DESTAQUE usando semantic token success */}
          <Link to="/app/gestao-passivo/relatorios">
            <Button 
              size="sm"
              className="gap-2 bg-success hover:bg-success-dark text-success-foreground font-semibold shadow-md transition-all"
            >
              <FileText className="h-4 w-4" />
              Gerar Relatórios
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
