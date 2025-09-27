import { UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProvisaoPerda, useProvisaoPerdaIncorrida } from "@/hooks/useProvisao";
import { useGetTipoOperacaoById } from "@/hooks/useTiposOperacao";
import { ContratoWizardData } from "./types";
import { Calculator, TrendingUp, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { calcularProvisao, ClassificacaoRisco } from "@/lib/calculoProvisao";
import { enhancedToast } from "@/components/ui/enhanced-toast";

interface Etapa3Props {
  form: UseFormReturn<ContratoWizardData>;
}

export function Etapa3({ form }: Etapa3Props) {
  const { data: tabelaPerda } = useProvisaoPerda();
  const { data: tabelaIncorrida } = useProvisaoPerdaIncorrida();
  const [calculoRealizado, setCalculoRealizado] = useState(false);

  // Dados do formulário
  const tipoOperacaoBcb = form.watch("tipo_operacao_bcb");
  const valorDivida = form.watch("valor_divida");
  const saldoContabil = form.watch("saldo_contabil");
  const diasAtraso = form.watch("dias_atraso");
  const classificacao = form.watch("classificacao");
  const valorProvisao = form.watch("valor_provisao");
  const propostaAcordo = form.watch("proposta_acordo");

  const { data: tipoOperacaoSelecionado } = useGetTipoOperacaoById(tipoOperacaoBcb);

  // Definir classificação automaticamente baseada no tipo de operação
  useEffect(() => {
    if (tipoOperacaoSelecionado && !classificacao) {
      const novaClassificacao = tipoOperacaoSelecionado.carteira as ClassificacaoRisco;
      form.setValue("classificacao", novaClassificacao);
      enhancedToast.info(`Classificação definida automaticamente: ${novaClassificacao}`, {
        description: "Baseada no tipo de operação BCB selecionado"
      });
    }
  }, [tipoOperacaoSelecionado, classificacao, form]);

  const calcularProvisaoAutomatica = () => {
    if (!valorDivida || !classificacao) {
      enhancedToast.warning("Dados insuficientes", {
        description: "Informe pelo menos o valor da dívida e a classificação"
      });
      return;
    }

    if (!tabelaPerda || !tabelaIncorrida) {
      enhancedToast.error("Tabelas de referência não carregadas");
      return;
    }

    try {
      const diasAtrasoNum = diasAtraso ? parseInt(diasAtraso) : 0;
      const valorDiv = parseFloat(valorDivida);
      const saldoCont = saldoContabil ? parseFloat(saldoContabil) : null;
      const valorParaCalculo = saldoCont || valorDiv;

      const resultado = calcularProvisao({
        valorDivida: valorParaCalculo,
        diasAtraso: diasAtrasoNum,
        classificacao: classificacao as ClassificacaoRisco,
        tabelaPerda,
        tabelaIncorrida,
        criterioIncorrida: "Dias de Atraso",
      });

      // Atualizar formulário
      form.setValue("percentual_provisao", resultado.percentualProvisao.toFixed(2));
      form.setValue("valor_provisao", resultado.valorProvisao.toFixed(2));
      
      const proposta = valorParaCalculo - resultado.valorProvisao;
      form.setValue("proposta_acordo", Math.max(0, proposta).toFixed(2));

      setCalculoRealizado(true);
      enhancedToast.success("Provisão calculada com sucesso!", {
        description: `${resultado.percentualProvisao.toFixed(2)}% - R$ ${resultado.valorProvisao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      });
    } catch (error) {
      enhancedToast.error("Erro ao calcular provisão");
      console.error(error);
    }
  };

  const getClassificacaoColor = (classif: string) => {
    const colors = {
      C1: "bg-green-100 text-green-800 border-green-200",
      C2: "bg-yellow-100 text-yellow-800 border-yellow-200",
      C3: "bg-orange-100 text-orange-800 border-orange-200",
      C4: "bg-red-100 text-red-800 border-red-200",
      C5: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[classif as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getRiscoDescricao = (classif: string) => {
    const descricoes = {
      C1: "Risco Normal - Provisão mínima",
      C2: "Risco Pequeno - Provisão baixa",
      C3: "Risco Médio - Provisão moderada",
      C4: "Risco Alto - Provisão elevada",
      C5: "Risco Máximo - Provisão total",
    };
    return descricoes[classif as keyof typeof descricoes] || "";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cálculo de Provisão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações da Classificação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="classificacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classificação de Risco</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a classificação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["C1", "C2", "C3", "C4", "C5"].map((classif) => (
                        <SelectItem key={classif} value={classif}>
                          <div className="flex items-center gap-2">
                            <Badge className={getClassificacaoColor(classif)}>
                              {classif}
                            </Badge>
                            <span className="text-sm">{getRiscoDescricao(classif)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Dias de Atraso</label>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">
                  {diasAtraso || "0"} dias
                </div>
                <div className="text-sm text-muted-foreground">
                  Calculado automaticamente
                </div>
              </div>
            </div>
          </div>

          {/* Botão para calcular provisão */}
          <div className="flex gap-4">
            <Button 
              onClick={calcularProvisaoAutomatica}
              disabled={!valorDivida || !classificacao}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              Calcular Provisão
            </Button>
            
            {calculoRealizado && (
              <Badge variant="outline" className="flex items-center gap-2 px-3 py-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Cálculo realizado
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview do Cálculo */}
      {valorProvisao && parseFloat(valorProvisao) > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <TrendingUp className="h-5 w-5" />
              Preview do Cálculo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-sm text-muted-foreground">Valor da Dívida</div>
                <div className="text-xl font-bold">
                  R$ {parseFloat(valorDivida || "0").toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-sm text-muted-foreground">Provisão Necessária</div>
                <div className="text-xl font-bold text-red-600">
                  R$ {parseFloat(valorProvisao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {form.watch("percentual_provisao")}% do valor
                </div>
              </div>
              
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-sm text-muted-foreground">Proposta de Acordo</div>
                <div className="text-xl font-bold text-green-600">
                  R$ {parseFloat(propostaAcordo || "0").toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-muted-foreground">
                  Valor sugerido
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campos de resultado (ocultos mas necessários) */}
      <div className="hidden">
        <FormField
          control={form.control}
          name="percentual_provisao"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="valor_provisao"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="proposta_acordo"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          O cálculo de provisão segue as diretrizes do Banco Central do Brasil (BCB) e considera 
          a classificação de risco, dias de atraso e valor da operação. A proposta de acordo é 
          calculada subtraindo a provisão necessária do valor total da dívida.
        </AlertDescription>
      </Alert>
    </div>
  );
}