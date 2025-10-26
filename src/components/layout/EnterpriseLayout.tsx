import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SmartBreadcrumbs } from "@/components/ui/smart-breadcrumbs";
import { EnhancedSearch } from "@/components/ui/enhanced-search";
import { EnterpriseMobileNav } from "@/components/ui/enterprise-mobile-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { InstallPrompt } from "@/components/InstallPrompt";
import { UserMenu } from "@/components/UserMenu";
import { PageTransition } from "@/components/ui/page-transition";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkipToMainContent } from "@/components/ui/accessibility-helpers";
import { GlobalSearch } from "@/components/ui/global-search";
import { LegalIcons } from "@/components/ui/legal-icons";
import { PremiumHeader } from "@/components/ui/premium-header";
import { VisualEffectsDemo } from "@/components/ui/visual-effects-demo";
import { TechnicalFixesShowcase } from "@/components/ui/technical-fixes-showcase";
import { ProfessionalFooter } from "@/components/ui/professional-footer";
import { SecurityIndicator, ComplianceBadge } from "@/components/ui/security-indicators";

// Import all pages
import Index from "@/pages/Index";
import Home from "@/pages/Home";
import Clientes from "@/pages/Clientes";
import NovoCliente from "@/pages/NovoCliente";
import ClienteDetalhes from "@/pages/clientes/ClienteDetalhes";
import AnaliseProvisionamento from "@/pages/contratos/AnaliseProvisionamento";
import AnaliseJurosAbusivos from "@/pages/contratos/AnaliseJurosAbusivos";
import PlanoSuperendividamento from "@/pages/clientes/PlanoSuperendividamento";
import Contratos from "@/pages/Contratos";
import NovoContrato from "@/pages/NovoContrato";
import ContratoDetalhes from "@/pages/ContratoDetalhes";
import Calculos from "@/pages/Calculos";
import Processos from "@/pages/Processos";
import Acordos from "@/pages/Acordos";
import PainelCliente from "@/pages/PainelCliente";
import Relatorios from "@/pages/Relatorios";
import RelatoriosAvancados from "@/pages/RelatoriosAvancados";
import Configuracoes from "@/pages/Configuracoes";
import WorkspacePage from "@/pages/WorkspacePage";
import NotFound from "@/pages/NotFound";
import Convite from "@/pages/Convite";
import AnaliseJurosContrato from "@/pages/AnaliseJurosContrato";
import CalculadoraJuros from "@/pages/CalculadoraJuros";
import ClientesJuros from "@/pages/juros/ClientesJuros";
import ContratosJuros from "@/pages/juros/ContratosJuros";
import AnaliseContratoJurosPage from "@/pages/juros/AnaliseContratoJuros";
import ImportarSeriesBacen from "@/pages/ImportarSeriesBacen";
import SuperendividamentoDashboard from "@/pages/superendividamento/Dashboard";
import SuperendividamentoClientes from "@/pages/superendividamento/Clientes";
import SuperendividamentoAnalise from "@/pages/superendividamento/Analise";
import SuperendividamentoPlanos from "@/pages/superendividamento/Planos";
import GerenciarEscritorio from "@/pages/configuracoes/GerenciarEscritorio";
import AdminDashboard from "@/pages/admin/Dashboard";
import SuperendividamentoCalculadora from "@/pages/superendividamento/Calculadora";
import SystemCheckPage from "@/pages/admin/SystemCheck";

export function EnterpriseLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [recentPages, setRecentPages] = useState<string[]>([]);

  const addToRecentPages = (page: string) => {
    setRecentPages(prev => {
      const filtered = prev.filter(p => p !== page);
      return [page, ...filtered].slice(0, 5);
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      addToRecentPages(window.location.pathname);
    }, 1000);

    return () => clearTimeout(timer);
  }, [addToRecentPages]);

  // Listen for global search shortcuts
  useEffect(() => {
    const handleOpenSearch = () => setSearchOpen(true);
    
    window.addEventListener('open-global-search', handleOpenSearch);
    return () => window.removeEventListener('open-global-search', handleOpenSearch);
  }, []);

  return (
    <ErrorBoundary>
      <SkipToMainContent />
      <SidebarProvider 
        defaultOpen={true}
      >
        <div className="min-h-screen flex w-full bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:block flex-shrink-0">
          <AppSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header - Otimizado e Limpo */}
          <header className="sticky top-0 z-40 w-full h-16 bg-[hsl(220_15%_20%)] backdrop-blur-xl border-b border-border/20 shadow-lg animate-fade-in">
            <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
              
              {/* Left Section - Logo Compacto */}
              <div className="flex items-center gap-3">
                {/* Mobile Sidebar Trigger */}
                <div className="md:hidden">
                  <SidebarTrigger className="text-white hover:text-accent transition-all duration-200 hover:scale-105 font-semibold" />
                </div>

                {/* Logo Compacto */}
                <div className="flex items-center gap-2 group">
                  <LegalIcons.justice className="h-6 w-6 text-accent flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-extrabold text-white tracking-wide leading-tight">
                      INTELLBANK
                    </h1>
                  </div>
                </div>
              </div>

              {/* Center Section - Breadcrumbs */}
              <div className="flex-1 hidden lg:flex justify-center max-w-lg mx-4">
                <SmartBreadcrumbs />
              </div>

              {/* Right Section - Ações Essenciais */}
              <div className="flex items-center gap-1">
                {/* Search Compacto */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchOpen(true)}
                  className="text-white hover:text-white hover:bg-white/10 border border-white/20 transition-all duration-200 hover:scale-105 font-semibold"
                >
                  <LegalIcons.search className="h-4 w-4" />
                  <span className="hidden xl:inline ml-2 text-sm font-semibold">Buscar</span>
                </Button>

                {/* Theme Toggle */}
                <ThemeToggle />
                
                {/* User Menu */}
                <UserMenu />
              </div>
            </div>

            {/* Mobile Breadcrumbs - Mais Compacto */}
            <div className="lg:hidden px-4 py-2 border-t border-border/20 bg-[hsl(220_15%_20%)] animate-slide-in-right">
              <SmartBreadcrumbs showKeyboardShortcuts={false} />
            </div>
          </header>

          {/* Page Content */}
          <main id="main-content" className="flex-1 overflow-auto bg-background">
            {/* Content Container com espaçamento adequado */}
            <div className="min-h-full">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                <PageTransition>
                  <Routes>
                    <Route index element={<Index />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/clientes" element={<Clientes />} />
                    <Route path="/clientes/novo" element={<NovoCliente />} />
              <Route path="/clientes/:id" element={<ClienteDetalhes />} />
              <Route path="/clientes/:id/superendividamento" element={<PlanoSuperendividamento />} />
              <Route path="/contratos/:id/provisionamento" element={<AnaliseProvisionamento />} />
              <Route path="/contratos/:id/juros-abusivos" element={<AnaliseJurosAbusivos />} />
                    <Route path="/contratos" element={<Contratos />} />
                    <Route path="/contratos/novo" element={<NovoContrato />} />
                    <Route path="/contratos/:contratoId" element={<ContratoDetalhes />} />
                    <Route path="/contratos/:contratoId/analise-juros" element={<AnaliseJurosContrato />} />
                    <Route path="/calculadora-juros" element={<CalculadoraJuros />} />
                    <Route path="/juros/clientes" element={<ClientesJuros />} />
                    <Route path="/juros/contratos" element={<ContratosJuros />} />
                    <Route path="/juros/contratos/:id/analise" element={<AnaliseContratoJurosPage />} />
                    <Route path="/admin" element={
                      <ProtectedRoute requireAdmin>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/importar-series-bacen" element={
                      <ProtectedRoute requireAdmin>
                        <ImportarSeriesBacen />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/system-check" element={
                      <ProtectedRoute requireAdmin>
                        <SystemCheckPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/superendividamento" element={<SuperendividamentoDashboard />} />
                    <Route path="/superendividamento/clientes" element={<SuperendividamentoClientes />} />
                    <Route path="/superendividamento/analise" element={<SuperendividamentoAnalise />} />
                    <Route path="/superendividamento/planos" element={<SuperendividamentoPlanos />} />
                    <Route path="/superendividamento/calculadora" element={<SuperendividamentoCalculadora />} />
                    <Route path="/calculos" element={<Calculos />} />
                    <Route path="/processos" element={<Processos />} />
                    <Route path="acordos" element={<Acordos />} />
                    <Route path="painel-cliente" element={<PainelCliente />} />
                    <Route path="relatorios" element={<Relatorios />} />
                    <Route path="relatorios-avancados" element={<RelatoriosAvancados />} />
                    <Route path="configuracoes" element={<Configuracoes />} />
                    <Route path="configuracoes/escritorio" element={<GerenciarEscritorio />} />
                    <Route path="workspace" element={<WorkspacePage />} />
                    <Route path="visual-effects" element={
                      <div className="container mx-auto">
                        <VisualEffectsDemo />
                      </div>
                    } />
                    <Route path="technical-fixes" element={<TechnicalFixesShowcase />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </PageTransition>
              </div>
              
              {/* Professional Footer */}
              <ProfessionalFooter />
            </div>
          </main>
        </div>

        {/* Mobile Navigation */}
        <EnterpriseMobileNav />

        {/* Global Search Component */}
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      </div>
    </SidebarProvider>
    </ErrorBoundary>
  );
}