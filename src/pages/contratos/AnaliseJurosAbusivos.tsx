import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, FileText, Save, Calculator, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContratoById } from "@/hooks/useContratoById";
import { useModalidadesBacenJuros } from "@/hooks/useModalidadesBacenJuros";
import { supabase } from "@/integrations/supabase/client";
import { calcularTaxaEfetiva, compararComTaxaBacen } from "@/lib/calculoTaxaEfetiva";
import { consultarTaxaBacenCSV } from "@/lib/consultarTaxaBacenCSV";
import { Badge } from "@/components/ui/badge";

export default function AnaliseJurosAbusivos() {
  const { id: contratoId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contrato, isLoading } = useContratoById(contratoId!);
  const { data: modalidades } = useModalidadesBacenJuros();

  const [valorFinanciado, setValorFinanciado] = useState<string>("");
  const [valorParcela, setValorParcela] = useState<string>("");
  const [numeroParcelas, setNumeroParcelas] = useState<string>("");
  const [taxaContratual, setTaxaContratual] = useState<string>("");
  const [modalidadeId, setModalidadeId] = useState<string>("");
  const [dataReferencia, setDataReferencia] = useState<string>("");
  const [observacoes, setObservacoes] = useState<string>("");
  
  const [calculando, setCalculando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Resultado dos cálculos
  const [resultado, setResultado] = useState<{
    taxaRealMensal: number;
    taxaRealAnual: number;
    taxaMediaBacen: number;
    diferencaAbsoluta: number;
    diferencaPercentual: number;
    abusividadeDetectada: boolean;
    grauAbusividade: string;
    valorIndevido: number;
  } | null>(null);

  useEffect(() => {
    if (contrato) {
      // Preencher com dados do contrato se disponíveis
      if (contrato.valor_financiado) {
        setValorFinanciado(contrato.valor_financiado.toString());
      }
      if (contrato.valor_parcela) {
        setValorParcela(contrato.valor_parcela.toString());
      }
      if (contrato.numero_parcelas) {
        setNumeroParcelas(contrato.numero_parcelas.toString());
      }
      if (contrato.taxa_juros_contratual) {
        setTaxaContratual(contrato.taxa_juros_contratual.toString());
      }
      if (contrato.modalidade_bacen_id) {
        setModalidadeId(contrato.modalidade_bacen_id);
      }
      if (contrato.data_assinatura) {
        setDataReferencia(contrato.data_assinatura);
      }
    }
  }, [contrato]);

  const calcularAnalise = async () => {
    if (!valorFinanciado || !valorParcela || !numeroParcelas || !modalidadeId || !dataReferencia) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setCalculando(true);

    try {
      const vf = parseFloat(valorFinanciado);
      const vp = parseFloat(valorParcela);
      const np = parseInt(numeroParcelas);
      const tc = taxaContratual ? parseFloat(taxaContratual) : undefined;

      // 1. Calcular taxa real aplicada (método iterativo)
      const calculoTaxa = calcularTaxaEfetiva({
        valorFinanciado: vf,
        valorParcela: vp,
        numeroParcelas: np,
        taxaJurosContratual: tc,
      });

      toast.info("Buscando taxa BACEN...");

      // 2. Buscar taxa média BACEN
      const taxaBacen = await consultarTaxaBacenCSV(modalidadeId, dataReferencia);

      // 3. Comparar e identificar abusividade
      const comparacao = compararComTaxaBacen(
        calculoTaxa.taxaEfetivaMensal,
        taxaBacen.taxa_mensal
      );

      // 4. Calcular valor cobrado indevidamente se houver abusividade
      let valorIndevido = 0;
      if (comparacao.acimaMercado) {
        const totalPagoReal = vp * np;
        // Recalcular o que deveria ser pago com a taxa do mercado
        const parcelaMercado = vf * (taxaBacen.taxa_mensal/100 * Math.pow(1 + taxaBacen.taxa_mensal/100, np)) / 
                               (Math.pow(1 + taxaBacen.taxa_mensal/100, np) - 1);
        const totalPagoMercado = parcelaMercado * np;
        valorIndevido = Math.max(0, totalPagoReal - totalPagoMercado);
      }

      setResultado({
        taxaRealMensal: calculoTaxa.taxaEfetivaMensal,
        taxaRealAnual: calculoTaxa.taxaEfetivaAnual,
        taxaMediaBacen: taxaBacen.taxa_mensal,
        diferencaAbsoluta: comparacao.diferenca,
        diferencaPercentual: comparacao.percentualDiferenca,
        abusividadeDetectada: comparacao.acimaMercado && comparacao.percentualDiferenca > 20,
        grauAbusividade: comparacao.grauAbusividade,
        valorIndevido,
      });

      toast.success("Análise concluída!");
    } catch (error: any) {
      console.error("Erro ao calcular:", error);
      toast.error(error.message || "Erro ao realizar a análise");
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

      const { error } = await supabase.from("analises_juros_abusivos").insert({
        escritorio_id: escritorioData?.escritorio_id,
        contrato_id: contratoId,
        modalidade_bacen_id: modalidadeId,
        valor_financiado: parseFloat(valorFinanciado),
        valor_parcela: parseFloat(valorParcela),
        numero_parcelas: parseInt(numeroParcelas),
        taxa_contratual: taxaContratual ? parseFloat(taxaContratual) : null,
        data_referencia: dataReferencia,
        taxa_real_aplicada: resultado.taxaRealMensal,
        taxa_media_bacen: resultado.taxaMediaBacen,
        diferenca_absoluta: resultado.diferencaAbsoluta,
        diferenca_percentual: resultado.diferencaPercentual,
        abusividade_detectada: resultado.abusividadeDetectada,
        usuario_id: userData.user?.id,
        metodologia: "Comparação com Séries Temporais BACEN",
        fonte_taxa_bacen: "CSV Local",
        observacoes,
      });

      if (error) throw error;

      toast.success("Análise de juros salva com sucesso!");
      navigate(-1);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar a análise");
    } finally {
      setSalvando(false);
    }
  };

  const gerarRelatorio = () => {
    toast.info("Gerando relatório judicial em PDF...");
    // TODO: Implementar geração de relatório judicial
  };

  const getAbusividadeColor = (grau: string) => {
    switch (grau) {
      case "Muito Grave": return "bg-destructive text-destructive-foreground";
      case "Grave": return "bg-orange-500 text-white";
      case "Moderado": return "bg-yellow-500 text-black";
      case "Leve": return "bg-blue-500 text-white";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <h1 className="text-3xl font-bold">Análise de Juros Abusivos</h1>
            <p className="text-muted-foreground">
              Comparação com taxas médias do BACEN
            </p>
          </div>
        </div>
        {resultado && (
          <Button onClick={gerarRelatorio} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Relatório Judicial
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
            <Label className="text-muted-foreground">Data Assinatura</Label>
            <p className="font-medium">
              {contrato.data_assinatura 
                ? new Date(contrato.data_assinatura).toLocaleDateString("pt-BR")
                : "-"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Entrada */}
      <Card>
        <CardHeader>
          <CardTitle>Dados para Análise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valorFinanciado">
                Valor Financiado <span className="text-destructive">*</span>
              </Label>
              <Input
                id="valorFinanciado"
                type="number"
                step="0.01"
                value={valorFinanciado}
                onChange={(e) => setValorFinanciado(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorParcela">
                Valor da Parcela <span className="text-destructive">*</span>
              </Label>
              <Input
                id="valorParcela"
                type="number"
                step="0.01"
                value={valorParcela}
                onChange={(e) => setValorParcela(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroParcelas">
                Número de Parcelas <span className="text-destructive">*</span>
              </Label>
              <Input
                id="numeroParcelas"
                type="number"
                value={numeroParcelas}
                onChange={(e) => setNumeroParcelas(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxaContratual">
                Taxa Contratual (% a.m.)
              </Label>
              <Input
                id="taxaContratual"
                type="number"
                step="0.01"
                value={taxaContratual}
                onChange={(e) => setTaxaContratual(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                Opcional - será calculada se não informada
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataReferencia">
                Data de Referência <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dataReferencia"
                type="date"
                value={dataReferencia}
                onChange={(e) => setDataReferencia(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modalidade">
              Modalidade BACEN <span className="text-destructive">*</span>
            </Label>
            <Select value={modalidadeId} onValueChange={setModalidadeId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a modalidade..." />
              </SelectTrigger>
              <SelectContent>
                {modalidades?.map((mod) => (
                  <SelectItem key={mod.id} value={mod.id}>
                    {mod.nome} ({mod.tipo_pessoa} - {mod.tipo_recurso})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            onClick={calcularAnalise}
            disabled={calculando || !valorFinanciado || !valorParcela || !numeroParcelas || !modalidadeId || !dataReferencia}
            className="w-full md:w-auto gap-2"
          >
            <Calculator className="h-4 w-4" />
            {calculando ? "Analisando..." : "Realizar Análise"}
          </Button>
        </CardContent>
      </Card>

      {/* Resultado */}
      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resultado da Análise</span>
              {resultado.abusividadeDetectada && (
                <Badge className={getAbusividadeColor(resultado.grauAbusividade)}>
                  {resultado.grauAbusividade}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Taxa Real Aplicada (Mensal)</Label>
                <p className="text-2xl font-bold">
                  {resultado.taxaRealMensal.toFixed(4)}% a.m.
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">Taxa Real Aplicada (Anual)</Label>
                <p className="text-2xl font-bold">
                  {resultado.taxaRealAnual.toFixed(2)}% a.a.
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">Taxa Média BACEN</Label>
                <p className="text-2xl font-bold text-primary">
                  {resultado.taxaMediaBacen.toFixed(4)}% a.m.
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">Diferença Absoluta</Label>
                <p className="text-2xl font-bold">
                  {resultado.diferencaAbsoluta.toFixed(4)} p.p.
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">Diferença Percentual</Label>
                <p className={`text-2xl font-bold ${resultado.abusividadeDetectada ? 'text-destructive' : ''}`}>
                  {resultado.diferencaPercentual.toFixed(2)}%
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground">Abusividade</Label>
                <p className={`text-2xl font-bold ${resultado.abusividadeDetectada ? 'text-destructive' : 'text-green-600'}`}>
                  {resultado.abusividadeDetectada ? "DETECTADA" : "Não detectada"}
                </p>
              </div>

              {resultado.abusividadeDetectada && resultado.valorIndevido > 0 && (
                <div className="space-y-1 md:col-span-2 lg:col-span-3">
                  <Label className="text-muted-foreground">Valor Cobrado Indevidamente (Estimativa)</Label>
                  <p className="text-3xl font-bold text-destructive">
                    R$ {resultado.valorIndevido.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              )}
            </div>

            {resultado.abusividadeDetectada && (
              <div className="mt-6 p-4 border border-destructive rounded-lg bg-destructive/10">
                <p className="text-sm font-medium text-destructive">
                  ⚠️ Abusividade detectada! A taxa aplicada está {resultado.diferencaPercentual.toFixed(2)}% 
                  acima da taxa média de mercado do BACEN. Considere realizar ação judicial.
                </p>
              </div>
            )}

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
                Gerar Relatório Judicial
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
