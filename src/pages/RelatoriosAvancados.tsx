import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, DollarSign, PieChart, FileText } from "lucide-react";
import { useRelatorioProvisao, useRelatorioPosicaoContratos, useRelatorioRisco } from "@/hooks/useRelatorios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from "recharts";
import { GlassCard } from "@/components/ui/glassmorphism";
import { GradientText } from "@/components/ui/gradient-elements";
import { ColoredIcon } from "@/components/ui/color-consistency";
import { PremiumStatsCard } from "@/components/dashboard/PremiumStatsCard";
import { ResponsiveContainer as LayoutResponsiveContainer } from "@/components/ui/layout-consistency";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function RelatoriosAvancados() {
  const { data: relatorioProvisao, isLoading: loadingProvisao } = useRelatorioProvisao();
  const { data: relatorioPosicao, isLoading: loadingPosicao } = useRelatorioPosicaoContratos();
  const { data: relatorioRisco, isLoading: loadingRisco } = useRelatorioRisco();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <LayoutResponsiveContainer className="py-8 animate-fade-in">
      <div className="mb-8">
        <GradientText variant="primary" className="text-3xl font-bold mb-2 flex items-center">
          <ColoredIcon icon={BarChart3} className="mr-3" />
          Relatórios Avançados
        </GradientText>
        <p className="text-muted-foreground">
          Análise detalhada da evolução do provisionamento e distribuição de risco
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-slide-up">
        <PremiumStatsCard
          title="Total Contratos"
          value={relatorioProvisao?.total_contratos?.toString() || "0"}
          icon={FileText}
          color="blue"
        />
        <PremiumStatsCard
          title="Valor Total Dívidas"
          value={formatCurrency(relatorioProvisao?.valor_total_dividas || 0)}
          icon={DollarSign}
          color="emerald"
        />
        <PremiumStatsCard
          title="Valor Total Provisão"
          value={formatCurrency(relatorioProvisao?.valor_total_provisao || 0)}
          icon={TrendingUp}
          color="amber"
          trend={relatorioProvisao?.percentual_medio_provisao ? {
            value: relatorioProvisao.percentual_medio_provisao,
            isPositive: relatorioProvisao.percentual_medio_provisao > 0
          } : undefined}
        />
        <PremiumStatsCard
          title="% Médio Provisão"
          value={`${relatorioProvisao?.percentual_medio_provisao?.toFixed(2) || 0}%`}
          icon={PieChart}
          color="red"
        />
      </div>

      {/* Gráfico de Evolução de Provisão por Classificação */}
      <GlassCard variant="subtle" className="mb-8 animate-slide-up animate-stagger-1">
        <CardHeader className="glass-header border-b border-white/10">
          <CardTitle className="flex items-center space-x-3">
            <ColoredIcon icon={BarChart3} className="text-primary" />
            <GradientText variant="primary">Evolução do Provisionamento por Classificação</GradientText>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={relatorioProvisao?.contratos_por_classificacao || []}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="classificacao" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [
                    name === 'valor_provisao' ? formatCurrency(value as number) : formatCurrency(value as number),
                    name === 'valor_provisao' ? 'Valor Provisão' : 'Valor Total'
                  ]}
                />
                <Bar dataKey="valor_total" fill="hsl(var(--chart-1))" name="Valor Total" />
                <Bar dataKey="valor_provisao" fill="hsl(var(--chart-2))" name="Valor Provisão" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </GlassCard>

      {/* Distribuição de Risco */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard variant="subtle" className="animate-slide-up animate-stagger-2">
          <CardHeader className="glass-header border-b border-white/10">
            <CardTitle className="flex items-center space-x-3">
              <ColoredIcon icon={PieChart} className="text-primary" />
              <GradientText variant="primary">Distribuição por Situação</GradientText>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    dataKey="quantidade"
                    data={relatorioPosicao?.por_situacao || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="hsl(var(--chart-1))"
                    label={({ situacao, percentual }) => `${situacao}: ${percentual.toFixed(1)}%`}
                  >
                    {(relatorioPosicao?.por_situacao || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </GlassCard>

        <GlassCard variant="subtle" className="animate-slide-up animate-stagger-3">
          <CardHeader className="glass-header border-b border-white/10">
            <CardTitle className="flex items-center space-x-3">
              <ColoredIcon icon={TrendingUp} className="text-primary" />
              <GradientText variant="primary">Distribuição de Risco</GradientText>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={relatorioRisco?.distribuicao_risco || []}>
                  <defs>
                    <linearGradient id="colorRisco" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="classificacao" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`${(value as number).toFixed(2)}%`, 'Percentual Provisão Médio']}
                  />
                  <Area
                    type="monotone"
                    dataKey="percentual_provisao_medio"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorRisco)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </GlassCard>
      </div>

      {/* Lista de Clientes Alto Risco */}
      {relatorioRisco?.clientes_alto_risco && relatorioRisco.clientes_alto_risco.length > 0 && (
        <GlassCard variant="subtle" className="animate-slide-up animate-stagger-4">
          <CardHeader className="glass-header border-b border-white/10">
            <CardTitle className="flex items-center space-x-3">
              <ColoredIcon icon={TrendingUp} className="text-destructive" />
              <GradientText variant="primary">Clientes de Alto Risco</GradientText>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {relatorioRisco.clientes_alto_risco.slice(0, 5).map((cliente, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-background/50 to-background/20 border border-border/50">
                  <div>
                    <h4 className="font-medium text-foreground">{cliente.cliente_nome}</h4>
                    <p className="text-sm text-muted-foreground">
                      {cliente.total_contratos} contratos • Classificação: {cliente.classificacao_predominante}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{formatCurrency(cliente.valor_total_provisao)}</p>
                    <p className="text-sm text-muted-foreground">Provisão Total</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </GlassCard>
      )}
    </LayoutResponsiveContainer>
  );
}