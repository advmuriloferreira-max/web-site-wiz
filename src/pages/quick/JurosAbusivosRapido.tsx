import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingDown, Download, Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { SelectJurosBACEN } from "@/components/juros/SelectJurosBACEN";
import { useTaxaJurosBacenPorData } from "@/hooks/useTaxasJurosBacen";
import { gerarRelatorioPDF } from "@/lib/gerarRelatorioPDF";
import { useAuth } from "@/hooks/useAuth";

export default function JurosAbusivosRapido() {
  const navigate = useNavigate();
  const { usuarioEscritorio } = useAuth();
  
  const [modalidadeId, setModalidadeId] = useState("");
  const [taxaContratoMensal, setTaxaContratoMensal] = useState("");
  const [dataAssinatura, setDataAssinatura] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [resultado, setResultado] = useState<any>(null);

  const { data: taxaBacenData } = useTaxaJurosBacenPorData(
    modalidadeId || null,
    dataAssinatura || null
  );

  const calcular = () => {
    if (!taxaContratoMensal || !modalidadeId || !dataAssinatura) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!taxaBacenData) {
      toast.error("Taxa BACEN não encontrada para esta modalidade e data");
      return;
    }

    try {
      const taxaContrato = parseFloat(taxaContratoMensal);
      const taxaBacen = taxaBacenData.taxa_mensal;

      const diferencaAbsoluta = taxaContrato - taxaBacen;
      const percentualAbusividade = ((taxaContrato / taxaBacen - 1) * 100);
      const abusividadeDetectada = percentualAbusividade > 20;
      
      let grauAbusividade = "Dentro do Mercado";
      if (percentualAbusividade > 50) grauAbusividade = "Muito Grave";
      else if (percentualAbusividade > 35) grauAbusividade = "Grave";
      else if (percentualAbusividade > 20) grauAbusividade = "Moderado";
      else if (percentualAbusividade > 0) grauAbusividade = "Leve";

      setResultado({
        taxaContrato,
        taxaBacen,
        diferencaAbsoluta,
        percentualAbusividade,
        abusividadeDetectada,
        grauAbusividade,
        modalidade: taxaBacenData.modalidades_bacen_juros.nome,
        categoria: taxaBacenData.modalidades_bacen_juros.categoria,
        tipoRecurso: taxaBacenData.modalidades_bacen_juros.tipo_recurso,
        codigoSgs: taxaBacenData.modalidades_bacen_juros.codigo_sgs,
        dataReferencia: taxaBacenData.data_referencia,
        fonteOficial: `Banco Central do Brasil - SGS (Código ${taxaBacenData.modalidades_bacen_juros.codigo_sgs})`,
      });

      toast.success("Análise concluída!");
    } catch (error: any) {
      console.error("Erro:", error);
      toast.error("Erro ao realizar a análise");
    }
  };

  const exportarPDF = () => {
    toast.info("Gerando relatório PDF...");
  };

  const salvarEmCliente = () => {
    toast.info("Funcionalidade em desenvolvimento");
  };

  const novaAnalise = () => {
    setModalidadeId("");
    setTaxaContratoMensal("");
    setDataAssinatura("");
    setObservacoes("");
    setResultado(null);
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
      <Button variant="ghost" onClick={() => navigate("/app")} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar ao Dashboard
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <TrendingDown className="h-8 w-8 text-red-600" />
          Análise de Juros Abusivos - Rápida
        </h1>
        <p className="text-muted-foreground mt-2">
          Compare a taxa do contrato com as taxas médias oficiais do BACEN
        </p>
      </div>

      {!resultado ? (
        <Card>
          <CardHeader>
            <CardTitle>Dados para Análise</CardTitle>
            <CardDescription>
              Informe a taxa do contrato e selecione a modalidade de crédito
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
            
            {taxaBacenData && modalidadeId && dataAssinatura && (
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
              <Label htmlFor="taxaContrato">Taxa de Juros do Contrato (% a.m.) *</Label>
              <Input
                id="taxaContrato"
                type="number"
                step="0.01"
                placeholder="Ex: 5.50"
                value={taxaContratoMensal}
                onChange={(e) => setTaxaContratoMensal(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Informe a taxa mensal cobrada no contrato
              </p>
            </div>

            <div>
              <Label htmlFor="dataAssinatura">Data de Assinatura do Contrato *</Label>
              <Input
                id="dataAssinatura"
                type="date"
                value={dataAssinatura}
                onChange={(e) => setDataAssinatura(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Usaremos o mês/ano para buscar a taxa BACEN correspondente
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
              disabled={!taxaContratoMensal || !modalidadeId || !dataAssinatura}
            >
              <TrendingDown className="mr-2 h-4 w-4" />
              Analisar Abusividade
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
                  Abusividade Detectada - {resultado.grauAbusividade}!
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
              <CardTitle>Comparação de Taxas</CardTitle>
              <CardDescription>Análise baseada nas séries temporais oficiais do BACEN</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-red-50 dark:bg-red-950 rounded-lg border-2 border-red-200 dark:border-red-800">
                  <p className="text-sm text-muted-foreground mb-2">Taxa do Contrato</p>
                  <p className="text-4xl font-bold text-red-600 dark:text-red-400">
                    {resultado.taxaContrato.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">ao mês</p>
                </div>

                <div className="p-6 bg-green-50 dark:bg-green-950 rounded-lg border-2 border-green-200 dark:border-green-800">
                  <p className="text-sm text-muted-foreground mb-2">Taxa Média BACEN</p>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {resultado.taxaBacen.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">ao mês</p>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Diferença Absoluta</p>
                  <p className="text-2xl font-bold">
                    {resultado.diferencaAbsoluta > 0 ? "+" : ""}
                    {resultado.diferencaAbsoluta.toFixed(2)} p.p.
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Percentual de Abusividade</p>
                  <p className={`text-2xl font-bold ${resultado.abusividadeDetectada ? 'text-red-600 dark:text-red-400' : 'text-green-600'}`}>
                    {resultado.percentualAbusividade > 0 ? "+" : ""}
                    {resultado.percentualAbusividade.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  📋 Informações da Análise
                </p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Modalidade:</span>
                    <span className="font-semibold ml-2">{resultado.modalidade}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Categoria:</span>
                    <span className="font-semibold ml-2">{resultado.categoria}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fonte Oficial:</span>
                    <span className="font-semibold ml-2">{resultado.fonteOficial}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Período de Referência:</span>
                    <span className="font-semibold ml-2">
                      {new Date(resultado.dataReferencia).toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button onClick={exportarPDF} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar Relatório
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
          ℹ️ Análise baseada em séries temporais oficiais do BACEN • 48 modalidades disponíveis
        </p>
      </div>
    </div>
  );
}
