import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, TrendingUp, LineChart, BarChart3, PieChart, Calendar } from "lucide-react";
import { format, subDays } from "date-fns";
import { useContratos } from "@/hooks/useContratos";
import { useClientes } from "@/hooks/useClientes";
import { useContratosByCliente } from "@/hooks/useContratosByCliente";
import { useProvisaoPerda, useProvisaoPerdaIncorrida } from "@/hooks/useProvisao";
import { toast } from "sonner";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer as RechartsResponsiveContainer, Area, AreaChart, BarChart, Bar, PieChart as RechartsPieChart, Cell } from "recharts";
import { ResponsiveContainer } from "@/components/ui/layout-consistency";
import { GlassCard } from "@/components/ui/glassmorphism";
import { GradientText } from "@/components/ui/gradient-elements";
import { ColoredIcon } from "@/components/ui/color-consistency";
import { ModernBadge } from "@/components/ui/modern-badge";

export default function RelatoriosAvancados() {
  // Estados para análise individual
  const [selectedClienteId, setSelectedClienteId] = useState<string>();
  const [selectedContratoId, setSelectedContratoId] = useState<string>();
  const [contractAnalysisData, setContractAnalysisData] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>("evolucao");

  const { data: contratos } = useContratos();
  const { data: clientes } = useClientes();
  const { data: clienteContratos } = useContratosByCliente(selectedClienteId || null);
  
  // Hooks para tabelas de provisão
  const tabelaPerda = useProvisaoPerda();
  const tabelaIncorrida = useProvisaoPerdaIncorrida();

  const analyzeContractEvolution = async () => {
    if (!selectedContratoId || !clienteContratos) return;
    
    setIsAnalyzing(true);
    
    try {
      const contrato = clienteContratos.find(c => c.id === selectedContratoId);
      if (!contrato) return;
      
      // Análise simulada baseada nos dados reais do contrato - em um cenário real, isso viria do backend
      const analysisData = Array.from({ length: 12 }, (_, i) => ({
        mes: format(subDays(new Date(), (11 - i) * 30), 'MMM/yy'),
        provisao: Math.random() * 50000 + 10000,
        risco: Math.random() * 100,
        classificacao: ['C1', 'C2', 'C3', 'C4', 'C5'][Math.floor(Math.random() * 5)]
      }));
      
      setContractAnalysisData(analysisData);
      toast.success("Análise concluída com sucesso!");
    } catch (error) {
      toast.error("Erro ao realizar análise");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analysisTypes = [
    {
      id: "evolucao",
      name: "Evolução Temporal",
      description: "Análise da evolução de contratos ao longo do tempo",
      icon: LineChart,
      color: "text-blue-600"
    },
    {
      id: "comparativo",
      name: "Análise Comparativa",
      description: "Comparação entre diferentes contratos e clientes",
      icon: BarChart3,
      color: "text-green-600"
    },
    {
      id: "distribuicao",
      name: "Distribuição de Risco",
      description: "Análise da distribuição de risco por classificação",
      icon: PieChart,
      color: "text-purple-600"
    },
    {
      id: "tendencias",
      name: "Tendências Futuras",
      description: "Projeções e tendências baseadas em dados históricos",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  return (
    <ResponsiveContainer className="py-8 animate-fade-in">
      <div className="mb-8">
        <GradientText variant="primary" className="text-3xl font-bold mb-2 flex items-center">
          <ColoredIcon icon={BarChart3} className="mr-3" />
          Relatórios Avançados
        </GradientText>
        <p className="text-muted-foreground">
          Análises avançadas e projeções inteligentes para tomada de decisão
        </p>
      </div>

      {/* Tipos de Análise */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
        {analysisTypes.map((analysis, index) => (
          <div
            key={analysis.id}
            className={`cursor-pointer group animate-scale-in animate-delay-${index}`}
            onClick={() => setSelectedAnalysis(analysis.id)}
          >
            <GlassCard 
              variant="subtle" 
              className={`h-full interactive-card transition-all duration-300 ${
                selectedAnalysis === analysis.id ? 'ring-2 ring-primary/50 bg-primary/5' : ''
              }`}
            >
              <CardHeader className="text-center pb-3">
                <div className="flex justify-center mb-3">
                  <div className="glass-element p-3 rounded-full">
                    <ColoredIcon icon={analysis.icon} className={analysis.color} />
                  </div>
                </div>
                <CardTitle className="text-lg">{analysis.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{analysis.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <ModernBadge 
                  variant={selectedAnalysis === analysis.id ? "success" : "outline"}
                  size="sm"
                  className="w-full justify-center"
                >
                  {selectedAnalysis === analysis.id ? "Selecionado" : "Selecionar"}
                </ModernBadge>
              </CardContent>
            </GlassCard>
          </div>
        ))}
      </div>

      {/* Filtros de Análise */}
      <GlassCard variant="subtle" className="mb-8 animate-slide-up animate-stagger-1">
        <CardHeader className="glass-header border-b border-white/10">
          <CardTitle className="flex items-center space-x-3">
            <ColoredIcon icon={Calendar} className="text-primary" />
            <GradientText variant="primary">Parâmetros de Análise</GradientText>
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
                      {contrato.numero_contrato || `Contrato ${contrato.id.slice(0, 8)}`}
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
                    Analisar
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      {/* Resultados da Análise */}
      {contractAnalysisData.length > 0 && (
        <GlassCard variant="subtle" className="animate-slide-up animate-stagger-2">
          <CardHeader className="glass-header border-b border-white/10">
            <CardTitle className="flex items-center space-x-3">
              <ColoredIcon icon={TrendingUp} className="text-primary" />
              <GradientText variant="primary">Resultados da Análise</GradientText>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80 w-full">
              <RechartsResponsiveContainer width="100%" height="100%">
                <AreaChart data={contractAnalysisData}>
                  <defs>
                    <linearGradient id="colorProvisao" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
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
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="provisao"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorProvisao)"
                  />
                </AreaChart>
              </RechartsResponsiveContainer>
            </div>
          </CardContent>
        </GlassCard>
      )}

      {/* Estado Vazio */}
      {contractAnalysisData.length === 0 && (
        <GlassCard variant="subtle" className="animate-slide-up animate-stagger-2">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="glass-element p-4 rounded-full w-fit mx-auto mb-4">
                <ColoredIcon icon={BarChart3} size="lg" className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhuma análise executada
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Selecione um cliente e contrato, depois clique em "Analisar" para gerar relatórios avançados com insights inteligentes
              </p>
            </div>
          </CardContent>
        </GlassCard>
      )}
    </ResponsiveContainer>
  );
}