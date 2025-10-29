import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, Target, DollarSign, Trophy,
  Filter, Eye, Calendar, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { useGestaoPassivo } from "@/hooks/useGestaoPassivo";

interface Marco {
  label: string;
  min: number;
  max: number;
  color: string;
  badgeColor: string;
  message: string;
}

const MARCOS: Record<string, Marco> = {
  marco_50: {
    label: "Momento Inicial",
    min: 50,
    max: 59,
    color: "bg-yellow-500",
    badgeColor: "bg-yellow-500 text-white",
    message: "Ainda cedo, mas já negociável",
  },
  marco_60: {
    label: "Momento Favorável",
    min: 60,
    max: 69,
    color: "bg-orange-500",
    badgeColor: "bg-orange-500 text-white",
    message: "Bom momento para iniciar negociação",
  },
  marco_70: {
    label: "Muito Favorável",
    min: 70,
    max: 79,
    color: "bg-orange-600",
    badgeColor: "bg-orange-600 text-white",
    message: "Ótima oportunidade de negociação",
  },
  marco_80: {
    label: "Momento Ótimo",
    min: 80,
    max: 89,
    color: "bg-green-600",
    badgeColor: "bg-green-600 text-white",
    message: "Excelente oportunidade! Banco muito motivado",
  },
  marco_90: {
    label: "PREMIUM",
    min: 90,
    max: 100,
    color: "bg-green-800",
    badgeColor: "bg-green-800 text-white",
    message: "🏆 Melhor momento! Proposta fixa de 10%",
  },
};

const generateEvolutionData = () => {
  const data = [];
  for (let mes = 0; mes <= 24; mes++) {
    const c1 = Math.min(5.5 + (mes * 4.5), 100);
    const c2 = Math.min(30 + (mes * 3.4), 100);
    const c3 = Math.min(45 + (mes * 2.6), 100);
    const c4 = Math.min(35 + (mes * 3.0), 100);
    const c5 = Math.min(50 + (mes * 2.4), 100);
    
    data.push({
      mes,
      C1: parseFloat(c1.toFixed(1)),
      C2: parseFloat(c2.toFixed(1)),
      C3: parseFloat(c3.toFixed(1)),
      C4: parseFloat(c4.toFixed(1)),
      C5: parseFloat(c5.toFixed(1)),
    });
  }
  return data;
};

export default function DashboardOportunidades() {
  const navigate = useNavigate();
  const { data: analises, isLoading } = useGestaoPassivo();

  const [filtro_banco, setFiltroBanco] = useState<string>("all");
  const [filtro_carteira, setFiltroCarteira] = useState<string>("all");
  const [filtro_estagio, setFiltroEstagio] = useState<string>("all");
  const [filtro_marco, setFiltroMarco] = useState<string>("all");
  const [filtro_tipo_pessoa, setFiltroTipoPessoa] = useState<string>("all");

  const analisesFiltradas = useMemo(() => {
    if (!analises) return [];
    let filtered = [...analises];

    if (filtro_banco !== "all") {
      filtered = filtered.filter((a) => a.banco_nome === filtro_banco);
    }
    if (filtro_carteira !== "all") {
      filtered = filtered.filter((a) => a.carteira_bcb352 === filtro_carteira);
    }
    if (filtro_estagio !== "all") {
      const estagio = parseInt(filtro_estagio);
      filtered = filtered.filter((a) => a.estagio_cmn4966 === estagio);
    }
    if (filtro_marco !== "all") {
      const marco = MARCOS[filtro_marco];
      filtered = filtered.filter((a) => {
        const percentual = a.percentual_provisao_bcb352 * 100;
        return percentual >= marco.min && percentual <= marco.max;
      });
    }
    if (filtro_tipo_pessoa !== "all") {
      filtered = filtered.filter((a) => a.tipo_pessoa === filtro_tipo_pessoa);
    }
    return filtered;
  }, [analises, filtro_banco, filtro_carteira, filtro_estagio, filtro_marco, filtro_tipo_pessoa]);

  const metricas = useMemo(() => {
    if (!analisesFiltradas.length) {
      return {
        totalContratos: 0,
        totalProvisao: 0,
        oportunidadesPremium: 0,
        economiaPotencial: 0,
      };
    }

    const totalProvisao = analisesFiltradas.reduce((sum, a) => sum + a.valor_provisao_bcb352, 0);
    const oportunidadesPremium = analisesFiltradas.filter(
      (a) => a.percentual_provisao_bcb352 * 100 >= 90
    ).length;

    const totalDesconto = analisesFiltradas.reduce((sum, a) => {
      return sum + (a.percentual_proposta_acordo || 0);
    }, 0);
    const economiaPotencial = totalDesconto / analisesFiltradas.length;

    return {
      totalContratos: analisesFiltradas.length,
      totalProvisao,
      oportunidadesPremium,
      economiaPotencial,
    };
  }, [analisesFiltradas]);

  const contratosPorMarco = useMemo(() => {
    const grupos: Record<string, typeof analisesFiltradas> = {
      marco_50: [],
      marco_60: [],
      marco_70: [],
      marco_80: [],
      marco_90: [],
    };

    analisesFiltradas.forEach((analise) => {
      const percentual = analise.percentual_provisao_bcb352 * 100;
      
      if (percentual >= 90) grupos.marco_90.push(analise);
      else if (percentual >= 80) grupos.marco_80.push(analise);
      else if (percentual >= 70) grupos.marco_70.push(analise);
      else if (percentual >= 60) grupos.marco_60.push(analise);
      else if (percentual >= 50) grupos.marco_50.push(analise);
    });

    return grupos;
  }, [analisesFiltradas]);

  const proximasMudancas = useMemo(() => {
    return analisesFiltradas
      .map((analise) => {
        const percentualAtual = analise.percentual_provisao_bcb352 * 100;
        
        let proximoMarco = 0;
        if (percentualAtual < 50) proximoMarco = 50;
        else if (percentualAtual < 60) proximoMarco = 60;
        else if (percentualAtual < 70) proximoMarco = 70;
        else if (percentualAtual < 80) proximoMarco = 80;
        else if (percentualAtual < 90) proximoMarco = 90;
        else proximoMarco = 100;

        const diasParaMudanca = Math.floor(((proximoMarco - percentualAtual) / 100) * 365);

        return {
          analise,
          percentualAtual,
          proximoMarco,
          diasParaMudanca,
        };
      })
      .filter((item) => item.diasParaMudanca > 0 && item.diasParaMudanca <= 30)
      .sort((a, b) => a.diasParaMudanca - b.diasParaMudanca)
      .slice(0, 10);
  }, [analisesFiltradas]);

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

  const evolutionData = generateEvolutionData();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard de Oportunidades</h1>
        <p className="text-muted-foreground">
          Análise estratégica de oportunidades de negociação baseada em provisão BCB 352/2023
        </p>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Contratos
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metricas.totalContratos}</div>
            <p className="text-xs text-muted-foreground mt-1">Analisados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total em Provisão
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(metricas.totalProvisao)}</div>
            <p className="text-xs text-muted-foreground mt-1">Provisionado pelos bancos</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/50 bg-gradient-to-br from-green-500/10 to-background">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-600">
                Oportunidades Premium
              </CardTitle>
              <Trophy className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {metricas.oportunidadesPremium}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Provisão ≥ 90%</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/50 bg-gradient-to-br from-blue-500/10 to-background">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-600">
                Economia Potencial
              </CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {metricas.economiaPotencial.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Desconto médio</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* FILTROS - SIDEBAR */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Por Banco</label>
                <Select value={filtro_banco} onValueChange={setFiltroBanco}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
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
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Por Carteira</label>
                <Select value={filtro_carteira} onValueChange={setFiltroCarteira}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as carteiras</SelectItem>
                    <SelectItem value="C1">C1 - Máxima Liquidez</SelectItem>
                    <SelectItem value="C2">C2 - Alta Liquidez</SelectItem>
                    <SelectItem value="C3">C3 - Liquidez Moderada</SelectItem>
                    <SelectItem value="C4">C4 - Sem Garantia PJ</SelectItem>
                    <SelectItem value="C5">C5 - Sem Garantia PF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Por Estágio</label>
                <Select value={filtro_estagio} onValueChange={setFiltroEstagio}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os estágios</SelectItem>
                    <SelectItem value="1">Estágio 1 (0-30 dias)</SelectItem>
                    <SelectItem value="2">Estágio 2 (31-90 dias)</SelectItem>
                    <SelectItem value="3">Estágio 3 (&gt;90 dias)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Por Marco</label>
                <Select value={filtro_marco} onValueChange={setFiltroMarco}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os marcos</SelectItem>
                    {Object.entries(MARCOS).map(([key, marco]) => (
                      <SelectItem key={key} value={key}>
                        {marco.label} ({marco.min}-{marco.max}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Por Tipo de Pessoa</label>
                <Select value={filtro_tipo_pessoa} onValueChange={setFiltroTipoPessoa}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="PF">Pessoa Física</SelectItem>
                    <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setFiltroBanco("all");
                  setFiltroCarteira("all");
                  setFiltroEstagio("all");
                  setFiltroMarco("all");
                  setFiltroTipoPessoa("all");
                }}
              >
                Limpar Filtros
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="lg:col-span-3 space-y-6">
          {/* SEÇÃO: MARCOS DE PROVISIONAMENTO */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Marcos de Provisionamento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(MARCOS).map(([key, marco]) => {
                const contratos = contratosPorMarco[key] || [];
                const valorTotal = contratos.reduce((sum, c) => sum + (c.valor_proposta_acordo || 0), 0);

                return (
                  <Card key={key} className="border-2">
                    <CardHeader className={`${marco.color} text-white rounded-t-lg`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge className={marco.badgeColor}>{marco.label}</Badge>
                          <CardDescription className="text-white/80 text-xs mt-1">
                            {marco.min}% - {marco.max}% de provisão
                          </CardDescription>
                        </div>
                        <div className="text-2xl font-bold">{contratos.length}</div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm mb-3">{marco.message}</p>
                      
                      {key === "marco_90" && (
                        <div className="bg-green-100 dark:bg-green-900/20 border border-green-500 rounded p-2 mb-3">
                          <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                            ⚡ Proposta fixa de 10%
                          </p>
                        </div>
                      )}

                      <div className="bg-muted/50 p-3 rounded-lg mb-3">
                        <div className="text-xs text-muted-foreground">Valor em Negociação</div>
                        <div className="text-xl font-bold">{formatCurrency(valorTotal)}</div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={contratos.length === 0}
                        onClick={() => navigate(`/app/gestao-passivo?marco=${key}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Contratos ({contratos.length})
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* SEÇÃO: GRÁFICO DE EVOLUÇÃO */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Provisão por Carteira</CardTitle>
              <CardDescription>
                Percentual de provisão ao longo dos meses de atraso (BCB 352/2023)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="mes" 
                    label={{ value: "Meses de Atraso", position: "insideBottom", offset: -5 }} 
                  />
                  <YAxis 
                    label={{ value: "Provisão (%)", angle: -90, position: "insideLeft" }} 
                  />
                  <Tooltip 
                    formatter={(value) => `${value}%`}
                    labelFormatter={(label) => `${label} meses`}
                  />
                  <Legend />
                  
                  <ReferenceLine y={50} stroke="#eab308" strokeDasharray="3 3" label="50%" />
                  <ReferenceLine y={60} stroke="#f97316" strokeDasharray="3 3" label="60%" />
                  <ReferenceLine y={70} stroke="#ea580c" strokeDasharray="3 3" label="70%" />
                  <ReferenceLine y={80} stroke="#16a34a" strokeDasharray="3 3" label="80%" />
                  <ReferenceLine y={90} stroke="#15803d" strokeDasharray="3 3" label="90%" />
                  
                  <Line type="monotone" dataKey="C1" stroke="#8b5cf6" strokeWidth={2} name="C1 - Máxima Liquidez" />
                  <Line type="monotone" dataKey="C2" stroke="#3b82f6" strokeWidth={2} name="C2 - Alta Liquidez" />
                  <Line type="monotone" dataKey="C3" stroke="#10b981" strokeWidth={2} name="C3 - Liquidez Moderada" />
                  <Line type="monotone" dataKey="C4" stroke="#f59e0b" strokeWidth={2} name="C4 - Sem Garantia PJ" />
                  <Line type="monotone" dataKey="C5" stroke="#ef4444" strokeWidth={2} name="C5 - Sem Garantia PF" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* SEÇÃO: PRÓXIMAS MUDANÇAS DE PROVISÃO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximas Mudanças de Provisão
              </CardTitle>
              <CardDescription>
                Contratos que mudarão de faixa nos próximos 30 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {proximasMudancas.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contrato</TableHead>
                      <TableHead>Banco</TableHead>
                      <TableHead>Provisão Atual</TableHead>
                      <TableHead>Próximo Marco</TableHead>
                      <TableHead>Dias para Mudança</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proximasMudancas.map(({ analise, percentualAtual, proximoMarco, diasParaMudanca }) => (
                      <TableRow key={analise.id}>
                        <TableCell className="font-medium">{analise.numero_contrato}</TableCell>
                        <TableCell>{analise.banco_nome}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{percentualAtual.toFixed(1)}%</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{proximoMarco}%</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {diasParaMudanca <= 7 && (
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            )}
                            <span className={diasParaMudanca <= 7 ? "font-bold text-amber-600" : ""}>
                              {diasParaMudanca} dias
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/app/gestao-passivo/${analise.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma mudança prevista nos próximos 30 dias
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
