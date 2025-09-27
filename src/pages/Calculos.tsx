import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalculadoraProvisaoCompleta } from "@/components/calculadora/CalculadoraProvisaoCompleta";
import { ContratosComCalculos } from "@/components/contratos/ContratosComCalculos";
import { Calculator, List } from "lucide-react";
import { ResponsiveContainer } from "@/components/ui/layout-consistency";
import { GlassCard } from "@/components/ui/glassmorphism";
import { GradientText } from "@/components/ui/gradient-elements";
import { ColoredIcon } from "@/components/ui/color-consistency";

export default function Calculos() {
  return (
    <ResponsiveContainer className="py-8 animate-fade-in">
      <div className="mb-8">
        <GradientText variant="primary" className="text-3xl font-bold mb-2 flex items-center">
          <ColoredIcon icon={Calculator} className="mr-3" />
          Sistema de Cálculos
        </GradientText>
        <p className="text-muted-foreground">
          Calcule provisões automaticamente baseado nas tabelas de referência
        </p>
      </div>

      <GlassCard variant="subtle" className="animate-slide-up">
        <Tabs defaultValue="calculadora" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 glass-header">
            <TabsTrigger value="calculadora" className="flex items-center gap-2 interactive-button">
              <ColoredIcon icon={Calculator} />
              Calculadora
            </TabsTrigger>
            <TabsTrigger value="contratos" className="flex items-center gap-2 interactive-button">
              <ColoredIcon icon={List} />
              Contratos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculadora" className="animate-fade-in">
            <CalculadoraProvisaoCompleta />
          </TabsContent>

          <TabsContent value="contratos" className="animate-fade-in">
            <ContratosComCalculos />
          </TabsContent>
        </Tabs>
      </GlassCard>
    </ResponsiveContainer>
  );
}