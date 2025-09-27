import { UseFormReturn } from "react-hook-form";
import { useEffect } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ContratoWizardData } from "./types";
import { 
  CheckCircle, 
  DollarSign, 
  TrendingDown, 
  Award, 
  Users, 
  Building, 
  FileText,
  Calculator,
  Calendar,
  Phone,
  MessageSquare
} from "lucide-react";

interface Etapa5Props {
  form: UseFormReturn<ContratoWizardData>;
}

export function Etapa5({ form }: Etapa5Props) {
  // Watchers para cálculos automáticos
  const valorDivida = form.watch("valor_divida");
  const acordoFinal = form.watch("acordo_final");
  const reducaoDivida = form.watch("reducao_divida");
  const percentualHonorarios = form.watch("percentual_honorarios");

  // Calcular redução da dívida automaticamente
  useEffect(() => {
    if (valorDivida && acordoFinal) {
      try {
        const valorDiv = parseFloat(valorDivida);
        const valorAcordo = parseFloat(acordoFinal);
        
        if (valorDiv > 0 && valorAcordo > 0) {
          const reducao = valorDiv - valorAcordo;
          form.setValue("reducao_divida", reducao.toFixed(2));
        }
      } catch (error) {
        console.error("Erro ao calcular redução da dívida:", error);
      }
    }
  }, [valorDivida, acordoFinal, form]);

  // Calcular honorários automaticamente
  useEffect(() => {
    if (percentualHonorarios && reducaoDivida) {
      try {
        const percentual = parseFloat(percentualHonorarios);
        const valorReducao = parseFloat(reducaoDivida);
        
        if (percentual > 0 && valorReducao > 0) {
          const valorHonorarios = (valorReducao * percentual) / 100;
          form.setValue("valor_honorarios", valorHonorarios.toFixed(2));
        }
      } catch (error) {
        console.error("Erro ao calcular honorários:", error);
      }
    }
  }, [percentualHonorarios, reducaoDivida, form]);

  // Dados do formulário para exibição
  const formData = form.getValues();
  
  const formatCurrency = (value: string | undefined) => {
    if (!value) return "R$ 0,00";
    return `R$ ${parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Não informada";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Valores do Acordo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="acordo_final"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Acordo Final</FormLabel>
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

            <FormField
              control={form.control}
              name="situacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Situação do Contrato</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a situação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Em análise">Em Análise</SelectItem>
                      <SelectItem value="Em negociação">Em Negociação</SelectItem>
                      <SelectItem value="Em processo judicial">Em Processo Judicial</SelectItem>
                      <SelectItem value="Acordo Finalizado">Acordo Finalizado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Cálculos automáticos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Redução da Dívida</span>
              </div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(reducaoDivida)}
              </div>
              <div className="text-sm text-muted-foreground">
                Economia obtida
              </div>
            </div>

            <FormField
              control={form.control}
              name="percentual_honorarios"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Percentual de Honorários
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o percentual" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="10">10% - Padrão</SelectItem>
                      <SelectItem value="15">15% - Intermediário</SelectItem>
                      <SelectItem value="20">20% - Máximo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {percentualHonorarios && reducaoDivida && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Honorários de Êxito</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(form.watch("valor_honorarios"))}
              </div>
              <div className="text-sm text-muted-foreground">
                {percentualHonorarios}% sobre a redução obtida
              </div>
            </div>
          )}

          {/* Campos ocultos para os cálculos */}
          <div className="hidden">
            <FormField
              control={form.control}
              name="reducao_divida"
              render={({ field }) => (
                <FormControl>
                  <Input {...field} />
                </FormControl>
              )}
            />
            
            <FormField
              control={form.control}
              name="valor_honorarios"
              render={({ field }) => (
                <FormControl>
                  <Input {...field} />
                </FormControl>
              )}
            />

            <FormField
              control={form.control}
              name="tempo_escritorio"
              render={({ field }) => (
                <FormControl>
                  <Input {...field} />
                </FormControl>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Resumo Completo do Contrato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Resumo Completo do Contrato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dados Básicos */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Dados Básicos
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Cliente:</span>
                <div className="font-medium">
                  {formData.cliente_id ? "Cliente selecionado" : "Não informado"}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Banco:</span>
                <div className="font-medium">
                  {formData.banco_id ? "Banco selecionado" : "Não informado"}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Número do Contrato:</span>
                <div className="font-medium">{formData.numero_contrato || "Não informado"}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Tipo de Operação:</span>
                <div className="font-medium">
                  {formData.tipo_operacao_bcb ? "Operação selecionada" : "Não informado"}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Valores Financeiros */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Valores Financeiros
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Valor da Dívida</div>
                <div className="text-lg font-bold">{formatCurrency(formData.valor_divida)}</div>
              </div>
              <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-sm text-muted-foreground">Provisão Necessária</div>
                <div className="text-lg font-bold text-red-600">{formatCurrency(formData.valor_provisao)}</div>
                <div className="text-xs text-muted-foreground">{formData.percentual_provisao}%</div>
              </div>
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-muted-foreground">Acordo Final</div>
                <div className="text-lg font-bold text-green-600">{formatCurrency(formData.acordo_final)}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Informações de Atraso */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Informações de Atraso
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Último Pagamento:</span>
                <div className="font-medium">{formatDate(formData.data_ultimo_pagamento)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Dias de Atraso:</span>
                <div className="font-medium">{formData.dias_atraso || "0"} dias</div>
              </div>
              <div>
                <span className="text-muted-foreground">Classificação:</span>
                <div>
                  {formData.classificacao && (
                    <Badge variant="outline">{formData.classificacao}</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {formData.forma_pagamento && (
            <>
              <Separator />
              
              {/* Forma de Pagamento */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Forma de Pagamento
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>
                    <div className="font-medium">
                      {formData.forma_pagamento === "a_vista" ? "À Vista" : "Parcelado"}
                    </div>
                  </div>
                  {formData.forma_pagamento === "parcelado" && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Parcelas:</span>
                        <div className="font-medium">{formData.numero_parcelas || "0"}x</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Valor da Parcela:</span>
                        <div className="font-medium">{formatCurrency(formData.valor_parcela)}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {(formData.contato_acordo_nome || formData.contato_acordo_telefone) && (
            <>
              <Separator />
              
              {/* Informações de Contato */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contato para Acordo
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {formData.contato_acordo_nome && (
                    <div>
                      <span className="text-muted-foreground">Nome:</span>
                      <div className="font-medium">{formData.contato_acordo_nome}</div>
                    </div>
                  )}
                  {formData.contato_acordo_telefone && (
                    <div>
                      <span className="text-muted-foreground">Telefone:</span>
                      <div className="font-medium">{formData.contato_acordo_telefone}</div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {formData.observacoes && (
            <>
              <Separator />
              
              {/* Observações */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Observações
                </h4>
                <div className="p-3 bg-muted rounded-lg text-sm">
                  {formData.observacoes}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}