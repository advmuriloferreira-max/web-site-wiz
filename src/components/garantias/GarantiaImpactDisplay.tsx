import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingDown, Shield, Calculator } from "lucide-react";
import { ResultadoCalculo, GarantiaInfo } from "@/lib/calculoProvisao";

interface GarantiaImpactDisplayProps {
  resultado: ResultadoCalculo;
}

export function GarantiaImpactDisplay({ resultado }: GarantiaImpactDisplayProps) {
  const formatCurrency = (value?: number) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value?: number) => {
    if (value === undefined) return "0,00%";
    return `${value.toFixed(2)}%`;
  };

  // Só exibe se houver garantias ou informações de LGD
  if (!resultado.garantias?.length && !resultado.lgdBase) {
    return null;
  }

  const temGarantias = resultado.garantias && resultado.garantias.length > 0;
  const impactoPositivo = resultado.impactoGarantia && resultado.impactoGarantia > 0;

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5" />
          Impacto das Garantias no Cálculo
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">LGD Base</div>
            <div className="text-lg font-semibold text-destructive">
              {formatPercentage(resultado.lgdBase)}
            </div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">LGD Ajustado</div>
            <div className="text-lg font-semibold text-primary">
              {formatPercentage(resultado.lgdAjustado)}
            </div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Redução na Provisão</div>
            <div className={`text-lg font-semibold flex items-center justify-center gap-1 ${
              impactoPositivo ? 'text-green-600' : 'text-muted-foreground'
            }`}>
              {impactoPositivo && <TrendingDown className="h-4 w-4" />}
              {formatPercentage(resultado.impactoGarantia)}
            </div>
          </div>
        </div>

        {/* Valor total das garantias */}
        {temGarantias && (
          <>
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Valor Total das Garantias:</span>
                <span className="text-lg font-semibold text-primary">
                  {formatCurrency(resultado.valorGarantiaTotal)}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Lista de garantias */}
        {temGarantias && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Garantias Consideradas ({resultado.garantias!.length})
              </h4>
              
              <div className="space-y-2">
                {resultado.garantias!.map((garantia) => {
                  const valorAjustado = (garantia.valor_avaliacao || 0) * (garantia.percentual_cobertura || 0) / 100;
                  
                  return (
                    <div key={garantia.id} className="p-3 border rounded-lg bg-background">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={garantia.tipo_garantia === "Real" ? "default" : "secondary"}>
                            {garantia.tipo_garantia}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(valorAjustado)}</div>
                          <div className="text-xs text-muted-foreground">
                            {garantia.percentual_cobertura}% de {formatCurrency(garantia.valor_avaliacao)}
                          </div>
                        </div>
                      </div>
                      
                      {garantia.descricao && (
                        <p className="text-sm text-muted-foreground">
                          {garantia.descricao}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Explicação da metodologia */}
        <Separator />
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Metodologia:</strong> LGD Ajustado = LGD Base × (1 - (Valor Garantia ÷ Valor Dívida) × Fator Recuperação)</p>
          <p><strong>Fator de Recuperação:</strong> 50% (padrão para garantias reais e fidejussórias)</p>
          <p><strong>Valor Garantia:</strong> Valor de avaliação × Percentual de cobertura</p>
        </div>
      </CardContent>
    </Card>
  );
}