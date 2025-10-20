import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GraficoEvolucaoProps {
  classificacao: string | null;
  diasAtraso: number;
  mesesAtraso: number;
}

export function GraficoEvolucao({
  classificacao,
  diasAtraso,
  mesesAtraso,
}: GraficoEvolucaoProps) {
  
  // ESTÁGIOS baseados em TEMPO (BCB 4.966/2021)
  // Classificação C1-C5 NÃO muda com tempo!
  const estagios = [
    {
      estagio: 1,
      dias: '0-30',
      titulo: 'Estágio 1',
      descricao: 'Sem aumento significativo de risco. Perda esperada de 12 meses.',
      provisaoTipica: '5-15%',
      icon: CheckCircle2,
      cor: 'text-green-600',
      bgCor: 'bg-green-100',
      lineCor: 'bg-green-400'
    },
    {
      estagio: 2,
      dias: '31-90',
      titulo: 'Estágio 2',
      descricao: 'Aumento significativo de risco. Perda esperada por toda vida do ativo.',
      provisaoTipica: '15-40%',
      icon: AlertCircle,
      cor: 'text-yellow-600',
      bgCor: 'bg-yellow-100',
      lineCor: 'bg-yellow-400'
    },
    {
      estagio: 3,
      dias: '>90',
      titulo: 'Estágio 3',
      descricao: 'Ativo problemático/inadimplido. Perda esperada elevada.',
      provisaoTipica: '40-100%',
      icon: XCircle,
      cor: 'text-red-600',
      bgCor: 'bg-red-100',
      lineCor: 'bg-red-400'
    }
  ];

  // Determina o estágio atual baseado em DIAS DE ATRASO
  const estagioAtual = diasAtraso <= 30 ? 0 : diasAtraso <= 90 ? 1 : 2;
  const estagioInfo = estagios[estagioAtual];

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Evolução por Estágios de Risco (BCB 4.966/2021)
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          Estágios baseados APENAS em dias de atraso. Classificação C1-C5 = tipo de operação.
        </p>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="relative py-8">
            {/* Linha de progresso */}
            <div className="absolute top-8 left-0 right-0 h-2 bg-slate-200 rounded-full">
              {/* Preenchimento até o ponto atual */}
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-out",
                  estagios[estagioAtual]?.lineCor || 'bg-green-400'
                )}
                style={{ 
                  width: `${((estagioAtual + 1) / estagios.length) * 100}%` 
                }}
              />
            </div>

            {/* Marcos */}
            <div className="relative flex justify-between">
              {estagios.map((estagio, index) => {
                const isAtual = index === estagioAtual;
                const isPast = index < estagioAtual;
                const Icon = estagio.icon;

                return (
                  <Tooltip key={estagio.estagio}>
                    <TooltipTrigger asChild>
                      <div 
                        className={cn(
                          "flex flex-col items-center transition-all duration-300 cursor-pointer",
                          isAtual && "scale-110"
                        )}
                      >
                        {/* Ícone */}
                        <div 
                          className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-all duration-300 z-10",
                            isAtual ? estagio.bgCor : isPast ? estagio.bgCor : "bg-slate-100",
                            isAtual && "animate-pulse"
                          )}
                        >
                          <Icon 
                            className={cn(
                              "h-6 w-6",
                              isAtual ? estagio.cor : isPast ? estagio.cor : "text-slate-400"
                            )} 
                          />
                        </div>

                        {/* Label */}
                        <div className="mt-2 text-center">
                          <div className={cn(
                            "text-sm font-semibold",
                            isAtual ? estagio.cor : isPast ? estagio.cor : "text-slate-400"
                          )}>
                            {estagio.titulo}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {estagio.dias} dias
                          </div>
                        </div>

                        {/* Indicador de posição atual */}
                        {isAtual && (
                          <div className="mt-2">
                            <div className={cn(
                              "px-2 py-1 rounded text-xs font-semibold",
                              estagio.bgCor,
                              estagio.cor
                            )}>
                              Você está aqui
                            </div>
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="bottom" 
                      className="max-w-xs p-4"
                      sideOffset={10}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon className={cn("h-5 w-5", estagio.cor)} />
                          <h4 className="font-semibold">{estagio.titulo}</h4>
                        </div>
                        <p className="text-sm text-slate-600">
                          {estagio.descricao}
                        </p>
                        <div className="pt-2 border-t border-slate-200">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Provisão típica:</span>
                            <span className={cn("font-semibold", estagio.cor)}>
                              {estagio.provisaoTipica}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-slate-600">Período:</span>
                            <span className="font-semibold">
                              {estagio.dias} dias de atraso
                            </span>
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </TooltipProvider>

        {/* Info adicional */}
        <div className="mt-8 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              estagioInfo.bgCor
            )}>
              <AlertTriangle className={cn(
                "h-5 w-5",
                estagioInfo.cor
              )} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800 mb-1">
                Situação Atual: {estagioInfo.titulo}
              </h4>
              <p className="text-sm text-slate-600 mb-2">
                {estagioInfo.descricao}
              </p>
              <div className="flex gap-4 text-xs text-slate-600 flex-wrap">
                <div>
                  <span className="font-semibold">Dias em atraso:</span> {diasAtraso}
                </div>
                <div>
                  <span className="font-semibold">Meses:</span> {mesesAtraso.toFixed(1)}
                </div>
                <div>
                  <span className="font-semibold">Tipo de operação:</span> {classificacao || "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Provisão típica:</span> {estagioInfo.provisaoTipica}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Aviso Importante */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900">
            <span className="font-semibold">⚠️ Importante:</span> A <strong>Classificação (C1-C5)</strong> é determinada pelo 
            TIPO de operação baseado em garantias (C1=garantias sólidas, C2=garantias médias, C3=sem garantia), 
            e NÃO muda com o tempo de atraso. Já o <strong>Estágio (1, 2 ou 3)</strong> é determinado APENAS 
            pelos dias de atraso conforme BCB 4.966/2021.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}