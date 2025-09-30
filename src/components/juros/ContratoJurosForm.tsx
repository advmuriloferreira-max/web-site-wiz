import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCreateContratoJuros, useUpdateContratoJuros } from "@/hooks/useContratosJuros";
import { useClientesJuros } from "@/hooks/useClientesJuros";
import { useInstituicoesFinanceiras } from "@/hooks/useInstituicoesFinanceiras";
import { useModalidadesBacenJuros } from "@/hooks/useModalidadesBacenJuros";
import { calcularTaxaEfetiva } from "@/lib/calculoTaxaEfetiva";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle, Calculator, TrendingUp } from "lucide-react";
import { format } from "date-fns";

const formSchema = z.object({
  cliente_id: z.string().min(1, "Selecione um cliente"),
  instituicao_id: z.string().min(1, "Selecione uma instituição"),
  modalidade_bacen_id: z.string().optional(),
  numero_contrato: z.string().optional(),
  tipo_operacao: z.string().optional(),
  data_contratacao: z.string().min(1, "Data de contratação é obrigatória"),
  valor_financiado: z.string().min(1, "Valor financiado é obrigatório"),
  numero_parcelas: z.string().min(1, "Número de parcelas é obrigatório"),
  valor_parcela: z.string().min(1, "Valor da parcela é obrigatório"),
  taxa_juros_contratual: z.string().optional(),
  observacoes: z.string().optional(),
});

interface ContratoJurosFormProps {
  contrato?: any;
  onSuccess: () => void;
}

interface CalculoResultado {
  taxaEfetivaMensal: number;
  taxaEfetivaAnual: number;
  custoEfetivoTotal: number;
  totalJuros: number;
  totalPago: number;
  taxaBacenReferencia: number | null;
  diferencaVsBacen: number | null;
  percentualDiferenca: number | null;
  temAbusividade: boolean;
  grauAbusividade: string | null;
}

export function ContratoJurosForm({ contrato, onSuccess }: ContratoJurosFormProps) {
  const createMutation = useCreateContratoJuros();
  const updateMutation = useUpdateContratoJuros();
  const { data: clientes } = useClientesJuros();
  const { data: instituicoes } = useInstituicoesFinanceiras();
  const { data: modalidades } = useModalidadesBacenJuros();

  const [calculo, setCalculo] = useState<CalculoResultado | null>(null);
  const [buscandoTaxaBacen, setBuscandoTaxaBacen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cliente_id: contrato?.cliente_id || "",
      instituicao_id: contrato?.instituicao_id || "",
      modalidade_bacen_id: contrato?.modalidade_bacen_id || "",
      numero_contrato: contrato?.numero_contrato || "",
      tipo_operacao: contrato?.tipo_operacao || "",
      data_contratacao: contrato?.data_contratacao || new Date().toISOString().split('T')[0],
      valor_financiado: contrato?.valor_financiado?.toString() || "",
      numero_parcelas: contrato?.numero_parcelas?.toString() || "",
      valor_parcela: contrato?.valor_parcela?.toString() || "",
      taxa_juros_contratual: contrato?.taxa_juros_contratual?.toString() || "",
      observacoes: contrato?.observacoes || "",
    },
  });

  const buscarTaxaBacen = async (modalidadeId: string, dataContratacao: string) => {
    try {
      setBuscandoTaxaBacen(true);
      
      // Buscar a modalidade para pegar o código SGS
      const { data: modalidade } = await supabase
        .from("modalidades_bacen_juros")
        .select("codigo_sgs")
        .eq("id", modalidadeId)
        .single();

      if (!modalidade) return null;

      // Buscar a taxa mais próxima da data de contratação
      const dataRef = new Date(dataContratacao);
      const { data: serie } = await supabase
        .from("series_temporais_bacen")
        .select("taxa_mensal")
        .eq("modalidade_id", modalidadeId)
        .lte("data_referencia", format(dataRef, "yyyy-MM-dd"))
        .order("data_referencia", { ascending: false })
        .limit(1)
        .single();

      return serie?.taxa_mensal || null;
    } catch (error) {
      console.error("Erro ao buscar taxa BACEN:", error);
      return null;
    } finally {
      setBuscandoTaxaBacen(false);
    }
  };

  const calcularTaxas = async () => {
    const valores = form.getValues();
    
    if (!valores.valor_financiado || !valores.valor_parcela || !valores.numero_parcelas) {
      setCalculo(null);
      return;
    }

    const valorFinanciado = parseFloat(valores.valor_financiado);
    const valorParcela = parseFloat(valores.valor_parcela);
    const numeroParcelas = parseInt(valores.numero_parcelas);

    if (isNaN(valorFinanciado) || isNaN(valorParcela) || isNaN(numeroParcelas)) {
      setCalculo(null);
      return;
    }

    // Calcular taxa efetiva
    const resultado = calcularTaxaEfetiva({
      valorFinanciado,
      valorParcela,
      numeroParcelas,
      taxaJurosContratual: valores.taxa_juros_contratual ? parseFloat(valores.taxa_juros_contratual) : undefined,
    });

    // Buscar taxa BACEN se houver modalidade selecionada
    let taxaBacen: number | null = null;
    if (valores.modalidade_bacen_id && valores.data_contratacao) {
      taxaBacen = await buscarTaxaBacen(valores.modalidade_bacen_id, valores.data_contratacao);
    }

    // Calcular diferença vs BACEN
    let diferencaVsBacen: number | null = null;
    let percentualDiferenca: number | null = null;
    let temAbusividade = false;
    let grauAbusividade: string | null = null;

    if (taxaBacen !== null) {
      diferencaVsBacen = resultado.taxaEfetivaMensal - taxaBacen;
      percentualDiferenca = ((resultado.taxaEfetivaMensal - taxaBacen) / taxaBacen) * 100;
      
      // Determinar abusividade
      if (percentualDiferenca > 0) {
        temAbusividade = true;
        if (percentualDiferenca <= 50) {
          grauAbusividade = "Baixa";
        } else if (percentualDiferenca <= 100) {
          grauAbusividade = "Média";
        } else if (percentualDiferenca <= 200) {
          grauAbusividade = "Alta";
        } else {
          grauAbusividade = "Crítica";
        }
      }
    }

    setCalculo({
      ...resultado,
      taxaBacenReferencia: taxaBacen,
      diferencaVsBacen,
      percentualDiferenca,
      temAbusividade,
      grauAbusividade,
    });
  };

  // Recalcular quando os valores mudarem
  useEffect(() => {
    const subscription = form.watch(() => {
      calcularTaxas();
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const data = {
        cliente_id: values.cliente_id,
        instituicao_id: values.instituicao_id,
        modalidade_bacen_id: values.modalidade_bacen_id || null,
        numero_contrato: values.numero_contrato || null,
        tipo_operacao: values.tipo_operacao || null,
        data_contratacao: values.data_contratacao,
        valor_financiado: parseFloat(values.valor_financiado),
        numero_parcelas: parseInt(values.numero_parcelas),
        valor_parcela: parseFloat(values.valor_parcela),
        taxa_juros_contratual: values.taxa_juros_contratual ? parseFloat(values.taxa_juros_contratual) : null,
        taxa_juros_real: calculo?.taxaEfetivaMensal || null,
        diferenca_taxa: calculo?.diferencaVsBacen || null,
        percentual_diferenca: calculo?.percentualDiferenca || null,
        taxa_bacen_referencia: calculo?.taxaBacenReferencia || null,
        diferenca_vs_bacen: calculo?.diferencaVsBacen || null,
        status_analise: calculo ? "Analisado" : "Pendente",
        tem_abusividade: calculo?.temAbusividade || false,
        grau_abusividade: calculo?.grauAbusividade || null,
        observacoes: values.observacoes || null,
        ultima_analise_em: calculo ? new Date().toISOString() : null,
      };

      if (contrato) {
        await updateMutation.mutateAsync({ id: contrato.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar contrato:", error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getAbusividadeBadge = () => {
    if (!calculo) return null;
    
    if (!calculo.temAbusividade) {
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Conforme
        </Badge>
      );
    }

    const colors: Record<string, string> = {
      "Baixa": "bg-yellow-500",
      "Média": "bg-orange-500",
      "Alta": "bg-red-500",
      "Crítica": "bg-purple-500",
    };

    return (
      <Badge className={colors[calculo.grauAbusividade || ""] || "bg-red-500"}>
        <AlertCircle className="h-3 w-3 mr-1" />
        {calculo.grauAbusividade}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados Básicos */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Contrato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  name="instituicao_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instituição Financeira *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a instituição" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {instituicoes?.map((inst) => (
                            <SelectItem key={inst.id} value={inst.id}>
                              {inst.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="numero_contrato"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Contrato</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data_contratacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Contratação *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipo_operacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Operação</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Empréstimo Pessoal" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="modalidade_bacen_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modalidade BACEN</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a modalidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {modalidades?.map((mod) => (
                            <SelectItem key={mod.id} value={mod.id}>
                              {mod.nome} ({mod.tipo_pessoa})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">
                        Necessário para comparar com taxa de mercado
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Valores Financeiros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Valores Financeiros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="valor_financiado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Financiado (R$) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setTimeout(() => calcularTaxas(), 100);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numero_parcelas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Parcelas *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setTimeout(() => calcularTaxas(), 100);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valor_parcela"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor da Parcela (R$) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setTimeout(() => calcularTaxas(), 100);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="taxa_juros_contratual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa Contratual (% a.m.)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Taxa informada no contrato (opcional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Resultado dos Cálculos */}
          {calculo && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Análise Automática
                  </CardTitle>
                  {getAbusividadeBadge()}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-background rounded-lg border">
                    <span className="text-sm text-muted-foreground block mb-1">Taxa Efetiva Mensal</span>
                    <p className="text-2xl font-bold text-primary">
                      {calculo.taxaEfetivaMensal.toFixed(4)}%
                    </p>
                  </div>

                  <div className="p-4 bg-background rounded-lg border">
                    <span className="text-sm text-muted-foreground block mb-1">Taxa Efetiva Anual</span>
                    <p className="text-2xl font-bold text-primary">
                      {calculo.taxaEfetivaAnual.toFixed(2)}%
                    </p>
                  </div>

                  <div className="p-4 bg-background rounded-lg border">
                    <span className="text-sm text-muted-foreground block mb-1">CET</span>
                    <p className="text-2xl font-bold text-orange-600">
                      {calculo.custoEfetivoTotal.toFixed(2)}%
                    </p>
                  </div>

                  {calculo.taxaBacenReferencia !== null && (
                    <>
                      <div className="p-4 bg-background rounded-lg border">
                        <span className="text-sm text-muted-foreground block mb-1">Taxa BACEN</span>
                        <p className="text-2xl font-bold">
                          {calculo.taxaBacenReferencia.toFixed(4)}%
                        </p>
                      </div>

                      <div className="p-4 bg-background rounded-lg border">
                        <span className="text-sm text-muted-foreground block mb-1">Diferença vs BACEN</span>
                        <p className="text-2xl font-bold text-destructive">
                          +{calculo.diferencaVsBacen?.toFixed(4)}%
                        </p>
                      </div>

                      <div className="p-4 bg-background rounded-lg border">
                        <span className="text-sm text-muted-foreground block mb-1">% acima BACEN</span>
                        <p className="text-2xl font-bold text-destructive">
                          {calculo.percentualDiferenca?.toFixed(2)}%
                        </p>
                      </div>
                    </>
                  )}

                  <div className="p-4 bg-background rounded-lg border">
                    <span className="text-sm text-muted-foreground block mb-1">Total de Juros</span>
                    <p className="text-xl font-bold text-destructive">
                      {formatCurrency(calculo.totalJuros)}
                    </p>
                  </div>

                  <div className="p-4 bg-background rounded-lg border">
                    <span className="text-sm text-muted-foreground block mb-1">Total a Pagar</span>
                    <p className="text-xl font-bold">
                      {formatCurrency(calculo.totalPago)}
                    </p>
                  </div>
                </div>

                {buscandoTaxaBacen && (
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    Buscando taxa BACEN de referência...
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          <FormField
            control={form.control}
            name="observacoes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
              size="lg"
            >
              {contrato ? "Atualizar" : "Salvar"} Contrato
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
