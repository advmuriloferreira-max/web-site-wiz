import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Eye, Clock, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardsAnalogiasProps {
  valorDivida: number;
  valorProvisao: number;
  classificacao: string | null;
  diasAtraso: number;
  mesesAtraso: number;
  estagioRisco: number; // Estágio BCB (1, 2 ou 3) - vem do banco
}

export function CardsAnalogias({
  valorDivida,
  valorProvisao,
  classificacao,
  diasAtraso,
  mesesAtraso,
  estagioRisco,
}: CardsAnalogiasProps) {
  
  // Calcula o "peso" da dívida em salários mínimos (aproximado)
  const salarioMinimo = 1412; // valor aproximado
  const pesoEmSalarios = Math.round(valorDivida / salarioMinimo);

  // Calcula quanto o banco "perdeu" com juros esperados
  const taxaJurosMensal = 0.02; // 2% ao mês (estimativa)
  const jurosPerdidos = valorDivida * taxaJurosMensal * mesesAtraso;

  // Como o banco vê baseado no PERCENTUAL DE PROVISÃO (não na classificação)
  // A classificação C1-C5 é apenas o TIPO de operação, não muda com tempo!
  const getVisaoBanco = () => {
    const percentualProvisao = valorDivida > 0 ? (valorProvisao / valorDivida) * 100 : 0;
    
    if (percentualProvisao >= 70) {
      return {
        pensamento: "Já consideramos perda provável",
        acao: `${percentualProvisao.toFixed(0)}% provisionado - QUER NEGOCIAR`,
        cor: "text-green-600",
        bgCor: "bg-green-50",
        oportunidade: "EXCELENTE"
      };
    } else if (percentualProvisao >= 40) {
      return {
        pensamento: "Provisão moderada",
        acao: `${percentualProvisao.toFixed(0)}% provisionado - Aberto a acordos`,
        cor: "text-blue-600",
        bgCor: "bg-blue-50",
        oportunidade: "BOA"
      };
    } else if (percentualProvisao >= 20) {
      return {
        pensamento: "Baixa provisão ainda",
        acao: `${percentualProvisao.toFixed(0)}% provisionado - Pouca flexibilidade`,
        cor: "text-yellow-600",
        bgCor: "bg-yellow-50",
        oportunidade: "REGULAR"
      };
    } else {
      return {
        pensamento: "Quase nada provisionado",
        acao: `${percentualProvisao.toFixed(0)}% provisionado - Aguarde melhor momento`,
        cor: "text-gray-600",
        bgCor: "bg-gray-50",
        oportunidade: "AGUARDAR"
      };
    }
  };

  const visaoBanco = getVisaoBanco();
  const percentualProvisao = valorDivida > 0 ? (valorProvisao / valorDivida) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card 1: Tamanho do Problema */}
      <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <Scale className="h-5 w-5 text-blue-600" />
            Tamanho do Problema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-3xl font-bold text-blue-600">
            {pesoEmSalarios}
          </div>
          <p className="text-sm text-slate-600">
            Equivalente a <span className="font-semibold">{pesoEmSalarios} salários mínimos</span>
          </p>
          
          <div className="pt-3 border-t border-slate-200">
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Valor Total:</span>
                <span className="font-semibold">
                  {valorDivida.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Por salário mínimo:</span>
                <span className="font-semibold">~R$ {salarioMinimo.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg mt-3">
            <p className="text-xs text-blue-800">
              💡 Para o banco, isso representa uma exposição significativa que precisa ser gerenciada.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Como o Banco Te Vê */}
      <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <Eye className="h-5 w-5 text-purple-600" />
            Como o Banco Te Vê
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className={cn("p-3 rounded-lg", visaoBanco.bgCor)}>
            <div className={cn("text-lg font-bold mb-1", visaoBanco.cor)}>
              "{visaoBanco.pensamento}"
            </div>
            <div className={cn("text-sm mb-2", visaoBanco.cor)}>
              {visaoBanco.acao}
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-2">
              Oportunidade: <span className={visaoBanco.cor}>{visaoBanco.oportunidade}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Tipo de Operação:</span>
              <span className={cn("font-bold text-lg")}>
                {classificacao || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Estágio:</span>
              <span className="font-semibold">
                {estagioRisco} ({estagioRisco === 1 ? "0-30 dias" : estagioRisco === 2 ? "31-90 dias" : ">90 dias"})
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Provisão:</span>
              <span className="font-semibold">
                {percentualProvisao.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <div className="text-xs text-slate-600 space-y-1">
              <p>📊 <span className="font-semibold">Provisão BCB:</span> Quanto maior, MELHOR para você negociar!</p>
              <p>🎯 <span className="font-semibold">Classificação:</span> Define o tipo de operação (garantias), não muda com tempo.</p>
            </div>
          </div>

          <div className={cn("p-3 rounded-lg", visaoBanco.bgCor)}>
            <p className="text-xs font-semibold" style={{ color: visaoBanco.cor.replace('text-', '') }}>
              💡 {percentualProvisao >= 70 
                ? "Banco já provisionou muito! Este é O MELHOR momento para conseguir grandes descontos."
                : percentualProvisao >= 40
                ? "Provisão moderada. Banco está aberto a negociações razoáveis."
                : "Provisão ainda baixa. Banco tem pouca pressão para negociar. Aguarde provisão aumentar."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Tempo é Dinheiro */}
      <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <Clock className="h-5 w-5 text-orange-600" />
            Tempo é Dinheiro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-3xl font-bold text-orange-600">
            {mesesAtraso} {mesesAtraso === 1 ? 'mês' : 'meses'}
          </div>
          <p className="text-sm text-slate-600">
            <span className="font-semibold">{diasAtraso} dias</span> sem pagamento
          </p>

          <div className="space-y-2 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2 text-sm">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-slate-600">Juros perdidos pelo banco:</span>
            </div>
            <div className="text-xl font-bold text-red-600">
              {jurosPerdidos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-slate-600">
              Baseado em ~2% ao mês de juros esperados
            </p>
          </div>

          <div className="bg-orange-50 p-3 rounded-lg space-y-2">
            <p className="text-xs text-orange-800 font-semibold">
              ⏰ Cada mês que passa:
            </p>
            <ul className="text-xs text-orange-800 space-y-1 list-disc list-inside">
              <li>Pode mudar o estágio de risco (baseado em dias)</li>
              <li>Cresce a provisão do banco (BOM para você!)</li>
              <li>Mas aumenta juros e encargos</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
