import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calculator, RefreshCw, AlertTriangle } from "lucide-react";
import { useContratos } from "@/hooks/useContratos";
import { useProvisaoPerda, useProvisaoPerdaIncorrida, useUpdateContrato } from "@/hooks/useProvisao";
import { 
  calcularProvisao, 
  classificarRisco, 
  calcularDiasAtraso,
  diasParaMeses,
  ClassificacaoRisco 
} from "@/lib/calculoProvisao";
import { toast } from "sonner";

export function ContratosComCalculos() {
  const { data: contratos, isLoading } = useContratos();
  const { data: tabelaPerda } = useProvisaoPerda();
  const { data: tabelaIncorrida } = useProvisaoPerdaIncorrida();
  const updateContrato = useUpdateContrato();
  const [calculandoIds, setCalculandoIds] = useState<Set<string>>(new Set());

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getClassificacaoColor = (classificacao: string | null) => {
    switch (classificacao) {
      case "C1": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "C2": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "C3": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "C4": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "C5": return "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const calcularProvisaoContrato = async (contratoId: string) => {
    if (!tabelaPerda || !tabelaIncorrida) {
      toast.error("Tabelas de referência não carregadas");
      return;
    }

    const contrato = contratos?.find(c => c.id === contratoId);
    if (!contrato) return;

    setCalculandoIds(prev => new Set(prev).add(contratoId));

    try {
      let diasAtraso = contrato.dias_atraso || 0;
      
      // Se tem data de vencimento, recalcular dias de atraso
      if (contrato.data_vencimento) {
        diasAtraso = calcularDiasAtraso(contrato.data_vencimento);
      }

      // Classificar automaticamente se não tem classificação
      let classificacao = contrato.classificacao as ClassificacaoRisco;
      if (!classificacao) {
        classificacao = classificarRisco(diasAtraso);
      }

      // Regra: usar saldo contábil (Registrato) quando presente, senão usar valor da dívida
      const valorParaCalculo = contrato.saldo_contabil || contrato.valor_divida;

      const resultado = calcularProvisao({
        valorDivida: valorParaCalculo,
        diasAtraso,
        classificacao,
        tabelaPerda,
        tabelaIncorrida,
        criterioIncorrida: "Dias de Atraso",
      });

      const updates = {
        dias_atraso: diasAtraso,
        meses_atraso: diasParaMeses(diasAtraso),
        classificacao: classificacao,
        percentual_provisao: resultado.percentualProvisao,
        valor_provisao: resultado.valorProvisao,
      };

      await updateContrato.mutateAsync({ id: contratoId, updates });
      
    } catch (error) {
      toast.error("Erro ao calcular provisão");
    } finally {
      setCalculandoIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(contratoId);
        return newSet;
      });
    }
  };

  const calcularTodosContratos = async () => {
    if (!contratos || !tabelaPerda || !tabelaIncorrida) return;

    toast.info("Iniciando cálculo automático para todos os contratos...");
    
    for (const contrato of contratos) {
      await calcularProvisaoContrato(contrato.id);
    }

    toast.success("Cálculo concluído para todos os contratos!");
  };

  const needsCalculation = (contrato: any) => {
    return !contrato.valor_provisao || contrato.valor_provisao === 0 || !contrato.classificacao;
  };

  if (isLoading) {
    return <div className="text-center">Carregando contratos...</div>;
  }

  const contratosComAlerta = contratos?.filter(needsCalculation).length || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Contratos com Cálculos de Provisão
            </div>
            <div className="flex items-center gap-2">
              {contratosComAlerta > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {contratosComAlerta} precisam de cálculo
                </Badge>
              )}
              <Button 
                onClick={calcularTodosContratos}
                disabled={!tabelaPerda || !tabelaIncorrida}
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recalcular Todos
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor Dívida</TableHead>
                  <TableHead>Dias Atraso</TableHead>
                  <TableHead>Classificação</TableHead>
                  <TableHead>% Provisão</TableHead>
                  <TableHead>Valor Provisão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contratos?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum contrato encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  contratos?.map((contrato) => (
                    <TableRow key={contrato.id}>
                      <TableCell className="font-medium">
                        {contrato.clientes?.nome}
                      </TableCell>
                      <TableCell>{formatCurrency(contrato.valor_divida)}</TableCell>
                      <TableCell>
                        <Badge variant={contrato.dias_atraso > 0 ? "destructive" : "secondary"}>
                          {contrato.dias_atraso || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {contrato.classificacao ? (
                          <Badge className={getClassificacaoColor(contrato.classificacao)}>
                            {contrato.classificacao}
                          </Badge>
                        ) : (
                          <Badge variant="outline">-</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {contrato.percentual_provisao ? 
                          `${(contrato.percentual_provisao).toFixed(2)}%` : 
                          <span className="text-muted-foreground">-</span>
                        }
                      </TableCell>
                      <TableCell className="font-medium">
                        {contrato.valor_provisao ? 
                          formatCurrency(contrato.valor_provisao) : 
                          <span className="text-muted-foreground">-</span>
                        }
                      </TableCell>
                      <TableCell>
                        {needsCalculation(contrato) ? (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Requer cálculo
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Calculado</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => calcularProvisaoContrato(contrato.id)}
                          disabled={calculandoIds.has(contrato.id) || !tabelaPerda || !tabelaIncorrida}
                        >
                          {calculandoIds.has(contrato.id) ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Calculator className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}