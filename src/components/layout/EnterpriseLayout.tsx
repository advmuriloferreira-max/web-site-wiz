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
import { cn } from "@/lib/utils";

// Import all pages
import Index from "@/pages/Index";
import Home from "@/pages/Home";
import Clientes from "@/pages/Clientes";
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
        <div className="min-h-screen flex w-full bg-background mobile-safe">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header - Estilo Executivo */}
          <header className="executive-header sticky top-0 z-40 w-full border-b-2 border-accent/20 bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-primary/60">
            <div className="flex h-20 items-center px-6 gap-6">
              {/* Mobile Sidebar Trigger */}
              <div className="md:hidden">
                <SidebarTrigger className="text-white hover:text-accent" />
              </div>

              {/* Logo Jurídico */}
              <div className="flex items-center space-x-3">
                <LegalIcons.justice className="h-8 w-8 text-accent" />
                <div className="hidden lg:block">
                  <h2 className="text-xl font-bold text-white tracking-wider">INTELLBANK</h2>
                  <p className="text-xs text-accent font-semibold uppercase">Provisionamento de Dívidas Bancárias</p>
                </div>
              </div>

              {/* Breadcrumbs */}
              <div className="flex-1 hidden sm:block">
                <SmartBreadcrumbs />
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-3">
                {/* Global Search */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchOpen(true)}
                  className="hidden sm:flex items-center space-x-2 text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
                >
                  <LegalIcons.search className="h-4 w-4" />
                  <span className="hidden lg:inline">Buscar...</span>
                  <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 font-mono text-xs font-medium text-white/70 hidden lg:flex">
                    ⌘K
                  </kbd>
                </Button>

                {/* Mobile Search Icon */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchOpen(true)}
                  className="sm:hidden text-white hover:bg-white/10"
                >
                  <LegalIcons.search className="h-4 w-4" />
                </Button>

                <PremiumHeader onSearchClick={() => setSearchOpen(true)} />
                <ThemeToggle />
                <InstallPrompt />
                <UserMenu />
              </div>
            </div>

            {/* Mobile Breadcrumbs */}
            <div className="px-4 py-2 border-t border-accent/20 sm:hidden">
              <SmartBreadcrumbs showKeyboardShortcuts={false} />
            </div>
          </header>

          {/* Page Content */}
          <main id="main-content" className="flex-1 overflow-auto bg-background">
            <div className="container mx-auto padding-content pb-20 md:pb-6">
              <PageTransition>
                <Routes>
                  <Route index element={<Index />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/clientes" element={<Clientes />} />
                  <Route path="/contratos" element={<Contratos />} />
                  <Route path="/contratos/:id" element={<ContratoDetalhes />} />
                  <Route path="/novo-contrato" element={<NovoContrato />} />
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