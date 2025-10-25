/**
 * Página dedicada para Análise de Juros Abusivos (Bacen)
 * Produto independente: Bacen Loan Wizard
 */

import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContratoById } from "@/hooks/useContratoById";
import { AnalysisDashboard } from "@/modules/FinancialAnalysis";

export default function AnaliseJurosContrato() {
  const { contratoId } = useParams<{ contratoId: string }>();
  const navigate = useNavigate();
  const { data: contrato, isLoading, error } = useContratoById(contratoId || null);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Carregando dados do contrato...</div>
      </div>
    );
  }

  if (error || !contrato) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Contrato não encontrado</h2>
          <p className="text-muted-foreground mb-4">
            O contrato com ID "{contratoId}" não pôde ser encontrado.
          </p>
          <Button onClick={() => navigate("/contratos")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Contratos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="p-6 bg-card border border-border rounded-lg">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/contratos/${contratoId}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para Detalhes
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground">
                  ABUSIVIDADE DE JUROS - REVISIONAIS (BACEN)
                </h1>
                <p className="text-muted-foreground text-lg">
                  Contrato {contrato.numero_contrato || "Sem número"} • Cliente: {contrato.clientes?.nome}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard de Análise */}
        {contratoId && <AnalysisDashboard contratoId={contratoId} />}
      </div>
    </div>
  );
}