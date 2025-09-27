import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Garantia } from "@/hooks/useGarantias";

const garantiaSchema = z.object({
  tipo_garantia: z.enum(['Real', 'Fidejussória'], {
    required_error: "Selecione o tipo de garantia",
  }),
  descricao: z.string().optional(),
  valor_avaliacao: z.coerce.number().min(0, "Valor deve ser positivo").optional(),
  percentual_cobertura: z.coerce.number().min(0, "Percentual deve ser positivo").max(100, "Percentual deve ser no máximo 100%").optional(),
});

export type GarantiaFormData = z.infer<typeof garantiaSchema>;

interface GarantiaFormProps {
  onSubmit: (data: GarantiaFormData) => void;
  onCancel: () => void;
  initialData?: Partial<Garantia>;
  isLoading?: boolean;
}

export function GarantiaForm({ onSubmit, onCancel, initialData, isLoading }: GarantiaFormProps) {
  const form = useForm<GarantiaFormData>({
    resolver: zodResolver(garantiaSchema),
    defaultValues: {
      tipo_garantia: initialData?.tipo_garantia,
      descricao: initialData?.descricao || "",
      valor_avaliacao: initialData?.valor_avaliacao || 0,
      percentual_cobertura: initialData?.percentual_cobertura || 0,
    },
  });

  const handleSubmit = (data: GarantiaFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="tipo_garantia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Garantia *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de garantia" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Real">Real</SelectItem>
                  <SelectItem value="Fidejussória">Fidejussória</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva a garantia..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="valor_avaliacao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da Avaliação</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="percentual_cobertura"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Percentual de Cobertura (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    max="100"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}