import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, FileText, Save, Calculator, Loader2, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useContratoById } from "@/hooks/useContratoById";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { SelectJurosBACEN } from "@/components/juros/SelectJurosBACEN";
import { useTaxaJurosBacenPorData } from "@/hooks/useTaxasJurosBacen";
import { useCreateAnaliseJuros } from "@/hooks/useAnaliseJuros";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  completarDadosContrato,
  calcularTaxaAnual,
  analisarAbusividade,
  calcularPrejuizo,
  gerarTabelaPrice,
  analisarDiscrepanciaTaxas,
  calcularProjecoesBacen,
  calcularPrejuizoDetalhado,
  analisarSaldoDevedor,
  type DadosContratoJuros,
  type ResultadoCalculo,
  type AnaliseAbusividade,
  type CalculoPrejuizo,
  type AnaliseDiscrepancia,
  type ProjecoesTaxaBacen,
  type PrejuizoDetalhado,
  type AnaliseSaldoDevedor,
} from "@/lib/calculosJurosAbusivos";

export default function AnaliseJurosAbusivos() {
  const { id: contratoId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contrato, isLoading } = useContratoById(contratoId!);
  const createAnalise = useCreateAnaliseJuros();

  // Identificação do contrato
  const [modalidadeId, setModalidadeId] = useState("");
  const [dataAssinatura, setDataAssinatura] = useState("");
  
  // Regra de 3 - preencher 3 dos 4 campos
  const [valorFinanciado, setValorFinanciado] = useState("");
  const [taxaMensal, setTaxaMensal] = useState("");
  const [valorParcela, setValorParcela] = useState("");
  const [numeroParcelas, setNumeroParcelas] = useState("");
  
  // Dados adicionais opcionais
  const [parcelasJaPagas, setParcelasJaPagas] = useState("");
  const [saldoDevedorAtual, setSaldoDevedorAtual] = useState("");
  const [taxaPrevistaContrato, setTaxaPrevistaContrato] = useState("");
  const [valorEntrada, setValorEntrada] = useState("");
  const [iofCobrado, setIofCobrado] = useState("");
  
  const [observacoes, setObservacoes] = useState("");
  
  // Resultados
  const [dadosCompletos, setDadosCompletos] = useState<ResultadoCalculo | null>(null);
  const [analiseAbusividade, setAnaliseAbusividade] = useState<AnaliseAbusividade | null>(null);
  const [analisePrejuizo, setAnalisePrejuizo] = useState<CalculoPrejuizo | null>(null);
  const [analiseDiscrepancia, setAnaliseDiscrepancia] = useState<AnaliseDiscrepancia | null>(null);
  const [projecoesBacen, setProjecoesBacen] = useState<ProjecoesTaxaBacen | null>(null);
  const [prejuizoDetalhado, setPrejuizoDetalhado] = useState<PrejuizoDetalhado | null>(null);
  const [analiseSaldo, setAnaliseSaldo] = useState<AnaliseSaldoDevedor | null>(null);
  const [tabelaPrice, setTabelaPrice] = useState<any[]>([]);

  const { data: taxaBacenData } = useTaxaJurosBacenPorData(
    modalidadeId || null,
    dataAssinatura || null
  );

  useEffect(() => {
    if (contrato) {
      if (contrato.taxa_juros_contratual) setTaxaMensal(contrato.taxa_juros_contratual.toString());
      if (contrato.modalidade_bacen_id) setModalidadeId(contrato.modalidade_bacen_id);
      if (contrato.data_assinatura) setDataAssinatura(contrato.data_assinatura);
      if (contrato.valor_financiado) setValorFinanciado(contrato.valor_financiado.toString());
      if (contrato.valor_parcela) setValorParcela(contrato.valor_parcela.toString());
      if (contrato.numero_parcelas) setNumeroParcelas(contrato.numero_parcelas.toString());
    }
  }, [contrato]);
  
  // Validação: contar quantos campos estão preenchidos
  const camposPreenchidos = [valorFinanciado, taxaMensal, valorParcela, numeroParcelas]
    .filter((v) => v && parseFloat(v) > 0).length;

  const calcularAnalise = () => {
    if (!modalidadeId || !dataAssinatura || !taxaBacenData) {
      toast.error("Preencha a modalidade e data de assinatura");
      return;
    }

    if (camposPreenchidos !== 3) {
      toast.error("Preencha exatamente 3 dos 4 campos da Regra de 3");
      return;
    }

    try {
      // 1. Completar dados do contrato (calcular campo faltante)
      const dados: DadosContratoJuros = {
        valorFinanciado: valorFinanciado ? parseFloat(valorFinanciado) : undefined,
        taxaMensal: taxaMensal ? parseFloat(taxaMensal) : undefined,
        valorParcela: valorParcela ? parseFloat(valorParcela) : undefined,
        numeroParcelas: numeroParcelas ? parseFloat(numeroParcelas) : undefined,
      };

      const resultado = completarDadosContrato(dados);
      if (!resultado) {
        toast.error("Erro ao calcular dados do contrato");
        return;
      }
      setDadosCompletos(resultado);

      // Atualizar campos calculados
      if (!valorFinanciado) setValorFinanciado(resultado.valorFinanciado.toFixed(2));
      if (!taxaMensal) setTaxaMensal(resultado.taxaMensal.toFixed(2));
      if (!valorParcela) setValorParcela(resultado.valorParcela.toFixed(2));
      if (!numeroParcelas) setNumeroParcelas(Math.round(resultado.numeroParcelas).toString());

      // 2. Análise de abusividade
      const taxaBacen = taxaBacenData.taxa_mensal;
      const analise = analisarAbusividade(resultado.taxaMensal, taxaBacen);
      setAnaliseAbusividade(analise);

      // 3. Análise de discrepância (taxa real vs contratual)
      if (taxaPrevistaContrato && parseFloat(taxaPrevistaContrato) > 0) {
        const discrepancia = analisarDiscrepanciaTaxas(
          resultado.taxaMensal,
          parseFloat(taxaPrevistaContrato)
        );
        setAnaliseDiscrepancia(discrepancia);
      }

      // 4. Projeções com taxa BACEN
      const projecoes = calcularProjecoesBacen(
        resultado.valorFinanciado,
        resultado.valorParcela,
        resultado.numeroParcelas,
        resultado.taxaMensal,
        taxaBacen
      );
      setProjecoesBacen(projecoes);

      // 5. Cálculo de prejuízo detalhado (se tiver parcelas pagas)
      if (parcelasJaPagas && parseFloat(parcelasJaPagas) > 0) {
        const parcelasPagasNum = parseFloat(parcelasJaPagas);
        const parcelasRestantes = resultado.numeroParcelas - parcelasPagasNum;
        
        const prejuizoCompleto = calcularPrejuizoDetalhado(
          projecoes.diferencaParcela,
          parcelasPagasNum,
          parcelasRestantes,
          resultado.valorParcela * resultado.numeroParcelas
        );
        setPrejuizoDetalhado(prejuizoCompleto);

        // Cálculo antigo para manter compatibilidade
        const prejuizo = calcularPrejuizo(
          resultado.valorFinanciado,
          resultado.numeroParcelas,
          parcelasPagasNum,
          resultado.taxaMensal,
          taxaBacen
        );
        setAnalisePrejuizo(prejuizo);
      }

      // 6. Análise de saldo devedor (se informado)
      if (saldoDevedorAtual && parseFloat(saldoDevedorAtual) > 0 && parcelasJaPagas) {
        const saldo = analisarSaldoDevedor(
          resultado.valorFinanciado,
          resultado.taxaMensal,
          taxaBacen,
          resultado.numeroParcelas,
          parseFloat(parcelasJaPagas),
          parseFloat(saldoDevedorAtual)
        );
        setAnaliseSaldo(saldo);
      }

      // 7. Gerar tabela Price
      const tabela = gerarTabelaPrice(
        resultado.valorFinanciado,
        resultado.taxaMensal,
        resultado.numeroParcelas
      );
      setTabelaPrice(tabela.slice(0, 12)); // Primeiras 12 parcelas

      toast.success("Análise completa realizada!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao realizar análise");
    }
  };

  const salvarAnalise = async () => {
    if (!dadosCompletos || !analiseAbusividade || !contratoId) {
      toast.error("Realize a análise antes de salvar");
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();

      await createAnalise.mutateAsync({
        contrato_id: contratoId,
        modalidade_bacen_id: modalidadeId || null,
        valor_financiado: dadosCompletos.valorFinanciado,
        valor_parcela: dadosCompletos.valorParcela,
        numero_parcelas: Math.round(dadosCompletos.numeroParcelas),
        taxa_contratual: dadosCompletos.taxaMensal,
        data_referencia: dataAssinatura,
        taxa_real_aplicada: dadosCompletos.taxaMensal,
        taxa_media_bacen: taxaBacenData?.taxa_mensal || 0,
        diferenca_absoluta: analiseAbusividade.diferencaAbsoluta,
        diferenca_percentual: analiseAbusividade.percentualAbusividade,
        abusividade_detectada: analiseAbusividade.abusividadeDetectada,
        usuario_id: userData.user?.id,
        observacoes,
        metodologia: 'Análise Completa com Regra de 3 e Tabela Price',
        fonte_taxa_bacen: 'SGS - Sistema Gerenciador de Séries Temporais',
        data_analise: new Date().toISOString(),
      } as any);

      toast.success("Análise salva com sucesso!");
      navigate(-1);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar análise");
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!contrato) return <div className="container mx-auto py-8"><Card><CardContent className="py-8"><p className="text-center text-muted-foreground">Contrato não encontrado</p></CardContent></Card></div>;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-3xl font-bold">Análise Completa de Juros Abusivos</h1>
          <p className="text-muted-foreground">Análise avançada com Regra de 3 e Tabela Price</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Informações do Contrato</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div><Label className="text-muted-foreground">Cliente</Label><p className="font-medium">{contrato.clientes?.nome}</p></div>
          <div><Label className="text-muted-foreground">Banco</Label><p className="font-medium">{contrato.bancos?.nome || "-"}</p></div>
          <div><Label className="text-muted-foreground">Número do Contrato</Label><p className="font-medium">{contrato.numero_contrato || "-"}</p></div>
        </CardContent>
      </Card>

      {/* SEÇÃO 1: Identificação do Contrato */}
      <Card>
        <CardHeader>
          <CardTitle>1. Identificação do Contrato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Data de Assinatura *</Label>
              <Input
                type="date"
                value={dataAssinatura}
                onChange={(e) => setDataAssinatura(e.target.value)}
                required
              />
            </div>
            <div>
              <SelectJurosBACEN value={modalidadeId} onValueChange={setModalidadeId} required />
            </div>
          </div>

          {taxaBacenData && (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-semibold">Taxa Média BACEN: {taxaBacenData.taxa_mensal.toFixed(2)}% a.m. / {calcularTaxaAnual(taxaBacenData.taxa_mensal).toFixed(2)}% a.a.</p>
                  <p className="text-sm">Taxa Limite Aceitável (1,5x): {(taxaBacenData.taxa_mensal * 1.5).toFixed(2)}% a.m. / {(calcularTaxaAnual(taxaBacenData.taxa_mensal) * 1.5).toFixed(2)}% a.a.</p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* SEÇÃO 2: Dados do Contrato (Regra de 3) */}
      <Card>
        <CardHeader>
          <CardTitle>2. Dados do Contrato (Regra de 3)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Preencha exatamente 3 dos 4 campos abaixo. O sistema calculará automaticamente o campo vazio.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {camposPreenchidos !== 3 && camposPreenchidos > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Você preencheu {camposPreenchidos} campo(s). Preencha exatamente 3 campos para continuar.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Valor Financiado (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={valorFinanciado}
                onChange={(e) => setValorFinanciado(e.target.value)}
                placeholder="R$ 0,00"
              />
            </div>
            <div>
              <Label>Taxa de Juros (% a.m.)</Label>
              <Input
                type="number"
                step="0.01"
                value={taxaMensal}
                onChange={(e) => setTaxaMensal(e.target.value)}
                placeholder="0,00%"
              />
            </div>
            <div>
              <Label>Valor da Parcela (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={valorParcela}
                onChange={(e) => setValorParcela(e.target.value)}
                placeholder="R$ 0,00"
              />
            </div>
            <div>
              <Label>Número de Parcelas</Label>
              <Input
                type="number"
                value={numeroParcelas}
                onChange={(e) => setNumeroParcelas(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO 3: Dados Adicionais (Opcional) */}
      <Card>
        <CardHeader>
          <CardTitle>3. Dados Adicionais (Opcional)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Para cálculos avançados de prejuízo e análises complementares
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Parcelas Já Pagas</Label>
              <Input
                type="number"
                value={parcelasJaPagas}
                onChange={(e) => setParcelasJaPagas(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Saldo Devedor Atual (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={saldoDevedorAtual}
                onChange={(e) => setSaldoDevedorAtual(e.target.value)}
                placeholder="R$ 0,00"
              />
            </div>
            <div>
              <Label>Taxa Prevista no Contrato (% a.m.)</Label>
              <Input
                type="number"
                step="0.01"
                value={taxaPrevistaContrato}
                onChange={(e) => setTaxaPrevistaContrato(e.target.value)}
                placeholder="0,00%"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Valor de Entrada/Sinal (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={valorEntrada}
                onChange={(e) => setValorEntrada(e.target.value)}
                placeholder="R$ 0,00"
              />
            </div>
            <div>
              <Label>IOF Cobrado (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={iofCobrado}
                onChange={(e) => setIofCobrado(e.target.value)}
                placeholder="R$ 0,00"
              />
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              placeholder="Observações adicionais sobre o contrato..."
            />
          </div>

          <Button
            onClick={calcularAnalise}
            disabled={camposPreenchidos !== 3 || !modalidadeId || !dataAssinatura}
            className="w-full gap-2"
            size="lg"
          >
            <Calculator className="h-5 w-5" />
            Realizar Análise Completa
          </Button>
        </CardContent>
      </Card>

      {/* RESULTADOS */}
      {dadosCompletos && analiseAbusividade && (
        <>
          {/* Resultado: Dados Completos do Contrato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dados Completos do Contrato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Valor Financiado</p>
                  <p className="text-2xl font-bold">R$ {dadosCompletos.valorFinanciado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Taxa Mensal / Anual</p>
                  <p className="text-2xl font-bold">{dadosCompletos.taxaMensal.toFixed(2)}%</p>
                  <p className="text-sm text-muted-foreground">{dadosCompletos.taxaAnual.toFixed(2)}% a.a.</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Valor da Parcela</p>
                  <p className="text-2xl font-bold">R$ {dadosCompletos.valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Número de Parcelas</p>
                  <p className="text-2xl font-bold">{Math.round(dadosCompletos.numeroParcelas)}</p>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total a Pagar</p>
                  <p className="text-xl font-bold text-blue-600">R$ {dadosCompletos.totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total de Juros</p>
                  <p className="text-xl font-bold text-orange-600">R$ {dadosCompletos.totalJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <p className="text-sm text-muted-foreground">CET (Custo Efetivo Total)</p>
                  <p className="text-xl font-bold text-purple-600">{dadosCompletos.custoEfetivoTotal.toFixed(2)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resultado: Análise de Abusividade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Análise de Abusividade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border-2 border-red-300 dark:border-red-700">
                  <p className="text-sm text-muted-foreground">Taxa do Contrato</p>
                  <p className="text-3xl font-bold text-red-600">{dadosCompletos.taxaMensal.toFixed(2)}% a.m.</p>
                  <p className="text-sm text-muted-foreground mt-1">{dadosCompletos.taxaAnual.toFixed(2)}% a.a.</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border-2 border-green-300 dark:border-green-700">
                  <p className="text-sm text-muted-foreground">Taxa BACEN (Mercado)</p>
                  <p className="text-3xl font-bold text-green-600">{taxaBacenData?.taxa_mensal.toFixed(2)}% a.m.</p>
                  <p className="text-sm text-muted-foreground mt-1">{calcularTaxaAnual(taxaBacenData?.taxa_mensal || 0).toFixed(2)}% a.a.</p>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Diferença Absoluta</p>
                  <p className="text-xl font-bold">{analiseAbusividade.diferencaAbsoluta.toFixed(2)} p.p.</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Percentual de Abusividade</p>
                  <p className="text-xl font-bold text-red-600">{analiseAbusividade.percentualAbusividade.toFixed(2)}%</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Grau de Abusividade</p>
                  <Badge
                    variant={analiseAbusividade.abusividadeDetectada ? "destructive" : "default"}
                    className="text-lg px-3 py-1"
                  >
                    {analiseAbusividade.grauAbusividade}
                  </Badge>
                </div>
              </div>

              {analiseAbusividade.excedeLimite && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold">⚠️ ABUSIVIDADE GRAVE DETECTADA</p>
                    <p className="text-sm mt-1">
                      A taxa contratada ({dadosCompletos.taxaMensal.toFixed(2)}% a.m.) excede o limite aceitável de 1,5x a taxa BACEN 
                      ({analiseAbusividade.taxaLimiteAceitavel.toFixed(2)}% a.m.)
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Resultado: Cálculo de Prejuízo */}
          {analisePrejuizo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Cálculo de Prejuízo do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Valor Pago Indevidamente</p>
                    <p className="text-2xl font-bold text-red-600">
                      R$ {analisePrejuizo.valorPagoIndevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Diferença entre parcelas com taxa abusiva vs. correta
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Diferença no Saldo Devedor</p>
                    <p className="text-2xl font-bold text-orange-600">
                      R$ {analisePrejuizo.diferencaSaldoDevedor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Saldo a maior devido à taxa abusiva
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-950 dark:to-orange-950 rounded-lg border-2 border-red-300 dark:border-red-700">
                  <p className="text-sm text-muted-foreground mb-2">💰 PREJUÍZO TOTAL DO CLIENTE</p>
                  <p className="text-4xl font-bold text-red-600">
                    R$ {analisePrejuizo.valorTotalPrejuizo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <Separator />

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Parcela com Taxa Correta</p>
                    <p className="text-lg font-semibold">
                      R$ {analisePrejuizo.parcelasComTaxaCorreta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Diferença Mensal</p>
                    <p className="text-lg font-semibold text-red-600">
                      R$ {analisePrejuizo.diferencaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Discrepância Taxa Real vs Contratual */}
          {analiseDiscrepancia && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Discrepância: Taxa Real vs Taxa Contratual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Taxa Real Aplicada</p>
                    <p className="text-2xl font-bold">{analiseDiscrepancia.taxaReal.toFixed(2)}% a.m.</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Taxa Prevista no Contrato</p>
                    <p className="text-2xl font-bold">{analiseDiscrepancia.taxaContratual.toFixed(2)}% a.m.</p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Diferença</p>
                    <p className="text-2xl font-bold text-red-600">{analiseDiscrepancia.diferencaTaxas.toFixed(2)} p.p.</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {analiseDiscrepancia.percentualDiferenca.toFixed(2)}% acima do previsto
                    </p>
                  </div>
                </div>

                {analiseDiscrepancia.temDiscrepancia && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold">⚠️ DISCREPÂNCIA DETECTADA</p>
                      <p className="text-sm mt-1">
                        A taxa real aplicada difere da taxa prevista no contrato em mais de 0,1 pontos percentuais.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Projeções com Taxa BACEN */}
          {projecoesBacen && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Projeções com Taxa BACEN (Correta)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Parcela Correta (Taxa BACEN)</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {projecoesBacen.parcelaCorreta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Diferença: R$ {projecoesBacen.diferencaParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 
                      ({projecoesBacen.percentualDiferencaParcela.toFixed(2)}%)
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Correto do Financiamento</p>
                    <p className="text-2xl font-bold text-blue-600">
                      R$ {projecoesBacen.totalCorreto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Economia: R$ {projecoesBacen.diferencaTotalFinanciamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold">💡 Análise Comparativa</p>
                    <p className="text-sm mt-1">
                      Com a taxa BACEN, o cliente pagaria <span className="font-bold">R$ {projecoesBacen.diferencaTotalFinanciamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} a menos</span> no total do financiamento.
                    </p>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Prejuízo Detalhado com CDC */}
          {prejuizoDetalhado && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Análise Detalhada de Prejuízo + CDC
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Valor Já Pago Indevidamente</p>
                    <p className="text-2xl font-bold text-red-600">
                      R$ {prejuizoDetalhado.totalPagoIndevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {parcelasJaPagas} parcelas já pagas
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Economia Futura (Revisando Agora)</p>
                    <p className="text-2xl font-bold text-orange-600">
                      R$ {prejuizoDetalhado.economiaFutura.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Nas {dadosCompletos!.numeroParcelas - parseFloat(parcelasJaPagas)} parcelas restantes
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Economia Total</p>
                    <p className="text-2xl font-bold text-purple-600">
                      R$ {prejuizoDetalhado.economiaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {prejuizoDetalhado.percentualPrejuizo.toFixed(2)}% do total
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="p-6 bg-gradient-to-r from-yellow-100 to-green-100 dark:from-yellow-950 dark:to-green-950 rounded-lg border-2 border-yellow-400 dark:border-yellow-600">
                  <p className="text-sm text-muted-foreground mb-2">⚖️ DEVOLUÇÃO EM DOBRO (CDC Art. 42)</p>
                  <p className="text-4xl font-bold text-yellow-700 dark:text-yellow-400">
                    R$ {prejuizoDetalhado.devolucaoDobro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Valor a ser pleiteado judicialmente (dobro do pago indevidamente)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Análise de Saldo Devedor */}
          {analiseSaldo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Análise de Saldo Devedor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Saldo Devedor Atual (Informado)</p>
                    <p className="text-2xl font-bold text-red-600">
                      R$ {analiseSaldo.saldoDevedorAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Saldo Correto (Taxa BACEN)</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {analiseSaldo.saldoDevedorCorreto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Diferença no Saldo</p>
                    <p className="text-2xl font-bold text-orange-600">
                      R$ {analiseSaldo.diferencaSaldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {analiseSaldo.percentualDiferencaSaldo.toFixed(2)}% a mais
                    </p>
                  </div>
                </div>

                {analiseSaldo.economiaPotencial > 0 && (
                  <Alert>
                    <DollarSign className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold">💰 Economia Potencial no Saldo</p>
                      <p className="text-sm mt-1">
                        O cliente poderia economizar <span className="font-bold">R$ {analiseSaldo.economiaPotencial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> no saldo devedor atual se a taxa fosse ajustada à taxa BACEN.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Resultado: Tabela Price (primeiras parcelas) */}
          {tabelaPrice.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tabela Price (Primeiras 12 Parcelas)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">#</th>
                        <th className="text-right p-2">Parcela</th>
                        <th className="text-right p-2">Juros</th>
                        <th className="text-right p-2">Amortização</th>
                        <th className="text-right p-2">Saldo Devedor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tabelaPrice.map((parcela) => (
                        <tr key={parcela.numero} className="border-b">
                          <td className="p-2">{parcela.numero}</td>
                          <td className="text-right p-2">
                            R$ {parcela.valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="text-right p-2 text-red-600">
                            R$ {parcela.juros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="text-right p-2 text-green-600">
                            R$ {parcela.amortizacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="text-right p-2 font-semibold">
                            R$ {parcela.saldoDevedor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botão Salvar */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={salvarAnalise}
                disabled={createAnalise.isPending}
                className="w-full gap-2"
                size="lg"
              >
                <Save className="h-5 w-5" />
                {createAnalise.isPending ? "Salvando..." : "Salvar Análise Completa"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
