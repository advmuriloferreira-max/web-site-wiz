import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
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
import Contratos from "@/pages/Contratos";
import NovoContrato from "@/pages/NovoContrato";
import ContratoDetalhes from "@/pages/ContratoDetalhes";
import Calculos from "@/pages/Calculos";
import Processos from "@/pages/Processos";
import Acordos from "@/pages/Acordos";
import Relatorios from "@/pages/Relatorios";
import RelatoriosAvancados from "@/pages/RelatoriosAvancados";
import Configuracoes from "@/pages/Configuracoes";
import WorkspacePage from "@/pages/WorkspacePage";
import NotFound from "@/pages/NotFound";
import Convite from "@/pages/Convite";
import AnaliseJurosContrato from "@/pages/AnaliseJurosContrato";

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
          <header className="sticky top-0 z-40 w-full h-16 bg-gradient-to-r from-primary to-primary-dark backdrop-blur-xl border-b border-accent/20 shadow-md animate-fade-in">
            <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
              
              {/* Left Section - Logo Compacto */}
              <div className="flex items-center gap-3">
                {/* Mobile Sidebar Trigger */}
                <div className="md:hidden">
                  <SidebarTrigger className="text-white hover:text-accent transition-all duration-200 hover:scale-105" />
                </div>

                {/* Logo Compacto */}
                <div className="flex items-center gap-2 group">
                  <LegalIcons.justice className="h-6 w-6 text-accent flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  <div className="hidden sm:block">
                    <h1 className="text-base font-bold text-white tracking-wide leading-tight">
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
                  className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20 transition-all duration-200 hover:scale-105"
                >
                  <LegalIcons.search className="h-4 w-4" />
                  <span className="hidden xl:inline ml-2 text-sm">Buscar</span>
                </Button>

                {/* Theme Toggle */}
                <ThemeToggle />
                
                {/* User Menu */}
                <UserMenu />
              </div>
            </div>

            {/* Mobile Breadcrumbs - Mais Compacto */}
            <div className="lg:hidden px-4 py-2 border-t border-accent/10 bg-primary/95 animate-slide-in-right">
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
                    <Route path="/contratos" element={<Contratos />} />
                    <Route path="/contratos/novo" element={<NovoContrato />} />
                    <Route path="/contratos/:contratoId" element={<ContratoDetalhes />} />
                    <Route path="/contratos/:contratoId/analise-juros" element={<AnaliseJurosContrato />} />
                    <Route path="/calculos" element={<Calculos />} />
                    <Route path="/processos" element={<Processos />} />
                    <Route path="acordos" element={<Acordos />} />
                    <Route path="relatorios" element={<Relatorios />} />
                    <Route path="relatorios-avancados" element={<RelatoriosAvancados />} />
                    <Route path="configuracoes" element={<Configuracoes />} />
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