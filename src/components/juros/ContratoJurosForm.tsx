import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateContratoJuros, useUpdateContratoJuros } from "@/hooks/useContratosJuros";
import { useClientesJuros } from "@/hooks/useClientesJuros";
import { useInstituicoesFinanceiras } from "@/hooks/useInstituicoesFinanceiras";
import { useModalidadesBacenJuros } from "@/hooks/useModalidadesBacenJuros";

const formSchema = z.object({
  cliente_id: z.string().min(1, "Selecione um cliente"),
  instituicao_id: z.string().min(1, "Selecione uma instituição"),
  modalidade_bacen_id: z.string().optional(),
  numero_contrato: z.string().optional(),
  tipo_operacao: z.string().optional(),
  data_contratacao: z.string().min(1, "Data de contratação é obrigatória"),
  valor_financiado: z.string().min(1, "Valor financiado é obrigatório"),
  numero_parcelas: z.string().optional(),
  valor_parcela: z.string().optional(),
  taxa_juros_contratual: z.string().optional(),
  observacoes: z.string().optional(),
});

interface ContratoJurosFormProps {
  contrato?: any;
  onSuccess: () => void;
}

export function ContratoJurosForm({ contrato, onSuccess }: ContratoJurosFormProps) {
  const createMutation = useCreateContratoJuros();
  const updateMutation = useUpdateContratoJuros();
  const { data: clientes } = useClientesJuros();
  const { data: instituicoes } = useInstituicoesFinanceiras();
  const { data: modalidades } = useModalidadesBacenJuros();

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
        numero_parcelas: values.numero_parcelas ? parseInt(values.numero_parcelas) : null,
        valor_parcela: values.valor_parcela ? parseFloat(values.valor_parcela) : null,
        taxa_juros_contratual: values.taxa_juros_contratual ? parseFloat(values.taxa_juros_contratual) : null,
        taxa_juros_real: null,
        diferenca_taxa: null,
        percentual_diferenca: null,
        taxa_bacen_referencia: null,
        diferenca_vs_bacen: null,
        status_analise: "Pendente",
        tem_abusividade: false,
        grau_abusividade: null,
        observacoes: values.observacoes || null,
        ultima_analise_em: null,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cliente_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        </div>

        <FormField
          control={form.control}
          name="modalidade_bacen_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modalidade BACEN</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a modalidade (opcional)" />
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
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
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

          <FormField
            control={form.control}
            name="valor_financiado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Financiado (R$) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxa_juros_contratual"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Taxa Contratual (% a.m.)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="numero_parcelas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Parcelas</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
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
                <FormLabel>Valor da Parcela (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {contrato ? "Atualizar" : "Criar"} Contrato
          </Button>
        </div>
      </form>
    </Form>
  );
}
