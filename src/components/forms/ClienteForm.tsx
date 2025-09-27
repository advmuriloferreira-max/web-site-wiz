import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SmartInput } from "@/components/ui/smart-input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCliente, useUpdateCliente, Cliente } from "@/hooks/useClientes";
import { useSmartValidation } from "@/hooks/useSmartValidation";

const clienteSchema = z.object({
  nome: z.string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
  cpf_cnpj: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const cleanVal = val.replace(/[^\d]/g, '');
      return cleanVal.length === 11 || cleanVal.length === 14;
    }, "CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos"),
  email: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      return z.string().email().safeParse(val).success;
    }, "Email deve ter um formato válido"),
  telefone: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const cleanVal = val.replace(/[^\d]/g, '');
      return cleanVal.length >= 10 && cleanVal.length <= 11;
    }, "Telefone deve ter 10 ou 11 dígitos"),
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

  // Validações inteligentes
  const nomeValidation = useSmartValidation(
    form.watch("nome"),
    [
      (value) => {
        if (!value) return { isValid: false, message: "Nome é obrigatório" };
        if (value.length < 2) return { isValid: false, message: "Nome deve ter pelo menos 2 caracteres" };
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return { isValid: false, message: "Nome deve conter apenas letras" };
        return { isValid: true };
      }
    ],
    {
      enableSuggestions: true,
      suggestionTable: "clientes",
      suggestionField: "nome",
      minSuggestionLength: 2
    }
  );

  const emailValidation = useSmartValidation(
    form.watch("email"),
    [
      (value) => {
        if (!value) return { isValid: true };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return { isValid: false, message: "Email deve ter um formato válido" };
        return { isValid: true };
      }
    ],
    {
      enableSuggestions: true,
      suggestionTable: "clientes", 
      suggestionField: "email",
      minSuggestionLength: 3
    }
  );

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
                  <SmartInput
                    placeholder="Nome completo do cliente"
                    {...field}
                    suggestions={nomeValidation.suggestions}
                    validationResult={nomeValidation.validationResult}
                    isValidating={nomeValidation.isValidating}
                    onSuggestionSelect={(suggestion) => {
                      form.setValue('nome', suggestion);
                      nomeValidation.clearSuggestions();
                    }}
                  />
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
                  <SmartInput
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    {...field}
                    showValidationIcon={!!field.value}
                    validationResult={{
                      isValid: !field.value || clienteSchema.shape.cpf_cnpj.safeParse(field.value).success,
                      message: field.value && !clienteSchema.shape.cpf_cnpj.safeParse(field.value).success 
                        ? "CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos" 
                        : undefined
                    }}
                  />
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
                  <SmartInput
                    type="email"
                    placeholder="exemplo@email.com"
                    {...field}
                    suggestions={emailValidation.suggestions}
                    validationResult={emailValidation.validationResult}
                    isValidating={emailValidation.isValidating}
                    onSuggestionSelect={(suggestion) => {
                      form.setValue('email', suggestion);
                      emailValidation.clearSuggestions();
                    }}
                  />
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
                  <SmartInput
                    placeholder="(00) 00000-0000"
                    {...field}
                    showValidationIcon={!!field.value}
                    validationResult={{
                      isValid: !field.value || clienteSchema.shape.telefone.safeParse(field.value).success,
                      message: field.value && !clienteSchema.shape.telefone.safeParse(field.value).success 
                        ? "Telefone deve ter 10 ou 11 dígitos" 
                        : undefined
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
          name="endereco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <SmartInput
                  placeholder="Endereço completo"
                  {...field}
                  showValidationIcon={false}
                />
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
                <SmartInput
                  placeholder="Nome do responsável"
                  {...field}
                  showValidationIcon={false}
                />
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