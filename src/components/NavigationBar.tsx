import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { FileText, Home, PlusCircle, List, BarChart3, Scale, ChevronDown, Calculator, ListChecks } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NavigationBar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isModuleActive = (modulePath: string) => location.pathname.includes(modulePath);

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
            <span className="text-xs text-muted-foreground">Direito Bancário</span>
          </div>
        </div>

        {/* Links de Navegação */}
        <div className="flex items-center gap-2">
          {/* Dropdown - Gestão de Passivo Bancário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={isModuleActive('/gestao-passivo') ? 'default' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Gestão de Passivo
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 z-50">
              <DropdownMenuLabel>Gestão de Passivo Bancário</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/app/gestao-passivo/dashboard" className="w-full cursor-pointer">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/app/gestao-passivo/nova" className="w-full cursor-pointer">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nova Análise
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/app/gestao-passivo/lista" className="w-full cursor-pointer">
                  <List className="h-4 w-4 mr-2" />
                  Lista de Análises
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/app/gestao-passivo/relatorios" className="w-full cursor-pointer">
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Relatórios
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dropdown - Superendividamento */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={isModuleActive('/superendividamento') ? 'default' : 'ghost'}
                size="sm"
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Scale className="h-4 w-4" />
                Superendividamento
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 z-50">
              <DropdownMenuLabel>Lei 14.181/2021</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/app/superendividamento/dashboard" className="w-full cursor-pointer">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/app/superendividamento/novo-relatorio" className="w-full cursor-pointer">
                  <FileText className="h-4 w-4 mr-2" />
                  Novo Relatório Socioeconômico
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/app/clientes" className="w-full cursor-pointer">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Novo Plano de Pagamento
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/app/superendividamento/lista" className="w-full cursor-pointer">
                  <ListChecks className="h-4 w-4 mr-2" />
                  Lista de Análises Completas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/app/superendividamento/simulacao-rapida" className="w-full cursor-pointer">
                  <Calculator className="h-4 w-4 mr-2" />
                  Simulação Rápida
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Link direto para Clientes */}
          <Link to="/app/clientes">
            <Button 
              variant={isActive('/app/clientes') ? 'default' : 'ghost'} 
              size="sm"
              className="gap-2"
            >
              <List className="h-4 w-4" />
              Clientes
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
