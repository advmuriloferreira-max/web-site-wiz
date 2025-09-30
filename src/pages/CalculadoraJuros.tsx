import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, User, Building2, Filter } from "lucide-react";
import { toast } from "sonner";
import { useModalidadesBacenJuros } from "@/hooks/useModalidadesBacenJuros";
import { calcularMetricasFinanceiras, compararTaxaBacen } from "@/modules/FinancialAnalysis/lib/financialCalculations";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const CalculadoraJuros = () => {
  const [tipoPessoaFiltro, setTipoPessoaFiltro] = useState<'PF' | 'PJ' | undefined>(undefined);
  const { data: modalidades, isLoading: loadingModalidades } = useModalidadesBacenJuros(tipoPessoaFiltro);

  // Estados do formulário
  const [valorFinanciamento, setValorFinanciamento] = useState("");
  const [valorPrestacao, setValorPrestacao] = useState("");
  const [numeroParcelas, setNumeroParcelas] = useState("");
  const [taxaJurosContratual, setTaxaJurosContratual] = useState("");
  const [dataAssinatura, setDataAssinatura] = useState("");
  const [modalidadeId, setModalidadeId] = useState("");

  // Estados de resultado
  const [resultado, setResultado] = useState<any>(null);
  const [analisando, setAnalisando] = useState(false);

  const handleAnalisar = async () => {
    if (!valorFinanciamento || !valorPrestacao || !numeroParcelas || !dataAssinatura || !modalidadeId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setAnalisando(true);
    
    try {
      // 1. Consultar taxa BACEN (busca automática: DB → CSV → API → Simulada)
      const { data, error } = await supabase.functions.invoke('consultar-taxa-bacen-sgs', {
        body: {
          modalidadeId,
          dataConsulta: dataAssinatura,
        }
      });

      if (error) throw new Error(error.message || 'Erro ao consultar taxa BACEN');
      if (!data || !data.taxa_mensal) throw new Error('Taxa não encontrada');

      toast.success(`✅ Taxa BACEN encontrada: ${data.taxa_mensal.toFixed(2)}% ao mês (${data.origem})`, {
        duration: 4000
      });

      // 2. Calcular métricas financeiras do contrato
      const valorPrest = parseFloat(valorPrestacao);
      const valorFin = parseFloat(valorFinanciamento);
      const parcelas = parseInt(numeroParcelas);
      
      // Calcular taxa real (efetiva) usando a fórmula financeira
      const taxaRealMensal = ((valorPrest * parcelas) / valorFin - 1) / parcelas * 100;
      
      // Taxa contratual (a que está escrita no contrato)
      const taxaContratual = taxaJurosContratual ? parseFloat(taxaJurosContratual) : taxaRealMensal;
      
      const metricas = calcularMetricasFinanceiras({
        valorDivida: valorFin,
        saldoContabil: valorFin,
        taxaBacen: data.taxa_mensal,
        taxaJuros: taxaRealMensal,
        prazoMeses: parcelas,
        valorParcela: valorPrest,
        valorGarantias: 0,
        diasAtraso: 0,
      });

      // 3. Comparar com taxa BACEN
      const taxaBacenMensal = data.taxa_mensal;
      const comparacao = compararTaxaBacen(
        metricas.taxaEfetivaMensal,
        taxaBacenMensal
      );
      
      // 4. Calcular diferença entre taxa contratual e taxa real
      const diferencaTaxas = taxaRealMensal - taxaContratual;
      const percentualDiferenca = taxaContratual > 0 ? (diferencaTaxas / taxaContratual) * 100 : 0;

      setResultado({
        metricas,
        comparacao,
        taxaBacen: data,
        modalidade: data.modalidade,
        taxaContratual,
        taxaReal: taxaRealMensal,
        diferencaTaxas,
        percentualDiferenca,
      });

      toast.success("Análise concluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao analisar:", error);
      toast.error("Erro ao realizar análise: " + error.message);
    } finally {
      setAnalisando(false);
    }
  };


  return (
    <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Análise de Juros Abusivos - BACEN</h1>
              <p className="text-muted-foreground">
                Sistema completo com 48 modalidades do Banco Central (Séries Temporais SGS)
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-600 px-4 py-2">
            48 Modalidades BACEN
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Seção 1: Formulário de Entrada */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Dados do Contrato
              </CardTitle>
              <CardDescription>
                Preencha os dados para análise de juros conforme BACEN
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="filtroTipoPessoa">Filtrar por Tipo de Pessoa</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant={tipoPessoaFiltro === undefined ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTipoPessoaFiltro(undefined)}
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      Todos
                    </Button>
                    <Button
                      type="button"
                      variant={tipoPessoaFiltro === 'PF' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTipoPessoaFiltro('PF')}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Pessoa Física
                    </Button>
                    <Button
                      type="button"
                      variant={tipoPessoaFiltro === 'PJ' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTipoPessoaFiltro('PJ')}
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      Pessoa Jurídica
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="modalidade">Modalidade de Crédito BACEN *</Label>
                  <Select value={modalidadeId} onValueChange={setModalidadeId} disabled={loadingModalidades}>
                    <SelectTrigger id="modalidade">
                      <SelectValue placeholder="Selecione a modalidade do BACEN" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[400px]">
                      {modalidades?.map((modalidade) => (
                        <SelectItem key={modalidade.id} value={modalidade.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant={modalidade.tipo_pessoa === 'PF' ? 'default' : 'secondary'} className="text-xs">
                              {modalidade.tipo_pessoa}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {modalidade.tipo_recurso}
                            </Badge>
                            <span>{modalidade.nome}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Selecione a modalidade exata conforme classificação do Banco Central
                  </p>
                </div>

                <div>
                  <Label htmlFor="valorFinanciamento">Valor do Financiamento *</Label>
                  <Input
                    id="valorFinanciamento"
                    type="number"
                    placeholder="Ex: 10000"
                    value={valorFinanciamento}
                    onChange={(e) => setValorFinanciamento(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="valorPrestacao">Valor da Prestação *</Label>
                  <Input
                    id="valorPrestacao"
                    type="number"
                    placeholder="Ex: 500"
                    value={valorPrestacao}
                    onChange={(e) => setValorPrestacao(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="numeroParcelas">Número de Parcelas *</Label>
                  <Input
                    id="numeroParcelas"
                    type="number"
                    placeholder="Ex: 24"
                    value={numeroParcelas}
                    onChange={(e) => setNumeroParcelas(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="taxaJurosContratual">Taxa de Juros Contratual (% a.m.)</Label>
                  <Input
                    id="taxaJurosContratual"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 2.5"
                    value={taxaJurosContratual}
                    onChange={(e) => setTaxaJurosContratual(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Taxa informada no contrato. Compararemos com a taxa real cobrada.
                  </p>
                </div>

                <div>
                  <Label htmlFor="dataAssinatura">Data de Assinatura do Contrato *</Label>
                  <Input
                    id="dataAssinatura"
                    type="date"
                    value={dataAssinatura}
                    onChange={(e) => setDataAssinatura(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Usada para buscar a taxa BACEN do período
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={handleAnalisar}
                  disabled={analisando}
                >
                  {analisando ? (
                    "Processando..."
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Analisar Juros
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Seção 2: Área de Resultados */}
          <div className="space-y-4">
            {!resultado && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Calculator className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aguardando Análise</h3>
                  <p className="text-sm text-muted-foreground">
                    Preencha os dados e clique em "Analisar Agora" para ver os resultados
                  </p>
                </CardContent>
              </Card>
            )}

            {resultado && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Resultado da Análise
                  </CardTitle>
                  <CardDescription>
                    Análise comparativa com taxas médias do BACEN
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resultado.modalidade && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-semibold mb-1">Modalidade Analisada:</p>
                      <p className="text-sm">{resultado.modalidade.nome}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={resultado.modalidade.tipo_pessoa === 'PF' ? 'default' : 'secondary'}>
                          {resultado.modalidade.tipo_pessoa}
                        </Badge>
                        <Badge variant="outline">{resultado.modalidade.categoria}</Badge>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-500/10 border border-blue-500 rounded-lg">
                      <p className="text-xs text-muted-foreground">Taxa Contratual (% a.m.)</p>
                      <p className="text-2xl font-bold text-blue-600">{resultado.taxaContratual.toFixed(4)}%</p>
                      <p className="text-xs text-muted-foreground mt-1">Informada no contrato</p>
                    </div>
                    <div className="p-3 bg-orange-500/10 border border-orange-500 rounded-lg">
                      <p className="text-xs text-muted-foreground">Taxa Real Cobrada (% a.m.)</p>
                      <p className="text-2xl font-bold text-orange-600">{resultado.taxaReal.toFixed(4)}%</p>
                      <p className="text-xs text-muted-foreground mt-1">Calculada pelos valores</p>
                    </div>
                    <div className={`p-3 rounded-lg border ${Math.abs(resultado.diferencaTaxas) > 0.01 ? 'bg-destructive/10 border-destructive' : 'bg-green-500/10 border-green-500'}`}>
                      <p className="text-xs text-muted-foreground">Diferença</p>
                      <p className={`text-2xl font-bold ${Math.abs(resultado.diferencaTaxas) > 0.01 ? 'text-destructive' : 'text-green-600'}`}>
                        {resultado.diferencaTaxas > 0 ? '+' : ''}{resultado.diferencaTaxas.toFixed(4)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.abs(resultado.percentualDiferenca).toFixed(1)}% de diferença
                      </p>
                    </div>
                  </div>

                  {Math.abs(resultado.diferencaTaxas) > 0.01 && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500 rounded-lg">
                      <p className="font-semibold text-amber-700 dark:text-amber-400">
                        ⚠️ Divergência entre Taxa Contratual e Taxa Real
                      </p>
                      <p className="text-sm mt-2 text-muted-foreground">
                        A taxa real cobrada ({resultado.taxaReal.toFixed(4)}% a.m.) está {resultado.diferencaTaxas > 0 ? 'MAIOR' : 'menor'} 
                        {' '}que a taxa contratual informada ({resultado.taxaContratual.toFixed(4)}% a.m.).
                        {resultado.diferencaTaxas > 0 && ' Esta divergência pode caracterizar cobrança indevida.'}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-background border rounded-lg">
                      <p className="text-xs text-muted-foreground">Taxa Real (Anual)</p>
                      <p className="text-2xl font-bold">{resultado.metricas.taxaEfetivaAnual.toFixed(2)}%</p>
                    </div>
                    <div className="p-3 bg-background border rounded-lg">
                      <p className="text-xs text-muted-foreground">CET (Custo Efetivo Total)</p>
                      <p className="text-2xl font-bold">{resultado.metricas.taxaEfetivaAnual.toFixed(2)}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Taxa BACEN (Mensal)</p>
                      <p className="text-2xl font-bold">{resultado.taxaBacen.taxa_mensal.toFixed(2)}%</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ref: {resultado.taxaBacen.periodo.mes}/{resultado.taxaBacen.periodo.ano}
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Taxa BACEN (Anual)</p>
                      <p className="text-2xl font-bold">
                        {resultado.taxaBacen.taxa_anual ? resultado.taxaBacen.taxa_anual.toFixed(2) : '-'}%
                      </p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${resultado.comparacao.acimaMercado ? 'bg-destructive/10 border border-destructive' : 'bg-green-500/10 border border-green-500'}`}>
                    <p className={`font-semibold text-lg ${resultado.comparacao.acimaMercado ? 'text-destructive' : 'text-green-600'}`}>
                      {resultado.comparacao.acimaMercado ? "⚠️ Taxa ACIMA da Média do Mercado" : "✓ Taxa Dentro da Média do Mercado"}
                    </p>
                    <p className="text-sm mt-2">
                      Diferença: <span className="font-bold">{resultado.comparacao.diferenca.toFixed(2)}%</span>
                      {' '}({resultado.comparacao.percentualDiferenca.toFixed(1)}% {resultado.comparacao.acimaMercado ? 'acima' : 'abaixo'})
                    </p>
                    {resultado.comparacao.acimaMercado && (
                      <p className="text-sm mt-2 text-muted-foreground">
                        A taxa praticada está significativamente acima da média do mercado para esta modalidade,
                        podendo caracterizar juros abusivos passíveis de revisão judicial.
                      </p>
                    )}
                  </div>

                  <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                    <p className="font-semibold mb-1">Fonte dos Dados:</p>
                    <p>Taxas obtidas do {resultado.taxaBacen.origem === 'banco_dados' ? 'banco de dados local (histórico)' : 'Sistema Gerenciador de Séries Temporais (SGS) do Banco Central'}</p>
                    <p className="mt-1">Consulta realizada em: {new Date(resultado.taxaBacen.data_consulta).toLocaleString('pt-BR')}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
  );
};

export default CalculadoraJuros;
