import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Save, TrendingUp, User, Building2, Filter } from "lucide-react";
import { EnterpriseLayout } from "@/components/layout/EnterpriseLayout";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useModalidadesBacenJuros } from "@/hooks/useModalidadesBacenJuros";
import { calcularMetricasFinanceiras, compararTaxaBacen } from "@/modules/FinancialAnalysis/lib/financialCalculations";
import { useCreateContrato } from "@/hooks/useCreateContrato";
import { useClientes } from "@/hooks/useClientes";
import { useBancos } from "@/hooks/useBancos";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const CalculadoraJuros = () => {
  const navigate = useNavigate();
  const [tipoPessoaFiltro, setTipoPessoaFiltro] = useState<'PF' | 'PJ' | undefined>(undefined);
  const { data: modalidades, isLoading: loadingModalidades } = useModalidadesBacenJuros(tipoPessoaFiltro);
  const { data: clientes } = useClientes();
  const { data: bancos } = useBancos();
  const createContrato = useCreateContrato();

  // Estados do formulário
  const [valorFinanciamento, setValorFinanciamento] = useState("");
  const [valorPrestacao, setValorPrestacao] = useState("");
  const [numeroParcelas, setNumeroParcelas] = useState("");
  const [dataAssinatura, setDataAssinatura] = useState("");
  const [modalidadeId, setModalidadeId] = useState("");
  const [acao, setAcao] = useState<"analisar" | "cadastrar">("analisar");
  const [clienteId, setClienteId] = useState("");
  const [bancoId, setBancoId] = useState("");

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
      console.log('Iniciando análise com modalidade:', modalidadeId);
      
      // 1. Consultar taxa BACEN usando a nova edge function
      const { data, error } = await supabase.functions.invoke('consultar-taxa-bacen-sgs', {
        body: {
          modalidadeId,
          dataConsulta: dataAssinatura,
        }
      });

      if (error) {
        console.error('Erro ao consultar taxa BACEN:', error);
        throw new Error(error.message || 'Erro ao consultar taxa BACEN');
      }

      console.log('Taxa BACEN consultada:', data);

      // 2. Calcular métricas financeiras do contrato
      const valorPrest = parseFloat(valorPrestacao);
      const valorFin = parseFloat(valorFinanciamento);
      const parcelas = parseInt(numeroParcelas);
      
      // Calcular taxa mensal aproximada usando fórmula simplificada
      // Esta é uma aproximação, idealmente deveria usar TIR
      const taxaMensalContrato = ((valorPrest * parcelas) / valorFin - 1) / parcelas * 100;
      
      const metricas = calcularMetricasFinanceiras({
        valorDivida: valorFin,
        saldoContabil: valorFin,
        taxaBacen: data.taxa_mensal,
        taxaJuros: taxaMensalContrato,
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

      setResultado({
        metricas,
        comparacao,
        taxaBacen: data,
        modalidade: data.modalidade,
      });

      toast.success("Análise concluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao analisar:", error);
      toast.error("Erro ao realizar análise: " + error.message);
    } finally {
      setAnalisando(false);
    }
  };

  const handleCadastrar = async () => {
    if (!valorFinanciamento || !valorPrestacao || !numeroParcelas || !dataAssinatura || !modalidadeId || !clienteId || !bancoId) {
      toast.error("Preencha todos os campos obrigatórios para cadastrar");
      return;
    }

    try {
      // Buscar o código da modalidade para salvar no contrato
      const modalidade = modalidades?.find(m => m.id === modalidadeId);
      
      await createContrato.mutateAsync({
        cliente_id: clienteId,
        banco_id: bancoId,
        tipo_operacao_bcb: modalidade?.codigo_sgs || modalidadeId,
        saldo_contabil: parseFloat(valorFinanciamento),
        valor_divida: parseFloat(valorFinanciamento),
        numero_parcelas: parseInt(numeroParcelas),
        valor_parcela: parseFloat(valorPrestacao),
      });

      toast.success("Contrato cadastrado com sucesso!");
      navigate("/contratos");
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error);
      toast.error("Erro ao cadastrar contrato: " + error.message);
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

        <Alert>
          <AlertDescription>
            <strong>Escolha sua ação:</strong> Você pode apenas analisar os juros ou salvar o contrato completo para provisionamento e gestão.
          </AlertDescription>
        </Alert>

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
                {/* Escolha de Ação */}
                <div>
                  <Label>O que deseja fazer? *</Label>
                  <RadioGroup value={acao} onValueChange={(v) => setAcao(v as any)} className="flex flex-col gap-2 mt-2">
                    <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="analisar" id="analisar" />
                      <label htmlFor="analisar" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="font-medium">Apenas Analisar Juros</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Análise rápida sem salvar o contrato
                        </p>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="cadastrar" id="cadastrar" />
                      <label htmlFor="cadastrar" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Save className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Salvar para Provisionamento</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Salvar contrato completo para gestão e provisão
                        </p>
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Campos condicionais para cadastrar */}
                {acao === "cadastrar" && (
                  <>
                    <div>
                      <Label htmlFor="cliente">Cliente *</Label>
                      <Select value={clienteId} onValueChange={setClienteId}>
                        <SelectTrigger id="cliente">
                          <SelectValue placeholder="Selecione o cliente" />
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

                    <div>
                      <Label htmlFor="banco">Banco *</Label>
                      <Select value={bancoId} onValueChange={setBancoId}>
                        <SelectTrigger id="banco">
                          <SelectValue placeholder="Selecione o banco" />
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
                  </>
                )}

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
                  onClick={acao === "analisar" ? handleAnalisar : handleCadastrar}
                  disabled={analisando}
                >
                  {analisando ? (
                    "Processando..."
                  ) : acao === "analisar" ? (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Analisar Agora
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar e Analisar
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-background border rounded-lg">
                      <p className="text-xs text-muted-foreground">Taxa do Contrato (Mensal)</p>
                      <p className="text-2xl font-bold">{resultado.metricas.taxaEfetivaMensal.toFixed(2)}%</p>
                    </div>
                    <div className="p-3 bg-background border rounded-lg">
                      <p className="text-xs text-muted-foreground">Taxa do Contrato (Anual)</p>
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
