import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTiposOperacao } from "@/hooks/useTiposOperacao";
import { useBancos } from "@/hooks/useBancos";
import { useClientes } from "@/hooks/useClientes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calculator, TrendingUp, AlertCircle, CheckCircle, XCircle, Save, Eye, Info } from "lucide-react";
import { calcularMetricasFinanceiras, compararTaxaBacen } from "@/modules/FinancialAnalysis/lib/financialCalculations";

const formSchema = z.object({
  // Dados básicos
  cliente_id: z.string().optional(),
  banco_id: z.string().optional(),
  numero_contrato: z.string().optional(),
  
  // Dados financeiros
  valorFinanciamento: z.string().min(1, "Valor é obrigatório"),
  valorPrestacao: z.string().min(1, "Valor da prestação é obrigatório"),
  numeroParcelas: z.string().min(1, "Número de parcelas é obrigatório"),
  dataAssinatura: z.string().min(1, "Data de assinatura é obrigatória"),
  dataVencimento: z.string().optional(),
  tipoOperacaoId: z.string().min(1, "Modalidade é obrigatória"),
  
  // Ação a tomar
  acao: z.enum(["analisar", "salvar"], {
    required_error: "Escolha uma ação",
  }),
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
  contratoSalvo?: {
    id: string;
    numero: string;
  };
}

export default function CalculadoraJuros() {
  const navigate = useNavigate();
  const { data: tiposOperacao, isLoading: loadingTipos } = useTiposOperacao();
  const { data: bancos } = useBancos();
  const { data: clientes } = useClientes();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Separar tipos de operação por carteira (PF e PJ)
  const tiposPF = tiposOperacao?.filter(t => ['C1', 'C2'].includes(t.carteira)) || [];
  const tiposPJ = tiposOperacao?.filter(t => ['C3', 'C4', 'C5'].includes(t.carteira)) || [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cliente_id: "",
      banco_id: "",
      numero_contrato: "",
      valorFinanciamento: "",
      valorPrestacao: "",
      numeroParcelas: "",
      dataAssinatura: "",
      dataVencimento: "",
      tipoOperacaoId: "",
      acao: "analisar",
    },
  });

  const acao = form.watch("acao");

  const calculateMonthlyRate = (principal: number, payment: number, periods: number): number => {
    let rate = 0.01;
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
      }

      const taxaBacen = bacenData?.taxa || 4.85; // Taxa Selic padrão
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

      let contratoSalvo;

      // Se a ação for salvar, criar o contrato
      if (values.acao === "salvar") {
        if (!values.cliente_id || !values.banco_id) {
          toast.error("Cliente e Banco são obrigatórios para salvar o contrato");
          return;
        }

        const { data: novoContrato, error: contratoError } = await supabase
          .from('contratos')
          .insert({
            cliente_id: values.cliente_id,
            banco_id: values.banco_id,
            numero_contrato: values.numero_contrato || `CALC-${Date.now()}`,
            valor_divida: valorFinanciamento,
            saldo_contabil: valorFinanciamento,
            valor_parcela: valorPrestacao,
            numero_parcelas: numeroParcelas,
            data_entrada: values.dataAssinatura,
            data_vencimento: values.dataVencimento || values.dataAssinatura,
            tipo_operacao_bcb: values.tipoOperacaoId,
            taxa_bacen: taxaBacen,
            taxa_referencia: taxaReferencia,
            situacao: "Em análise",
            dias_atraso: 0,
            meses_atraso: 0,
            percentual_provisao: 0,
            valor_provisao: 0,
          })
          .select()
          .single();

        if (contratoError) {
          console.error('Erro ao salvar contrato:', contratoError);
          toast.error('Erro ao salvar contrato');
          return;
        }

        contratoSalvo = {
          id: novoContrato.id,
          numero: novoContrato.numero_contrato,
        };

        // Criar análise para o contrato
        await supabase
          .from('analyses')
          .insert({
            contrato_id: novoContrato.id,
            taxa_bacen: taxaBacen,
            taxa_referencia: taxaReferencia,
            metadata: {
              taxa_contrato_mensal: taxaMensal,
              taxa_contrato_anual: taxaAnual,
              diferenca: comparacao.diferenca,
              percentual_diferenca: comparacao.percentualDiferenca,
              acima_mercado: comparacao.acimaMercado,
            },
          });

        toast.success('Contrato salvo com sucesso!');
      }

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
        contratoSalvo,
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calculator className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Calculadora de Juros Abusivos</h1>
            <p className="text-muted-foreground">
              Sistema integrado com as 48 modalidades BACEN (PF e PJ)
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          BACEN Séries Temporais
        </Badge>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Escolha sua ação:</strong> Você pode apenas analisar os juros ou salvar o contrato completo para provisionamento e gestão.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Seção 1: Formulário de Entrada */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Dados do Contrato
            </CardTitle>
            <CardDescription>
              Preencha os dados para análise de juros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Escolha de Ação */}
                <FormField
                  control={form.control}
                  name="acao"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>O que deseja fazer? *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent">
                            <RadioGroupItem value="analisar" id="analisar" />
                            <label htmlFor="analisar" className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-primary" />
                                <span className="font-medium">Apenas Analisar Juros</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Análise rápida sem salvar o contrato
                              </p>
                            </label>
                          </div>
                          <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent">
                            <RadioGroupItem value="salvar" id="salvar" />
                            <label htmlFor="salvar" className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-2">
                                <Save className="h-4 w-4 text-green-600" />
                                <span className="font-medium">Salvar para Provisionamento</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Salvar contrato completo para gestão e provisão
                              </p>
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* Campos condicionais para salvar */}
                {acao === "salvar" && (
                  <>
                    <FormField
                      control={form.control}
                      name="cliente_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cliente *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o cliente" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {clientes?.map((cliente) => (
                                <SelectItem key={cliente.id} value={cliente.id}>
                                  {cliente.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="banco_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Banco *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o banco" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {bancos?.map((banco) => (
                                <SelectItem key={banco.id} value={banco.id}>
                                  {banco.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="numero_contrato"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número do Contrato</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 123456" {...field} />
                          </FormControl>
                          <FormDescription>
                            Opcional - será gerado automaticamente se não informado
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Dados Financeiros */}
                <FormField
                  control={form.control}
                  name="valorFinanciamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor do Financiamento *</FormLabel>
                      <FormControl>
                        <Input placeholder="R$ 10.000,00" {...field} />
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
                      <FormLabel>Valor da Prestação *</FormLabel>
                      <FormControl>
                        <Input placeholder="R$ 500,00" {...field} />
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
                      <FormLabel>Número de Parcelas *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="24" {...field} />
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
                      <FormLabel>Data de Assinatura *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {acao === "salvar" && (
                  <FormField
                    control={form.control}
                    name="dataVencimento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Vencimento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="tipoOperacaoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modalidade do Contrato (BACEN) *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loadingTipos}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a modalidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <div className="px-2 py-1.5 text-sm font-semibold">
                            Pessoa Física (PF)
                          </div>
                          {tiposPF.map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.id}>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {tipo.carteira}
                                </Badge>
                                {tipo.nome}
                              </div>
                            </SelectItem>
                          ))}
                          <Separator className="my-2" />
                          <div className="px-2 py-1.5 text-sm font-semibold">
                            Pessoa Jurídica (PJ)
                          </div>
                          {tiposPJ.map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.id}>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {tipo.carteira}
                                </Badge>
                                {tipo.nome}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {tiposPF.length + tiposPJ.length} modalidades disponíveis ({tiposPF.length} PF / {tiposPJ.length} PJ)
                      </FormDescription>
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
                  ) : acao === "salvar" ? (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Salvar e Analisar
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

                  {result.contratoSalvo && (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>Contrato salvo com sucesso!</strong> Número: {result.contratoSalvo.numero}
                        <div className="mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/contratos/${result.contratoSalvo?.id}`)}
                            className="border-green-600 text-green-600 hover:bg-green-50"
                          >
                            Ver Detalhes do Contrato
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

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