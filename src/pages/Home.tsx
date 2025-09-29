import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  return (
    <div className="container mx-auto space-y-6">
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