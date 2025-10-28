import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
import AnaliseSocioeconomica from "@/pages/clientes/AnaliseSocioeconomica";
import ListaProvisionamento from "@/pages/analises/ListaProvisionamento";
import ListaJurosAbusivos from "@/pages/analises/ListaJurosAbusivos";
import ListaSuperendividamento from "@/pages/analises/ListaSuperendividamento";
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
import CalculadoraJuros from "@/pages/CalculadoraJuros";
import ImportarSeriesBacen from "@/pages/ImportarSeriesBacen";
import Planos from "@/pages/superendividamento/Planos";
import GerenciarEscritorio from "@/pages/configuracoes/GerenciarEscritorio";
import AdminDashboard from "@/pages/admin/Dashboard";
import SystemCheckPage from "@/pages/admin/SystemCheck";
import ProvisionamentoRapido from "@/pages/quick/ProvisionamentoRapido";
import JurosAbusivosRapido from "@/pages/quick/JurosAbusivosRapido";
import SuperendividamentoRapido from "@/pages/quick/SuperendividamentoRapido";
import ListaAnalises from "@/pages/gestao-passivo/ListaAnalises";
import NovaAnalise from "@/pages/gestao-passivo/NovaAnalise";
import DashboardOportunidades from "@/pages/gestao-passivo/DashboardOportunidades";

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
          {/* Top Header - Otimizado sem duplicação */}
          <header className="sticky top-0 z-40 w-full h-16 bg-gradient-to-r from-slate-800 to-slate-900 backdrop-blur-xl border-b border-slate-700 shadow-lg">
            <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
              
              {/* Left Section - Mobile Trigger + Breadcrumbs */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Mobile Sidebar Trigger */}
                <div className="md:hidden flex-shrink-0">
                  <SidebarTrigger className="text-white hover:text-blue-400 transition-all duration-200 hover:scale-105" />
                </div>

                {/* Breadcrumbs (Desktop e Mobile) */}
                <div className="flex-1 min-w-0">
                  <SmartBreadcrumbs />
                </div>
              </div>

              {/* Right Section - Ações Úteis */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Botão: Nova Análise Rápida */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/app/quick/provisionamento'}
                  className="text-white hover:text-white hover:bg-white/10 border border-white/20 transition-all duration-200 hover:scale-105 hidden sm:flex"
                  title="Nova Análise Rápida"
                >
                  <LegalIcons.calculations className="h-4 w-4" />
                  <span className="hidden lg:inline ml-2 text-sm font-medium">Análise Rápida</span>
                </Button>

                {/* Botão: Novo Cliente */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/app/clientes/novo'}
                  className="text-white hover:text-white hover:bg-white/10 border border-white/20 transition-all duration-200 hover:scale-105 hidden sm:flex"
                  title="Novo Cliente"
                >
                  <LegalIcons.clients className="h-4 w-4" />
                  <span className="hidden xl:inline ml-2 text-sm font-medium">Novo Cliente</span>
                </Button>

                {/* Busca Global */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchOpen(true)}
                  className="text-white hover:text-white hover:bg-white/10 border border-white/20 transition-all duration-200 hover:scale-105"
                  title="Buscar (Ctrl+K)"
                >
                  <LegalIcons.search className="h-4 w-4" />
                  <span className="hidden xl:inline ml-2 text-sm font-medium">Buscar</span>
                </Button>

                {/* Theme Toggle */}
                <ThemeToggle />
                
                {/* User Menu */}
                <UserMenu />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main id="main-content" className="flex-1 overflow-auto bg-background">
            {/* Content Container com espaçamento adequado */}
            <div className="min-h-full">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                <PageTransition>
                  <Routes>
                    {/* ===================================================================== */}
                    {/* ROTAS PRINCIPAIS */}
                    {/* ===================================================================== */}
                    <Route path="/home" element={<Index />} />
                    <Route path="/workspace" element={<WorkspacePage />} />

                    {/* ===================================================================== */}
                    {/* CLIENTES E CONTRATOS (HUB CENTRAL) */}
                    {/* ===================================================================== */}
                    <Route path="/clientes" element={<Clientes />} />
                    <Route path="/clientes/novo" element={<NovoCliente />} />
                    <Route path="/clientes/:id" element={<ClienteDetalhes />} />
                    
                    {/* Rotas de contrato mantidas apenas para acesso via cliente */}
                    <Route path="/contratos/novo" element={<NovoContrato />} />
                    <Route path="/contratos/:id" element={<ContratoDetalhes />} />

                    {/* ===================================================================== */}
                    {/* ANÁLISES POR CONTRATO */}
                    {/* ===================================================================== */}
                    <Route path="/contratos/:id/provisionamento" element={<AnaliseProvisionamento />} />
                    <Route path="/contratos/:id/juros-abusivos" element={<AnaliseJurosAbusivos />} />
                    
                    {/* ===================================================================== */}
                    {/* ANÁLISES POR CLIENTE */}
                    {/* ===================================================================== */}
                    <Route path="/clientes/:id/superendividamento" element={<PlanoSuperendividamento />} />
                    <Route path="/clientes/:id/analise-socioeconomica" element={<AnaliseSocioeconomica />} />

                    {/* ===================================================================== */}
                    {/* LISTAGENS DE ANÁLISES */}
                    {/* ===================================================================== */}
                    <Route path="/analises/provisionamento" element={<ListaProvisionamento />} />
                    <Route path="/analises/juros-abusivos" element={<ListaJurosAbusivos />} />
                    <Route path="/analises/superendividamento" element={<ListaSuperendividamento />} />

                    {/* ===================================================================== */}
                    {/* ANÁLISE RÁPIDA */}
                    {/* ===================================================================== */}
                    <Route path="/quick/provisionamento" element={<ProvisionamentoRapido />} />
                    <Route path="/quick/juros-abusivos" element={<JurosAbusivosRapido />} />
                    <Route path="/quick/superendividamento" element={<SuperendividamentoRapido />} />

                    {/* ===================================================================== */}
                    {/* GESTÃO DE PASSIVO BANCÁRIO (MÓDULO INDEPENDENTE) */}
                    {/* ===================================================================== */}
                    <Route path="/gestao-passivo" element={<ListaAnalises />} />
                    <Route path="/gestao-passivo/nova" element={<NovaAnalise />} />
                    <Route path="/gestao-passivo/dashboard" element={<DashboardOportunidades />} />

                    {/* ===================================================================== */}
                    {/* CALCULADORA (manter para compatibilidade) */}
                    {/* ===================================================================== */}
                    <Route path="/calculadora-juros" element={<CalculadoraJuros />} />
                    <Route path="/superendividamento/planos" element={<Planos />} />

                    {/* ===================================================================== */}
                    {/* CONFIGURAÇÕES */}
                    {/* ===================================================================== */}
                    <Route path="/configuracoes" element={<Configuracoes />} />
                    <Route path="/configuracoes/escritorio" element={<GerenciarEscritorio />} />

                    {/* ===================================================================== */}
                    {/* ADMIN */}
                    {/* ===================================================================== */}
                    <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/importar-series-bacen" element={<ProtectedRoute requireAdmin><ImportarSeriesBacen /></ProtectedRoute>} />
                    <Route path="/admin/system-check" element={<ProtectedRoute requireAdmin><SystemCheckPage /></ProtectedRoute>} />

                    {/* ===================================================================== */}
                    {/* ROTA INDEX (quando acessa /app sem nada) */}
                    {/* ===================================================================== */}
                    <Route index element={<Navigate to="home" replace />} />

                    {/* ===================================================================== */}
                    {/* FALLBACK (para rotas que não existem) */}
                    {/* ===================================================================== */}
                    <Route path="*" element={<Navigate to="home" replace />} />
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