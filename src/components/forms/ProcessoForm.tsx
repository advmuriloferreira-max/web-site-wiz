import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useContratos } from "@/hooks/useContratos";
import { useCreateProcesso, useUpdateProcesso, Processo } from "@/hooks/useProcessos";

const processoSchema = z.object({
  contrato_id: z.string().min(1, "Contrato é obrigatório"),
  numero_processo: z.string().optional(),
  acao: z.string().optional(),
  status: z.string().optional(),
  protocolo: z.string().optional(),
  prazo: z.string().optional(),
  liminar: z.boolean().optional(),
  justica_gratuita: z.boolean().optional(),
  diligencias: z.string().optional(),
});

type ProcessoFormData = z.infer<typeof processoSchema>;

interface ProcessoFormProps {
  processo?: Processo;
  onSuccess?: () => void;
}

export function ProcessoForm({ processo, onSuccess }: ProcessoFormProps) {
  const { data: contratos } = useContratos();
  const createProcesso = useCreateProcesso();
  const updateProcesso = useUpdateProcesso();
  
  const form = useForm<ProcessoFormData>({
    resolver: zodResolver(processoSchema),
    defaultValues: {
      contrato_id: processo?.contrato_id || "",
      numero_processo: processo?.numero_processo || "",
      acao: processo?.acao || "",
      status: processo?.status || "Em andamento",
      protocolo: processo?.protocolo || "",
      prazo: processo?.prazo || "",
      liminar: processo?.liminar || false,
      justica_gratuita: processo?.justica_gratuita || false,
      diligencias: processo?.diligencias || "",
    },
  });

  const onSubmit = async (data: ProcessoFormData) => {
    try {
      if (!data.contrato_id) {
        throw new Error("Contrato é obrigatório");
      }

      const processData = {
        contrato_id: data.contrato_id,
        numero_processo: data.numero_processo || null,
        acao: data.acao || null,
        status: data.status || null,
        protocolo: data.protocolo || null,
        prazo: data.prazo || null,
        liminar: data.liminar || null,
        justica_gratuita: data.justica_gratuita || null,
        diligencias: data.diligencias || null,
      };

      if (processo) {
        await updateProcesso.mutateAsync({ id: processo.id, ...processData });
      } else {
        await createProcesso.mutateAsync(processData);
      }
      form.reset();
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const isLoading = createProcesso.isPending || updateProcesso.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="contrato_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contrato *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um contrato" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {contratos?.map((contrato) => (
                    <SelectItem key={contrato.id} value={contrato.id}>
                      {contrato.clientes?.nome} - {contrato.bancos?.nome}
                      {contrato.numero_contrato && ` (${contrato.numero_contrato})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="numero_processo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do Processo</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 1234567-89.2023.4.01.1234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="protocolo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Protocolo</FormLabel>
                <FormControl>
                  <Input placeholder="Número do protocolo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="acao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Ação</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Cobrança, Execução" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Em andamento">Em andamento</SelectItem>
                    <SelectItem value="Suspenso">Suspenso</SelectItem>
                    <SelectItem value="Concluído">Concluído</SelectItem>
                    <SelectItem value="Arquivado">Arquivado</SelectItem>
                    <SelectItem value="Acordo">Acordo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="prazo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prazo</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="liminar"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Liminar
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="justica_gratuita"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Justiça Gratuita
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="diligencias"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diligências</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva as diligências necessárias..."
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : processo ? "Atualizar" : "Cadastrar"}
        </Button>
      </form>
    </Form>
  );
}