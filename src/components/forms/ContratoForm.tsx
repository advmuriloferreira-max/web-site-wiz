import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useClientes } from "@/hooks/useClientes";
import { useBancos } from "@/hooks/useBancos";
import { useCreateContrato } from "@/hooks/useCreateContrato";
import { Calculator, Info } from "lucide-react";

const contratoSchema = z.object({
  cliente_id: z.string().min(1, "Cliente é obrigatório"),
  banco_id: z.string().min(1, "Banco é obrigatório"),
  numero_contrato: z.string().optional(),
  tipo_operacao: z.string().min(1, "Tipo de operação é obrigatório"),
  valor_divida: z.string().min(1, "Valor da dívida é obrigatório"),
  saldo_contabil: z.string().optional(),
  data_ultimo_pagamento: z.string().optional(),
  data_vencimento: z.string().optional(),
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
  
  const form = useForm<ContratoFormData>({
    resolver: zodResolver(contratoSchema),
    defaultValues: {
      numero_contrato: "",
      tipo_operacao: "",
      valor_divida: "",
      saldo_contabil: "",
      data_ultimo_pagamento: "",
      data_vencimento: "",
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
        data_vencimento: data.data_vencimento || null,
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

  return (
    <div className="space-y-4">
      {/* Alerta sobre automações */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Dados essenciais para automação:</strong> Informe a classificação C1-C5 (conforme contrato original) 
          e a data de vencimento. O sistema calculará automaticamente dias de atraso e provisão conforme BCB 352/2023 e 4966/2021.
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
          <FormField
            control={form.control}
            name="data_vencimento"
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