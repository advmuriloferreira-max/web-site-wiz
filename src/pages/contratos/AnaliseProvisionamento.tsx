import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, FileText, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useContratoById } from "@/hooks/useContratoById";
import { supabase } from "@/integrations/supabase/client";
import { calcularProvisaoConformeBCB } from "@/lib/calculoProvisaoConformeBCB";

export default function AnaliseProvisionamento() {
  const { id: contratoId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contrato, isLoading } = useContratoById(contratoId!);

  const [valorDivida, setValorDivida] = useState<string>("");
  const [dataUltimoPagamento, setDataUltimoPagamento] = useState<string>("");
  const [observacoes, setObservacoes] = useState<string>("");
  const [calculando, setCalculando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Resultado dos cálculos
  const [resultado, setResultado] = useState<{
    diasAtraso: number;
    mesesAtraso: number;
    classificacaoRisco: string;
    percentualProvisao: number;
    valorProvisao: number;
  } | null>(null);

  useEffect(() => {
    if (contrato) {
      // Preencher com dados do contrato se disponíveis
      if (contrato.valor_contrato) {
        setValorDivida(contrato.valor_contrato.toString());
      }
      if (contrato.data_ultimo_pagamento) {
        setDataUltimoPagamento(contrato.data_ultimo_pagamento);
      }
    }
  }, [contrato]);

  const calcularProvisao = async () => {
    if (!valorDivida || !dataUltimoPagamento) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setCalculando(true);

    try {
      const valor = parseFloat(valorDivida);
      const dataUltimoPgto = new Date(dataUltimoPagamento);
      const hoje = new Date();

      // Calcular dias e meses de atraso
      const diffTime = Math.abs(hoje.getTime() - dataUltimoPgto.getTime());
      const diasAtraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const mesesAtraso = parseFloat((diasAtraso / 30).toFixed(2));

      // Usar a função do sistema para calcular provisão conforme BCB
      const resultadoCalculo = await calcularProvisaoConformeBCB({
        valorDivida: valor,
        diasAtraso,
        estagio: diasAtraso <= 30 ? 1 : diasAtraso <= 90 ? 2 : 3,
        contratoId: contratoId,
      });

      setResultado({
        diasAtraso,
        mesesAtraso,
        classificacaoRisco: `Estágio ${resultadoCalculo.estagio}`,
        percentualProvisao: resultadoCalculo.percentualProvisao,
        valorProvisao: resultadoCalculo.valorProvisao,
      });

      toast.success("Provisão calculada com sucesso!");
    } catch (error) {
      console.error("Erro ao calcular:", error);
      toast.error("Erro ao calcular a provisão");
    } finally {
      setCalculando(false);
    }
  };

  const salvarAnalise = async () => {
    if (!resultado || !contratoId) {
      toast.error("Execute o cálculo antes de salvar");
      return;
    }

    setSalvando(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: escritorioData } = await supabase
        .from("usuarios_escritorio")
        .select("escritorio_id")
        .eq("user_id", userData.user?.id)
        .single();

      const { error } = await supabase.from("analises_provisionamento").insert({
        escritorio_id: escritorioData?.escritorio_id,
        contrato_id: contratoId,
        valor_divida: parseFloat(valorDivida),
        data_ultimo_pagamento: dataUltimoPagamento,
        dias_atraso: resultado.diasAtraso,
        meses_atraso: resultado.mesesAtraso,
        percentual_provisao: resultado.percentualProvisao,
        valor_provisao: resultado.valorProvisao,
        classificacao_risco: resultado.classificacaoRisco,
        usuario_id: userData.user?.id,
        metodologia: "Resolução 4966 BACEN e 352 CMN",
        base_calculo: `Dias de atraso: ${resultado.diasAtraso}, Meses: ${resultado.mesesAtraso}`,
        observacoes,
      });

      if (error) throw error;

      toast.success("Análise de provisionamento salva com sucesso!");
      navigate(-1);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar a análise");
    } finally {
      setSalvando(false);
    }
  };

  const gerarRelatorio = () => {
    toast.info("Gerando relatório PDF...");
    // TODO: Implementar geração de PDF
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Contrato não encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Análise de Provisionamento</h1>
            <p className="text-muted-foreground">
              Conforme Resolução 4966 BACEN e 352 CMN
            </p>
          </div>
        </div>
        {resultado && (
          <Button onClick={gerarRelatorio} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Gerar PDF
          </Button>
        )}
      </div>

      {/* Informações do Contrato */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Contrato</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Cliente</Label>
            <p className="font-medium">{contrato.clientes?.nome}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Banco</Label>
            <p className="font-medium">{contrato.bancos?.nome || "-"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Número do Contrato</Label>
            <p className="font-medium">{contrato.numero_contrato || "-"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Situação</Label>
            <p className="font-medium">{contrato.situacao || "-"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Entrada */}
      <Card>
        <CardHeader>
          <CardTitle>Dados para Cálculo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valorDivida">
                Valor da Dívida <span className="text-destructive">*</span>
              </Label>
              <Input
                id="valorDivida"
                type="number"
                step="0.01"
                value={valorDivida}
                onChange={(e) => setValorDivida(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataUltimoPagamento">
                Data do Último Pagamento <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dataUltimoPagamento"
                type="date"
                value={dataUltimoPagamento}
                onChange={(e) => setDataUltimoPagamento(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informações adicionais sobre a análise..."
              rows={3}
            />
          </div>

          <Button
            onClick={calcularProvisao}
            disabled={calculando || !valorDivida || !dataUltimoPagamento}
            className="w-full md:w-auto"
          >
            {calculando ? "Calculando..." : "Calcular Provisão"}
          </Button>
        </CardContent>
      </Card>

      {/* Resultado */}
      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado da Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Dias de Atraso</Label>
                <p className="text-2xl font-bold">{resultado.diasAtraso}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">Meses de Atraso</Label>
                <p className="text-2xl font-bold">{resultado.mesesAtraso}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">Classificação de Risco</Label>
                <p className="text-2xl font-bold text-primary">
                  {resultado.classificacaoRisco}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">Percentual de Provisão</Label>
                <p className="text-2xl font-bold">
                  {resultado.percentualProvisao.toFixed(2)}%
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">Valor da Provisão</Label>
                <p className="text-2xl font-bold text-primary">
                  R$ {resultado.valorProvisao.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">Metodologia</Label>
                <p className="text-sm font-medium">Resolução 4966 BACEN</p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={salvarAnalise}
                disabled={salvando}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {salvando ? "Salvando..." : "Salvar Análise"}
              </Button>
              <Button onClick={gerarRelatorio} variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Gerar Relatório PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
