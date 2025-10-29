import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  calcularAnaliseCompleta, 
  MODALIDADES_COMPLETAS, 
  BANCOS_COMPLETOS, 
  getCarteira 
} from "@/lib/calculoGestaoPassivoBancario";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

const formSchema = z.object({
  // Seção 1: Dados do Contrato
  numero_contrato: z.string().min(1, "Número do contrato é obrigatório"),
  banco_id: z.string().min(1, "Banco é obrigatório"),
  tipo_pessoa: z.enum(["PF", "PJ"], { required_error: "Tipo de pessoa é obrigatório" }),
  tipo_operacao: z.string().min(1, "Tipo de operação é obrigatório"),
  saldo_devedor: z.string().min(1, "Saldo devedor é obrigatório"),
  data_vencimento_original: z.date({ required_error: "Data de vencimento original é obrigatória" }),
  data_inadimplencia: z.date({ required_error: "Data de inadimplência é obrigatória" }),
  
  // Seção 2: Garantias
  possui_garantia: z.enum(["sim", "nao"], { required_error: "Campo obrigatório" }),
  tipo_garantia: z.string().optional(),
  valor_garantia: z.string().optional(),
  descricao_garantia: z.string().optional(),
  
  // Seção 3: Observações
  observacoes: z.string().optional(),
}).refine((data) => {
  // Validação: Data de inadimplência não pode ser futura
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return data.data_inadimplencia <= hoje;
}, {
  message: "Data de inadimplência não pode ser futura",
  path: ["data_inadimplencia"],
}).refine((data) => {
  // Validação: Data de inadimplência deve ser >= Data de vencimento original
  return data.data_inadimplencia >= data.data_vencimento_original;
}, {
  message: "Data de inadimplência deve ser posterior ou igual à data de vencimento",
  path: ["data_inadimplencia"],
}).refine((data) => {
  // Validação: Se possui garantia = sim, tipo de garantia é obrigatório
  if (data.possui_garantia === "sim" && !data.tipo_garantia) {
    return false;
  }
  return true;
}, {
  message: "Tipo de garantia é obrigatório quando há garantia",
  path: ["tipo_garantia"],
}).refine((data) => {
  // Validação: Saldo devedor > 0
  const saldo = parseFloat(data.saldo_devedor.replace(/[^0-9,-]+/g, "").replace(",", "."));
  return !isNaN(saldo) && saldo > 0;
}, {
  message: "Saldo devedor deve ser maior que zero",
  path: ["saldo_devedor"],
});

// Modalidades agrupadas por carteira
const MODALIDADES_POR_CARTEIRA = {
  C1: MODALIDADES_COMPLETAS.filter(m => m.carteira === "C1"),
  C2: MODALIDADES_COMPLETAS.filter(m => m.carteira === "C2"),
  C3: MODALIDADES_COMPLETAS.filter(m => m.carteira === "C3"),
  C4: MODALIDADES_COMPLETAS.filter(m => m.carteira === "C4"),
  C5: MODALIDADES_COMPLETAS.filter(m => m.carteira === "C5"),
};

const formatCurrency = (value: string) => {
  const number = parseFloat(value.replace(/[^0-9,-]+/g, "").replace(",", "."));
  if (isNaN(number)) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number);
};

export default function NovaAnalise() {
  const { user } = useAuth();

  const createAnalise = useMutation({
    mutationFn: async (analise: any) => {
      const { data, error } = await supabase
        .from("analises_gestao_passivo")
        .insert(analise)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Análise criada com sucesso",
      });
    },
    onError: (error) => {
      console.error("Erro ao criar análise:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar análise",
        description: "Tente novamente.",
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      possui_garantia: undefined,
      tipo_pessoa: undefined,
    },
  });

  const possuiGarantia = form.watch("possui_garantia");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não autenticado",
      });
      return;
    }

    try {
      // Parse valores
      const saldoDevedor = parseFloat(values.saldo_devedor.replace(/[^0-9,-]+/g, "").replace(",", "."));
      const valorGarantia = values.valor_garantia
        ? parseFloat(values.valor_garantia.replace(/[^0-9,-]+/g, "").replace(",", "."))
        : null;

      // Executar análise com a nova função
      const resultado = calcularAnaliseCompleta(
        saldoDevedor,
        values.data_inadimplencia,
        values.tipo_operacao
      );

      // Determinar estágio CMN 4.966
      const estagio = resultado.diasAtraso >= 90 ? 3 : resultado.diasAtraso >= 30 ? 2 : 1;
      
      // Determinar momento de negociação
      const momento = resultado.provisaoPercentual >= 90 ? "premium" :
                      resultado.provisaoPercentual >= 80 ? "otimo" :
                      resultado.provisaoPercentual >= 70 ? "muito_favoravel" :
                      resultado.provisaoPercentual >= 60 ? "favoravel" :
                      resultado.provisaoPercentual >= 50 ? "inicial" : "prematuro";

      // Montar objeto para salvar
      const analiseData = {
        usuario_id: user.id,
        numero_contrato: values.numero_contrato,
        banco_id: null, // Não estamos mais usando banco_id do Supabase
        tipo_pessoa: values.tipo_pessoa,
        tipo_operacao: values.tipo_operacao,
        carteira_bcb352: resultado.carteira || "C5",
        saldo_devedor_atual: saldoDevedor,
        data_vencimento_original: format(values.data_vencimento_original, "yyyy-MM-dd"),
        data_inadimplencia: format(values.data_inadimplencia, "yyyy-MM-dd"),
        dias_atraso: resultado.diasAtraso,
        meses_atraso: Math.floor(resultado.diasAtraso / 30),
        estagio_cmn4966: estagio,
        em_default: resultado.diasAtraso >= 90,
        percentual_provisao_bcb352: resultado.provisaoPercentual,
        valor_provisao_bcb352: resultado.provisaoValor,
        tipo_provisao: resultado.diasAtraso >= 90 ? "ANEXO_I" : "ANEXO_II",
        valor_proposta_acordo: resultado.propostaValor,
        percentual_proposta_acordo: (resultado.provisaoValor / saldoDevedor) * 100,
        marco_provisionamento: resultado.marco,
        momento_negociacao: momento,
        possui_garantias: values.possui_garantia === "sim",
        tipo_garantias: values.tipo_garantia ? [values.tipo_garantia] : null,
        valor_garantias: valorGarantia,
        descricao_garantia: values.descricao_garantia || null,
        observacoes: values.observacoes || null,
        status_negociacao: "pendente",
      };

      await createAnalise.mutateAsync(analiseData);
      
      // Reset form
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar análise",
        description: error.message || "Ocorreu um erro inesperado",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nova Análise de Contrato</h1>
        <p className="text-muted-foreground mt-2">
          Análise de Provisão conforme BCB 352/2023 e CMN 4.966/2021
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* SEÇÃO 1: DADOS DO CONTRATO */}
          <Card>
            <CardHeader>
              <CardTitle>1. Dados do Contrato</CardTitle>
              <CardDescription>Informações básicas do contrato bancário</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="numero_contrato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Contrato *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="banco_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banco *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o banco" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BANCOS_COMPLETOS.map((banco, index) => (
                          <SelectItem key={index} value={banco.nome}>
                            {banco.segmento} - {banco.nome}
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
                name="tipo_pessoa"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tipo de Pessoa *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="PF" id="pf" />
                          <label htmlFor="pf" className="cursor-pointer">Pessoa Física</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="PJ" id="pj" />
                          <label htmlFor="pj" className="cursor-pointer">Pessoa Jurídica</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo_operacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Operação *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de operação" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                          C1 - Máxima Liquidez
                        </div>
                        {MODALIDADES_POR_CARTEIRA.C1.map((mod) => (
                          <SelectItem key={mod.nome} value={mod.nome}>
                            {mod.nome}
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">
                          C2 - Alta Liquidez
                        </div>
                        {MODALIDADES_POR_CARTEIRA.C2.map((mod) => (
                          <SelectItem key={mod.nome} value={mod.nome}>
                            {mod.nome}
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">
                          C3 - Liquidez Moderada
                        </div>
                        {MODALIDADES_POR_CARTEIRA.C3.map((mod) => (
                          <SelectItem key={mod.nome} value={mod.nome}>
                            {mod.nome}
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">
                          C4 - PJ Sem Garantia
                        </div>
                        {MODALIDADES_POR_CARTEIRA.C4.map((mod) => (
                          <SelectItem key={mod.nome} value={mod.nome}>
                            {mod.nome}
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">
                          C5 - PF Sem Garantia
                        </div>
                        {MODALIDADES_POR_CARTEIRA.C5.map((mod) => (
                          <SelectItem key={mod.nome} value={mod.nome}>
                            {mod.nome}
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
                name="saldo_devedor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saldo Devedor *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="R$ 0,00"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatCurrency(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                    <FormDescription>Valor atual da dívida</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="data_vencimento_original"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Vencimento Original *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
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
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
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
                  name="data_inadimplencia"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Inadimplência *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
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
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
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

          {/* SEÇÃO 2: GARANTIAS */}
          <Card>
            <CardHeader>
              <CardTitle>2. Garantias</CardTitle>
              <CardDescription>Informações sobre garantias do contrato</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="possui_garantia"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Possui Garantia? *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sim" id="sim" />
                          <label htmlFor="sim" className="cursor-pointer">Sim</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="nao" id="nao" />
                          <label htmlFor="nao" className="cursor-pointer">Não</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {possuiGarantia === "sim" && (
                <>
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
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                              C1 - Máxima Liquidez
                            </div>
                            {MODALIDADES_POR_CARTEIRA.C1.map((mod) => (
                              <SelectItem key={mod.nome} value={mod.nome}>
                                {mod.nome}
                              </SelectItem>
                            ))}
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">
                              C2 - Alta Liquidez
                            </div>
                            {MODALIDADES_POR_CARTEIRA.C2.map((mod) => (
                              <SelectItem key={mod.nome} value={mod.nome}>
                                {mod.nome}
                              </SelectItem>
                            ))}
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">
                              C3 - Liquidez Moderada
                            </div>
                            {MODALIDADES_POR_CARTEIRA.C3.map((mod) => (
                              <SelectItem key={mod.nome} value={mod.nome}>
                                {mod.nome}
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
                    name="valor_garantia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor da Garantia</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="R$ 0,00"
                            {...field}
                            onChange={(e) => {
                              const formatted = formatCurrency(e.target.value);
                              field.onChange(formatted);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descricao_garantia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição da Garantia</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva os detalhes da garantia..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* SEÇÃO 3: OBSERVAÇÕES */}
          <Card>
            <CardHeader>
              <CardTitle>3. Observações</CardTitle>
              <CardDescription>Informações adicionais (opcional)</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Adicione observações relevantes sobre o contrato..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              <X className="h-4 w-4 mr-2" />
              Limpar
            </Button>
            <Button type="submit" disabled={createAnalise.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {createAnalise.isPending ? "Calculando..." : "Calcular Análise"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
