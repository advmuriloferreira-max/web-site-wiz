import { UseFormReturn } from "react-hook-form";
import { useEffect } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ContratoWizardData } from "./types";
import { Shield, Calendar as CalendarIcon, CreditCard, RefreshCw, Phone, User, Calculator } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { GarantiasSection } from "@/components/garantias/GarantiasSection";

interface Etapa4Props {
  form: UseFormReturn<ContratoWizardData>;
}

export function Etapa4({ form }: Etapa4Props) {
  // Watchers para cálculos automáticos
  const formaPagamento = form.watch("forma_pagamento");
  const numeroParcelas = form.watch("numero_parcelas");
  const acordoFinal = form.watch("acordo_final");

  // Calcular valor da parcela automaticamente
  useEffect(() => {
    if (formaPagamento === "parcelado" && numeroParcelas && acordoFinal) {
      try {
        const valorAcordo = parseFloat(acordoFinal);
        const numParcelas = parseInt(numeroParcelas);
        
        if (valorAcordo > 0 && numParcelas > 0) {
          const valorParcela = valorAcordo / numParcelas;
          form.setValue("valor_parcela", valorParcela.toFixed(2));
        }
      } catch (error) {
        console.error("Erro ao calcular valor da parcela:", error);
      }
    } else {
      form.setValue("valor_parcela", "0");
    }
  }, [formaPagamento, numeroParcelas, acordoFinal, form]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Informações de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="forma_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma de pagamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="a_vista">À Vista</SelectItem>
                      <SelectItem value="parcelado">Parcelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {formaPagamento === "parcelado" && (
              <FormField
                control={form.control}
                name="numero_parcelas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Parcelas</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 12"
                        {...field}
                        type="number"
                        min="1"
                        max="120"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {formaPagamento === "parcelado" && numeroParcelas && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4" />
                <span className="text-sm font-medium">Valor da Parcela (Calculado)</span>
              </div>
              <div className="text-xl font-bold">
                R$ {parseFloat(form.watch("valor_parcela") || "0").toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-muted-foreground">
                Baseado no valor do acordo final
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações de Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="escritorio_banco_acordo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Escritório/Banco para Acordo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome da instituição"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contato_acordo_nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Contato</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome completo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="contato_acordo_telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone do Contato
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="(11) 99999-9999"
                    {...field}
                    className="max-w-md"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Reestruturação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="is_reestruturado"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Contrato Reestruturado
                  </FormLabel>
                  <FormDescription>
                    Marque se este contrato passou por processo de reestruturação
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {form.watch("is_reestruturado") && (
            <FormField
              control={form.control}
              name="data_reestruturacao"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data da Reestruturação</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Selecione a data da reestruturação</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Seção de Garantias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Garantias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GarantiasSection contratoId={form.watch("numero_contrato")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="observacoes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações Gerais</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Adicione observações relevantes sobre o contrato..."
                    className="min-h-24"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Informações adicionais que possam ser relevantes para o acompanhamento do contrato
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}