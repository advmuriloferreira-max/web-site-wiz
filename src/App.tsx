import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { EnterpriseLayout } from "@/components/layout/EnterpriseLayout";
import Auth from "./pages/Auth";
import Convite from "./pages/Convite";
import NovoEscritorio from "./pages/cadastro/NovoEscritorio";
import EscritorioSuspenso from "./pages/EscritorioSuspenso";
import SemPermissao from "./pages/SemPermissao";
import SemEscritorio from "./pages/SemEscritorio";
import UsuarioInativo from "./pages/UsuarioInativo";

const queryClient = new QueryClient();

const App = () => {
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
            <Route path="/cadastro/escritorio" element={<NovoEscritorio />} />
            <Route path="/escritorio-suspenso" element={<EscritorioSuspenso />} />
            <Route path="/sem-permissao" element={<SemPermissao />} />
            <Route path="/sem-escritorio" element={<SemEscritorio />} />
            <Route path="/usuario-inativo" element={<UsuarioInativo />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <EnterpriseLayout />
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
