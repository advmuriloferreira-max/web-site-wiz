import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTiposOperacao } from "@/hooks/useTiposOperacao";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calculator, TrendingUp, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { calcularMetricasFinanceiras, compararTaxaBacen } from "@/modules/FinancialAnalysis/lib/financialCalculations";

const formSchema = z.object({
  valorFinanciamento: z.string().min(1, "Valor é obrigatório"),
  valorPrestacao: z.string().min(1, "Valor da prestação é obrigatório"),
  numeroParcelas: z.string().min(1, "Número de parcelas é obrigatório"),
  dataAssinatura: z.string().min(1, "Data de assinatura é obrigatória"),
  tipoOperacaoId: z.string().min(1, "Modalidade é obrigatória"),
});

type FormValues = z.infer<typeof formSchema>;

interface AnalysisResult {
  taxaContratoMensal: number;
  taxaContratoAnual: number;
  taxaBacen: number;
  taxaReferencia: string;
  diferenca: number;
  percentualDiferenca: number;
  acimaMercado: boolean;
  custoEfetivoTotal: number;
  taxaInternaRetorno: number;
  valorTotalPago: number;
}

export default function CalculadoraJuros() {
  const { data: tiposOperacao, isLoading: loadingTipos } = useTiposOperacao();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      valorFinanciamento: "",
      valorPrestacao: "",
      numeroParcelas: "",
      dataAssinatura: "",
      tipoOperacaoId: "",
    },
  });

  const calculateMonthlyRate = (principal: number, payment: number, periods: number): number => {
    let rate = 0.01; // Taxa inicial de 1% ao mês
    const maxIterations = 100;
    const tolerance = 0.000001;

    for (let i = 0; i < maxIterations; i++) {
      const pv = payment * ((1 - Math.pow(1 + rate, -periods)) / rate);
      const diff = pv - principal;

      if (Math.abs(diff) < tolerance) {
        return rate * 100;
      }

      const derivative = payment * (
        (periods * Math.pow(1 + rate, -periods - 1)) / rate -
        ((1 - Math.pow(1 + rate, -periods)) / (rate * rate))
      );

      rate = rate - diff / derivative;

      if (rate <= 0) rate = 0.0001;
    }

    return rate * 100;
  };

  const onSubmit = async (values: FormValues) => {
    setAnalyzing(true);
    setResult(null);

    try {
      const valorFinanciamento = parseFloat(values.valorFinanciamento.replace(/[^\d,]/g, '').replace(',', '.'));
      const valorPrestacao = parseFloat(values.valorPrestacao.replace(/[^\d,]/g, '').replace(',', '.'));
      const numeroParcelas = parseInt(values.numeroParcelas);

      // Calcular taxa mensal do contrato
      const taxaMensal = calculateMonthlyRate(valorFinanciamento, valorPrestacao, numeroParcelas);
      const taxaAnual = (Math.pow(1 + taxaMensal / 100, 12) - 1) * 100;

      // Buscar taxa do BACEN
      const { data: bacenData, error: bacenError } = await supabase.functions.invoke('get-bacen-rate', {
        body: {
          modalidade: values.tipoOperacaoId,
          dataReferencia: values.dataAssinatura,
        },
      });

      if (bacenError) {
        console.error('Erro ao buscar taxa BACEN:', bacenError);
        toast.error('Erro ao consultar taxa do BACEN');
        return;
      }

      const taxaBacen = bacenData?.taxa || 0;
      const taxaReferencia = bacenData?.taxaReferencia || "Selic";

      // Calcular métricas financeiras
      const metricas = calcularMetricasFinanceiras({
        valorDivida: valorFinanciamento,
        saldoContabil: valorFinanciamento,
        taxaBacen: taxaBacen,
        taxaJuros: taxaMensal,
        prazoMeses: numeroParcelas,
        valorParcela: valorPrestacao,
        valorGarantias: 0,
        diasAtraso: 0,
      });

      // Comparar com BACEN
      const comparacao = compararTaxaBacen(taxaMensal, taxaBacen);

      const valorTotalPago = valorPrestacao * numeroParcelas;

      setResult({
        taxaContratoMensal: taxaMensal,
        taxaContratoAnual: taxaAnual,
        taxaBacen: taxaBacen,
        taxaReferencia: taxaReferencia,
        diferenca: comparacao.diferenca,
        percentualDiferenca: comparacao.percentualDiferenca,
        acimaMercado: comparacao.acimaMercado,
        custoEfetivoTotal: metricas.custoEfetivoTotal,
        taxaInternaRetorno: metricas.taxaInternaRetorno,
        valorTotalPago: valorTotalPago,
      });

      toast.success('Análise concluída com sucesso!');
    } catch (error) {
      console.error('Erro na análise:', error);
      toast.error('Erro ao realizar análise');
    } finally {
      setAnalyzing(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Calculadora de Juros Abusivos</h1>
          <p className="text-muted-foreground">
            Análise rápida e independente de taxas de juros
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Seção 1: Formulário de Entrada */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Dados do Contrato
            </CardTitle>
            <CardDescription>
              Preencha os dados abaixo para analisar a taxa de juros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="valorFinanciamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor do Financiamento</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="R$ 10.000,00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valorPrestacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor da Prestação</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="R$ 500,00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numeroParcelas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Parcelas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataAssinatura"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Assinatura</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipoOperacaoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modalidade do Contrato (BACEN)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={loadingTipos}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a modalidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tiposOperacao?.map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.id}>
                              {tipo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <>
                      <Calculator className="mr-2 h-5 w-5 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-5 w-5" />
                      Analisar Agora
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Seção 2: Área de Resultados */}
        <div className="space-y-6">
          {!result ? (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">
                  Preencha o formulário e clique em "Analisar Agora"
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Os resultados da análise aparecerão aqui
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Card de Veredito */}
              <Card className={`border-2 ${result.acimaMercado ? 'border-destructive' : 'border-primary'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {result.acimaMercado ? (
                      <XCircle className="h-6 w-6 text-destructive" />
                    ) : (
                      <CheckCircle className="h-6 w-6 text-primary" />
                    )}
                    Veredito da Análise
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <Badge
                      variant={result.acimaMercado ? "destructive" : "default"}
                      className="text-lg px-6 py-2"
                    >
                      {result.acimaMercado ? (
                        <>
                          <TrendingUp className="mr-2 h-5 w-5" />
                          JUROS ABUSIVOS IDENTIFICADOS
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-5 w-5" />
                          DENTRO DA MÉDIA DE MERCADO
                        </>
                      )}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Diferença vs BACEN</span>
                      <span className={`text-lg font-bold ${result.diferenca > 0 ? 'text-destructive' : 'text-primary'}`}>
                        {result.diferenca > 0 ? '+' : ''}{result.diferenca.toFixed(2)}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Percentual Acima</span>
                      <span className={`text-lg font-bold ${result.percentualDiferenca > 0 ? 'text-destructive' : 'text-primary'}`}>
                        {result.percentualDiferenca > 0 ? '+' : ''}{result.percentualDiferenca.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Taxas Comparativas */}
              <Card>
                <CardHeader>
                  <CardTitle>Taxas Comparativas</CardTitle>
                  <CardDescription>
                    Comparação entre as três taxas de juros
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Taxa do Contrato (Mensal)</span>
                        <span className="text-xl font-bold text-destructive">
                          {result.taxaContratoMensal.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Taxa do Contrato (Anual)</span>
                        <span className="text-xl font-bold text-destructive">
                          {result.taxaContratoAnual.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Taxa BACEN ({result.taxaReferencia})</span>
                        <span className="text-xl font-bold text-primary">
                          {result.taxaBacen.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Custo Efetivo Total (CET)</span>
                        <span className="text-xl font-bold">
                          {result.custoEfetivoTotal.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Impacto Financeiro */}
              <Card>
                <CardHeader>
                  <CardTitle>Impacto Financeiro</CardTitle>
                  <CardDescription>
                    Custo total do contrato
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Valor Total a Pagar</span>
                    <span className="text-xl font-bold">
                      {formatCurrency(result.valorTotalPago)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Taxa Interna de Retorno (TIR)</span>
                    <span className="text-xl font-bold">
                      {result.taxaInternaRetorno.toFixed(2)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}