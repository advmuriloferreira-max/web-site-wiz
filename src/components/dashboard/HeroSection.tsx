import { TrendingUp, BarChart3, Users, Calculator } from "lucide-react";
import { useContratosStats } from "@/hooks/useContratos";

export function HeroSection() {
  const { data: stats } = useContratosStats();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-8 md:p-12 text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-48 translate-x-48" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-glow/10 rounded-full blur-3xl translate-y-36 -translate-x-36" />
      
      <div className="relative flex flex-col lg:flex-row items-center justify-between">
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <h1 className="title-main text-4xl lg:text-5xl text-white">
              Bem-vindo ao <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-glow to-accent-light">INTELLBANK</span>
            </h1>
            <p className="text-lg lg:text-xl text-white/80 font-medium">
              Inteligência em Provisionamento Bancário
            </p>
          </div>
          
          <div className="flex items-center space-x-6 text-white/90">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-label text-white/70">Portfolio Total</p>
                <p className="text-monetary text-lg font-semibold">
                  R$ {((stats?.valorTotalDividas || 0) / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
            
            <div className="hidden md:block w-px h-12 bg-white/20" />
            
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-label text-white/70">Provisão Média</p>
                <p className="text-monetary text-lg font-semibold">
                  {(stats?.percentualProvisao ?? 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Illustration */}
        <div className="flex-shrink-0 mt-8 lg:mt-0 lg:ml-12">
          <div className="relative">
            <div className="w-32 h-32 lg:w-40 lg:h-40 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Calculator className="h-16 w-16 lg:h-20 lg:w-20 text-primary-glow" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full animate-pulse" />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-warning rounded-full animate-ping" />
          </div>
        </div>
      </div>
    </div>
  );
}