import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGestaoPassivo } from "@/hooks/useGestaoPassivo";
import { determinarMarcoProvisionamento, determinarMomentoNegociacao } from "@/lib/calculoGestaoPassivo";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts";

export default function SimuladorCenarios() {
  const navigate = useNavigate();
  const { data: analises = [], isLoading } = useGestaoPassivo();
  
  const [contratoSelecionado, setContratoSelecionado] = useState<string>("");
  const [mesesAguardar, setMesesAguardar] = useState([0]);

  // Buscar análise selecionada
  const analiseSelecionada = useMemo(() => {
    return analises.find((a) => a.id === contratoSelecionado);
  }, [analises, contratoSelecionado]);

  // Calcular cenários
  const cenarios = useMemo(() => {
    if (!analiseSelecionada) return null;

    const mesesAtual = analiseSelecionada.meses_atraso;
    const mesesFuturo = mesesAtual + mesesAguardar[0];
    const saldoDevedor = Number(analiseSelecionada.saldo_devedor_atual);

    // Simulação de crescimento de provisão (simplificado)
    // Na prática, isso deveria consultar uma tabela real
    const calcularProvisao = (meses: number): number => {
      if (meses >= 24) return 100;
      if (meses >= 18) return 90;
      if (meses >= 15) return 80;
      if (meses >= 12) return 70;
      if (meses >= 9) return 60;
      if (meses >= 6) return 50;
      if (meses >= 3) return 30;
      return 10;
    };

    const provisaoAtual = analiseSelecionada.percentual_provisao_bcb352;
    const provisaoFutura = calcularProvisao(mesesFuturo);

    const valorProvisaoAtual = saldoDevedor * (provisaoAtual / 100);
    const valorProvisaoFutura = saldoDevedor * (provisaoFutura / 100);

    // Calcular proposta
    const calcularProposta = (provisao: number): number => {
      if (provisao >= 90) {
        return saldoDevedor * 0.10; // 10% fixo
      } else {
        return saldoDevedor - (saldoDevedor * (provisao / 100));
      }
    };

    const propostaAtual = calcularProposta(provisaoAtual);
    const propostaFutura = calcularProposta(provisaoFutura);

    const marcoAtual = determinarMarcoProvisionamento(provisaoAtual);
    const marcoFuturo = determinarMarcoProvisionamento(provisaoFutura);

    const momentoAtual = determinarMomentoNegociacao(provisaoAtual);
    const momentoFuturo = determinarMomentoNegociacao(provisaoFutura);

    const economiaAdicional = propostaAtual - propostaFutura;
    const percentualEconomia = ((economiaAdicional / saldoDevedor) * 100);

    return {
      atual: {
        meses: mesesAtual,
        provisao: provisaoAtual,
        valorProvisao: valorProvisaoAtual,
        proposta: propostaAtual,
        percentualProposta: (propostaAtual / saldoDevedor) * 100,
        marco: marcoAtual,
        momento: momentoAtual,
      },
      futuro: {
        meses: mesesFuturo,
        provisao: provisaoFutura,
        valorProvisao: valorProvisaoFutura,
        proposta: propostaFutura,
        percentualProposta: (propostaFutura / saldoDevedor) * 100,
        marco: marcoFuturo,
        momento: momentoFuturo,
      },
      economiaAdicional,
      percentualEconomia,
      saldoDevedor,
    };
  }, [analiseSelecionada, mesesAguardar]);

  // Gerar dados para o gráfico
  const dadosGrafico = useMemo(() => {
    if (!analiseSelecionada) return [];

    const mesesBase = analiseSelecionada.meses_atraso;
    const saldoDevedor = Number(analiseSelecionada.saldo_devedor_atual);
    const dados = [];

    for (let i = 0; i <= 24; i++) {
      const meses = mesesBase + i;
      let provisao = 10;

      if (meses >= 24) provisao = 100;
      else if (meses >= 18) provisao = 90;
      else if (meses >= 15) provisao = 80;
      else if (meses >= 12) provisao = 70;
      else if (meses >= 9) provisao = 60;
      else if (meses >= 6) provisao = 50;
      else if (meses >= 3) provisao = 30;

      const proposta = provisao >= 90 
        ? saldoDevedor * 0.10 
        : saldoDevedor - (saldoDevedor * (provisao / 100));

      dados.push({
        mesesAguardar: i,
        mesesTotal: meses,
        provisao,
        proposta: Math.round(proposta),
        propostaFormatada: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 0,
        }).format(proposta),
      });
    }

    return dados;
  }, [analiseSelecionada]);

  // Gerar recomendação
  const recomendacao = useMemo(() => {
    if (!cenarios) return null;

    const { atual, futuro, economiaAdicional, percentualEconomia } = cenarios;

    // Se já está em 90%+, não vale a pena aguardar
    if (atual.provisao >= 90) {
      return {
        tipo: 'alerta',
        icone: <AlertTriangle className="h-5 w-5" />,
        titulo: 'Não Recomendado Aguardar',
        mensagem: `O contrato já está em ${atual.provisao.toFixed(0)}% de provisão (momento premium). Negocie agora para garantir acordo de ${atual.percentualProposta.toFixed(0)}% do saldo.`,
        cor: 'text-orange-600 bg-orange-500/10 border-orange-500/20',
      };
    }

    // Se ao aguardar atingirá 90%+
    if (futuro.provisao >= 90 && atual.provisao < 90) {
      return {
        tipo: 'sucesso',
        icone: <CheckCircle2 className="h-5 w-5" />,
        titulo: 'Recomendado Aguardar',
        mensagem: `Aguardando ${mesesAguardar[0]} meses, o contrato atingirá ${futuro.provisao.toFixed(0)}% de provisão (momento premium). Proposta cairá para 10% fixo, economizando ${Math.abs(percentualEconomia).toFixed(1)}% adicional.`,
        cor: 'text-green-600 bg-green-500/10 border-green-500/20',
      };
    }

    // Se haverá mudança de marco significativa
    if (futuro.marco !== atual.marco && futuro.provisao > atual.provisao) {
      return {
        tipo: 'info',
        icone: <TrendingUp className="h-5 w-5" />,
        titulo: 'Aguardar Pode Ser Vantajoso',
        mensagem: `Aguardando ${mesesAguardar[0]} meses, o contrato mudará de ${atual.marco}% para ${futuro.marco}% de provisão, economizando mais ${Math.abs(percentualEconomia).toFixed(1)}% do saldo devedor.`,
        cor: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
      };
    }

    // Não há vantagem significativa
    return {
      tipo: 'neutro',
      icone: <Calendar className="h-5 w-5" />,
      titulo: 'Análise Neutra',
      mensagem: `Aguardar ${mesesAguardar[0]} meses trará economia adicional de apenas ${Math.abs(percentualEconomia).toFixed(1)}%. Considere outros fatores como urgência e relacionamento com o banco.`,
      cor: 'text-gray-600 bg-gray-500/10 border-gray-500/20',
    };
  }, [cenarios, mesesAguardar]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getMomentoLabel = (momento: string) => {
    const labels: Record<string, string> = {
      inicial: 'Inicial',
      favoravel: 'Favorável',
      muito_favoravel: 'Muito Favorável',
      otimo: 'Ótimo',
      premium: 'Premium 💎',
      total: 'Total 🔥',
    };
    return labels[momento] || momento;
  };

  const getMomentoBadge = (momento: string) => {
    const colors: Record<string, string> = {
      inicial: 'bg-gray-500/10 text-gray-600',
      favoravel: 'bg-yellow-500/10 text-yellow-600',
      muito_favoravel: 'bg-lime-500/10 text-lime-600',
      otimo: 'bg-green-500/10 text-green-600',
      premium: 'bg-purple-500/10 text-purple-600',
      total: 'bg-red-500/10 text-red-600',
    };
    return colors[momento] || 'bg-gray-500/10 text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando análises...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Simulador de Cenários</h1>
            <p className="text-muted-foreground">
              Simule diferentes momentos de negociação e encontre o timing ideal
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          Premium
        </Badge>
      </div>

      {/* Seleção de Contrato */}
      <Card>
        <CardHeader>
          <CardTitle>Selecione o Contrato</CardTitle>
          <CardDescription>
            Escolha o contrato para simular cenários de negociação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={contratoSelecionado} onValueChange={setContratoSelecionado}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um contrato..." />
            </SelectTrigger>
            <SelectContent>
              {analises.map((analise) => (
                <SelectItem key={analise.id} value={analise.id}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium">{analise.numero_contrato}</span>
                    <span className="text-sm text-muted-foreground">
                      {analise.banco_nome} • {analise.percentual_provisao_bcb352.toFixed(0)}% provisão
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Simulador */}
      {analiseSelecionada && cenarios && (
        <>
          {/* Slider de Meses */}
          <Card>
            <CardHeader>
              <CardTitle>Quantos meses aguardar?</CardTitle>
              <CardDescription>
                Arraste o controle para simular diferentes períodos de espera
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Período de Espera:</span>
                  <Badge variant="secondary" className="text-lg px-4 py-1">
                    {mesesAguardar[0]} {mesesAguardar[0] === 1 ? 'mês' : 'meses'}
                  </Badge>
                </div>
                <Slider
                  value={mesesAguardar}
                  onValueChange={setMesesAguardar}
                  min={0}
                  max={24}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Hoje</span>
                  <span>6 meses</span>
                  <span>12 meses</span>
                  <span>18 meses</span>
                  <span>24 meses</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recomendação */}
          {recomendacao && (
            <Card className={`border-2 ${recomendacao.cor}`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={recomendacao.cor}>
                    {recomendacao.icone}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{recomendacao.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{recomendacao.mensagem}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comparação Lado a Lado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cenário Atual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Hoje
                </CardTitle>
                <CardDescription>Situação atual do contrato</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Meses de Atraso:</span>
                    <span className="font-medium">{cenarios.atual.meses} meses</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Provisão BCB 352:</span>
                    <span className="font-medium">{cenarios.atual.provisao.toFixed(2)}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valor Provisão:</span>
                    <span className="font-medium">{formatCurrency(cenarios.atual.valorProvisao)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-t">
                    <span className="text-sm text-muted-foreground">Valor Proposta:</span>
                    <span className="font-bold text-lg text-primary">
                      {formatCurrency(cenarios.atual.proposta)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">% do Saldo:</span>
                    <span className="font-medium">{cenarios.atual.percentualProposta.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Marco:</span>
                    <Badge variant="secondary">{cenarios.atual.marco}%</Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Momento:</span>
                    <Badge className={getMomentoBadge(cenarios.atual.momento)}>
                      {getMomentoLabel(cenarios.atual.momento)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cenário Futuro */}
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Daqui a {mesesAguardar[0]} {mesesAguardar[0] === 1 ? 'mês' : 'meses'}
                </CardTitle>
                <CardDescription>Projeção se aguardar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Meses de Atraso:</span>
                    <span className="font-medium">{cenarios.futuro.meses} meses</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Provisão BCB 352:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cenarios.futuro.provisao.toFixed(2)}%</span>
                      {cenarios.futuro.provisao > cenarios.atual.provisao && (
                        <Badge variant="destructive" className="text-xs">
                          +{(cenarios.futuro.provisao - cenarios.atual.provisao).toFixed(0)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valor Provisão:</span>
                    <span className="font-medium">{formatCurrency(cenarios.futuro.valorProvisao)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-t">
                    <span className="text-sm text-muted-foreground">Valor Proposta:</span>
                    <span className="font-bold text-lg text-primary">
                      {formatCurrency(cenarios.futuro.proposta)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">% do Saldo:</span>
                    <span className="font-medium">{cenarios.futuro.percentualProposta.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Marco:</span>
                    <Badge variant="secondary">{cenarios.futuro.marco}%</Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Momento:</span>
                    <Badge className={getMomentoBadge(cenarios.futuro.momento)}>
                      {getMomentoLabel(cenarios.futuro.momento)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Economia */}
          <Card className="bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Economia Adicional ao Aguardar</p>
                <p className="text-4xl font-bold text-primary">
                  {formatCurrency(Math.abs(cenarios.economiaAdicional))}
                </p>
                <p className="text-sm text-muted-foreground">
                  ({Math.abs(cenarios.percentualEconomia).toFixed(2)}% do saldo devedor)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Evolução */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Proposta ao Longo do Tempo</CardTitle>
              <CardDescription>
                Visualize como a proposta de acordo evolui conforme aumenta a provisão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={dadosGrafico}>
                  <defs>
                    <linearGradient id="colorProposta" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="mesesAguardar" 
                    label={{ value: 'Meses a Aguardar', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                    label={{ value: 'Valor da Proposta', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(value)}
                    labelFormatter={(label) => `Aguardar ${label} meses`}
                  />
                  <ReferenceLine 
                    x={mesesAguardar[0]} 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    label={{ 
                      value: 'Selecionado', 
                      position: 'top',
                      fill: '#3b82f6',
                      fontWeight: 'bold'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="proposta" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fill="url(#colorProposta)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Provisão */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Provisão BCB 352</CardTitle>
              <CardDescription>
                Percentual de provisão ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="mesesAguardar" 
                    label={{ value: 'Meses a Aguardar', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'Provisão (%)', angle: -90, position: 'insideLeft' }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    formatter={(value: any) => `${value}%`}
                    labelFormatter={(label) => `Aguardar ${label} meses`}
                  />
                  <Legend />
                  <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" label="50%" />
                  <ReferenceLine y={70} stroke="#84cc16" strokeDasharray="3 3" label="70%" />
                  <ReferenceLine y={90} stroke="#8b5cf6" strokeDasharray="3 3" label="90%" />
                  <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" label="100%" />
                  <ReferenceLine 
                    x={mesesAguardar[0]} 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  <Line 
                    type="stepAfter" 
                    dataKey="provisao" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!contratoSelecionado && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Selecione um Contrato</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Escolha um contrato acima para começar a simular diferentes cenários de negociação
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
