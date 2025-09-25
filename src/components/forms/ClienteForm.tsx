import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCliente, useUpdateCliente, Cliente } from "@/hooks/useClientes";

const clienteSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cpf_cnpj: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  endereco: z.string().optional(), 
  responsavel: z.string().optional(),
  observacoes: z.string().optional(),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

interface ClienteFormProps {
  cliente?: Cliente;
  onSuccess?: () => void;
}

export function ClienteForm({ cliente, onSuccess }: ClienteFormProps) {
  const createCliente = useCreateCliente();
  const updateCliente = useUpdateCliente();
  
  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: cliente?.nome || "",
      cpf_cnpj: cliente?.cpf_cnpj || "",
      email: cliente?.email || "",
      telefone: cliente?.telefone || "",
      endereco: cliente?.endereco || "",
      responsavel: cliente?.responsavel || "",
      observacoes: cliente?.observacoes || "",
    },
  });

  const onSubmit = async (data: ClienteFormData) => {
    try {
      const cleanData = {
        nome: data.nome,
        cpf_cnpj: data.cpf_cnpj || null,
        email: data.email || null,
        telefone: data.telefone || null,
        endereco: data.endereco || null,
        responsavel: data.responsavel || null,
        observacoes: data.observacoes || null,
      };

      if (cliente) {
        await updateCliente.mutateAsync({ id: cliente.id, ...cleanData });
      } else {
        await createCliente.mutateAsync(cleanData);
      }
      form.reset();
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const isLoading = createCliente.isPending || updateCliente.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cpf_cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF/CNPJ</FormLabel>
                <FormControl>
                  <Input placeholder="000.000.000-00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(11) 99999-9999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="endereco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input placeholder="Endereço completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="responsavel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável</FormLabel>
              <FormControl>
                <Input placeholder="Nome do responsável" {...field} />
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

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : cliente ? "Atualizar" : "Cadastrar"}
        </Button>
      </form>
    </Form>
  );
}