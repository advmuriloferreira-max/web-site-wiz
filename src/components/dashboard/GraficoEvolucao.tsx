import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  XCircle, 
  Skull,
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
  
  const marcos = [
    {
      nivel: 'C1',
      dias: 0,
      titulo: 'Em Dia',
      descricao: 'Contrato regular, sem atrasos. Cliente em boa situação.',
      provisao: '0%',
      icon: CheckCircle2,
      cor: 'text-green-600',
      bgCor: 'bg-green-100',
      lineCor: 'bg-green-400'
    },
    {
      nivel: 'C2',
      dias: 15,
      titulo: 'Atraso Inicial',
      descricao: 'Primeiros sinais de dificuldade. Banco começa a monitorar.',
      provisao: '1-3%',
      icon: AlertCircle,
      cor: 'text-blue-600',
      bgCor: 'bg-blue-100',
      lineCor: 'bg-blue-400'
    },
    {
      nivel: 'C3',
      dias: 60,
      titulo: 'Situação Preocupante',
      descricao: 'Atraso significativo. Banco aumenta provisão e pode oferecer acordo.',
      provisao: '10-30%',
      icon: AlertTriangle,
      cor: 'text-yellow-600',
      bgCor: 'bg-yellow-100',
      lineCor: 'bg-yellow-400'
    },
    {
      nivel: 'C4',
      dias: 90,
      titulo: 'Alto Risco',
      descricao: 'Situação crítica. Banco espera grande perda. Negociação urgente necessária.',
      provisao: '50-70%',
      icon: XCircle,
      cor: 'text-orange-600',
      bgCor: 'bg-orange-100',
      lineCor: 'bg-orange-400'
    },
    {
      nivel: 'C5',
      dias: 180,
      titulo: 'Perda Esperada',
      descricao: 'Banco considera o valor praticamente perdido. Última chance de negociação.',
      provisao: '100%',
      icon: Skull,
      cor: 'text-red-600',
      bgCor: 'bg-red-100',
      lineCor: 'bg-red-400'
    }
  ];

  // Encontra o índice atual
  const indiceAtual = marcos.findIndex(m => m.nivel === classificacao);
  const marcoAtual = indiceAtual >= 0 ? indiceAtual : 0;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Evolução da Situação
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          Linha do tempo mostrando como a classificação evolui com o passar dos dias
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
                  marcos[marcoAtual]?.lineCor || 'bg-green-400'
                )}
                style={{ 
                  width: `${((marcoAtual + 1) / marcos.length) * 100}%` 
                }}
              />
            </div>

            {/* Marcos */}
            <div className="relative flex justify-between">
              {marcos.map((marco, index) => {
                const isAtual = index === marcoAtual;
                const isPast = index < marcoAtual;
                const Icon = marco.icon;

                return (
                  <Tooltip key={marco.nivel}>
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
                            isAtual ? marco.bgCor : isPast ? marco.bgCor : "bg-slate-100",
                            isAtual && "animate-pulse"
                          )}
                        >
                          <Icon 
                            className={cn(
                              "h-6 w-6",
                              isAtual ? marco.cor : isPast ? marco.cor : "text-slate-400"
                            )} 
                          />
                        </div>

                        {/* Label */}
                        <div className="mt-2 text-center">
                          <div className={cn(
                            "text-sm font-semibold",
                            isAtual ? marco.cor : isPast ? marco.cor : "text-slate-400"
                          )}>
                            {marco.nivel}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {marco.dias}+ dias
                          </div>
                        </div>

                        {/* Indicador de posição atual */}
                        {isAtual && (
                          <div className="mt-2">
                            <div className={cn(
                              "px-2 py-1 rounded text-xs font-semibold",
                              marco.bgCor,
                              marco.cor
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
                          <Icon className={cn("h-5 w-5", marco.cor)} />
                          <h4 className="font-semibold">{marco.titulo}</h4>
                        </div>
                        <p className="text-sm text-slate-600">
                          {marco.descricao}
                        </p>
                        <div className="pt-2 border-t border-slate-200">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Provisão bancária:</span>
                            <span className={cn("font-semibold", marco.cor)}>
                              {marco.provisao}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-slate-600">A partir de:</span>
                            <span className="font-semibold">
                              {marco.dias} dias de atraso
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
              marcos[marcoAtual]?.bgCor || 'bg-green-100'
            )}>
              <AlertTriangle className={cn(
                "h-5 w-5",
                marcos[marcoAtual]?.cor || 'text-green-600'
              )} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800 mb-1">
                Situação Atual: {marcos[marcoAtual]?.titulo}
              </h4>
              <p className="text-sm text-slate-600 mb-2">
                {marcos[marcoAtual]?.descricao}
              </p>
              <div className="flex gap-4 text-xs text-slate-600">
                <div>
                  <span className="font-semibold">Dias em atraso:</span> {diasAtraso}
                </div>
                <div>
                  <span className="font-semibold">Meses:</span> {mesesAtraso}
                </div>
                <div>
                  <span className="font-semibold">Provisão:</span> {marcos[marcoAtual]?.provisao}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
