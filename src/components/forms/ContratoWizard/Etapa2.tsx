import { UseFormReturn } from "react-hook-form";
import { useEffect } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useTiposOperacao } from "@/hooks/useTiposOperacao";
import { ContratoWizardData } from "./types";
import { DollarSign, Calendar as CalendarIcon, TrendingUp, Building2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { calcularDiasAtraso, diasParaMeses } from "@/lib/calculoProvisao";
import { enhancedToast } from "@/components/ui/enhanced-toast";

interface Etapa2Props {
  form: UseFormReturn<ContratoWizardData>;
}

export function Etapa2({ form }: Etapa2Props) {
  const { data: tiposOperacao } = useTiposOperacao();

  // Calcular automaticamente dias e meses de atraso
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
      form.setValue("dias_atraso", "0");
      form.setValue("meses_atraso", "0");
    }
  }, [dataUltimoPagamento, form]);

  // Calcular tempo no escritório automaticamente
  const dataEntradaEscritorio = form.watch("data_entrada_escritorio");
  
  useEffect(() => {
    if (dataEntradaEscritorio) {
      try {
        const dataEntrada = new Date(dataEntradaEscritorio);
        const hoje = new Date();
        const diffTime = Math.abs(hoje.getTime() - dataEntrada.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        form.setValue("tempo_escritorio", diffDays.toString());
      } catch (error) {
        console.error("Erro ao calcular tempo no escritório:", error);
      }
    } else {
      form.setValue("tempo_escritorio", "0");
    }
  }, [dataEntradaEscritorio, form]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Detalhes Financeiros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tipo de Operação e Valores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="tipo_operacao_bcb"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Tipo de Operação BCB *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de operação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tiposOperacao?.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id!}>
                          <div>
                            <div className="font-medium">{tipo.nome}</div>
                            <div className="text-sm text-muted-foreground">
                              Carteira: {tipo.carteira}
                            </div>
                          </div>
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
              name="valor_divida"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor da Dívida *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0,00"
                      {...field}
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="saldo_contabil"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dívida Contábil (opcional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0,00"
                    {...field}
                    type="number"
                    min="0"
                    step="0.01"
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
            <CalendarIcon className="h-5 w-5" />
            Datas Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="data_ultimo_pagamento"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data do Último Pagamento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "dd/MM/yyyy")
                          ) : (
                            <span>Selecione a data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_entrada_escritorio"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Data de Entrada no Escritório
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "dd/MM/yyyy")
                          ) : (
                            <span>Selecione a data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Cálculos automáticos:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                <li>Os dias de atraso são calculados automaticamente com base na data do último pagamento</li>
                <li>O tempo no escritório é calculado a partir da data de entrada</li>
                <li>A classificação será definida com base no tipo de operação BCB selecionado</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}