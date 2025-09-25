import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalculadoraProvisaoCompleta } from "@/components/calculadora/CalculadoraProvisaoCompleta";
import { ContratosComCalculos } from "@/components/contratos/ContratosComCalculos";
import { Calculator, List } from "lucide-react";

export default function Calculos() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sistema de Cálculos</h1>
        <p className="text-muted-foreground">
          Calcule provisões automaticamente baseado nas tabelas de referência
        </p>
      </div>

      <Tabs defaultValue="calculadora" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculadora" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Calculadora
          </TabsTrigger>
          <TabsTrigger value="contratos" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Contratos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculadora">
          <CalculadoraProvisaoCompleta />
        </TabsContent>

        <TabsContent value="contratos">
          <ContratosComCalculos />
        </TabsContent>
      </Tabs>
    </div>
  );
}