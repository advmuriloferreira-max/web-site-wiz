import { LegalIcons } from "@/components/ui/legal-icons";
import { Brain } from "lucide-react";
import { useContratosStats } from "@/hooks/useContratos";

export function HeroSection() {
  const { data: stats } = useContratosStats();

  return (
    <div className="executive-header relative overflow-hidden rounded-lg bg-gradient-hero text-white border border-accent/20 shadow-lg flex items-center justify-center min-h-[400px]">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-48 translate-x-48" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-glow/10 rounded-full blur-3xl translate-y-36 -translate-x-36" />
      
      <div className="relative text-center space-y-8">
        {/* Logo com Brain Icon */}
        <div className="flex items-center justify-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 bg-accent/20 backdrop-blur-sm rounded-lg border border-accent/40 flex items-center justify-center shadow-lg">
              <Brain className="h-12 w-12 text-accent" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center opacity-75">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
          
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              INTELLBANK
            </h1>
          </div>
        </div>
        
        <p className="text-lg text-white/90 font-medium max-w-3xl mx-auto">
          Plataforma de otimização processual avançada para advogados bancários
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 text-white/90">
          <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-accent/20">
            <div className="p-2 bg-accent/20 rounded-md">
              <LegalIcons.justice className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-xs text-white/70 font-medium">Valor total de dívidas monitoradas</p>
              <p className="text-sm font-bold">
                R$ {(stats?.valorTotalDividas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-success/20">
            <div className="p-2 bg-success/20 rounded-md">
              <LegalIcons.compliance className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-xs text-white/70 font-medium">Taxa de Provisão</p>
              <p className="text-sm font-bold">
                {(stats?.percentualProvisao ?? 0).toFixed(2)}%
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-warning/20">
            <div className="p-2 bg-warning/20 rounded-md">
              <LegalIcons.contract className="h-4 w-4 text-warning" />
            </div>
            <div>
              <p className="text-xs text-white/70 font-medium">Contratos Ativos</p>
              <p className="text-sm font-bold">
                {(stats?.totalContratos || 0).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Compliance badge */}
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2 px-4 py-2 bg-success/20 border border-success/40 rounded-lg shadow-sm">
            <LegalIcons.compliance className="h-5 w-5 text-success" />
            <span className="text-sm font-semibold text-success uppercase tracking-wider">
              Conforme Resolução BCB 4966/2021
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}