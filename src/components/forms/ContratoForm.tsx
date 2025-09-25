import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useClientes } from "@/hooks/useClientes";
import { useBancos } from "@/hooks/useBancos";
import { useCreateContrato } from "@/hooks/useCreateContrato";
import { useUpdateContrato } from "@/hooks/useUpdateContrato";
import { useContratoByNumero } from "@/hooks/useContratoByNumero";
import { useProvisaoPerda, useProvisaoPerdaIncorrida } from "@/hooks/useProvisao";
import { useTiposOperacao, useGetTipoOperacaoById } from "@/hooks/useTiposOperacao";
import { 
  calcularProvisao, 
  calcularDiasAtraso,
  diasParaMeses,
  ClassificacaoRisco 
} from "@/lib/calculoProvisao";
import { Calculator, Info, Search, Edit } from "lucide-react";
import { toast } from "sonner";

const contratoSchema = z.object({
  cliente_id: z.string().min(1, "Cliente é obrigatório"),
  banco_id: z.string().min(1, "Banco é obrigatório"),
  numero_contrato: z.string().optional(),
  tipo_operacao_bcb: z.string().min(1, "Tipo de operação BCB é obrigatório"),
  valor_divida: z.string().min(1, "Valor da dívida é obrigatório"),
  saldo_contabil: z.string().optional(),
  data_ultimo_pagamento: z.string().optional(),
  dias_atraso: z.string().optional(),
  meses_atraso: z.string().optional(),
  classificacao: z.enum(["C1", "C2", "C3", "C4", "C5"]).optional(),
  percentual_provisao: z.string().optional(),
  valor_provisao: z.string().optional(),
  proposta_acordo: z.string().optional(),
  // Novos campos para controle de escritório e acordos
  data_entrada_escritorio: z.string().optional(),
  tempo_escritorio: z.string().optional(),
  forma_pagamento: z.enum(["a_vista", "parcelado"]).optional(),
  numero_parcelas: z.string().optional(),
  valor_parcela: z.string().optional(),
  escritorio_banco_acordo: z.string().optional(),
  contato_acordo_nome: z.string().optional(),
  contato_acordo_telefone: z.string().optional(),
  acordo_final: z.string().optional(),
  reducao_divida: z.string().optional(),
  percentual_honorarios: z.enum(["10", "15", "20"]).optional(),
  valor_honorarios: z.string().optional(),
  situacao: z.string().optional(),
  observacoes: z.string().optional(),
});

type ContratoFormData = z.infer<typeof contratoSchema>;

interface ContratoFormProps {
  onSuccess?: () => void;
  contratoParaEditar?: string | null;
}

export function ContratoForm({ onSuccess, contratoParaEditar }: ContratoFormProps) {
  const { data: clientes } = useClientes();
  const { data: bancos } = useBancos();
  const { data: tiposOperacao } = useTiposOperacao();
  const createContrato = useCreateContrato();
  const updateContrato = useUpdateContrato();
  const { data: tabelaPerda } = useProvisaoPerda();
  const { data: tabelaIncorrida } = useProvisaoPerdaIncorrida();
  
  const [numeroContratoSearch, setNumeroContratoSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { data: contratoExistente } = useContratoByNumero(numeroContratoSearch);
  
  const form = useForm<ContratoFormData>({
    resolver: zodResolver(contratoSchema),
    defaultValues: {
      numero_contrato: "",
      tipo_operacao_bcb: "",
      valor_divida: "",
      saldo_contabil: "",
      data_ultimo_pagamento: "",
      dias_atraso: "0",
      meses_atraso: "0",
      percentual_provisao: "0",
      valor_provisao: "0",
      proposta_acordo: "0",
      // Novos campos
      data_entrada_escritorio: "",
      tempo_escritorio: "0",
      forma_pagamento: undefined,
      numero_parcelas: "",
      valor_parcela: "0",
      escritorio_banco_acordo: "",
      contato_acordo_nome: "",
      contato_acordo_telefone: "",
      acordo_final: "0",
      reducao_divida: "0",
      percentual_honorarios: undefined,
      valor_honorarios: "0",
      situacao: "Em análise",
      observacoes: "",
    },
  });

  const onSubmit = async (data: ContratoFormData) => {
    try {
      const contratoData = {
        cliente_id: data.cliente_id,
        banco_id: data.banco_id,
        numero_contrato: data.numero_contrato || null,
        tipo_operacao: null, // Campo legado, manter como null
        tipo_operacao_bcb: data.tipo_operacao_bcb,
        valor_divida: parseFloat(data.valor_divida),
        saldo_contabil: data.saldo_contabil ? parseFloat(data.saldo_contabil) : null,
        data_ultimo_pagamento: data.data_ultimo_pagamento || null,
        dias_atraso: data.dias_atraso ? parseInt(data.dias_atraso) : undefined,
        meses_atraso: data.meses_atraso ? parseFloat(data.meses_atraso) : undefined,
        classificacao: data.classificacao || null,
        percentual_provisao: data.percentual_provisao ? parseFloat(data.percentual_provisao) : undefined,
        valor_provisao: data.valor_provisao ? parseFloat(data.valor_provisao) : undefined,
        proposta_acordo: data.proposta_acordo ? parseFloat(data.proposta_acordo) : undefined,
        // Novos campos
        data_entrada_escritorio: data.data_entrada_escritorio || null,
        tempo_escritorio: data.tempo_escritorio ? parseInt(data.tempo_escritorio) : undefined,
        forma_pagamento: data.forma_pagamento || null,
        numero_parcelas: data.numero_parcelas ? parseInt(data.numero_parcelas) : null,
        valor_parcela: data.valor_parcela ? parseFloat(data.valor_parcela) : undefined,
        escritorio_banco_acordo: data.escritorio_banco_acordo || null,
        contato_acordo_nome: data.contato_acordo_nome || null,
        contato_acordo_telefone: data.contato_acordo_telefone || null,
        acordo_final: data.acordo_final ? parseFloat(data.acordo_final) : undefined,
        reducao_divida: data.reducao_divida ? parseFloat(data.reducao_divida) : undefined,
        percentual_honorarios: data.percentual_honorarios ? parseFloat(data.percentual_honorarios) : undefined,
        valor_honorarios: data.valor_honorarios ? parseFloat(data.valor_honorarios) : undefined,
        situacao: data.situacao || "Em análise",
        observacoes: data.observacoes || null,
      };

      if (isEditing && contratoExistente) {
        await updateContrato.mutateAsync({ ...contratoData, id: contratoExistente.id });
      } else {
        await createContrato.mutateAsync(contratoData);
      }
      
      handleReset();
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const calcularProvisaoAutomatica = () => {
    const valores = form.getValues();
    
    // Verificar se temos os dados essenciais
    if (!valores.valor_divida || !valores.classificacao) {
      toast.error("Para calcular a provisão, informe pelo menos o valor da dívida e a classificação");
      return;
    }

    if (!tabelaPerda || !tabelaIncorrida) {
      toast.error("Tabelas de referência não carregadas");
      return;
    }

    try {
      // Calcular dias de atraso se houver data do último pagamento
      let diasAtraso = valores.dias_atraso ? parseInt(valores.dias_atraso) : 0;
      if (valores.data_ultimo_pagamento && diasAtraso === 0) {
        diasAtraso = calcularDiasAtraso(valores.data_ultimo_pagamento);
      }

      // Determinar valor para cálculo (priorizar saldo contábil)
      const valorDivida = parseFloat(valores.valor_divida);
      const saldoContabil = valores.saldo_contabil ? parseFloat(valores.saldo_contabil) : null;
      const valorParaCalculo = saldoContabil || valorDivida;

      // Calcular provisão
      const resultado = calcularProvisao({
        valorDivida: valorParaCalculo,
        diasAtraso,
        classificacao: valores.classificacao as ClassificacaoRisco,
        tabelaPerda,
        tabelaIncorrida,
        criterioIncorrida: "Dias de Atraso",
      });

      const mesesAtraso = diasParaMeses(diasAtraso);
      const percentualProvisao = resultado.percentualProvisao;
      form.setValue("valor_provisao", resultado.valorProvisao.toFixed(2));
      
      // Calcular proposta de acordo (valor para cálculo - valor da provisão)
      const propostaAcordo = valorParaCalculo - resultado.valorProvisao;
      form.setValue("proposta_acordo", propostaAcordo.toFixed(2));

      toast.success(`Provisão calculada: ${percentualProvisao.toFixed(2)}% (R$ ${resultado.valorProvisao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`);
    } catch (error) {
      toast.error("Erro ao calcular provisão");
      console.error(error);
    }
  };

  const buscarContrato = () => {
    if (!numeroContratoSearch.trim()) {
      toast.error("Digite o número do contrato para buscar");
      return;
    }
    // A busca é automática através do hook useContratoByNumero
  };

  const carregarContratoParaEdicao = () => {
    if (!contratoExistente) {
      toast.error("Contrato não encontrado");
      return;
    }

    setIsEditing(true);
    
    // Preencher formulário com dados do contrato existente
    form.reset({
      cliente_id: contratoExistente.cliente_id,
      banco_id: contratoExistente.banco_id,
      numero_contrato: contratoExistente.numero_contrato || "",
      tipo_operacao_bcb: (contratoExistente as any).tipo_operacao_bcb || "",
      valor_divida: contratoExistente.valor_divida.toString(),
      saldo_contabil: contratoExistente.saldo_contabil?.toString() || "",
      data_ultimo_pagamento: contratoExistente.data_ultimo_pagamento || "",
      dias_atraso: contratoExistente.dias_atraso?.toString() || "0",
      meses_atraso: contratoExistente.meses_atraso?.toString() || "0",
      classificacao: contratoExistente.classificacao || undefined,
      percentual_provisao: contratoExistente.percentual_provisao?.toString() || "0",
      valor_provisao: contratoExistente.valor_provisao?.toString() || "0",
      proposta_acordo: contratoExistente.proposta_acordo?.toString() || "0",
      // Novos campos (usando any temporariamente até os tipos serem atualizados)
      data_entrada_escritorio: (contratoExistente as any).data_entrada_escritorio || "",
      tempo_escritorio: (contratoExistente as any).tempo_escritorio?.toString() || "0",
      forma_pagamento: (contratoExistente as any).forma_pagamento || undefined,
      numero_parcelas: (contratoExistente as any).numero_parcelas?.toString() || "",
      valor_parcela: (contratoExistente as any).valor_parcela?.toString() || "0",
      escritorio_banco_acordo: (contratoExistente as any).escritorio_banco_acordo || "",
      contato_acordo_nome: (contratoExistente as any).contato_acordo_nome || "",
      contato_acordo_telefone: (contratoExistente as any).contato_acordo_telefone || "",
      acordo_final: contratoExistente.acordo_final?.toString() || "0",
      reducao_divida: (contratoExistente as any).reducao_divida?.toString() || "0",
      percentual_honorarios: (contratoExistente as any).percentual_honorarios?.toString() || undefined,
      valor_honorarios: (contratoExistente as any).valor_honorarios?.toString() || "0",
      situacao: contratoExistente.situacao || "Em análise",
      observacoes: contratoExistente.observacoes || "",
    });

    toast.success(`Contrato ${contratoExistente.numero_contrato} carregado para edição`);
  };

  const handleReset = () => {
    setIsEditing(false);
    setNumeroContratoSearch("");
    form.reset();
  };

  // Calcular automaticamente dias e meses de atraso quando data do último pagamento mudar
  const dataUltimoPagamento = form.watch("data_ultimo_pagamento");
  const tipoOperacaoBcb = form.watch("tipo_operacao_bcb");
  
  // Buscar dados do tipo de operação selecionado
  const { data: tipoOperacaoSelecionado } = useGetTipoOperacaoById(tipoOperacaoBcb);
  
  // Watchers para cálculos automáticos dos novos campos
  const dataEntradaEscritorio = form.watch("data_entrada_escritorio");
  const formaPagamento = form.watch("forma_pagamento");
  const numeroParcelas = form.watch("numero_parcelas");
  const propostaAcordo = form.watch("proposta_acordo");
  const acordoFinal = form.watch("acordo_final");
  const valorDivida = form.watch("valor_divida");
  const reducaoDivida = form.watch("reducao_divida");
  const percentualHonorarios = form.watch("percentual_honorarios");
  
  useEffect(() => {
    if (dataUltimoPagamento) {
      try {
        const diasAtraso = calcularDiasAtraso(dataUltimoPagamento);
        const mesesAtraso = diasParaMeses(diasAtraso);
        
        form.setValue("dias_atraso", diasAtraso.toString());
        form.setValue("meses_atraso", mesesAtraso.toString());

        // Determinar qual anexo usar baseado na regra dos 90 dias
        const anexoReferencia = diasAtraso >= 90 ? "Anexo I (Perdas Incorridas)" : "Anexo II (Perdas Esperadas)";
        toast.info(`Referência automática: ${anexoReferencia} - ${diasAtraso} dias de atraso`);
      } catch (error) {
        console.error("Erro ao calcular atraso:", error);
      }
    } else {
      // Limpar campos quando data for removida
      form.setValue("dias_atraso", "0");
      form.setValue("meses_atraso", "0");
    }
  }, [dataUltimoPagamento, form]);

  // Atualizar classificação automaticamente baseada no tipo de operação BCB
  useEffect(() => {
    if (tipoOperacaoSelecionado) {
      // A classificação é definida pela carteira do tipo de operação
      const classificacao = tipoOperacaoSelecionado.carteira as ClassificacaoRisco;
      form.setValue("classificacao", classificacao);
      
      toast.info(`Classificação automaticamente definida como ${classificacao} baseada no tipo de operação selecionado`);
    }
  }, [tipoOperacaoSelecionado, form]);

  // Calcular tempo no escritório automaticamente
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
    } else {
      form.setValue("reducao_divida", "0");
    }
  }, [valorDivida, acordoFinal, form]);

  // Calcular honorários de êxito automaticamente
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
    } else {
      form.setValue("valor_honorarios", "0");
    }
  }, [percentualHonorarios, reducaoDivida, form]);

  // Carregar contrato automaticamente quando contratoParaEditar muda
  useEffect(() => {
    if (contratoParaEditar) {
      setNumeroContratoSearch(contratoParaEditar);
    }
  }, [contratoParaEditar]);

  // Carregar contrato para edição quando contratoExistente é encontrado e contratoParaEditar está definido
  useEffect(() => {
    if (contratoExistente && contratoParaEditar && !isEditing) {
      carregarContratoParaEdicao();
    }
  }, [contratoExistente, contratoParaEditar, isEditing]);

  return (
    <div className="space-y-4">
      {/* Buscar contrato existente para edição */}
      <Alert>
        <Search className="h-4 w-4" />
        <AlertDescription>
          <strong>Editar contrato existente:</strong> Digite o número do contrato para buscar e editar os dados cadastrados.
        </AlertDescription>
      </Alert>

      <div className="flex gap-2 p-4 border rounded-lg bg-muted/50">
        <div className="flex-1">
          <Input
            placeholder="Digite o número do contrato para buscar..."
            value={numeroContratoSearch}
            onChange={(e) => setNumeroContratoSearch(e.target.value)}
          />
        </div>
        <Button 
          type="button" 
          variant="outline" 
          onClick={buscarContrato}
          disabled={!numeroContratoSearch.trim()}
        >
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
        {contratoExistente && (
          <Button 
            type="button" 
            variant="default" 
            onClick={carregarContratoParaEdicao}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
        {isEditing && (
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleReset}
          >
            Novo
          </Button>
        )}
      </div>

      {contratoExistente && !isEditing && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Contrato encontrado: <strong>{contratoExistente.numero_contrato}</strong> - 
            Cliente: <strong>{contratoExistente.clientes?.nome}</strong> - 
            Banco: <strong>{contratoExistente.bancos?.nome}</strong>.
            Clique em "Editar" para modificar os dados.
          </AlertDescription>
        </Alert>
      )}

      {/* Alerta sobre automações */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Dados essenciais para automação:</strong> Informe a classificação C1-C5 (conforme contrato original) 
          e os dias de atraso. O sistema calculará automaticamente a provisão conforme BCB 352/2023 e 4966/2021.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cliente_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um banco" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bancos?.map((banco) => (
                      <SelectItem key={banco.id} value={banco.id}>
                        {banco.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="numero_contrato"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do Contrato</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipo_operacao_bcb"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Operação BCB *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de operação" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tiposOperacao?.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        {tipo.carteira} - {tipo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="valor_divida"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da Dívida *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="saldo_contabil"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Saldo Contábil</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="data_ultimo_pagamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Último Pagamento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="dias_atraso"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dias em Atraso</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="meses_atraso"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meses em Atraso</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="classificacao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Classificação (conforme contrato) - Preenchida Automaticamente *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!!tipoOperacaoSelecionado}>
                  <FormControl>
                    <SelectTrigger className={!!tipoOperacaoSelecionado ? "bg-muted" : ""}>
                      <SelectValue placeholder={tipoOperacaoSelecionado ? `${field.value} - Definido pelo tipo de operação` : "Selecione o tipo de operação BCB acima"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="C1">C1 - Risco Mínimo</SelectItem>
                    <SelectItem value="C2">C2 - Risco Pequeno</SelectItem>
                    <SelectItem value="C3">C3 - Risco Médio</SelectItem>
                    <SelectItem value="C4">C4 - Risco Alto</SelectItem>
                    <SelectItem value="C5">C5 - Risco Máximo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Botão para Cálculo Automático */}
        <div className="flex justify-center py-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={calcularProvisaoAutomatica}
            disabled={!tabelaPerda || !tabelaIncorrida}
            className="flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Calcular Provisão Automaticamente
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="percentual_provisao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Percentual Provisão (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="valor_provisao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Provisão</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="proposta_acordo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proposta de Acordo</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* SEÇÃO: Controle de Escritório */}
        <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
          <h3 className="text-lg font-semibold">Controle de Escritório</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="data_entrada_escritorio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Entrada no Escritório</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tempo_escritorio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo no Escritório (dias) - Calculado Automaticamente</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* SEÇÃO: Acordo e Pagamento */}
        <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
          <h3 className="text-lg font-semibold">Dados do Acordo</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="forma_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma" />
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

            <FormField
              control={form.control}
              name="acordo_final"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Acordo</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="numero_parcelas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Parcelas (máx. 24)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max="24" 
                      placeholder="1" 
                      {...field} 
                      disabled={form.watch("forma_pagamento") !== "parcelado"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="valor_parcela"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor da Parcela - Calculado Automaticamente</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="escritorio_banco_acordo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Escritório/Banco do Acordo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do escritório ou banco" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contato_acordo_nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Contato</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do responsável" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contato_acordo_telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone do Contato</FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* SEÇÃO: Valores Finais e Honorários */}
        <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
          <h3 className="text-lg font-semibold">Valores Finais e Honorários</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="reducao_divida"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Redução da Dívida - Calculado Automaticamente</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="percentual_honorarios"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Percentual de Honorários de Êxito</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o percentual" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="15">15%</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="valor_honorarios"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor dos Honorários - Calculado Automaticamente</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="situacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Situação</FormLabel>
              <FormControl>
                <Input placeholder="Em análise" {...field} />
              </FormControl>
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
                <Textarea placeholder="Observações adicionais..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button 
            type="submit" 
            disabled={createContrato.isPending || updateContrato.isPending}
          >
            <Calculator className="mr-2 h-4 w-4" />
            {isEditing 
              ? (updateContrato.isPending ? "Atualizando..." : "Atualizar Contrato")
              : (createContrato.isPending ? "Calculando e Cadastrando..." : "Cadastrar com Automação")
            }
          </Button>
          {isEditing && (
            <Button 
              type="button" 
              variant="outline"
              onClick={handleReset}
            >
              Cancelar Edição
            </Button>
          )}
        </div>
      </form>
    </Form>
    </div>
  );
}