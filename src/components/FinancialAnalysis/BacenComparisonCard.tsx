import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Contrato } from "@/hooks/useContratos";
import { compararTaxaBacen } from "@/lib/financialCalculations";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BacenComparisonCardProps {
  contrato: Contrato;
  latestAnalysis?: {
    taxa_bacen: number | null;
    taxa_referencia: string | null;
    data_consulta: string | null;
  };
}

export default function BacenComparisonCard({ 
  contrato, 
  latestAnalysis 
}: BacenComparisonCardProps) {
  if (!contrato.taxa_bacen && !latestAnalysis?.taxa_bacen) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparação com Taxa Bacen</CardTitle>
          <CardDescription>
            Nenhuma taxa de referência disponível
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <p>Consulte a taxa do Bacen para comparar com este contrato</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const taxaContrato = contrato.taxa_bacen || 0;
  const taxaBacen = latestAnalysis?.taxa_bacen || contrato.taxa_bacen || 0;
  const comparacao = compararTaxaBacen(taxaContrato, taxaBacen);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparação com Taxa Bacen</CardTitle>
        <CardDescription>
          Análise comparativa com taxa de referência do mercado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Taxa do Contrato
            </label>
            <p className="text-2xl font-bold">{taxaContrato.toFixed(2)}%</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Taxa Bacen ({latestAnalysis?.taxa_referencia || "Selic"})
            </label>
            <p className="text-2xl font-bold">{taxaBacen.toFixed(2)}%</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <Badge variant={comparacao.acimaMercado ? "destructive" : "default"}>
              {comparacao.acimaMercado ? (
                <>
                  <TrendingUp className="mr-1 h-3 w-3" />
                  Acima do Mercado
                </>
              ) : (
                <>
                  <TrendingDown className="mr-1 h-3 w-3" />
                  Dentro do Mercado
                </>
              )}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Diferença</span>
            <span className={`font-bold ${
              comparacao.diferenca > 0 ? 'text-destructive' : 'text-primary'
            }`}>
              {comparacao.diferenca > 0 ? '+' : ''}{comparacao.diferenca.toFixed(2)}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Diferença Percentual</span>
            <span className={`font-bold ${
              comparacao.percentualDiferenca > 0 ? 'text-destructive' : 'text-primary'
            }`}>
              {comparacao.percentualDiferenca > 0 ? '+' : ''}{comparacao.percentualDiferenca.toFixed(2)}%
            </span>
          </div>

          {latestAnalysis?.data_consulta && (
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Última consulta: {format(
                  new Date(latestAnalysis.data_consulta), 
                  "dd/MM/yyyy 'às' HH:mm",
                  { locale: ptBR }
                )}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
