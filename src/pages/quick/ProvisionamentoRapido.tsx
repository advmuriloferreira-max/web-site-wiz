import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calculator, Download, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBancos } from "@/hooks/useBancos";
import { useTiposOperacao } from "@/hooks/useTiposOperacao";
import { useClientes } from "@/hooks/useClientes";
import { useContratosByCliente } from "@/hooks/useContratosByCliente";
import { calcularProvisaoConformeBCB, determinarEstagioRisco } from "@/lib/calculoProvisaoConformeBCB";
import { gerarRelatorioPDF } from "@/lib/gerarRelatorioPDF";
import { useAuth } from "@/hooks/useAuth";

// Função auxiliar para calcular dias de atraso
const calcularDiasAtraso = (dataUltimoPagamento: string): number => {
  if (!dataUltimoPagamento) return 0;
  const hoje = new Date();
  const dataUltimo = new Date(dataUltimoPagamento);
  const diffTime = Math.abs(hoje.getTime() - dataUltimo.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Função auxiliar para converter dias em meses
const diasParaMeses = (dias: number): number => {
  return dias / 30;
};

export default function ProvisionamentoRapido() {
  const navigate = useNavigate();
  const { data: bancos } = useBancos();
  const { data: tiposOperacao } = useTiposOperacao();
  const { usuarioEscritorio } = useAuth();
  
  // Campos do formulário (mesmos do ContratoForm)
  const [bancoId, setBancoId] = useState("");
  const [tipoOperacaoBcb, setTipoOperacaoBcb] = useState("");
  const [saldoContabil, setSaldoContabil] = useState("");
  const [dataUltimoPagamento, setDataUltimoPagamento] = useState("");
  const [numeroContrato, setNumeroContrato] = useState("");
  const [isReestruturado, setIsReestruturado] = useState(false);
  const [dataReestruturacao, setDataReestruturacao] = useState("");
  const [observacoes, setObservacoes] = useState("");
  
  const [resultado, setResultado] = useState<any>(null);
  
  // States para o modal de salvamento
  const [isModalSalvarOpen, setIsModalSalvarOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [contratoSelecionado, setContratoSelecionado] = useState("");

  const { data: clientes } = useClientes();
  const { data: contratos } = useContratosByCliente(clienteSelecionado || null);

  const calcular = async () => {
    if (!saldoContabil || !dataUltimoPagamento || !tipoOperacaoBcb || !bancoId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const valorDivida = parseFloat(saldoContabil.replace(/\D/g, "")) / 100;
      const diasAtraso = calcularDiasAtraso(dataUltimoPagamento);
      const mesesAtraso = diasParaMeses(diasAtraso);

      // Buscar tipo de operação para obter carteira
      const tipoOp = tiposOperacao?.find(t => t.id === tipoOperacaoBcb);
      
      // Determinar estágio de risco
      const estagio = determinarEstagioRisco(
        diasAtraso,
        isReestruturado,
        isReestruturado ? dataReestruturacao : undefined
      );
      
      // Calcular provisão usando a função conforme BCB
      const provisao = await calcularProvisaoConformeBCB({
        valorDivida,
        diasAtraso,
        estagio,
        tipoOperacao: {
          id: tipoOp?.id || "",
          nome: tipoOp?.nome || "",
          descricao: tipoOp?.descricao || "",
          carteira: tipoOp?.carteira || "C1",
        },
        isReestruturado,
        dataReestruturacao: isReestruturado ? dataReestruturacao : undefined,
      });

      // Buscar nome do banco
      const banco = bancos?.find(b => b.id === bancoId);

      setResultado({
        valorDivida,
        diasAtraso,
        mesesAtraso,
        estagio: provisao.estagio,
        classificacao: tipoOp?.carteira || "C1",
        percentualProvisao: provisao.percentualProvisao,
        valorProvisao: provisao.valorProvisao,
        banco: banco?.nome || "Não informado",
        tipoOperacao: tipoOp?.nome || "Não informado",
        numeroContrato,
        isReestruturado,
        observacoes,
      });

      toast.success("Provisão calculada com sucesso!");
    } catch (error) {
      console.error("Erro ao calcular:", error);
      toast.error("Erro ao calcular a provisão");
    }
  };

  const exportarPDF = () => {
    if (!resultado) return;

    try {
      gerarRelatorioPDF({
        tipo: "provisionamento",
        cliente: {
          nome: "Cliente Não Cadastrado",
          cpf_cnpj: undefined,
        },
        contrato: {
          numero: resultado.numeroContrato,
          banco: resultado.banco,
        },
        escritorio: {
          nome: usuarioEscritorio?.escritorio?.nome || "Escritório",
          oab: undefined,
        },
        resultado: resultado,
        dataAnalise: new Date(),
      });
      
      toast.success("Relatório PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatório PDF");
    }
  };

  const salvarEmCliente = () => {
    if (!resultado) {
      toast.error("Realize o cálculo primeiro");
      return;
    }
    setIsModalSalvarOpen(true);
  };

  const salvarAnalise = async () => {
    if (!contratoSelecionado) {
      toast.error("Selecione um contrato");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("analises_provisionamento")
        .insert({
          contrato_id: contratoSelecionado,
          escritorio_id: usuarioEscritorio?.escritorio_id,
          usuario_id: usuarioEscritorio?.id,
          valor_divida: resultado.valorDivida,
          dias_atraso: resultado.diasAtraso,
          meses_atraso: resultado.mesesAtraso,
          classificacao_risco: `Estágio ${resultado.estagio}`,
          percentual_provisao: resultado.percentualProvisao,
          valor_provisao: resultado.valorProvisao,
          metodologia: "Conforme BCB",
          base_calculo: "Saldo Contábil",
          data_calculo: new Date().toISOString(),
          data_ultimo_pagamento: dataUltimoPagamento,
          observacoes: observacoes,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Análise salva com sucesso!");
      setIsModalSalvarOpen(false);
      navigate(`/app/contratos/${contratoSelecionado}`);
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast.error(`Erro ao salvar análise: ${error.message}`);
    }
  };

  const novaAnalise = () => {
    setBancoId("");
    setTipoOperacaoBcb("");
    setSaldoContabil("");
    setDataUltimoPagamento("");
    setNumeroContrato("");
    setIsReestruturado(false);
    setDataReestruturacao("");
    setObservacoes("");
    setResultado(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/app")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar ao Dashboard
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Calculator className="h-8 w-8 text-orange-600" />
          Gestão de Passivo Bancário
        </h1>
        <p className="text-muted-foreground mt-2">
          Calcule a provisão bancária sem necessidade de cadastro prévio
        </p>
      </div>

      {!resultado ? (
        <Card>
          <CardHeader>
            <CardTitle>Dados do Contrato</CardTitle>
            <CardDescription>
              Preencha as informações conforme seu sistema atual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="banco">Banco *</Label>
              <Select value={bancoId} onValueChange={setBancoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o banco..." />
                </SelectTrigger>
                <SelectContent>
                  {bancos?.map((banco) => (
                    <SelectItem key={banco.id} value={banco.id}>
                      {banco.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="numero">Número do Contrato (opcional)</Label>
              <Input
                id="numero"
                type="text"
                placeholder="Ex: 123456789"
                value={numeroContrato}
                onChange={(e) => setNumeroContrato(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo de Operação BCB *</Label>
              <Select value={tipoOperacaoBcb} onValueChange={setTipoOperacaoBcb}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de operação..." />
                </SelectTrigger>
                <SelectContent>
                  {tiposOperacao?.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nome} ({tipo.carteira})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Define a classificação de risco (C1 a C5)
              </p>
            </div>

            <div>
              <Label htmlFor="saldo">Saldo Contábil da Dívida *</Label>
              <Input
                id="saldo"
                type="text"
                placeholder="R$ 0,00"
                value={saldoContabil}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  const formatted = new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(parseFloat(value) / 100 || 0);
                  setSaldoContabil(formatted);
                }}
              />
            </div>

            <div>
              <Label htmlFor="data">Data do Último Pagamento *</Label>
              <Input
                id="data"
                type="date"
                value={dataUltimoPagamento}
                onChange={(e) => setDataUltimoPagamento(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Sistema calculará dias e meses de atraso automaticamente
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reestruturado"
                  checked={isReestruturado}
                  onCheckedChange={(checked) => setIsReestruturado(checked as boolean)}
                />
                <Label htmlFor="reestruturado" className="font-normal">
                  Contrato Reestruturado
                </Label>
              </div>

              {isReestruturado && (
                <div>
                  <Label htmlFor="dataReest">Data da Reestruturação</Label>
                  <Input
                    id="dataReest"
                    type="date"
                    value={dataReestruturacao}
                    onChange={(e) => setDataReestruturacao(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="obs">Observações</Label>
              <Textarea
                id="obs"
                placeholder="Informações adicionais sobre o contrato..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={calcular} className="w-full" size="lg">
              <Calculator className="mr-2 h-4 w-4" />
              Calcular Provisão
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-700">
                ✅ Provisão Calculada com Sucesso!
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados do Contrato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Banco</p>
                  <p className="font-semibold">{resultado.banco}</p>
                </div>
                {resultado.numeroContrato && (
                  <div>
                    <p className="text-muted-foreground">Nº Contrato</p>
                    <p className="font-semibold">{resultado.numeroContrato}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-muted-foreground">Tipo de Operação</p>
                <p className="font-semibold">{resultado.tipoOperacao}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resultado da Provisão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Contábil</p>
                  <p className="text-lg font-semibold">{formatCurrency(resultado.valorDivida)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dias de Atraso</p>
                  <p className="text-lg font-semibold">
                    {resultado.diasAtraso} dias ({resultado.mesesAtraso.toFixed(1)} meses)
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Classificação de Risco</p>
                  <p className="text-2xl font-bold text-orange-600">{resultado.classificacao}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Percentual de Provisão</p>
                  <p className="text-2xl font-bold">{resultado.percentualProvisao.toFixed(2)}%</p>
                </div>
              </div>

              <Separator />

              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Valor da Provisão</p>
                <p className="text-3xl font-bold text-orange-600">
                  {formatCurrency(resultado.valorProvisao)}
                </p>
              </div>

              {resultado.isReestruturado && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Contrato reestruturado - Provisão ajustada conforme regulamentação
                  </p>
                </div>
              )}

              {resultado.observacoes && (
                <div>
                  <p className="text-sm text-muted-foreground">Observações</p>
                  <p className="text-sm">{resultado.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>O que fazer agora?</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button onClick={exportarPDF} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
              <Button onClick={salvarEmCliente} variant="outline">
                <Save className="mr-2 h-4 w-4" />
                Salvar em Cliente
              </Button>
              <Button onClick={novaAnalise} variant="outline">
                <Calculator className="mr-2 h-4 w-4" />
                Nova Análise
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground text-center">
          ℹ️ Mesmos campos e cálculos do sistema completo • Sem necessidade de cadastro
        </p>
      </div>

      <Dialog open={isModalSalvarOpen} onOpenChange={setIsModalSalvarOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Salvar Análise em Cliente</DialogTitle>
            <DialogDescription>
              Selecione o cliente e contrato para salvar esta análise
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label>Cliente *</Label>
              <Select value={clienteSelecionado} onValueChange={setClienteSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clientes?.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {clienteSelecionado && (
              <div>
                <Label>Contrato *</Label>
                <Select value={contratoSelecionado} onValueChange={setContratoSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o contrato..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contratos?.map((contrato) => (
                      <SelectItem key={contrato.id} value={contrato.id}>
                        {contrato.numero_contrato || `Contrato ${contrato.id.slice(0, 8)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  variant="link"
                  className="mt-2 p-0 h-auto"
                  onClick={() => navigate(`/app/clientes/${clienteSelecionado}/novo-contrato`)}
                >
                  + Criar novo contrato para este cliente
                </Button>
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsModalSalvarOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={salvarAnalise}
                disabled={!contratoSelecionado}
              >
                Salvar Análise
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
