import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Trophy, Target, CheckCircle2, Clock, AlertCircle, 
  TrendingUp, FileText, Download, Search, Filter,
  ChevronRight, Calendar, DollarSign, Building2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useGestaoPassivo } from "@/hooks/useGestaoPassivo";
import { AnaliseGestaoPassivo, MomentoNegociacao } from "@/types/gestaoPassivo";

const MOMENTO_CONFIG = {
  total: {
    label: "PROVISÃO TOTAL",
    color: "bg-red-600",
    icon: Trophy,
    message: "🔥 Provisão 100%! Proposta simbólica de 5-10%",
    min: 100,
    max: 100,
  },
  premium: {
    label: "MOMENTO PREMIUM",
    color: "bg-purple-600",
    icon: Trophy,
    message: "🏆 Melhor momento! Proposta fixa de 10% do saldo",
    min: 90,
    max: 99,
  },
  otimo: {
    label: "MOMENTO ÓTIMO",
    color: "bg-green-700",
    icon: Target,
    message: "🎯 Excelente oportunidade! Banco muito motivado",
    min: 80,
    max: 89,
  },
  muito_favoravel: {
    label: "MOMENTO MUITO FAVORÁVEL",
    color: "bg-green-600",
    icon: CheckCircle2,
    message: "✅ Ótima oportunidade de negociação",
    min: 70,
    max: 79,
  },
  favoravel: {
    label: "MOMENTO FAVORÁVEL",
    color: "bg-yellow-600",
    icon: CheckCircle2,
    message: "⚠️ Bom momento para iniciar negociação",
    min: 60,
    max: 69,
  },
  inicial: {
    label: "MOMENTO INICIAL",
    color: "bg-orange-600",
    icon: AlertCircle,
    message: "⏳ Ainda cedo, mas já negociável",
    min: 50,
    max: 59,
  },
  aguardar: {
    label: "AGUARDAR",
    color: "bg-gray-500",
    icon: Clock,
    message: "⏳ Recomenda-se aguardar maior provisão",
    min: 0,
    max: 49,
  },
};

export default function DashboardOportunidades() {
  const navigate = useNavigate();
  const { data: analises, isLoading } = useGestaoPassivo();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [bancoFilter, setBancoFilter] = useState<string>("all");
  const [carteiraFilter, setCarteiraFilter] = useState<string>("all");
  const [contratoSelecionado, setContratoSelecionado] = useState<string | null>(null);

  // Calcular estatísticas gerais
  const stats = useMemo(() => {
    if (!analises) return {
      totalContratos: 0,
      valorTotalDividas: 0,
      valorTotalProvisionado: 0,
      economiaPotencial: 0,
    };

    return {
      totalContratos: analises.length,
      valorTotalDividas: analises.reduce((sum, a) => sum + a.saldo_devedor_atual, 0),
      valorTotalProvisionado: analises.reduce((sum, a) => sum + a.valor_provisao_bcb352, 0),
      economiaPotencial: analises.reduce((sum, a) => {
        const economia = a.saldo_devedor_atual - (a.valor_proposta_acordo || 0);
        return sum + economia;
      }, 0),
    };
  }, [analises]);

  // Agrupar análises por momento de negociação
  const analisesPorMomento = useMemo(() => {
    if (!analises) return {};

    const grupos: Record<string, AnaliseGestaoPassivo[]> = {
      total: [],
      premium: [],
      otimo: [],
      muito_favoravel: [],
      favoravel: [],
      inicial: [],
      aguardar: [],
    };

    analises.forEach((analise) => {
      const percentual = analise.percentual_provisao_bcb352 * 100;
      
      if (percentual >= 100) grupos.total.push(analise);
      else if (percentual >= 90) grupos.premium.push(analise);
      else if (percentual >= 80) grupos.otimo.push(analise);
      else if (percentual >= 70) grupos.muito_favoravel.push(analise);
      else if (percentual >= 60) grupos.favoravel.push(analise);
      else if (percentual >= 50) grupos.inicial.push(analise);
      else grupos.aguardar.push(analise);
    });

    return grupos;
  }, [analises]);

  // Filtrar e ordenar análises para o ranking
  const rankingOportunidades = useMemo(() => {
    if (!analises) return [];

    let filtered = [...analises];

    // Aplicar filtros
    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.numero_contrato.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.banco_nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (bancoFilter !== "all") {
      filtered = filtered.filter((a) => a.banco_nome === bancoFilter);
    }

    if (carteiraFilter !== "all") {
      filtered = filtered.filter((a) => a.carteira_bcb352 === carteiraFilter);
    }

    // Ordenar por prioridade
    return filtered.sort((a, b) => {
      // Prioridade 1: Maior provisão
      const diffProvisao = b.percentual_provisao_bcb352 - a.percentual_provisao_bcb352;
      if (Math.abs(diffProvisao) > 0.01) return diffProvisao;

      // Prioridade 2: Maior economia
      const economiaA = a.saldo_devedor_atual - (a.valor_proposta_acordo || 0);
      const economiaB = b.saldo_devedor_atual - (b.valor_proposta_acordo || 0);
      return economiaB - economiaA;
    });
  }, [analises, searchTerm, bancoFilter, carteiraFilter]);

  // Gerar dados para linha do tempo
  const timelineData = useMemo(() => {
    if (!contratoSelecionado || !analises) return [];

    const analise = analises.find((a) => a.id === contratoSelecionado);
    if (!analise) return [];

    const data = [];
    const percentualAtual = analise.percentual_provisao_bcb352 * 100;

    // Gerar pontos de 0% a 100% (a cada 10%)
    for (let mes = 0; mes <= 24; mes++) {
      const percentual = Math.min((mes / 24) * 100, 100);
      let valorProposta = 0;

      if (percentual < 90) {
        valorProposta = analise.saldo_devedor_atual - (analise.saldo_devedor_atual * (percentual / 100));
      } else {
        valorProposta = analise.saldo_devedor_atual * 0.10;
      }

      data.push({
        mes,
        percentual: parseFloat(percentual.toFixed(2)),
        valorProposta,
        isAtual: Math.abs(percentual - percentualAtual) < 5,
      });
    }

    return data;
  }, [contratoSelecionado, analises]);

  // Bancos únicos para filtro
  const bancosUnicos = useMemo(() => {
    if (!analises) return [];
    return Array.from(new Set(analises.map((a) => a.banco_nome))).sort();
  }, [analises]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Carregando oportunidades...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* HEADER COM ESTATÍSTICAS GERAIS */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard de Oportunidades</h1>
            <p className="text-muted-foreground">
              Análise premium de oportunidades de negociação baseada em provisões BCB 352
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/gestao-passivo/simulador")}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Simulador
            </Button>
            <Button onClick={() => navigate("/app/gestao-passivo/nova")}>
              <FileText className="h-4 w-4 mr-2" />
              Nova Análise
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Contratos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalContratos}</div>
              <p className="text-xs text-muted-foreground mt-1">Em análise</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valor Total de Dívidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(stats.valorTotalDividas)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Saldo devedor total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Provisionado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(stats.valorTotalProvisionado)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pelos bancos</p>
            </CardContent>
          </Card>

          <Card className="border-green-500/50 bg-gradient-to-br from-green-500/10 to-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600">
                Economia Potencial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(stats.economiaPotencial)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {((stats.economiaPotencial / stats.valorTotalDividas) * 100).toFixed(1)}% de desconto médio
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FILTROS */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar contrato ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={bancoFilter} onValueChange={setBancoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por banco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os bancos</SelectItem>
                {bancosUnicos.map((banco) => (
                  <SelectItem key={banco} value={banco}>
                    {banco}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={carteiraFilter} onValueChange={setCarteiraFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por carteira" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as carteiras</SelectItem>
                <SelectItem value="C1">C1 - Varejo Não Consignado</SelectItem>
                <SelectItem value="C2">C2 - Varejo Consignado</SelectItem>
                <SelectItem value="C3">C3 - Atacado</SelectItem>
                <SelectItem value="C4">C4 - Arrendamento</SelectItem>
                <SelectItem value="C5">C5 - Outros Ativos</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO 1: OPORTUNIDADES POR MARCO DE PROVISIONAMENTO */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Oportunidades por Marco de Provisionamento</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(MOMENTO_CONFIG).map(([key, config]) => {
            const contratos = analisesPorMomento[key] || [];
            const valorTotal = contratos.reduce((sum, c) => sum + (c.valor_proposta_acordo || 0), 0);
            const Icon = config.icon;

            return (
              <Card
                key={key}
                className={`border-2 ${
                  contratos.length > 0 ? "border-primary/50" : "border-muted"
                }`}
              >
                <CardHeader className={`${config.color} text-white rounded-t-lg`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6" />
                      <div>
                        <CardTitle className="text-lg">{config.label}</CardTitle>
                        <CardDescription className="text-white/80 text-sm">
                          {config.min}% - {config.max}% de provisão
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {contratos.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-sm mb-4 font-medium">{config.message}</p>

                  {contratos.length > 0 ? (
                    <>
                      <div className="bg-muted/50 p-3 rounded-lg mb-4">
                        <div className="text-xs text-muted-foreground mb-1">
                          Valor Total das Propostas
                        </div>
                        <div className="text-2xl font-bold">{formatCurrency(valorTotal)}</div>
                      </div>

                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {contratos.slice(0, 5).map((contrato) => (
                          <div
                            key={contrato.id}
                            className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => navigate(`/app/gestao-passivo/${contrato.id}`)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-semibold">{contrato.numero_contrato}</div>
                                <div className="text-xs text-muted-foreground">
                                  {contrato.banco_nome}
                                </div>
                              </div>
                              <Badge variant="outline">
                                {(contrato.percentual_provisao_bcb352 * 100).toFixed(1)}%
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Saldo: </span>
                                <span className="font-medium">
                                  {formatCurrency(contrato.saldo_devedor_atual)}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Proposta: </span>
                                <span className="font-medium text-green-600">
                                  {formatCurrency(contrato.valor_proposta_acordo || 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {contratos.length > 5 && (
                        <Button variant="ghost" className="w-full mt-3" size="sm">
                          Ver todos ({contratos.length})
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Nenhum contrato neste marco
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* SEÇÃO 2: LINHA DO TEMPO DE PROVISÃO */}
      {contratoSelecionado && timelineData.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Linha do Tempo de Provisão</CardTitle>
            <CardDescription>
              Evolução projetada da provisão e valor da proposta ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="mes"
                  label={{ value: "Meses", position: "insideBottom", offset: -5 }}
                />
                <YAxis
                  yAxisId="left"
                  label={{ value: "Provisão (%)", angle: -90, position: "insideLeft" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{ value: "Valor Proposta (R$)", angle: 90, position: "insideRight" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold mb-2">
                            Mês {payload[0].payload.mes}
                            {payload[0].payload.isAtual && " (Atual)"}
                          </p>
                          <p className="text-sm">
                            Provisão: {payload[0].payload.percentual.toFixed(2)}%
                          </p>
                          <p className="text-sm text-green-600">
                            Proposta: {formatCurrency(payload[0].payload.valorProposta)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine yAxisId="left" y={50} stroke="#f59e0b" strokeDasharray="3 3" />
                <ReferenceLine yAxisId="left" y={70} stroke="#10b981" strokeDasharray="3 3" />
                <ReferenceLine yAxisId="left" y={90} stroke="#8b5cf6" strokeDasharray="3 3" />
                <ReferenceLine yAxisId="left" y={100} stroke="#ef4444" strokeDasharray="3 3" />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="percentual"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={(props: any) => {
                    if (props.payload.isAtual) {
                      return (
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={8}
                          fill="#3b82f6"
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      );
                    }
                    return <circle cx={props.cx} cy={props.cy} r={4} fill="#3b82f6" />;
                  }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="valorProposta"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* SEÇÃO 4: RANKING DE MELHORES OPORTUNIDADES */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking de Melhores Oportunidades</CardTitle>
          <CardDescription>
            Ordenado por provisão, economia potencial e tempo até próximo marco
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Banco</TableHead>
                <TableHead>Carteira</TableHead>
                <TableHead className="text-right">Saldo Devedor</TableHead>
                <TableHead className="text-right">Provisão</TableHead>
                <TableHead className="text-right">Proposta</TableHead>
                <TableHead className="text-right">Economia</TableHead>
                <TableHead>Momento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankingOportunidades.slice(0, 20).map((analise, index) => {
                const economia = analise.saldo_devedor_atual - (analise.valor_proposta_acordo || 0);
                const percentualEconomia = (economia / analise.saldo_devedor_atual) * 100;
                const momentoConfig = MOMENTO_CONFIG[analise.momento_negociacao as keyof typeof MOMENTO_CONFIG];

                return (
                  <TableRow key={analise.id} className="hover:bg-muted/50">
                    <TableCell className="font-bold">{index + 1}</TableCell>
                    <TableCell>
                      <div className="font-medium">{analise.numero_contrato}</div>
                      <div className="text-xs text-muted-foreground">
                        {analise.tipo_operacao}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{analise.banco_nome}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{analise.carteira_bcb352}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(analise.saldo_devedor_atual)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className={momentoConfig?.color}>
                        {(analise.percentual_provisao_bcb352 * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(analise.valor_proposta_acordo || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium text-green-600">
                        {formatCurrency(economia)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {percentualEconomia.toFixed(1)}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="whitespace-nowrap">
                        {momentoConfig?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => navigate(`/app/gestao-passivo/${analise.id}`)}
                      >
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {rankingOportunidades.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma oportunidade encontrada com os filtros selecionados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
