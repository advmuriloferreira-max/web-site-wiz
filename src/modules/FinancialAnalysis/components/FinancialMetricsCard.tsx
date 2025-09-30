import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calcularMetricasFinanceiras } from "../lib/financialCalculations";
import { TrendingUp, TrendingDown, Percent, DollarSign } from "lucide-react";
import { Contrato } from "@/hooks/useContratos";

interface FinancialMetricsCardProps {
  contrato: Contrato;
}

export default function FinancialMetricsCard({ contrato }: FinancialMetricsCardProps) {
  const metricas = calcularMetricasFinanceiras({
    valorDivida: contrato.valor_divida,
    saldoContabil: contrato.saldo_contabil || contrato.valor_divida,
    taxaBacen: contrato.taxa_bacen || 0,
    taxaJuros: contrato.taxa_bacen || 0,
    prazoMeses: 12,
    valorParcela: contrato.valor_parcela || 0,
    valorGarantias: 0,
    diasAtraso: contrato.dias_atraso || 0,
  });

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const metrics = [
    {
      label: "Taxa Efetiva Mensal",
      value: formatPercent(metricas.taxaEfetivaMensal),
      icon: Percent,
      description: "Taxa mensal do contrato",
    },
    {
      label: "Taxa Efetiva Anual",
      value: formatPercent(metricas.taxaEfetivaAnual),
      icon: Percent,
      description: "Taxa anualizada do contrato",
    },
    {
      label: "Custo Efetivo Total",
      value: formatPercent(metricas.custoEfetivoTotal),
      icon: TrendingUp,
      description: "CET anual do financiamento",
    },
    {
      label: "Valor Presente Líquido",
      value: formatCurrency(metricas.valorPresenteLiquido),
      icon: DollarSign,
      description: "VPL do fluxo de caixa",
    },
    {
      label: "Taxa Interna de Retorno",
      value: formatPercent(metricas.taxaInternaRetorno),
      icon: TrendingUp,
      description: "TIR do contrato",
    },
    {
      label: "Índice de Cobertura",
      value: metricas.indiceCoberturaDivida.toFixed(2),
      icon: TrendingDown,
      description: "Capacidade de pagamento",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}