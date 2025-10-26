import { UseFormReturn } from "react-hook-form";
import { useEffect } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PremiumInput } from "@/components/ui/premium-input";
import { PremiumSection } from "@/components/ui/premium-section";
import { PremiumButton } from "@/components/ui/premium-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useTiposOperacao } from "@/hooks/useTiposOperacao";
import { ContratoWizardData } from "./types";
import { DollarSign, Calendar as CalendarIcon, TrendingUp, Building2, Info } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { calcularDiasAtraso, diasParaMeses } from "@/lib/calculoProvisao";
import { toast } from "sonner";

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
      <PremiumSection 
        title="Detalhes Financeiros" 
        icon={DollarSign}
        description="Configure os valores e tipo de operação do contrato"
      >
        <div className="space-y-6">
          {/* Tipo de Operação */}
          <FormField
            control={form.control}
            name="tipo_operacao_bcb"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-slate-700 font-medium">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Tipo de Operação BCB *
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500">
                      <SelectValue placeholder="Selecione o tipo de operação" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-lg border-slate-200">
                    {tiposOperacao?.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id!} className="rounded-md">
                        <div>
                          <div className="font-medium text-slate-800">{tipo.nome}</div>
                          <div className="text-sm text-slate-500">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="saldo_contabil"
              render={({ field }) => (
                <FormItem>
                  <PremiumInput
                    label="Dívida Contábil *"
                    placeholder="0,00"
                    icon={DollarSign}
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valor_divida"
              render={({ field }) => (
                <FormItem>
                  <PremiumInput
                    label="Valor da Dívida (opcional)"
                    placeholder="0,00"
                    icon={DollarSign}
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </PremiumSection>

      <PremiumSection 
        title="Datas Importantes" 
        icon={CalendarIcon}
        description="Defina as datas relevantes para o contrato"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="data_ultimo_pagamento"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-slate-700 font-medium mb-2">Data do Último Pagamento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <PremiumButton
                        variant="outline"
                        className={cn(
                          "h-12 pl-3 text-left font-normal justify-start",
                          !field.value && "text-slate-400"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
                        {field.value ? (
                          format(new Date(field.value), "dd/MM/yyyy")
                        ) : (
                          <span>Selecione a data</span>
                        )}
                      </PremiumButton>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-lg border-slate-200" align="start">
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
                <FormLabel className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  Data de Entrada no Escritório
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <PremiumButton
                        variant="outline"
                        className={cn(
                          "h-12 pl-3 text-left font-normal justify-start",
                          !field.value && "text-slate-400"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
                        {field.value ? (
                          format(new Date(field.value), "dd/MM/yyyy")
                        ) : (
                          <span>Selecione a data</span>
                        )}
                      </PremiumButton>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-lg border-slate-200" align="start">
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
      </PremiumSection>

      <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-emerald-800 mb-2">Cálculos automáticos:</p>
            <ul className="list-disc list-inside text-emerald-700 space-y-1">
              <li>Os dias de atraso são calculados automaticamente com base na data do último pagamento</li>
              <li>O tempo no escritório é calculado a partir da data de entrada</li>
              <li>A classificação será definida com base no tipo de operação BCB selecionado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}