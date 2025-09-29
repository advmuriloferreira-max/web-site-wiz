import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalculadoraProvisaoCompleta } from "@/components/calculadora/CalculadoraProvisaoCompleta";
import { ContratosComCalculos } from "@/components/contratos/ContratosComCalculos";
import { Calculator, List, TrendingUp } from "lucide-react";
import { 
  ResponsiveContainer, 
  ResponsiveSection, 
  PageHeader, 
  ResponsiveCard 
} from "@/components/ui/responsive-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Calculos() {
  return (
    <ResponsiveContainer maxWidth="2xl" className="min-h-screen">
      <ResponsiveSection spacing="lg">
        
        {/* Page Header */}
        <PageHeader
          title="Sistema de Cálculos"
          description="Calcule provisões automaticamente baseado nas tabelas de referência do Banco Central"
          icon={Calculator}
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <TrendingUp className="h-3 w-3 mr-1" />
                BCB 352/2023
              </Badge>
            </div>
          }
        />

        {/* Main Content */}
        <ResponsiveCard hover={false} padding="none" className="overflow-hidden border-2 border-primary/10">
          <Tabs defaultValue="calculadora" className="w-full">
            
            {/* Tab Navigation */}
            <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-primary/20">
              <TabsList className="grid w-full grid-cols-2 h-14 bg-transparent rounded-none border-0">
                <TabsTrigger 
                  value="calculadora" 
                  className="flex items-center gap-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full font-semibold transition-all"
                >
                  <Calculator className="h-4 w-4" />
                  <span className="hidden sm:inline">Calculadora Avançada</span>
                  <span className="sm:hidden">Calculadora</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="contratos" 
                  className="flex items-center gap-3 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full font-semibold transition-all"
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Contratos com Cálculos</span>
                  <span className="sm:hidden">Contratos</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="p-6 lg:p-8">
              <TabsContent value="calculadora" className="mt-0 focus-visible:outline-none">
                <div className="animate-fade-in">
                  <CalculadoraProvisaoCompleta />
                </div>
              </TabsContent>

              <TabsContent value="contratos" className="mt-0 focus-visible:outline-none">
                <div className="animate-fade-in">
                  <ContratosComCalculos />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </ResponsiveCard>

      </ResponsiveSection>
    </ResponsiveContainer>
  );
}