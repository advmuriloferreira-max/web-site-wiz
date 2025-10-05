import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContadorOportunidadeProps {
  valorDivida: number;
  diasAtraso: number;
}

export function ContadorOportunidade({ 
  valorDivida, 
  diasAtraso 
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

  // Calcula o custo por dia de atraso
  const taxaDiaria = valorDivida * 0.0015; // ~4.5% ao mês = 0.15% ao dia
  const custoDiario = taxaDiaria;
  const custoAteMomentoDourado = custoDiario * timeLeft.dias;

  // Calcula desconto sazonal baseado em proximidade
  const calcularDescontoSazonal = () => {
    const hoje = new Date();
    const mes = hoje.getMonth();
    
    // Dezembro = 70%, Março/Junho/Setembro = 50%, outros = 40%
    if (mes === 11) {
      return { percentual: 70, descricao: "Desconto de Fim de Ano", urgencia: "extrema" };
    } else if ([2, 5, 8].includes(mes)) {
      return { percentual: 50, descricao: "Desconto de Fim de Trimestre", urgencia: "muito-alta" };
    } else {
      return { percentual: 40, descricao: "Desconto Padrão", urgencia: "alta" };
    }
  };

  const descontoAtual = calcularDescontoSazonal();
  const economiaEstimada = valorDivida * (descontoAtual.percentual / 100);

  const getUrgenciaStyles = () => {
    if (timeLeft.dias <= 7) {
      return {
        bg: "from-red-500 to-red-700",
        text: "text-red-50",
        badge: "bg-red-600",
        pulse: true
      };
    } else if (timeLeft.dias <= 14) {
      return {
        bg: "from-orange-500 to-orange-700",
        text: "text-orange-50",
        badge: "bg-orange-600",
        pulse: false
      };
    } else {
      return {
        bg: "from-blue-500 to-blue-700",
        text: "text-blue-50",
        badge: "bg-blue-600",
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
          Contador de Oportunidade
        </CardTitle>
        <p className="text-sm opacity-90 mt-1">
          Tempo até o próximo "momento dourado" de negociação
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
            <div className="text-sm opacity-90 mb-1">Momento Ideal em:</div>
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

        {/* Desconto Atual */}
        <div className="bg-green-50 border-2 border-green-300 p-5 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              <h3 className="font-bold text-green-900">Desconto Disponível Agora</h3>
            </div>
            <Badge className="bg-green-600 text-white">
              {descontoAtual.percentual}%
            </Badge>
          </div>
          
          <div className="mb-3">
            <div className="text-sm text-green-800 mb-1">{descontoAtual.descricao}</div>
            <div className="text-3xl font-bold text-green-700">
              {economiaEstimada.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              })}
            </div>
            <div className="text-xs text-green-700">
              Economia potencial negociando neste período
            </div>
          </div>

          <div className="bg-white p-3 rounded border border-green-200">
            <div className="text-xs text-slate-600 mb-2">O que isso significa na prática:</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-700">Valor original da dívida:</span>
                <span className="font-semibold text-slate-900">
                  {valorDivida.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="flex justify-between text-green-700">
                <span>Com desconto de {descontoAtual.percentual}%:</span>
                <span className="font-bold">
                  {(valorDivida - economiaEstimada).toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Custo da Espera */}
        <div className="bg-red-50 border-2 border-red-300 p-5 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-red-600" />
            <h3 className="font-bold text-red-900">Custo de Esperar</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white p-3 rounded border border-red-200">
              <div className="text-xs text-slate-600 mb-1">Por dia:</div>
              <div className="text-lg font-bold text-red-600">
                +{custoDiario.toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                })}
              </div>
            </div>
            <div className="bg-white p-3 rounded border border-red-200">
              <div className="text-xs text-slate-600 mb-1">Até momento dourado:</div>
              <div className="text-lg font-bold text-red-600">
                +{custoAteMomentoDourado.toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                })}
              </div>
            </div>
          </div>

          <p className="text-xs text-red-800">
            💸 Cada dia que você espera, a dívida aumenta. Não deixe o tempo trabalhar contra você!
          </p>
        </div>

        {/* Alertas de Urgência */}
        {timeLeft.dias <= 7 && (
          <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-5 rounded-lg animate-pulse">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-1">ÚLTIMA SEMANA!</h3>
                <p className="text-sm opacity-90">
                  O momento dourado está chegando! Este é o melhor período para negociar com o banco. 
                  Não perca esta oportunidade única!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dica Estratégica */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1 text-sm text-blue-900">
              <p className="font-semibold mb-1">Estratégia Recomendada:</p>
              <p className="text-xs">
                {timeLeft.dias > 14 
                  ? "Comece a se preparar agora. Organize documentos e planeje sua proposta. Inicie contato 7-10 dias antes do momento dourado."
                  : timeLeft.dias > 7
                  ? "Momento de agir! Entre em contato com o banco agora para ter tempo de negociar até o momento ideal."
                  : "AÇÃO URGENTE! Este é o melhor momento. Ligue para o banco HOJE e negocie o melhor desconto possível."
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
