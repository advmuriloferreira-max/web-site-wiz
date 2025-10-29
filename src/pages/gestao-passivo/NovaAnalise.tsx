import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Save, X } from "lucide-react";
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
import { useBancosBrasil, useCreateGestaoPassivo } from "@/hooks/useGestaoPassivo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { analisarContrato, TIPOS_GARANTIA } from "@/lib/calculoGestaoPassivoBancario";
import { toast } from "@/hooks/use-toast";

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

const TIPOS_OPERACAO = [
  "Empréstimo Pessoal",
  "Capital de Giro",
  "Financiamento de Veículo",
  "Cartão de Crédito",
  "Cheque Especial",
  "Crédito Consignado",
  "Outros",
];

// Flatten all guarantee types
const ALL_TIPOS_GARANTIA = [
  ...TIPOS_GARANTIA.C1,
  ...TIPOS_GARANTIA.C2,
  ...TIPOS_GARANTIA.C3,
];

const formatCurrency = (value: string) => {
  const number = parseFloat(value.replace(/[^0-9,-]+/g, "").replace(",", "."));
  if (isNaN(number)) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number);
};

export default function NovaAnalise() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: bancos } = useBancosBrasil();
  const createAnalise = useCreateGestaoPassivo();

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

      // Buscar dados do banco
      const bancoSelecionado = bancos?.find((b) => b.id === values.banco_id);

      // Executar análise
      const resultado = await analisarContrato({
        dataInadimplencia: values.data_inadimplencia,
        saldoDevedor,
        possuiGarantia: values.possui_garantia === "sim",
        tipoGarantia: values.tipo_garantia || null,
        tipoPessoa: values.tipo_pessoa,
        supabase,
      });

      // Montar objeto para salvar
      const analiseData = {
        usuario_id: user.id,
        numero_contrato: values.numero_contrato,
        banco_nome: bancoSelecionado?.nome_completo || "",
        banco_codigo_compe: bancoSelecionado?.codigo_compe || null,
        banco_segmento: bancoSelecionado?.segmento_bcb || null,
        tipo_pessoa: values.tipo_pessoa,
        tipo_operacao: values.tipo_operacao,
        carteira_bcb352: resultado.carteira,
        saldo_devedor_atual: saldoDevedor,
        valor_original: saldoDevedor, // Assuming original equals current for this form
        data_vencimento_original: format(values.data_vencimento_original, "yyyy-MM-dd"),
        data_inadimplencia: format(values.data_inadimplencia, "yyyy-MM-dd"),
        data_contratacao: format(values.data_vencimento_original, "yyyy-MM-dd"), // Using vencimento as proxy
        dias_atraso: resultado.diasAtraso,
        meses_atraso: resultado.mesesAtraso,
        estagio_cmn4966: resultado.estagio,
        em_default: resultado.emDefault,
        percentual_provisao_bcb352: resultado.percentualProvisao,
        valor_provisao_bcb352: resultado.valorProvisao,
        tipo_provisao: resultado.tipoProvisao,
        valor_proposta_acordo: resultado.valorPropostaAcordo,
        percentual_proposta_acordo: resultado.percentualDesconto,
        possui_garantias: values.possui_garantia === "sim",
        tipo_garantias: values.tipo_garantia ? [values.tipo_garantia] : null,
        valor_garantias: valorGarantia,
        descricao_garantia: values.descricao_garantia || null,
        observacoes: values.observacoes || null,
        status_negociacao: "pendente",
      };

      const result = await createAnalise.mutateAsync(analiseData as any);
      
      if (result) {
        toast({
          title: "Sucesso!",
          description: "Análise criada com sucesso",
        });
        navigate(`/app/gestao-passivo/${result.id}`);
      }
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
        <Button
          variant="ghost"
          onClick={() => navigate("/app/gestao-passivo")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
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
                        {bancos?.map((banco) => (
                          <SelectItem key={banco.id} value={banco.id}>
                            {banco.codigo_compe} - {banco.nome_curto}
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
                        {TIPOS_OPERACAO.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
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
                          <RadioGroupItem value="sim" id="garantia-sim" />
                          <label htmlFor="garantia-sim" className="cursor-pointer">Sim</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="nao" id="garantia-nao" />
                          <label htmlFor="garantia-nao" className="cursor-pointer">Não</label>
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
                            {TIPOS_GARANTIA.C1.map((tipo) => (
                              <SelectItem key={tipo} value={tipo}>
                                {tipo}
                              </SelectItem>
                            ))}
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">
                              C2 - Alta Liquidez
                            </div>
                            {TIPOS_GARANTIA.C2.map((tipo) => (
                              <SelectItem key={tipo} value={tipo}>
                                {tipo}
                              </SelectItem>
                            ))}
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">
                              C3 - Liquidez Moderada
                            </div>
                            {TIPOS_GARANTIA.C3.map((tipo) => (
                              <SelectItem key={tipo} value={tipo}>
                                {tipo}
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
                        <FormDescription>Opcional</FormDescription>
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
                            placeholder="Descreva detalhes sobre a garantia..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Opcional</FormDescription>
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
              <CardDescription>Informações complementares</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Adicionais</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Adicione observações sobre o contrato..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Opcional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* BOTÕES */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/app/gestao-passivo")}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
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
