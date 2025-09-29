import { LegalIcons } from "@/components/ui/legal-icons";
import { useContratosStats } from "@/hooks/useContratos";

export function HeroSection() {
  const { data: stats } = useContratosStats();

  return (
    <div className="executive-header relative overflow-hidden rounded-sm bg-gradient-hero p-12 text-white border-2 border-accent/20">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-48 translate-x-48" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-glow/10 rounded-full blur-3xl translate-y-36 -translate-x-36" />
      
      <div className="relative flex flex-col lg:flex-row items-center justify-between">
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white">
              INTELLBANK
              <span className="block text-2xl lg:text-3xl text-accent font-medium mt-2">
                Sistema Jurídico Especializado
              </span>
            </h1>
            <p className="text-lg text-white/90 font-medium max-w-2xl">
              Plataforma de gestão de provisões bancárias em conformidade com as regulamentações do Banco Central do Brasil
            </p>
          </div>
          
          <div className="flex items-center space-x-8 text-white/90">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-sm border border-accent/30">
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
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-sm border border-accent/30">
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
          <div className="flex items-center space-x-2 px-4 py-2 bg-success/20 border-2 border-success/40 rounded-sm inline-flex">
            <LegalIcons.compliance className="h-5 w-5 text-success" />
            <span className="text-sm font-semibold text-success uppercase tracking-wider">
              Conforme Resolução BCB 4966/2021
            </span>
          </div>
        </div>
        
        {/* Legal illustration */}
        <div className="flex-shrink-0 mt-8 lg:mt-0 lg:ml-12">
          <div className="relative">
            <div className="w-40 h-40 bg-accent/20 backdrop-blur-sm rounded-sm border-2 border-accent/40 flex items-center justify-center">
              <LegalIcons.justice className="h-24 w-24 text-accent" />
            </div>
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-success rounded-full flex items-center justify-center animate-pulse">
              <LegalIcons.completed className="h-4 w-4 text-white" />
            </div>
            <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-warning rounded-full flex items-center justify-center animate-ping">
              <LegalIcons.pending className="h-3 w-3 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}