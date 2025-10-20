import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Star, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalendarioEstrategicoProps {
  valorDivida: number;
}

export function CalendarioEstrategico({ valorDivida }: CalendarioEstrategicoProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  
  // Calcula os "momentos dourados" de negociação
  // IMPORTANTE: Não é só sobre o DESCONTO (provisão), mas sobre a FLEXIBILIDADE do banco
  const calcularMomentosDourados = () => {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth();

    const momentos = [
      {
        data: new Date(anoAtual, mesAtual, getDiasNoMes(mesAtual, anoAtual) - 2),
        titulo: "Fim do Mês",
        descricao: "Gerentes bancários precisam bater metas mensais. Estão mais flexíveis para fechar acordos rapidamente!",
        flexibilidadeGerente: "Alta",
        urgencia: "alta",
        tipo: "mensal",
        icone: "💰"
      },
      {
        data: new Date(anoAtual, 2, 29), // Final de Q1
        titulo: "Fim do 1º Trimestre",
        descricao: "Bancos fazem balanços trimestrais. Gerentes têm mais autonomia para oferecer condições especiais!",
        flexibilidadeGerente: "Muito Alta",
        urgencia: "muito-alta",
        tipo: "trimestral",
        icone: "🎯"
      },
      {
        data: new Date(anoAtual, 5, 28), // Final de Q2
        titulo: "Fim do 2º Trimestre",
        descricao: "Meio do ano - grandes metas a bater. Momento excelente para negociações favoráveis!",
        flexibilidadeGerente: "Muito Alta",
        urgencia: "muito-alta",
        tipo: "trimestral",
        icone: "🎯"
      },
      {
        data: new Date(anoAtual, 8, 29), // Final de Q3
        titulo: "Fim do 3º Trimestre",
        descricao: "Preparação para o fechamento anual. Gerentes querem limpar carteira e bater metas!",
        flexibilidadeGerente: "Muito Alta",
        urgencia: "muito-alta",
        tipo: "trimestral",
        icone: "🎯"
      },
      {
        data: new Date(anoAtual, 11, 20),
        titulo: "Fim do Ano - MOMENTO IDEAL!",
        descricao: "MELHOR PERÍODO! Bancos querem fechar o ano com carteira limpa. Máxima flexibilidade dos gerentes!",
        flexibilidadeGerente: "Máxima",
        urgencia: "extrema",
        tipo: "anual",
        icone: "⭐"
      }
    ];

    return momentos.filter(m => m.data >= hoje);
  };

  const momentosDourados = calcularMomentosDourados();
  const proximoMomento = momentosDourados[0];

  function getDiasNoMes(mes: number, ano: number) {
    return new Date(ano, mes + 1, 0).getDate();
  }

  // Calcula dias até o próximo momento dourado
  const diasAteProximoMomento = proximoMomento 
    ? Math.ceil((proximoMomento.data.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const getUrgenciaColor = (urgencia: string) => {
    switch (urgencia) {
      case 'extrema': return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' };
      case 'muito-alta': return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' };
      case 'alta': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' };
      default: return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4 bg-gradient-to-r from-amber-50 to-yellow-50">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <CalendarIcon className="h-5 w-5 text-amber-600" />
          Calendário Estratégico de Negociação
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          Aproveite quando os gerentes bancários estão mais flexíveis!
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Próximo Momento Dourado em Destaque */}
        {proximoMomento && (
          <div className={cn(
            "p-6 rounded-lg border-2",
            getUrgenciaColor(proximoMomento.urgencia).bg,
            getUrgenciaColor(proximoMomento.urgencia).border
          )}>
            <div className="flex items-start gap-4">
              <div className="text-5xl">{proximoMomento.icone}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={cn(
                    "text-xl font-bold",
                    getUrgenciaColor(proximoMomento.urgencia).text
                  )}>
                    {proximoMomento.titulo}
                  </h3>
                  <Badge className={cn(
                    getUrgenciaColor(proximoMomento.urgencia).bg,
                    getUrgenciaColor(proximoMomento.urgencia).text
                  )}>
                    Em {diasAteProximoMomento} dias
                  </Badge>
                </div>
                
                <p className={cn(
                  "text-sm mb-3",
                  getUrgenciaColor(proximoMomento.urgencia).text
                )}>
                  {proximoMomento.descricao}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white/80 p-3 rounded border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Data Ideal:</div>
                    <div className="font-bold text-slate-900">
                      {proximoMomento.data.toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: 'long' 
                      })}
                    </div>
                  </div>
                  <div className="bg-white/80 p-3 rounded border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Flexibilidade Gerente:</div>
                    <div className="font-bold text-green-600">
                      {proximoMomento.flexibilidadeGerente}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded border border-green-200">
                  <div className="text-sm font-semibold text-green-900 mb-1">
                    💡 Por que este momento é especial:
                  </div>
                  <p className="text-xs text-green-800">
                    Nestes períodos, os gerentes têm mais autonomia para fechar acordos rapidamente. 
                    A pressão por metas torna eles mais dispostos a negociar condições favoráveis!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Todos os Momentos Dourados */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            Todos os Momentos Estratégicos do Ano:
          </h4>
          
          <TooltipProvider>
            <div className="space-y-3">
              {momentosDourados.map((momento, idx) => {
                const diasAte = Math.ceil((momento.data.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const cores = getUrgenciaColor(momento.urgencia);
                
                return (
                  <Tooltip key={idx}>
                    <TooltipTrigger asChild>
                      <div 
                        className={cn(
                          "p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.02]",
                          cores.bg,
                          cores.border
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{momento.icone}</div>
                            <div>
                              <div className={cn("font-semibold", cores.text)}>
                                {momento.titulo}
                              </div>
                              <div className="text-xs text-slate-600">
                                {momento.data.toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={cn(cores.bg, cores.text)}>
                              {diasAte} dias
                            </Badge>
                            <div className="text-xs text-green-600 font-semibold mt-1">
                              {momento.flexibilidadeGerente}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p className="text-sm">{momento.descricao}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        </div>

        {/* Dicas Estratégicas */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2 text-sm text-blue-900">
              <p className="font-semibold">💡 Estratégia Inteligente:</p>
              <ul className="space-y-1 list-disc list-inside text-xs">
                <li>Comece a conversa 1-2 semanas ANTES da data ideal</li>
                <li>Finais de trimestre = gerentes mais flexíveis para fechar acordos</li>
                <li>Dezembro é o MÊS DOURADO - todos os bancos querem fechar o ano limpo</li>
                <li>Sexta-feira à tarde gerentes querem resolver pendências</li>
                <li>Tenha documentação pronta para agilizar o processo</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Entendimento Importante */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📊</div>
            <div className="flex-1 text-sm text-amber-900">
              <p className="font-semibold mb-1">Entenda a Dinâmica:</p>
              <p className="text-xs">
                Sim, quanto mais tempo passa, maior fica a provisão (e o desconto potencial). 
                MAS estes "momentos dourados" são sobre a <strong>flexibilidade do gerente</strong>, 
                não sobre a provisão. Um gerente flexível em fim de mês pode aceitar sua proposta 
                MAIS RÁPIDO, mesmo com provisão menor. É sobre timing e pressão de metas!
              </p>
            </div>
          </div>
        </div>

        {/* Alerta de Ação */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-5 rounded-lg">
          <div className="text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-bold text-lg mb-2">Combine Provisão + Timing!</h3>
            <p className="text-sm opacity-90">
              O ideal é negociar quando você tem BOA PROVISÃO (30-60%) E está num momento dourado. 
              Assim você consegue o melhor acordo: desconto justo + negociação rápida + sem riscos jurídicos!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}