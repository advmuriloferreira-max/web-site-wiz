import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useClientes } from "@/hooks/useClientes";
import { useBancos } from "@/hooks/useBancos";
import { useCreateContrato } from "@/hooks/useCreateContrato";
import { useProvisaoPerda, useProvisaoPerdaIncorrida } from "@/hooks/useProvisao";
import { 
  calcularProvisao, 
  calcularDiasAtraso,
  diasParaMeses,
  ClassificacaoRisco 
} from "@/lib/calculoProvisao";
import { Calculator, Info } from "lucide-react";
import { toast } from "sonner";

const contratoSchema = z.object({
  cliente_id: z.string().min(1, "Cliente é obrigatório"),
  banco_id: z.string().min(1, "Banco é obrigatório"),
  numero_contrato: z.string().optional(),
  tipo_operacao: z.string().min(1, "Tipo de operação é obrigatório"),
  valor_divida: z.string().min(1, "Valor da dívida é obrigatório"),
  saldo_contabil: z.string().optional(),
  data_ultimo_pagamento: z.string().optional(),
  dias_atraso: z.string().optional(),
  meses_atraso: z.string().optional(),
  classificacao: z.enum(["C1", "C2", "C3", "C4", "C5"]).optional(),
  percentual_provisao: z.string().optional(),
  valor_provisao: z.string().optional(),
  situacao: z.string().optional(),
  observacoes: z.string().optional(),
});

type ContratoFormData = z.infer<typeof contratoSchema>;

interface ContratoFormProps {
  onSuccess?: () => void;
}

export function ContratoForm({ onSuccess }: ContratoFormProps) {
  const { data: clientes } = useClientes();
  const { data: bancos } = useBancos();
  const createContrato = useCreateContrato();
  const { data: tabelaPerda } = useProvisaoPerda();
  const { data: tabelaIncorrida } = useProvisaoPerdaIncorrida();
  
  const form = useForm<ContratoFormData>({
    resolver: zodResolver(contratoSchema),
    defaultValues: {
      numero_contrato: "",
      tipo_operacao: "",
      valor_divida: "",
      saldo_contabil: "",
      data_ultimo_pagamento: "",
      dias_atraso: "0",
      meses_atraso: "0",
      percentual_provisao: "0",
      valor_provisao: "0",
      situacao: "Em análise",
      observacoes: "",
    },
  });

  const onSubmit = async (data: ContratoFormData) => {
    try {
      const contratoData = {
        cliente_id: data.cliente_id,
        banco_id: data.banco_id,
        numero_contrato: data.numero_contrato || null,
        tipo_operacao: data.tipo_operacao,
        valor_divida: parseFloat(data.valor_divida),
        saldo_contabil: data.saldo_contabil ? parseFloat(data.saldo_contabil) : null,
        data_ultimo_pagamento: data.data_ultimo_pagamento || null,
        dias_atraso: data.dias_atraso ? parseInt(data.dias_atraso) : undefined,
        meses_atraso: data.meses_atraso ? parseFloat(data.meses_atraso) : undefined,
        classificacao: data.classificacao || null,
        percentual_provisao: data.percentual_provisao ? parseFloat(data.percentual_provisao) : undefined,
        valor_provisao: data.valor_provisao ? parseFloat(data.valor_provisao) : undefined,
        situacao: data.situacao || "Em análise",
        observacoes: data.observacoes || null,
      };

      await createContrato.mutateAsync(contratoData);
      form.reset();
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const calcularProvisaoAutomatica = () => {
    const valores = form.getValues();
    
    // Verificar se temos os dados essenciais
    if (!valores.valor_divida || !valores.classificacao) {
      toast.error("Para calcular a provisão, informe pelo menos o valor da dívida e a classificação");
      return;
    }

    if (!tabelaPerda || !tabelaIncorrida) {
      toast.error("Tabelas de referência não carregadas");
      return;
    }

    try {
      // Calcular dias de atraso se houver data do último pagamento
      let diasAtraso = valores.dias_atraso ? parseInt(valores.dias_atraso) : 0;
      if (valores.data_ultimo_pagamento && diasAtraso === 0) {
        diasAtraso = calcularDiasAtraso(valores.data_ultimo_pagamento);
      }

      // Determinar valor para cálculo (priorizar saldo contábil)
      const valorDivida = parseFloat(valores.valor_divida);
      const saldoContabil = valores.saldo_contabil ? parseFloat(valores.saldo_contabil) : null;
      const valorParaCalculo = saldoContabil || valorDivida;

      // Calcular provisão
      const resultado = calcularProvisao({
        valorDivida: valorParaCalculo,
        diasAtraso,
        classificacao: valores.classificacao as ClassificacaoRisco,
        tabelaPerda,
        tabelaIncorrida,
        criterioIncorrida: "Dias de Atraso",
      });

      const mesesAtraso = diasParaMeses(diasAtraso);
      const percentualProvisao = Math.max(resultado.percentualPerda, resultado.percentualIncorrida);

      // Preencher os campos calculados
      form.setValue("dias_atraso", diasAtraso.toString());
      form.setValue("meses_atraso", mesesAtraso.toString());
      form.setValue("percentual_provisao", percentualProvisao.toFixed(2));
      form.setValue("valor_provisao", resultado.valorProvisaoTotal.toFixed(2));

      toast.success(`Provisão calculada: ${percentualProvisao.toFixed(2)}% (R$ ${resultado.valorProvisaoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`);
    } catch (error) {
      toast.error("Erro ao calcular provisão");
      console.error(error);
    }
  };

  // Calcular automaticamente dias e meses de atraso quando data do último pagamento mudar
  const dataUltimoPagamento = form.watch("data_ultimo_pagamento");
  
  useEffect(() => {
    if (dataUltimoPagamento) {
      try {
        const diasAtraso = calcularDiasAtraso(dataUltimoPagamento);
        const mesesAtraso = diasParaMeses(diasAtraso);
        
        form.setValue("dias_atraso", diasAtraso.toString());
        form.setValue("meses_atraso", mesesAtraso.toString());
      } catch (error) {
        console.error("Erro ao calcular atraso:", error);
      }
    } else {
      // Limpar campos quando data for removida
      form.setValue("dias_atraso", "0");
      form.setValue("meses_atraso", "0");
    }
  }, [dataUltimoPagamento, form]);

  return (
    <div className="space-y-4">
      {/* Alerta sobre automações */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Dados essenciais para automação:</strong> Informe a classificação C1-C5 (conforme contrato original) 
          e os dias de atraso. O sistema calculará automaticamente a provisão conforme BCB 352/2023 e 4966/2021.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cliente_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um banco" />
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="numero_contrato"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do Contrato</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipo_operacao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Operação *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Empréstimo, Financiamento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="valor_divida"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da Dívida *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="saldo_contabil"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Saldo Contábil</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="data_ultimo_pagamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Último Pagamento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="dias_atraso"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dias em Atraso</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="meses_atraso"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meses em Atraso</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="classificacao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Classificação (conforme contrato) *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a classificação" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="C1">C1 - Risco Mínimo</SelectItem>
                    <SelectItem value="C2">C2 - Risco Pequeno</SelectItem>
                    <SelectItem value="C3">C3 - Risco Médio</SelectItem>
                    <SelectItem value="C4">C4 - Risco Alto</SelectItem>
                    <SelectItem value="C5">C5 - Risco Máximo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Botão para Cálculo Automático */}
        <div className="flex justify-center py-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={calcularProvisaoAutomatica}
            disabled={!tabelaPerda || !tabelaIncorrida}
            className="flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Calcular Provisão Automaticamente
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="percentual_provisao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Percentual Provisão (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="valor_provisao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Provisão</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="situacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Situação</FormLabel>
              <FormControl>
                <Input placeholder="Em análise" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea placeholder="Observações adicionais..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={createContrato.isPending}>
          <Calculator className="mr-2 h-4 w-4" />
          {createContrato.isPending ? "Calculando e Cadastrando..." : "Cadastrar com Automação"}
        </Button>
      </form>
    </Form>
    </div>
  );
}