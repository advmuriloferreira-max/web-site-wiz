import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, TrendingUp, AlertTriangle, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContadorOportunidadeProps {
  valorDivida: number;
  diasAtraso: number;
  percentualProvisaoAtual: number; // Provisão atual REAL do banco
  valorProvisaoAtual: number; // Valor provisionado REAL
}

export function ContadorOportunidade({ 
  valorDivida, 
  diasAtraso,
  percentualProvisaoAtual,
  valorProvisaoAtual
}: ContadorOportunidadeProps) {
  const [timeLeft, setTimeLeft] = useState({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0
  });

  // Calcula o próximo "momento dourado" (fim do mês)
  const calcularProximaData = () => {
    const hoje = new Date();
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    // 2 dias antes do fim do mês é o momento ideal
    const dataIdeal = new Date(ultimoDiaMes);
    dataIdeal.setDate(dataIdeal.getDate() - 2);
    
    return dataIdeal;
  };

  const dataAlvo = calcularProximaData();

  // Atualiza o contador a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      const agora = new Date().getTime();
      const diferenca = dataAlvo.getTime() - agora;

      if (diferenca > 0) {
        setTimeLeft({
          dias: Math.floor(diferenca / (1000 * 60 * 60 * 24)),
          horas: Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutos: Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60)),
          segundos: Math.floor((diferenca % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Usa provisão REAL do banco (não estimativa!)
  const provisaoAtual = percentualProvisaoAtual;
  const descontoAtual = valorProvisaoAtual;
  const valorPropostaAtual = valorDivida - descontoAtual;

  // Avalia o momento atual
  const avaliarMomento = () => {
    if (provisaoAtual >= 60) {
      return {
        status: "excelente",
        titulo: "Momento EXCELENTE!",
        descricao: "Provisão alta + momento dourado chegando = Combinação perfeita!",
        cor: "from-green-500 to-green-700",
        textColor: "text-green-50"
      };
    } else if (provisaoAtual >= 40) {
      return {
        status: "bom",
        titulo: "Bom Momento!",
        descricao: "Provisão razoável. Aguarde o momento dourado para negociar!",
        cor: "from-blue-500 to-blue-700",
        textColor: "text-blue-50"
      };
    } else if (provisaoAtual >= 20) {
      return {
        status: "regular",
        titulo: "Momento Regular",
        descricao: "Provisão ainda crescendo. Pode negociar ou aguardar mais provisão.",
        cor: "from-amber-500 to-amber-700",
        textColor: "text-amber-50"
      };
    } else {
      return {
        status: "inicial",
        titulo: "Momento Inicial",
        descricao: "Provisão ainda baixa. Considere aguardar um pouco para mais desconto.",
        cor: "from-orange-500 to-orange-700",
        textColor: "text-orange-50"
      };
    }
  };

  const momentoAtual = avaliarMomento();

  const getUrgenciaStyles = () => {
    if (timeLeft.dias <= 7) {
      return {
        bg: "from-purple-500 to-purple-700",
        text: "text-purple-50",
        badge: "bg-purple-600",
        pulse: true
      };
    } else if (timeLeft.dias <= 14) {
      return {
        bg: "from-blue-500 to-blue-700",
        text: "text-blue-50",
        badge: "bg-blue-600",
        pulse: false
      };
    } else {
      return {
        bg: "from-slate-500 to-slate-700",
        text: "text-slate-50",
        badge: "bg-slate-600",
        pulse: false
      };
    }
  };

  const styles = getUrgenciaStyles();

  return (
    <Card className="border-slate-200 shadow-lg overflow-hidden">
      <CardHeader className={cn(
        "pb-4 bg-gradient-to-r",
        styles.bg,
        styles.text
      )}>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Clock className={cn("h-5 w-5", styles.pulse && "animate-pulse")} />
          Contagem Regressiva: Momento Dourado
        </CardTitle>
        <p className="text-sm opacity-90 mt-1">
          Tempo até a melhor janela de negociação do mês
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Contador Grande */}
        <div className={cn(
          "p-6 rounded-lg bg-gradient-to-br",
          styles.bg,
          styles.text
        )}>
          <div className="text-center mb-4">
            <div className="text-sm opacity-90 mb-1">Próximo Momento Dourado:</div>
            <div className="text-sm font-semibold">
              {dataAlvo.toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Dias', value: timeLeft.dias },
              { label: 'Horas', value: timeLeft.horas },
              { label: 'Min', value: timeLeft.minutos },
              { label: 'Seg', value: timeLeft.segundos }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className={cn(
                  "bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-2",
                  styles.pulse && idx === 0 && "animate-pulse"
                )}>
                  <div className="text-3xl font-bold">
                    {String(item.value).padStart(2, '0')}
                  </div>
                </div>
                <div className="text-xs opacity-90 font-semibold">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Atual da Provisão */}
        <div className={cn(
          "p-5 rounded-lg border-2",
          `bg-gradient-to-r ${momentoAtual.cor}`,
          "text-white"
        )}>
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-5 w-5" />
            <h3 className="font-bold text-lg">{momentoAtual.titulo}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded">
              <div className="text-xs opacity-90 mb-1">Provisão Atual:</div>
              <div className="text-2xl font-bold">
                {provisaoAtual.toFixed(0)}%
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded">
              <div className="text-xs opacity-90 mb-1">Desconto Disponível:</div>
              <div className="text-lg font-bold">
                {descontoAtual.toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL',
                  maximumFractionDigits: 0
                })}
              </div>
            </div>
          </div>

          <p className="text-sm opacity-90">
            {momentoAtual.descricao}
          </p>
        </div>

        {/* Valor da Proposta */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-lg border-2 border-green-300">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-green-600" />
            <h3 className="font-bold text-green-900">Valor da Sua Proposta Hoje</h3>
          </div>
          
          <div className="mb-3">
            <div className="text-sm text-green-800 mb-1">Com {provisaoAtual.toFixed(0)}% de provisão:</div>
            <div className="text-3xl font-bold text-green-700">
              {valorPropostaAtual.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              })}
            </div>
            <div className="text-xs text-green-700 mt-1">
              (Fórmula: R$ {valorDivida.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} - R$ {descontoAtual.toLocaleString('pt-BR', { maximumFractionDigits: 0 })})
            </div>
          </div>

          <div className="bg-white p-3 rounded border border-green-200">
            <div className="text-xs text-slate-600 mb-2">Composição do acordo:</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-700">Valor original:</span>
                <span className="font-semibold text-slate-900">
                  {valorDivida.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="flex justify-between text-green-700">
                <span>Desconto (provisão {provisaoAtual.toFixed(0)}%):</span>
                <span className="font-bold">
                  -{descontoAtual.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-1 flex justify-between">
                <span className="text-slate-700 font-semibold">Você pagaria:</span>
                <span className="font-bold text-green-700">
                  {valorPropostaAtual.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Estratégia Recomendada */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-blue-900">
              <p className="font-semibold mb-1">📋 Estratégia Recomendada:</p>
              <p className="text-xs">
                {provisaoAtual >= 60 && timeLeft.dias <= 7
                  ? "MOMENTO PERFEITO! Provisão alta + momento dourado chegando. Inicie contato com o banco AGORA!"
                  : provisaoAtual >= 60 && timeLeft.dias > 7
                  ? "Provisão excelente! Prepare-se e aguarde o momento dourado (menos de 7 dias) para negociar."
                  : provisaoAtual >= 40 && timeLeft.dias <= 7
                  ? "Bom momento! Provisão razoável + momento dourado. Pode negociar agora com boas chances!"
                  : provisaoAtual >= 40
                  ? "Provisão crescendo bem. Organize documentos e aguarde o momento dourado para maximizar resultado."
                  : provisaoAtual >= 20
                  ? "Provisão ainda moderada. Considere aguardar mais alguns dias para melhorar o desconto."
                  : "Provisão ainda inicial. Recomendamos aguardar mais tempo para conseguir melhor desconto."
                }
              </p>
            </div>
          </div>
        </div>

        {/* Alerta de Urgência */}
        {timeLeft.dias <= 7 && provisaoAtual >= 40 && (
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-5 rounded-lg animate-pulse">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-1">⭐ JANELA DE OPORTUNIDADE ABERTA!</h3>
                <p className="text-sm opacity-90">
                  Provisão de {provisaoAtual.toFixed(0)}% + momento dourado em menos de 7 dias = 
                  Combinação ideal para negociar! Entre em contato com o banco AGORA!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Entendimento */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1 text-sm text-amber-900">
              <p className="font-semibold mb-1">Entenda a Estratégia:</p>
              <p className="text-xs">
                Este contador marca o "momento dourado" - quando gerentes estão sob pressão de metas 
                e mais flexíveis. O IDEAL é combinar: provisão razoável (40-70%) + momento dourado. 
                Assim você tem desconto bom E gerente motivado a fechar rápido!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}