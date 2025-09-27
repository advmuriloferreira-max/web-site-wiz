import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUpdateContrato } from "@/hooks/useProvisao";
import { Contrato } from "@/hooks/useContratos";
import { Handshake, TrendingDown } from "lucide-react";
import { PropostasTimeline } from "./PropostasTimeline";

const acordoSchema = z.object({
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
      acordo_final: contrato.acordo_final?.toString() || "",
      quantidade_planos: contrato.quantidade_planos?.toString() || "1",
      observacoes: contrato.observacoes || "",
    },
  });

  const onSubmit = async (data: AcordoFormData) => {
    try {
      const updates = {
        acordo_final: data.acordo_final ? parseFloat(data.acordo_final) : null,
        quantidade_planos: data.quantidade_planos ? parseInt(data.quantidade_planos) : null,
        observacoes: data.observacoes || null,
        situacao: data.acordo_final ? "Acordo finalizado" : contrato.situacao,
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

  const acordoFinal = form.watch("acordo_final");

  return (
    <div className="space-y-6">
      {/* Resumo do Contrato */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">{contrato.clientes?.nome}</h3>
          <Badge variant="outline">{contrato.situacao}</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Banco:</span>
            <span className="ml-2 font-medium">{contrato.bancos?.nome}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Valor:</span>
            <span className="ml-2 font-bold">{formatCurrency(contrato.valor_divida)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Atraso:</span>
            <Badge variant={contrato.dias_atraso > 0 ? "destructive" : "secondary"} className="ml-2">
              {contrato.dias_atraso || 0} dias
            </Badge>
          </div>
        </div>
      </div>

      {/* Histórico de Propostas */}
      <PropostasTimeline contratoId={contrato.id} />

      {/* Finalização do Acordo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5" />
            Finalizar Acordo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          placeholder="0.00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                      {acordoFinal && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <TrendingDown className="h-4 w-4" />
                          <span>
                            Desconto: {calcularDesconto(contrato.valor_divida, parseFloat(acordoFinal))}%
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
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Finais</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observações sobre o acordo finalizado..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={updateContrato.isPending}>
                {updateContrato.isPending ? "Salvando..." : "Finalizar Acordo"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Simulação de Acordo Final */}
      {acordoFinal && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-600">Simulação do Acordo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Valor Original</p>
                <p className="text-xl font-bold">{formatCurrency(contrato.valor_divida)}</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Acordo Final</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(parseFloat(acordoFinal))}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Economia Total</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(contrato.valor_divida - parseFloat(acordoFinal))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}