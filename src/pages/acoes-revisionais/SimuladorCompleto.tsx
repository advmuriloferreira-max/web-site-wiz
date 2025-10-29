import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "@/components/NavigationBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Calculator, TrendingUp, DollarSign, FileText, Share2, Download } from "lucide-react";
import { toast } from "sonner";
import { calcularValorParcela, gerarTabelaPrice } from "@/lib/calculosJurosAbusivos";

interface DadosSimulacao {
  valorFinanciado: number;
  taxaContratual: number;
  taxaBacen: number;
  parcelaAtual: number;
  prazoTotal: number;
  parcelasJaPagas: number;
  saldoDevedorAtual: number;
}

interface CenarioSimulacao {
  nome: string;
  descricao: string;
  parcelaMensal: number;
  saldoDevedor: number;
  prazoRestante: number;
  totalAPagar: number;
  dataQuitacao: string;
  economiaMensal?: number;
  economiaTotal?: number;
  cor: string;
}

export default function SimuladorCompleto() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState<"entrada" | "resultado">("entrada");

  // Dados de entrada
  const [valorFinanciado, setValorFinanciado] = useState("");
  const [taxaContratual, setTaxaContratual] = useState("");
  const [taxaBacen, setTaxaBacen] = useState("");
  const [parcelaAtual, setParcelaAtual] = useState("");
  const [prazoTotal, setPrazoTotal] = useState("");
  const [parcelasJaPagas, setParcelasJaPagas] = useState("");
  const [saldoDevedorAtual, setSaldoDevedorAtual] = useState("");

  // Resultados
  const [cenarios, setCenarios] = useState<CenarioSimulacao[]>([]);
  const [graficosData, setGraficosData] = useState<any>({
    evolucaoSaldo: [],
    comparacaoParcelas: []
  });

  const calcularSimulacao = () => {
    if (!valorFinanciado || !taxaContratual || !taxaBacen || !parcelaAtual || 
        !prazoTotal || !parcelasJaPagas || !saldoDevedorAtual) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      const vf = parseFloat(valorFinanciado);
      const tc = parseFloat(taxaContratual);
      const tb = parseFloat(taxaBacen);
      const pa = parseFloat(parcelaAtual);
      const pt = parseInt(prazoTotal);
      const pj = parseInt(parcelasJaPagas);
      const sd = parseFloat(saldoDevedorAtual);

      const prazoRestante = pt - pj;
      const dataAtual = new Date();

      // CENÁRIO 1: ATUAL (Continuando com taxa abusiva)
      const cenario1 = {
        nome: "Atual",
        descricao: "Mantendo taxa contratual",
        parcelaMensal: pa,
        saldoDevedor: sd,
        prazoRestante: prazoRestante,
        totalAPagar: pa * prazoRestante,
        dataQuitacao: new Date(dataAtual.setMonth(dataAtual.getMonth() + prazoRestante)).toLocaleDateString("pt-BR"),
        cor: "#ef4444"
      };

      // CENÁRIO 2: REVISADO (Com taxa BACEN)
      const parcelaRevisada = calcularValorParcela(sd, tb, prazoRestante);
      const economiaMensal2 = pa - parcelaRevisada;
      const economiaTotal2 = economiaMensal2 * prazoRestante;
      
      const cenario2 = {
        nome: "Revisado",
        descricao: "Com taxa BACEN (mercado)",
        parcelaMensal: parcelaRevisada,
        saldoDevedor: sd,
        prazoRestante: prazoRestante,
        totalAPagar: parcelaRevisada * prazoRestante,
        dataQuitacao: new Date(dataAtual.setMonth(dataAtual.getMonth() + prazoRestante)).toLocaleDateString("pt-BR"),
        economiaMensal: economiaMensal2,
        economiaTotal: economiaTotal2,
        cor: "#22c55e"
      };

      // CENÁRIO 3: OTIMISTA (Devolução em dobro + taxa BACEN)
      // Simplificação: assumir que já pagou indevidamente 30% do que já foi pago
      const totalJaPago = pa * pj;
      const indevidoPago = totalJaPago * 0.3;
      const devolucaoDobro = indevidoPago * 2;
      const novoSaldo = Math.max(0, sd - devolucaoDobro);
      const parcelaOtimista = novoSaldo > 0 ? calcularValorParcela(novoSaldo, tb, prazoRestante) : 0;
      const economiaMensal3 = pa - parcelaOtimista;
      const economiaTotal3 = (pa * prazoRestante) - (parcelaOtimista * prazoRestante);

      const cenario3 = {
        nome: "Otimista",
        descricao: "Devolução dobro + taxa BACEN",
        parcelaMensal: parcelaOtimista,
        saldoDevedor: novoSaldo,
        prazoRestante: prazoRestante,
        totalAPagar: parcelaOtimista * prazoRestante,
        dataQuitacao: new Date(dataAtual.setMonth(dataAtual.getMonth() + prazoRestante)).toLocaleDateString("pt-BR"),
        economiaMensal: economiaMensal3,
        economiaTotal: economiaTotal3,
        cor: "#9333ea"
      };

      setCenarios([cenario1, cenario2, cenario3]);

      // Gerar dados para gráfico de evolução do saldo
      const evolucaoSaldo = [];
      for (let mes = 0; mes <= Math.min(prazoRestante, 12); mes++) {
        const tabela1 = gerarTabelaPrice(sd, tc, prazoRestante);
        const tabela2 = gerarTabelaPrice(sd, tb, prazoRestante);
        const tabela3 = novoSaldo > 0 ? gerarTabelaPrice(novoSaldo, tb, prazoRestante) : [];

        evolucaoSaldo.push({
          mes: `Mês ${mes}`,
          Atual: tabela1[mes]?.saldoDevedor || 0,
          Revisado: tabela2[mes]?.saldoDevedor || 0,
          Otimista: tabela3[mes]?.saldoDevedor || 0,
        });
      }

      // Dados para comparação de parcelas
      const comparacaoParcelas = [
        { cenario: "Atual", parcela: cenario1.parcelaMensal, fill: cenario1.cor },
        { cenario: "Revisado", parcela: cenario2.parcelaMensal, fill: cenario2.cor },
        { cenario: "Otimista", parcela: cenario3.parcelaMensal, fill: cenario3.cor },
      ];

      setGraficosData({ evolucaoSaldo, comparacaoParcelas });
      setEtapa("resultado");
      toast.success("Simulação realizada com sucesso!");

    } catch (error) {
      console.error("Erro na simulação:", error);
      toast.error("Erro ao realizar simulação");
    }
  };

  const compartilharPDF = () => {
    toast.info("Gerando PDF para compartilhar com cliente...");
  };

  const novaSimulacao = () => {
    setEtapa("entrada");
    setValorFinanciado("");
    setTaxaContratual("");
    setTaxaBacen("");
    setParcelaAtual("");
    setPrazoTotal("");
    setParcelasJaPagas("");
    setSaldoDevedorAtual("");
    setCenarios([]);
  };

  return (
    <>
      <NavigationBar />
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-purple-700 dark:text-purple-400">
              Simulador de Impacto Financeiro - Ações Revisionais
            </h1>
            <p className="text-muted-foreground mt-1">
              Compare 3 cenários e mostre ao cliente o impacto financeiro da revisão
            </p>
          </div>
        </div>

        {etapa === "entrada" ? (
          <Card>
            <CardHeader>
              <CardTitle>Dados do Contrato</CardTitle>
              <CardDescription>
                Preencha os dados do contrato para simular os cenários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Valor Financiado (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="R$ 50.000,00"
                    value={valorFinanciado}
                    onChange={(e) => setValorFinanciado(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Taxa Contratual (% a.m.)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="5.50"
                    value={taxaContratual}
                    onChange={(e) => setTaxaContratual(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Taxa BACEN - Mercado (% a.m.)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="3.20"
                    value={taxaBacen}
                    onChange={(e) => setTaxaBacen(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Parcela Atual (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="R$ 1.500,00"
                    value={parcelaAtual}
                    onChange={(e) => setParcelaAtual(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Prazo Total (meses)</Label>
                  <Input
                    type="number"
                    placeholder="48"
                    value={prazoTotal}
                    onChange={(e) => setPrazoTotal(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Parcelas Já Pagas</Label>
                  <Input
                    type="number"
                    placeholder="12"
                    value={parcelasJaPagas}
                    onChange={(e) => setParcelasJaPagas(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Saldo Devedor Atual (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="R$ 45.000,00"
                    value={saldoDevedorAtual}
                    onChange={(e) => setSaldoDevedorAtual(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={calcularSimulacao}
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                <Calculator className="mr-2 h-5 w-5" />
                Simular Cenários
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Cards de Cenários */}
            <div className="grid md:grid-cols-3 gap-4">
              {cenarios.map((cenario, index) => (
                <Card key={index} className={`border-2 border-${cenario.cor}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{cenario.nome}</CardTitle>
                      <Badge style={{ backgroundColor: cenario.cor }} className="text-white">
                        {index === 0 ? "❌" : "✅"}
                      </Badge>
                    </div>
                    <CardDescription>{cenario.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Parcela Mensal</p>
                      <p className="text-2xl font-bold">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cenario.parcelaMensal)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo Devedor</p>
                      <p className="text-lg font-semibold">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cenario.saldoDevedor)}
                      </p>
                    </div>
                    {cenario.economiaTotal && (
                      <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200">
                        <p className="text-sm text-muted-foreground">Economia Total</p>
                        <p className="text-xl font-bold text-green-600">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cenario.economiaTotal)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Prazo Restante</p>
                      <p className="text-sm font-medium">{cenario.prazoRestante} meses</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Quitação Prevista</p>
                      <p className="text-sm font-medium">{cenario.dataQuitacao}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Card de Economia Destacado */}
            {cenarios[2] && (
              <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-gray-900">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                    Economia Máxima Possível
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-6xl font-bold text-purple-600">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cenarios[2].economiaTotal || 0)}
                    </p>
                    <p className="text-lg text-muted-foreground mt-2">
                      no cenário otimista (devolução em dobro + revisão)
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Gráficos */}
            <Tabs defaultValue="evolucao" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="evolucao">Evolução do Saldo</TabsTrigger>
                <TabsTrigger value="parcelas">Comparação de Parcelas</TabsTrigger>
              </TabsList>

              <TabsContent value="evolucao">
                <Card>
                  <CardHeader>
                    <CardTitle>Evolução do Saldo Devedor</CardTitle>
                    <CardDescription>Comparação dos 3 cenários ao longo do tempo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={graficosData.evolucaoSaldo}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => 
                            new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
                          }
                        />
                        <Legend />
                        <Line type="monotone" dataKey="Atual" stroke="#ef4444" strokeWidth={2} />
                        <Line type="monotone" dataKey="Revisado" stroke="#22c55e" strokeWidth={2} />
                        <Line type="monotone" dataKey="Otimista" stroke="#9333ea" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="parcelas">
                <Card>
                  <CardHeader>
                    <CardTitle>Comparação de Parcelas Mensais</CardTitle>
                    <CardDescription>Diferença entre os valores das parcelas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={graficosData.comparacaoParcelas}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="cenario" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => 
                            new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
                          }
                        />
                        <Bar dataKey="parcela">
                          {graficosData.comparacaoParcelas.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Botões de Ação */}
            <Card>
              <CardHeader>
                <CardTitle>Próximos Passos</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button onClick={compartilharPDF} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Compartilhar com Cliente
                </Button>
                <Button onClick={() => navigate("/app/acoes-revisionais/nova-analise")} variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Criar Análise Completa
                </Button>
                <Button onClick={() => navigate("/app/acoes-revisionais/gerar-peticoes")} variant="outline" className="gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
                  <Download className="h-4 w-4" />
                  Gerar Petição
                </Button>
                <Button onClick={novaSimulacao} variant="ghost" className="gap-2">
                  <Calculator className="h-4 w-4" />
                  Nova Simulação
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
