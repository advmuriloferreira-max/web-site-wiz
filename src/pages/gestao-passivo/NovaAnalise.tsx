import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Save, X, Calculator } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useClientes } from "@/hooks/useClientes";
import { useBancosBrasil, useCreateGestaoPassivo } from "@/hooks/useGestaoPassivo";
import { useAuth } from "@/hooks/useAuth";
import {
  TIPO_OPERACAO_CARTEIRA_MAP,
  TipoOperacaoGestaoPassivo,
  MotivoDefault,
  TipoGarantia,
  CarteiraBCB352,
} from "@/types/gestaoPassivo";
import {
  calcularGestaoPassivo,
  calcularDiasAtraso,
  calcularMesesAtraso,
  verificarDefault,
} from "@/lib/calculoGestaoPassivo";

const formSchema = z.object({
  // Seção 1: Identificação
  numero_contrato: z.string().min(1, "Número do contrato é obrigatório"),
  cliente_id: z.string().min(1, "Cliente é obrigatório"),
  banco_id: z.string().min(1, "Banco é obrigatório"),
  tipo_operacao: z.string().min(1, "Tipo de operação é obrigatório"),
  
  // Seção 2: Valores e Datas
  valor_original: z.string().min(1, "Valor original é obrigatório"),
  saldo_devedor_atual: z.string().min(1, "Saldo devedor é obrigatório"),
  data_contratacao: z.date({ required_error: "Data de contratação é obrigatória" }),
  data_vencimento_original: z.date().optional(),
  data_inadimplencia: z.date({ required_error: "Data de inadimplência é obrigatória" }),
  
  // Seção 3: Situação do Contrato
  motivo_default: z.array(z.string()).optional(),
  foi_reestruturado: z.boolean().default(false),
  data_reestruturacao: z.date().optional(),
  
  // Seção 4: Garantias
  possui_garantias: z.boolean().default(false),
  valor_garantias: z.string().optional(),
  tipo_garantias: z.array(z.string()).optional(),
  
  // Seção 6: Análise
  fundamentacao_juridica: z.string().optional(),
  observacoes: z.string().optional(),
}).refine((data) => {
  const valorOriginal = parseFloat(data.valor_original.replace(/[^0-9,-]+/g, "").replace(",", "."));
  const saldoDevedor = parseFloat(data.saldo_devedor_atual.replace(/[^0-9,-]+/g, "").replace(",", "."));
  return saldoDevedor <= valorOriginal;
}, {
  message: "Saldo devedor não pode ser maior que valor original",
  path: ["saldo_devedor_atual"],
}).refine((data) => {
  return data.data_inadimplencia >= data.data_contratacao;
}, {
  message: "Data de inadimplência não pode ser anterior à contratação",
  path: ["data_inadimplencia"],
});

const TIPOS_OPERACAO: TipoOperacaoGestaoPassivo[] = [
  "Cartão de Crédito",
  "Cheque Especial",
  "Empréstimo Pessoal",
  "Empréstimo Consignado",
  "Capital de Giro",
  "CCB Empresarial",
  "Financiamento de Veículo",
  "Leasing",
  "Outros",
];

const MOTIVOS_DEFAULT: MotivoDefault[] = [
  "Atraso superior a 90 dias",
  "Reestruturação",
  "Falência decretada",
  "Recuperação judicial",
  "Recuperação extrajudicial",
  "Medida judicial",
  "Descumprimento de cláusulas contratuais",
];

const TIPOS_GARANTIA: TipoGarantia[] = [
  "Hipoteca",
  "Penhor",
  "Alienação Fiduciária",
  "Aval",
  "Fiança",
  "Outras",
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
  const { data: clientes } = useClientes();
  const { data: bancos } = useBancosBrasil();
  const createAnalise = useCreateGestaoPassivo();
  
  const [carteiraBCB, setCarteiraBCB] = useState<CarteiraBCB352 | null>(null);
  const [diasAtraso, setDiasAtraso] = useState(0);
  const [mesesAtraso, setMesesAtraso] = useState(0);
  const [emDefault, setEmDefault] = useState(false);
  const [calculoPreview, setCalculoPreview] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      possui_garantias: false,
      foi_reestruturado: false,
      motivo_default: [],
      tipo_garantias: [],
    },
  });

  const tipoOperacao = form.watch("tipo_operacao");
  const dataInadimplencia = form.watch("data_inadimplencia");
  const saldoDevedorStr = form.watch("saldo_devedor_atual");
  const possuiGarantias = form.watch("possui_garantias");
  const foiReestruturado = form.watch("foi_reestruturado");

  // Atualizar carteira BCB quando tipo de operação mudar
  useEffect(() => {
    if (tipoOperacao) {
      const carteira = TIPO_OPERACAO_CARTEIRA_MAP[tipoOperacao as TipoOperacaoGestaoPassivo];
      setCarteiraBCB(carteira);
    }
  }, [tipoOperacao]);

  // Calcular dias e meses de atraso
  useEffect(() => {
    if (dataInadimplencia) {
      const dias = calcularDiasAtraso(dataInadimplencia);
      const meses = calcularMesesAtraso(dias);
      setDiasAtraso(dias);
      setMesesAtraso(meses);
      setEmDefault(verificarDefault(dias));
    }
  }, [dataInadimplencia]);

  // Recalcular provisão quando valores mudarem
  useEffect(() => {
    if (carteiraBCB && saldoDevedorStr && mesesAtraso > 0) {
      const saldoDevedor = parseFloat(saldoDevedorStr.replace(/[^0-9,-]+/g, "").replace(",", "."));
      if (!isNaN(saldoDevedor) && saldoDevedor > 0) {
        calcularGestaoPassivo(carteiraBCB, saldoDevedor, mesesAtraso).then((resultado) => {
          setCalculoPreview(resultado);
        });
      }
    }
  }, [carteiraBCB, saldoDevedorStr, mesesAtraso]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || !calculoPreview) return;

    const valorOriginal = parseFloat(values.valor_original.replace(/[^0-9,-]+/g, "").replace(",", "."));
    const saldoDevedor = parseFloat(values.saldo_devedor_atual.replace(/[^0-9,-]+/g, "").replace(",", "."));
    const valorGarantias = values.valor_garantias
      ? parseFloat(values.valor_garantias.replace(/[^0-9,-]+/g, "").replace(",", "."))
      : null;

    const bancoSelecionado = bancos?.find((b) => b.id === values.banco_id);

    const analise = {
      usuario_id: user.id,
      cliente_id: values.cliente_id,
      numero_contrato: values.numero_contrato,
      banco_nome: bancoSelecionado?.nome_completo || "",
      banco_codigo_compe: bancoSelecionado?.codigo_compe || null,
      banco_segmento: bancoSelecionado?.segmento_bcb || null,
      carteira_bcb352: carteiraBCB as string,
      tipo_operacao: values.tipo_operacao,
      valor_original: valorOriginal,
      saldo_devedor_atual: saldoDevedor,
      data_contratacao: format(values.data_contratacao, "yyyy-MM-dd"),
      data_vencimento_original: values.data_vencimento_original
        ? format(values.data_vencimento_original, "yyyy-MM-dd")
        : null,
      data_inadimplencia: format(values.data_inadimplencia, "yyyy-MM-dd"),
      dias_atraso: diasAtraso,
      meses_atraso: mesesAtraso,
      percentual_provisao_bcb352: calculoPreview.percentualProvisao,
      valor_provisao_bcb352: calculoPreview.valorProvisao,
      valor_proposta_acordo: calculoPreview.valorPropostaAcordo,
      percentual_proposta_acordo: calculoPreview.percentualPropostaAcordo,
      marco_provisionamento: calculoPreview.marcoProvisionamento || null,
      momento_negociacao: calculoPreview.momentoNegociacao,
      em_default: emDefault,
      motivo_default: values.motivo_default && values.motivo_default.length > 0 ? values.motivo_default : null,
      foi_reestruturado: values.foi_reestruturado,
      data_reestruturacao: values.data_reestruturacao
        ? format(values.data_reestruturacao, "yyyy-MM-dd")
        : null,
      possui_garantias: values.possui_garantias,
      valor_garantias: valorGarantias,
      tipo_garantias: values.tipo_garantias && values.tipo_garantias.length > 0 ? values.tipo_garantias : null,
      fundamentacao_juridica: values.fundamentacao_juridica || null,
      estrategia_negociacao: calculoPreview.recomendacaoEstrategica,
      observacoes: values.observacoes || null,
      status_negociacao: "pendente" as const,
    };

    const result = await createAnalise.mutateAsync(analise as any);
    if (result) {
      navigate(`/app/gestao-passivo/${result.id}`);
    }
  };

  const getMomentoColor = (momento: string | null) => {
    const colors: Record<string, string> = {
      inicial: "bg-gray-500",
      favoravel: "bg-blue-500",
      muito_favoravel: "bg-green-500",
      otimo: "bg-amber-500",
      premium: "bg-purple-500",
      total: "bg-red-500",
    };
    return colors[momento || ""] || "bg-gray-500";
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/app/gestao-passivo")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Lista
        </Button>
        <h1 className="text-3xl font-bold">Nova Análise de Passivo Bancário</h1>
        <p className="text-muted-foreground mt-2">
          Preencha os dados do contrato para análise conforme Resolução BCB 352/2023
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* SEÇÃO 1: IDENTIFICAÇÃO DO CONTRATO */}
          <Card>
            <CardHeader>
              <CardTitle>1. Identificação do Contrato</CardTitle>
              <CardDescription>Dados básicos do contrato e instituição financeira</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  name="cliente_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clientes?.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id}>
                              {cliente.nome}
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
                  name="tipo_operacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Operação *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
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

                <div className="col-span-1 md:col-span-2">
                  <FormLabel>Carteira BCB 352</FormLabel>
                  <Input
                    value={carteiraBCB || ""}
                    disabled
                    className="bg-muted"
                    placeholder="Será preenchido automaticamente"
                  />
                  <FormDescription>
                    Preenchido automaticamente baseado no tipo de operação
                  </FormDescription>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEÇÃO 2: VALORES E DATAS */}
          <Card>
            <CardHeader>
              <CardTitle>2. Valores e Datas</CardTitle>
              <CardDescription>Informações financeiras e temporais do contrato</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="valor_original"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Original *</FormLabel>
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
                  name="saldo_devedor_atual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Saldo Devedor Atual *</FormLabel>
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
                  name="data_contratacao"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Contratação *</FormLabel>
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
                                <span>Selecione uma data</span>
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
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data_vencimento_original"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Vencimento Original</FormLabel>
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
                                <span>Selecione uma data</span>
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
                            initialFocus
                            className="pointer-events-auto"
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
                                <span>Selecione uma data</span>
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
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Dias de Atraso</FormLabel>
                  <Input value={diasAtraso} disabled className="bg-muted" />
                  <FormDescription>Calculado automaticamente</FormDescription>
                </div>

                <div>
                  <FormLabel>Meses de Atraso</FormLabel>
                  <Input value={mesesAtraso} disabled className="bg-muted" />
                  <FormDescription>Calculado automaticamente</FormDescription>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEÇÃO 3: SITUAÇÃO DO CONTRATO */}
          <Card>
            <CardHeader>
              <CardTitle>3. Situação do Contrato</CardTitle>
              <CardDescription>Status de default e reestruturação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/50">
                <Checkbox checked={emDefault} disabled />
                <div className="flex-1">
                  <FormLabel>Em Default?</FormLabel>
                  <FormDescription>
                    Contrato está em default ({'>'}90 dias de atraso)
                  </FormDescription>
                </div>
                {emDefault && (
                  <Badge variant="destructive" className="ml-auto">
                    SIM
                  </Badge>
                )}
              </div>

              {emDefault && (
                <FormField
                  control={form.control}
                  name="motivo_default"
                  render={() => (
                    <FormItem>
                      <FormLabel>Motivos do Default</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        {MOTIVOS_DEFAULT.map((motivo) => (
                          <FormField
                            key={motivo}
                            control={form.control}
                            name="motivo_default"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(motivo)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, motivo]);
                                      } else {
                                        field.onChange(
                                          current.filter((v) => v !== motivo)
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {motivo}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="foi_reestruturado"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 p-4 border rounded-lg">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="flex-1">
                        <FormLabel>Foi Reestruturado?</FormLabel>
                        <FormDescription>
                          Contrato passou por reestruturação
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {foiReestruturado && (
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
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>Selecione uma data</span>
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
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEÇÃO 4: GARANTIAS */}
          <Card>
            <CardHeader>
              <CardTitle>4. Garantias</CardTitle>
              <CardDescription>Garantias vinculadas ao contrato</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="possui_garantias"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 p-4 border rounded-lg">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="flex-1">
                      <FormLabel>Possui Garantias?</FormLabel>
                      <FormDescription>
                        O contrato possui garantias reais ou fidejussórias
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {possuiGarantias && (
                <>
                  <FormField
                    control={form.control}
                    name="valor_garantias"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor das Garantias</FormLabel>
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
                    name="tipo_garantias"
                    render={() => (
                      <FormItem>
                        <FormLabel>Tipos de Garantias</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                          {TIPOS_GARANTIA.map((tipo) => (
                            <FormField
                              key={tipo}
                              control={form.control}
                              name="tipo_garantias"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(tipo)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([...current, tipo]);
                                        } else {
                                          field.onChange(
                                            current.filter((v) => v !== tipo)
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {tipo}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* SEÇÃO 5: CÁLCULO AUTOMÁTICO (PREVIEW) */}
          {calculoPreview && (
            <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-background">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  <CardTitle>5. Cálculo Automático - Preview</CardTitle>
                </div>
                <CardDescription>Resultados baseados na Resolução BCB 352/2023</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Percentual de Provisão
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(calculoPreview.percentualProvisao * 100).toFixed(2)}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        BCB 352 - Carteira {carteiraBCB}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Valor da Provisão
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(calculoPreview.valorProvisao)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Prejuízo provisionado
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Marco de Provisionamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {calculoPreview.marcoProvisionamento || "< 50"}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Nível de risco atual
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Momento de Negociação
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge
                        className={`${getMomentoColor(
                          calculoPreview.momentoNegociacao
                        )} text-white text-sm px-3 py-1`}
                      >
                        {calculoPreview.momentoNegociacao.replace("_", " ").toUpperCase()}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        Janela de oportunidade
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEÇÃO 6: PROPOSTA DE ACORDO (PREMIUM) */}
          {calculoPreview && (
            <Card>
              <CardHeader>
                <CardTitle>6. Proposta de Acordo - PREMIUM</CardTitle>
                <CardDescription>Estratégia calculada automaticamente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Valor da Proposta</FormLabel>
                    <Input
                      value={new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(calculoPreview.valorPropostaAcordo)}
                      disabled
                      className="bg-muted text-lg font-semibold"
                    />
                    <FormDescription>
                      Calculado automaticamente pela lógica BCB
                    </FormDescription>
                  </div>

                  <div>
                    <FormLabel>Percentual da Proposta</FormLabel>
                    <Input
                      value={`${calculoPreview.percentualPropostaAcordo.toFixed(2)}%`}
                      disabled
                      className="bg-muted text-lg font-semibold"
                    />
                    <FormDescription>
                      Em relação ao saldo devedor atual
                    </FormDescription>
                  </div>
                </div>

                <div>
                  <FormLabel>Recomendação Estratégica</FormLabel>
                  <Textarea
                    value={calculoPreview.recomendacaoEstrategica}
                    disabled
                    className="bg-muted min-h-[200px] font-mono text-sm"
                  />
                </div>

                <FormField
                  control={form.control}
                  name="fundamentacao_juridica"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fundamentação Jurídica</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Insira a fundamentação jurídica e normativa para a proposta..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Base legal e normativa para sustentar a negociação
                      </FormDescription>
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
                        <Textarea
                          placeholder="Observações adicionais sobre o contrato..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* BOTÕES */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/app/gestao-passivo")}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createAnalise.isPending || !calculoPreview}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              <Save className="h-4 w-4 mr-2" />
              {createAnalise.isPending ? "Salvando..." : "Salvar e Calcular"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
