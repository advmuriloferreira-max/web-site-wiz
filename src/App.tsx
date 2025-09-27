import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UserMenu } from "@/components/UserMenu";
import { useState } from "react";
import { InstallPrompt } from "@/components/InstallPrompt";
import { AppSidebar } from "@/components/AppSidebar";
import { PageTransition } from "@/components/ui/page-transition";
import { SimpleSearch } from "@/components/ui/simple-search";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Convite from "./pages/Convite";
import Clientes from "./pages/Clientes";
import NovoCliente from "./pages/NovoCliente";
import Contratos from "./pages/Contratos";
import NovoContrato from "./pages/NovoContrato";
import ContratoDetalhes from "./pages/ContratoDetalhes";
import Calculos from "./pages/Calculos";
import Processos from "./pages/Processos";
import Acordos from "./pages/Acordos";
import Relatorios from "./pages/Relatorios";
import RelatoriosAvancados from "./pages/RelatoriosAvancados";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/convite" element={<Convite />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full bg-background">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                      <header className="h-12 flex items-center justify-between border-b border-border bg-background px-4">
                        <div className="flex items-center">
                          <SidebarTrigger className="mr-4" />
                          <h1 className="text-sm font-medium text-foreground">
                            INTELLBANK - Sistema de Monitoramento Inteligente de Dívidas Bancárias
                          </h1>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              console.log('Search button clicked, opening dialog');
                              setIsSearchOpen(true);
                            }}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                          >
                            <Search className="h-4 w-4" />
                            <span className="hidden sm:inline text-xs">Buscar</span>
                          </Button>
                          <UserMenu />
                        </div>
                      </header>
                        <main className="flex-1 overflow-auto">
                          <PageTransition>
                            <Routes>
                              <Route path="/" element={<Index />} />
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
                              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </PageTransition>
                        </main>
                     </div>
                    </div>
                    <SimpleSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} />
                    <InstallPrompt />
                  </SidebarProvider>
               </ProtectedRoute>
             } />
           </Routes>
         </BrowserRouter>
       </TooltipProvider>
     </AuthProvider>
   </QueryClientProvider>
  );
};

 export default App;
