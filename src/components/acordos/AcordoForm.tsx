import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUpdateContrato } from "@/hooks/useProvisao";
import { Contrato } from "@/hooks/useContratos";
import { Calculator, TrendingDown, TrendingUp } from "lucide-react";

const acordoSchema = z.object({
  proposta_acordo: z.string().min(1, "Valor da proposta é obrigatório"),
  acordo_final: z.string().optional(),
  quantidade_planos: z.string().optional(),
  observacoes: z.string().optional(),
});

type AcordoFormData = z.infer<typeof acordoSchema>;

interface AcordoFormProps {
  contrato: Contrato;
  onSuccess?: () => void;
}

export function AcordoForm({ contrato, onSuccess }: AcordoFormProps) {
  const updateContrato = useUpdateContrato();
  
  const form = useForm<AcordoFormData>({
    resolver: zodResolver(acordoSchema),
    defaultValues: {
      proposta_acordo: contrato.proposta_acordo?.toString() || "",
      acordo_final: contrato.acordo_final?.toString() || "",
      quantidade_planos: contrato.quantidade_planos?.toString() || "1",
      observacoes: contrato.observacoes || "",
    },
  });

  const onSubmit = async (data: AcordoFormData) => {
    try {
      const updates = {
        proposta_acordo: parseFloat(data.proposta_acordo),
        acordo_final: data.acordo_final ? parseFloat(data.acordo_final) : null,
        quantidade_planos: data.quantidade_planos ? parseInt(data.quantidade_planos) : null,
        observacoes: data.observacoes || null,
        situacao: data.acordo_final ? "Acordo finalizado" : "Em negociação",
      };

      await updateContrato.mutateAsync({ id: contrato.id, updates });
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const calcularDesconto = (valorOriginal: number, valorAcordo: number) => {
    const desconto = ((valorOriginal - valorAcordo) / valorOriginal) * 100;
    return desconto.toFixed(1);
  };

  const proposta = form.watch("proposta_acordo");
  const acordoFinal = form.watch("acordo_final");

  return (
    <div className="space-y-6">
      {/* Informações do Contrato */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalhes do Contrato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Cliente</p>
              <p className="font-medium">{contrato.clientes?.nome}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Banco</p>
              <p className="font-medium">{contrato.bancos?.nome}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Valor Original</p>
              <p className="font-bold text-lg">{formatCurrency(contrato.valor_divida)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dias em Atraso</p>
              <Badge variant={contrato.dias_atraso > 0 ? "destructive" : "secondary"}>
                {contrato.dias_atraso || 0}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Situação Atual</p>
              <Badge variant="outline">{contrato.situacao}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Acordo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Proposta de Acordo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="proposta_acordo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor da Proposta *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                      {proposta && (
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingDown className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">
                            Desconto: {calcularDesconto(contrato.valor_divida, parseFloat(proposta))}%
                          </span>
                        </div>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantidade_planos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade de Parcelas</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="acordo_final"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor do Acordo Final</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00 (deixe vazio se ainda em negociação)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                    {acordoFinal && (
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-600">
                          Desconto final: {calcularDesconto(contrato.valor_divida, parseFloat(acordoFinal))}%
                        </span>
                      </div>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações da Negociação</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detalhes da negociação, condições especiais, etc..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={updateContrato.isPending}>
                {updateContrato.isPending ? "Salvando..." : "Salvar Acordo"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Simulação de Economia */}
      {proposta && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-600">Simulação de Economia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Valor Original</p>
                <p className="text-xl font-bold">{formatCurrency(contrato.valor_divida)}</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Proposta</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(parseFloat(proposta))}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Economia</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(contrato.valor_divida - parseFloat(proposta))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}