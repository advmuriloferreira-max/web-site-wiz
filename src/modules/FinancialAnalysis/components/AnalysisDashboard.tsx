/**
 * Dashboard principal de Análise Financeira
 * Bacen Loan Wizard - Ponto de entrada do módulo
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, FileText, TrendingUp, RefreshCw } from "lucide-react";
import { useContratoById } from "@/hooks/useContratoById";
import { useConsultarTaxaBacen, useLatestAnalysis } from "../hooks/useBacenRates";
import { toast } from "sonner";
import FinancialMetricsCard from "./FinancialMetricsCard";
import BacenComparisonCard from "./BacenComparisonCard";
import AnalysisHistoryTable from "./AnalysisHistoryTable";
import { saveAnalysisReport } from "../lib/analysisReportGenerator";
import { calcularMetricasFinanceiras } from "../lib/financialCalculations";

interface AnalysisDashboardProps {
  contratoId: string;
}

export default function AnalysisDashboard({ contratoId }: AnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState("metrics");
  
  const { data: contrato, isLoading: loadingContrato } = useContratoById(contratoId);
  const { data: latestAnalysis, refetch: refetchAnalysis } = useLatestAnalysis(contratoId);
  const consultarTaxaBacen = useConsultarTaxaBacen();

  const handleConsultarTaxaBacen = async () => {
    try {
      await consultarTaxaBacen.mutateAsync({
        contratoId,
        tipoOperacao: contrato?.tipo_operacao,
      });
      refetchAnalysis();
    } catch (error) {
      console.error("Erro ao consultar taxa Bacen:", error);
    }
  };

  const handleGerarRelatorio = () => {
    if (!contrato) {
      toast.error("Dados do contrato não disponíveis");
      return;
    }

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

    const reportData = {
      contrato: {
        numero: contrato.numero_contrato || "N/A",
        cliente: contrato.clientes?.nome || "N/A",
        banco: contrato.bancos?.nome || "N/A",
        valorDivida: contrato.valor_divida,
        dataContrato: contrato.data_entrada,
      },
      metricas,
      taxaBacen: latestAnalysis ? {
      taxa: latestAnalysis.taxa_bacen || 0,
        referencia: latestAnalysis.taxa_referencia || "N/A",
        dataConsulta: latestAnalysis.data_consulta || new Date().toISOString(),
      } : undefined,
      situacaoAtual: {
        diasAtraso: 0,
        mesesAtraso: 0,
        estagioRisco: 1,
        valorProvisao: 0,
        percentualProvisao: 0,
        saldoContabil: contrato.valor_divida || 0,
      },
      projecoes: {
        valor30Dias: (contrato.valor_divida || 0) * 1.02,
        valor60Dias: (contrato.valor_divida || 0) * 1.04,
        valor90Dias: (contrato.valor_divida || 0) * 1.06,
        valor180Dias: (contrato.valor_divida || 0) * 1.12,
        valor360Dias: (contrato.valor_divida || 0) * 1.24,
        provisao30Dias: 5,
        provisao60Dias: 10,
        provisao90Dias: 15,
        provisao180Dias: 25,
        provisao360Dias: 40,
      },
      estrategia: {
        momentoIdeal: "Fim de trimestre",
        descontoEsperado: 30,
        valorAcordoEstimado: (contrato.valor_divida || 0) * 0.7,
        economiaEstimada: (contrato.valor_divida || 0) * 0.3,
        janelaNegociacao: "Próximos 60 dias",
      },
      recomendacoes: [
        "Avaliar possibilidade de renegociação com taxas mais favoráveis",
        "Considerar liquidação antecipada se houver disponibilidade financeira",
        "Monitorar variações nas taxas de mercado periodicamente",
      ],
    };

    saveAnalysisReport(reportData);
    toast.success("Relatório gerado com sucesso!");
  };

  if (loadingContrato) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando dados...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!contrato) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Contrato não encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Análise Financeira Bacen
              </CardTitle>
              <CardDescription>
                Análise detalhada do contrato {contrato.numero_contrato}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleConsultarTaxaBacen}
                disabled={consultarTaxaBacen.isPending}
              >
                {consultarTaxaBacen.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Consultando...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Consultar Taxa Bacen
                  </>
                )}
              </Button>
              <Button onClick={handleGerarRelatorio}>
                <FileText className="mr-2 h-4 w-4" />
                Gerar Relatório
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Métricas Financeiras</TabsTrigger>
          <TabsTrigger value="bacen">Comparação Bacen</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <FinancialMetricsCard contrato={contrato} />
        </TabsContent>

        <TabsContent value="bacen" className="space-y-4">
          <BacenComparisonCard 
            contrato={contrato} 
            latestAnalysis={latestAnalysis || undefined}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <AnalysisHistoryTable contratoId={contratoId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}