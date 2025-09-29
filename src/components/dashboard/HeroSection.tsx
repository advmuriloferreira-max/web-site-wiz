import { LegalIcons } from "@/components/ui/legal-icons";
import { useContratosStats } from "@/hooks/useContratos";

export function HeroSection() {
  const { data: stats } = useContratosStats();

  return (
    <div className="executive-header relative overflow-hidden rounded-lg bg-gradient-hero p-8 md:p-12 text-white border border-accent/20 shadow-lg">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-48 translate-x-48" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-glow/10 rounded-full blur-3xl translate-y-36 -translate-x-36" />
      
      <div className="relative flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="space-y-6">
          {/* Logo com Brain Icon */}
          <div className="flex items-center justify-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-accent/20 backdrop-blur-sm rounded-lg border border-accent/40 flex items-center justify-center shadow-lg">
                <LegalIcons.justice className="h-10 w-10 text-accent animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center animate-ping opacity-75">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>
            
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                INTELLBANK
              </h1>
              <span className="block text-lg md:text-xl lg:text-2xl text-accent/90 font-medium mt-2">
                Provisionamento Bancário Inteligente
              </span>
            </div>
          </div>
          
          <p className="text-lg text-white/90 font-medium max-w-3xl mx-auto">
            Plataforma de gestão de provisões bancárias em conformidade com as regulamentações do Banco Central do Brasil
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-8 text-white/90">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-accent/30">
                <LegalIcons.justice className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-label text-white/70">Portfolio Jurídico</p>
                <p className="text-monetary text-xl font-bold">
                  R$ {((stats?.valorTotalDividas || 0) / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
            
            <div className="hidden md:block w-px h-16 bg-white/20" />
            
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-accent/30">
                <LegalIcons.compliance className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-label text-white/70">Taxa de Provisão</p>
                <p className="text-monetary text-xl font-bold">
                  {(stats?.percentualProvisao ?? 0).toFixed(1)}%
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
    </div>
  );
}