import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calculator, TrendingDown, PiggyBank } from "lucide-react";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PremiumStatsCard } from "@/components/dashboard/PremiumStatsCard";
import { ClientesAnalysisChart } from "@/components/dashboard/ClientesAnalysisChart";
import { AcordosChart } from "@/components/dashboard/AcordosChart";
import { TendenciasChart } from "@/components/dashboard/TendenciasChart";
import { ClassificacaoChart } from "@/components/dashboard/ClassificacaoChart";
import { QuickActionsSection } from "@/components/dashboard/QuickActionsSection";
import { QuickActions } from "@/components/ui/quick-actions";

export default function Home() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto space-y-6">
        {/* Seção de Análise Rápida */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">⚡ Análise Rápida</h2>
              <p className="text-muted-foreground">
                Resultados imediatos sem necessidade de cadastro
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Provisionamento Rápido */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate("/app/quick/provisionamento")}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Calculator className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Provisionamento</CardTitle>
                    <CardDescription>Resolução BCB 4966/2021</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Calcule a provisão bancária de forma rápida e precisa
                </p>
                <Button className="w-full" variant="outline">
                  Calcular Agora →
                </Button>
              </CardContent>
            </Card>

            {/* Card 2: Juros Abusivos Rápido */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate("/app/quick/juros-abusivos")}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Juros Abusivos</CardTitle>
                    <CardDescription>Comparação com BACEN</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Identifique abusividade comparando com taxas médias
                </p>
                <Button className="w-full" variant="outline">
                  Analisar Agora →
                </Button>
              </CardContent>
            </Card>

            {/* Card 3: Superendividamento Rápido */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate("/app/quick/superendividamento")}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <PiggyBank className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Superendividamento</CardTitle>
                    <CardDescription>Lei 14.181/2021</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Crie plano de pagamento personalizado rapidamente
                </p>
                <Button className="w-full" variant="outline">
                  Criar Plano →
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-center text-muted-foreground">
              💡 <strong>Dica:</strong> Análises rápidas podem ser salvas e vinculadas a clientes posteriormente
            </p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <HeroSection />
            <div className="grid gap-6 md:grid-cols-2">
              <ClientesAnalysisChart />
              <AcordosChart />
            </div>
          </div>
          
          <div className="space-y-6">
            <QuickActions />
          </div>
        </div>
    </div>
  );
}