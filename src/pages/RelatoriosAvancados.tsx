import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, TrendingUp, LineChart, BarChart3, Calendar, Clock, Target, AlertTriangle } from "lucide-react";
import { format, addMonths, differenceInDays, subDays } from "date-fns";
import { useContratos } from "@/hooks/useContratos";
import { useClientes } from "@/hooks/useClientes";
import { useContratosByCliente } from "@/hooks/useContratosByCliente";
import { determinarEstagio, calcularProvisao, ClassificacaoRisco } from "@/lib/calculoProvisao";
import { useProvisaoPerda, useProvisaoPerdaIncorrida } from "@/hooks/useProvisao";
import { toast } from "sonner";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { ResponsiveContainer as LayoutResponsiveContainer } from "@/components/ui/layout-consistency";
import { GlassCard } from "@/components/ui/glassmorphism";
import { GradientText } from "@/components/ui/gradient-elements";
import { ColoredIcon } from "@/components/ui/color-consistency";
import { PremiumStatsCard } from "@/components/dashboard/PremiumStatsCard";

export default function RelatoriosAvancados() {
  // Estados para análise individual
  const [selectedClienteId, setSelectedClienteId] = useState<string>();
  const [selectedContratoId, setSelectedContratoId] = useState<string>();
  const [contractAnalysisData, setContractAnalysisData] = useState<any[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: contratos } = useContratos();
  const { data: clientes } = useClientes();
  const { data: clienteContratos } = useContratosByCliente(selectedClienteId || null);
  
  // Hooks para tabelas de provisão
  const { data: tabelaPerda } = useProvisaoPerda();
  const { data: tabelaIncorrida } = useProvisaoPerdaIncorrida();

  const analyzeContractEvolution = async () => {
    if (!selectedContratoId || !clienteContratos || !tabelaPerda) return;
    
    setIsAnalyzing(true);
    
    try {
      const contrato = clienteContratos.find(c => c.id === selectedContratoId);
      if (!contrato) return;
      
      // Calcular a evolução do provisionamento baseado na lógica real
      const dataEntrada = new Date(contrato.data_entrada);
      const hoje = new Date();
      const mesesPassados = differenceInDays(hoje, dataEntrada) / 30;
      
      // Determinar estágio atual e calcular provisão atual
      const estagioAtual = determinarEstagio(contrato.dias_atraso || 0);
      const provisaoAtual = calcularProvisao({
        valorDivida: contrato.valor_divida,
        diasAtraso: contrato.dias_atraso || 0,
        classificacao: (contrato.classificacao as ClassificacaoRisco) || 'C1',
        tabelaPerda: tabelaPerda,
        tabelaIncorrida: tabelaIncorrida || []
      });
      
      // Simular evolução mensal até 100%
      const analysisData = [];
      let provisaoAcumulada = provisaoAtual.percentualProvisao;
      let mesAtual = 0;
      
      // Dados históricos (simulados baseados na lógica real)
      for (let i = 12; i >= 0; i--) {
        const dataSimulada = subDays(hoje, i * 30);
        const diasAtrasoSimulado = Math.max(0, (contrato.dias_atraso || 0) - (i * 30));
        const provisaoSimulada = Math.min(100, (diasAtrasoSimulado / 365) * 100);
        
        analysisData.push({
          mes: format(dataSimulada, 'MMM/yy'),
          provisao: provisaoSimulada,
          diasAtraso: diasAtrasoSimulado,
          valor: (contrato.valor_divida * provisaoSimulada) / 100
        });
      }
      
      // Projeção futura
      let provisaoProjecao = provisaoAtual.percentualProvisao;
      let mesesPara50 = null;
      let mesesPara100 = null;
      let mesProjecao = 0;
      
      while (provisaoProjecao < 100 && mesProjecao < 24) {
        mesProjecao++;
        // Incremento baseado no estágio de risco
        const incrementoMensal = estagioAtual <= 2 ? 2 : estagioAtual <= 4 ? 5 : 8;
        provisaoProjecao = Math.min(100, provisaoProjecao + incrementoMensal);
        
        const dataFutura = addMonths(hoje, mesProjecao);
        
        if (provisaoProjecao >= 50 && !mesesPara50) {
          mesesPara50 = mesProjecao;
        }
        
        if (provisaoProjecao >= 100 && !mesesPara100) {
          mesesPara100 = mesProjecao;
        }
        
        analysisData.push({
          mes: format(dataFutura, 'MMM/yy'),
          provisao: provisaoProjecao,
          diasAtraso: (contrato.dias_atraso || 0) + (mesProjecao * 30),
          valor: (contrato.valor_divida * provisaoProjecao) / 100,
          isProjection: true
        });
      }
      
      setContractAnalysisData(analysisData);
      setAnalysisResults({
        valorDivida: contrato.valor_divida,
        provisaoAtual: provisaoAtual.percentualProvisao,
        valorProvisaoAtual: provisaoAtual.valorProvisao,
        estagioRisco: estagioAtual,
        classificacao: provisaoAtual.regra,
        mesesPara50: mesesPara50,
        mesesPara100: mesesPara100,
        diasPara50: mesesPara50 ? mesesPara50 * 30 : null,
        diasPara100: mesesPara100 ? mesesPara100 * 30 : null
      });
      
      toast.success("Análise de evolução concluída com sucesso!");
    } catch (error) {
      toast.error("Erro ao realizar análise");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

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
          Análise da evolução do provisionamento por contrato ao longo do tempo
        </p>
      </div>

      {/* Filtros de Análise */}
      <GlassCard variant="subtle" className="mb-8 animate-slide-up">
        <CardHeader className="glass-header border-b border-white/10">
          <CardTitle className="flex items-center space-x-3">
            <ColoredIcon icon={Calendar} className="text-primary" />
            <GradientText variant="primary">Seleção de Contrato para Análise</GradientText>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Cliente</label>
              <Select value={selectedClienteId} onValueChange={setSelectedClienteId}>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Selecione um cliente" />
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Contrato</label>
              <Select value={selectedContratoId} onValueChange={setSelectedContratoId} disabled={!selectedClienteId}>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Selecione um contrato" />
                </SelectTrigger>
                <SelectContent>
                  {clienteContratos?.map((contrato) => (
                    <SelectItem key={contrato.id} value={contrato.id}>
                      {contrato.numero_contrato || `Contrato ${contrato.id.slice(0, 8)}`} - {formatCurrency(contrato.valor_divida)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={analyzeContractEvolution}
                disabled={!selectedContratoId || isAnalyzing}
                className="w-full interactive-button"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Analisar Evolução
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Resultados da Análise */}
      {analysisResults && (
        <>
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-slide-up animate-stagger-1">
            <PremiumStatsCard
              title="Tempo para 50%"
              value={analysisResults.mesesPara50 ? `${analysisResults.mesesPara50} meses` : "Já atingido"}
              description={analysisResults.diasPara50 ? `${analysisResults.diasPara50} dias` : ""}
              icon={Clock}
              color="amber"
            />
            <PremiumStatsCard
              title="Tempo para 100%"
              value={analysisResults.mesesPara100 ? `${analysisResults.mesesPara100} meses` : "Já atingido"}
              description={analysisResults.diasPara100 ? `${analysisResults.diasPara100} dias` : ""}
              icon={Target}
              color="red"
            />
            <PremiumStatsCard
              title="Provisão Atual"
              value={`${analysisResults.provisaoAtual.toFixed(1)}%`}
              description={formatCurrency(analysisResults.valorProvisaoAtual)}
              icon={TrendingUp}
              color="blue"
            />
            <PremiumStatsCard
              title="Classificação Risco"
              value={analysisResults.classificacao}
              description={`Estágio ${analysisResults.estagioRisco}`}
              icon={AlertTriangle}
              color="emerald"
            />
          </div>

          {/* Gráfico de Evolução */}
          <GlassCard variant="subtle" className="animate-slide-up animate-stagger-2">
            <CardHeader className="glass-header border-b border-white/10">
              <CardTitle className="flex items-center space-x-3">
                <ColoredIcon icon={LineChart} className="text-primary" />
                <GradientText variant="primary">Evolução do Provisionamento no Tempo</GradientText>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={contractAnalysisData}>
                    <defs>
                      <linearGradient id="colorProvisao" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorProjecao" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="mes" 
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value, name, props) => [
                        `${(value as number).toFixed(1)}%`,
                        props.payload.isProjection ? 'Projeção' : 'Histórico'
                      ]}
                      labelFormatter={(label) => `Período: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="provisao"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#colorProvisao)"
                      connectNulls={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span>Dados Históricos e Projeção</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full border-2 border-warning"></div>
                  <span>Meta 100% Provisão</span>
                </div>
              </div>
            </CardContent>
          </GlassCard>
        </>
      )}

      {/* Estado Vazio */}
      {!analysisResults && (
        <GlassCard variant="subtle" className="animate-slide-up animate-stagger-2">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="glass-element p-4 rounded-full w-fit mx-auto mb-4">
                <ColoredIcon icon={BarChart3} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhuma análise executada
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Selecione um cliente e contrato, depois clique em "Analisar Evolução" para visualizar a evolução do provisionamento até atingir 100%
              </p>
            </div>
          </CardContent>
        </GlassCard>
      )}
    </LayoutResponsiveContainer>
  );
}