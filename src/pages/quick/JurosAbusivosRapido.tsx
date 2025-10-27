import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingDown, Download, Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { calcularTaxaEfetiva, compararComTaxaBacen } from "@/lib/calculoTaxaEfetiva";
import { gerarRelatorioPDF } from "@/lib/gerarRelatorioPDF";
import { useAuth } from "@/hooks/useAuth";
import { SelectJurosBACEN } from "@/components/juros/SelectJurosBACEN";
import { useTaxaJurosBacenPorData } from "@/hooks/useTaxasJurosBacen";

export default function JurosAbusivosRapido() {
  const navigate = useNavigate();
  const { usuarioEscritorio } = useAuth();
  
  // Campos do formulário
  const [modalidadeId, setModalidadeId] = useState("");
  const [valorFinanciado, setValorFinanciado] = useState("");
  const [valorParcela, setValorParcela] = useState("");
  const [numeroParcelas, setNumeroParcelas] = useState("");
  const [taxaContratual, setTaxaContratual] = useState("");
  const [dataReferencia, setDataReferencia] = useState("");
  const [observacoes, setObservacoes] = useState("");
  
  const [calculando, setCalculando] = useState(false);
  const [resultado, setResultado] = useState<any>(null);

  // Buscar taxa BACEN automaticamente quando modalidade e data estiverem preenchidos
  const { data: taxaBacenData } = useTaxaJurosBacenPorData(
    modalidadeId ? parseInt(modalidadeId) : null,
    dataReferencia || null
  );

  const calcular = async () => {
    if (!valorFinanciado || !valorParcela || !numeroParcelas || !modalidadeId || !dataReferencia) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!taxaBacenData) {
      toast.error("Taxa BACEN não encontrada para esta modalidade e data");
      return;
    }

    setCalculando(true);

    try {
      const vf = parseFloat(valorFinanciado.replace(/\D/g, "")) / 100;
      const vp = parseFloat(valorParcela.replace(/\D/g, "")) / 100;
      const np = parseInt(numeroParcelas);
      const tc = taxaContratual ? parseFloat(taxaContratual) : undefined;

      // 1. Calcular taxa real aplicada
      const calculoTaxa = calcularTaxaEfetiva({
        valorFinanciado: vf,
        valorParcela: vp,
        numeroParcelas: np,
        taxaJurosContratual: tc,
      });

      // 2. Usar taxa BACEN já carregada
      const taxaBacen = taxaBacenData.taxa_mensal;

      // 3. Comparar e identificar abusividade
      const comparacao = compararComTaxaBacen(
        calculoTaxa.taxaEfetivaMensal,
        taxaBacen
      );

      // 4. Calcular valor indevido
      let valorIndevido = 0;
      if (comparacao.acimaMercado) {
        const totalPagoReal = vp * np;
        const parcelaMercado = vf * (taxaBacen/100 * Math.pow(1 + taxaBacen/100, np)) / 
                               (Math.pow(1 + taxaBacen/100, np) - 1);
        const totalPagoMercado = parcelaMercado * np;
        valorIndevido = Math.max(0, totalPagoReal - totalPagoMercado);
      }

      setResultado({
        valorFinanciado: vf,
        valorParcela: vp,
        numeroParcelas: np,
        taxaContratual: tc,
        taxaRealMensal: calculoTaxa.taxaEfetivaMensal,
        taxaRealAnual: calculoTaxa.taxaEfetivaAnual,
        taxaMediaBacen: taxaBacen,
        diferencaAbsoluta: comparacao.diferenca,
        diferencaPercentual: comparacao.percentualDiferenca,
        abusividadeDetectada: comparacao.acimaMercado && comparacao.percentualDiferenca > 20,
        grauAbusividade: comparacao.grauAbusividade,
        valorIndevido,
        modalidade: taxaBacenData.nome_modalidade,
        categoria: taxaBacenData.categoria,
        subCategoria: taxaBacenData.sub_categoria,
        codigoSerie: taxaBacenData.codigo_serie,
        dataReferencia,
      });

      toast.success("Análise concluída!");
    } catch (error: any) {
      console.error("Erro ao calcular:", error);
      toast.error(error.message || "Erro ao realizar a análise");
    } finally {
      setCalculando(false);
    }
  };

  const exportarPDF = () => {
    if (!resultado) return;

    try {
      gerarRelatorioPDF({
        tipo: "juros_abusivos",
        cliente: {
          nome: "Cliente Não Cadastrado",
        },
        contrato: {
          numero: undefined,
          banco: undefined,
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
    toast.info("Funcionalidade de salvar em cliente em desenvolvimento");
  };

  const novaAnalise = () => {
    setModalidadeId("");
    setValorFinanciado("");
    setValorParcela("");
    setNumeroParcelas("");
    setTaxaContratual("");
    setDataReferencia("");
    setObservacoes("");
    setResultado(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getAbusividadeColor = (grau: string) => {
    switch (grau) {
      case "Muito Grave": return "bg-destructive text-destructive-foreground";
      case "Grave": return "bg-orange-500 text-white";
      case "Moderado": return "bg-yellow-500 text-black";
      case "Leve": return "bg-blue-500 text-white";
      default: return "bg-green-500 text-white";
    }
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
          <TrendingDown className="h-8 w-8 text-red-600" />
          Análise de Juros Abusivos Rápida
        </h1>
        <p className="text-muted-foreground mt-2">
          Identifique abusividade comparando com taxas médias do BACEN
        </p>
      </div>

      {!resultado ? (
        <Card>
          <CardHeader>
            <CardTitle>Dados do Contrato</CardTitle>
            <CardDescription>
              Preencha as informações para análise de juros
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SelectJurosBACEN
              value={modalidadeId}
              onValueChange={setModalidadeId}
              label="Modalidade BACEN"
              placeholder="Selecione a modalidade de crédito..."
              required
            />
            
            {taxaBacenData && modalidadeId && dataReferencia && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">
                  📊 Taxa BACEN Encontrada
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Taxa Mensal:</span>
                    <span className="font-bold ml-1 text-blue-600 dark:text-blue-400">
                      {taxaBacenData.taxa_mensal.toFixed(2)}% a.m.
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data Ref:</span>
                    <span className="font-semibold ml-1">
                      {new Date(taxaBacenData.data_referencia).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="valorFinanciado">Valor Financiado *</Label>
              <Input
                id="valorFinanciado"
                type="text"
                placeholder="R$ 0,00"
                value={valorFinanciado}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  const formatted = new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(parseFloat(value) / 100 || 0);
                  setValorFinanciado(formatted);
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valorParcela">Valor da Parcela *</Label>
                <Input
                  id="valorParcela"
                  type="text"
                  placeholder="R$ 0,00"
                  value={valorParcela}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    const formatted = new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(parseFloat(value) / 100 || 0);
                    setValorParcela(formatted);
                  }}
                />
              </div>

              <div>
                <Label htmlFor="numeroParcelas">Número de Parcelas *</Label>
                <Input
                  id="numeroParcelas"
                  type="number"
                  placeholder="12"
                  value={numeroParcelas}
                  onChange={(e) => setNumeroParcelas(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="taxaContratual">Taxa Contratual (% a.m.) - Opcional</Label>
              <Input
                id="taxaContratual"
                type="number"
                step="0.01"
                placeholder="Ex: 2.50"
                value={taxaContratual}
                onChange={(e) => setTaxaContratual(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Se informada, será comparada com a taxa real aplicada
              </p>
            </div>

            <div>
              <Label htmlFor="dataReferencia">Data de Referência *</Label>
              <Input
                id="dataReferencia"
                type="date"
                value={dataReferencia}
                onChange={(e) => setDataReferencia(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Data para buscar taxa média BACEN (geralmente data da assinatura)
              </p>
            </div>

            <div>
              <Label htmlFor="obs">Observações</Label>
              <Textarea
                id="obs"
                placeholder="Informações adicionais..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              onClick={calcular} 
              className="w-full" 
              size="lg"
              disabled={calculando}
            >
              {calculando ? (
                <>Analisando...</>
              ) : (
                <>
                  <TrendingDown className="mr-2 h-4 w-4" />
                  Analisar Juros
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {resultado.abusividadeDetectada ? (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Abusividade Detectada!
                </CardTitle>
              </CardHeader>
            </Card>
          ) : (
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-300">
                  ✅ Taxa Dentro do Mercado
                </CardTitle>
              </CardHeader>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Dados do Contrato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Modalidade</p>
                <p className="font-semibold">{resultado.modalidade}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Valor Financiado</p>
                  <p className="font-semibold">{formatCurrency(resultado.valorFinanciado)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Parcela</p>
                  <p className="font-semibold">{formatCurrency(resultado.valorParcela)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Parcelas</p>
                  <p className="font-semibold">{resultado.numeroParcelas}x</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Análise Comparativa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Taxa Real Aplicada</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {resultado.taxaRealMensal.toFixed(2)}% a.m.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {resultado.taxaRealAnual.toFixed(2)}% a.a.
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Taxa Média BACEN</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {resultado.taxaMediaBacen.toFixed(2)}% a.m.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Referência: {new Date(resultado.dataReferencia).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              {resultado.taxaContratual && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm">
                    <strong>Taxa Contratual:</strong> {resultado.taxaContratual.toFixed(2)}% a.m.
                  </p>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Diferença Absoluta</p>
                  <p className="text-lg font-semibold">
                    {resultado.diferencaAbsoluta > 0 ? "+" : ""}
                    {resultado.diferencaAbsoluta.toFixed(2)} p.p.
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Diferença Percentual</p>
                  <p className="text-lg font-semibold">
                    {resultado.diferencaPercentual > 0 ? "+" : ""}
                    {resultado.diferencaPercentual.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Grau de Abusividade:</p>
                <Badge className={getAbusividadeColor(resultado.grauAbusividade)}>
                  {resultado.grauAbusividade}
                </Badge>
              </div>

              {resultado.valorIndevido > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Valor Cobrado Indevidamente (estimativa)
                  </p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(resultado.valorIndevido)}
                  </p>
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
                Exportar Relatório Judicial
              </Button>
              <Button onClick={salvarEmCliente} variant="outline">
                <Save className="mr-2 h-4 w-4" />
                Salvar em Cliente
              </Button>
              <Button onClick={novaAnalise} variant="outline">
                <TrendingDown className="mr-2 h-4 w-4" />
                Nova Análise
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground text-center">
          ℹ️ Análise baseada em séries temporais do BACEN • Sem necessidade de cadastro
        </p>
      </div>
    </div>
  );
}
