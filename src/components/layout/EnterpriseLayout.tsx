import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PremiumSidebar } from "@/components/ui/premium-sidebar";
import { SmartBreadcrumbs } from "@/components/ui/smart-breadcrumbs";
import { EnhancedSearch } from "@/components/ui/enhanced-search";
import { EnterpriseMobileNav } from "@/components/ui/enterprise-mobile-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PageTransition } from "@/components/ui/page-transition";
import { InstallPrompt } from "@/components/InstallPrompt";
import AssistenteVirtual from "@/components/assistente/AssistenteVirtual";
import { Button } from "@/components/ui/button";
import { Search, Bell, Settings } from "lucide-react";
import { useEnterpriseNavigation } from "@/hooks/useEnterpriseNavigation";
import { cn } from "@/lib/utils";

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
import { VisualEffectsDemo } from "@/components/ui/visual-effects-demo";

export function EnterpriseLayout() {
  const { addToRecentPages } = useEnterpriseNavigation();
  const [searchOpen, setSearchOpen] = React.useState(false);

  // Add current page to recent pages
  useEffect(() => {
    const title = document.title || "Página sem título";
    const timer = setTimeout(() => {
      addToRecentPages(title);
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
    <SidebarProvider 
      defaultOpen={true}
    >
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <PremiumSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 gap-4">
              {/* Mobile Sidebar Trigger */}
              <div className="md:hidden">
                <SidebarTrigger />
              </div>

              {/* Breadcrumbs */}
              <div className="flex-1 hidden sm:block">
                <SmartBreadcrumbs />
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-2">
                {/* Global Search */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchOpen(true)}
                  className="hidden sm:flex items-center space-x-2 text-muted-foreground"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden lg:inline">Buscar...</span>
                  <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 hidden lg:flex">
                    Ctrl+K
                  </kbd>
                </Button>

                {/* Mobile Search Icon */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchOpen(true)}
                  className="sm:hidden"
                >
                  <Search className="h-4 w-4" />
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                </Button>

                {/* Theme Toggle */}
                <ThemeToggle size="sm" />

                {/* Settings (Desktop) */}
                <Button variant="ghost" size="sm" className="hidden md:flex">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Breadcrumbs */}
            <div className="px-4 py-2 border-t sm:hidden">
              <SmartBreadcrumbs showKeyboardShortcuts={false} />
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
              <PageTransition>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<Index />} />
                  <Route path="clientes" element={<Clientes />} />
                  <Route path="clientes/novo" element={<NovoCliente />} />
                  <Route path="contratos" element={<Contratos />} />
                  <Route path="contratos/novo" element={<NovoContrato />} />
                  <Route path="contratos/:contratoId" element={<ContratoDetalhes />} />
                  <Route path="calculos" element={<Calculos />} />
                  <Route path="processos" element={<Processos />} />
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
          <Route path="*" element={<NotFound />} />
                </Routes>
              </PageTransition>
            </div>
          </main>
        </div>

        {/* Mobile Navigation */}
        <EnterpriseMobileNav />

        <EnhancedSearch 
          open={searchOpen} 
          onOpenChange={setSearchOpen} 
        />

        {/* Global Components */}
        <InstallPrompt />
        <AssistenteVirtual />
      </div>
    </SidebarProvider>
  );
}