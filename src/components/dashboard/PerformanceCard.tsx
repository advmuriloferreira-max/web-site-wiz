import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  DollarSign
} from "lucide-react";

export function PerformanceCard() {
  const { data: performanceData, isLoading } = useQuery({
    queryKey: ["performance-provisao-escritorio"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contratos_provisao")
        .select(`
          situacao,
          acordo_final,
          proposta_acordo,
          percentual_provisao,
          tempo_escritorio,
          data_entrada,
          data_conclusao,
          valor_honorarios,
          valor_divida,
          percentual_honorarios
        `);
      
      if (error) throw error;

      // Métricas de acordos
      const acordosFirmados = data.filter(c => c.acordo_final && c.acordo_final > 0).length;
      const propostas = data.filter(c => c.proposta_acordo && c.proposta_acordo > 0).length;
      const taxaSucesso = propostas > 0 ? (acordosFirmados / propostas) * 100 : 0;

      // Métricas de tempo
      const contratosComTempo = data.filter(c => c.tempo_escritorio && c.tempo_escritorio > 0);
      const tempoMedio = contratosComTempo.length > 0
        ? contratosComTempo.reduce((sum, c) => sum + (c.tempo_escritorio || 0), 0) / contratosComTempo.length
        : 0;

      // Métricas de provisionamento
      const provisaoMedia = data.length > 0
        ? data.reduce((sum, c) => sum + ((c.percentual_provisao ?? 0)), 0) / data.length
        : 0;

      // Contratos críticos (provisão > 70%)
      const contratosCriticos = data.filter(c => ((c.percentual_provisao ?? 0)) > 70).length;

      // Receita de honorários
      const receitaHonorarios = data.reduce((sum, c) => sum + (Number(c.valor_honorarios) || 0), 0);
      const receitaPotencial = data.reduce((sum, c) => {
        const valorDivida = Number(c.valor_divida) || 0;
        const percentualHonorarios = (c.percentual_honorarios ?? 20); // Assumindo 20% padrão
        return sum + (valorDivida * (percentualHonorarios / 100));
      }, 0);

      // Status geral
      const getStatusGeral = () => {
        if (taxaSucesso >= 80 && provisaoMedia <= 30) return { status: "Excelente", color: "bg-green-100 text-green-800 border-green-200" };
        if (taxaSucesso >= 60 && provisaoMedia <= 50) return { status: "Bom", color: "bg-blue-100 text-blue-800 border-blue-200" };
        if (taxaSucesso >= 40 && provisaoMedia <= 70) return { status: "Regular", color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
        return { status: "Crítico", color: "bg-red-100 text-red-800 border-red-200" };
      };

      return {
        taxaSucesso: Math.round(taxaSucesso * 10) / 10,
        tempoMedio: Math.round(tempoMedio * 10) / 10,
        provisaoMedia: Math.round(provisaoMedia * 10) / 10,
        contratosCriticos,
        receitaHonorarios,
        receitaPotencial,
        statusGeral: getStatusGeral(),
        totalContratos: data.length,
        acordosFirmados,
        propostas
      };
    }
  });

  const metricas = [
    {
      label: "Taxa de Sucesso",
      value: `${performanceData?.taxaSucesso || 0}%`,
      icon: Target,
      description: `${performanceData?.acordosFirmados || 0}/${performanceData?.propostas || 0} acordos`,
      color: (performanceData?.taxaSucesso || 0) >= 70 ? "text-green-600" : "text-orange-600"
    },
    {
      label: "Tempo Médio",
      value: `${performanceData?.tempoMedio || 0} dias`,
      icon: Clock,
      description: "no escritório",
      color: (performanceData?.tempoMedio || 0) <= 90 ? "text-green-600" : "text-red-600"
    },
    {
      label: "Provisão Média",
      value: `${performanceData?.provisaoMedia || 0}%`,
      icon: TrendingUp,
      description: "do portfólio",
      color: (performanceData?.provisaoMedia || 0) <= 40 ? "text-green-600" : "text-red-600"
    },
    {
      label: "Casos Críticos",
      value: performanceData?.contratosCriticos || 0,
      icon: AlertCircle,
      description: "provisão > 70%",
      color: (performanceData?.contratosCriticos || 0) === 0 ? "text-green-600" : "text-red-600"
    }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance do Escritório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Performance do Escritório</CardTitle>
        <div className="flex items-center justify-between">
          <Badge className={performanceData?.statusGeral.color}>
            {performanceData?.statusGeral.status}
          </Badge>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>
              R$ {((performanceData?.receitaHonorarios || 0) / 1000).toFixed(0)}K realizados
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {metricas.map((metrica, index) => {
            const IconComponent = metrica.icon;
            return (
              <div key={index} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                <div className={`p-2 rounded-full bg-muted ${metrica.color}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metrica.label}
                  </p>
                  <p className={`text-lg font-bold ${metrica.color}`}>
                    {metrica.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {metrica.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Indicador de receita potencial */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Receita Potencial</p>
              <p className="text-xs text-muted-foreground">
                Baseada em honorários estimados
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">
                R$ {((performanceData?.receitaPotencial || 0) / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-muted-foreground">
                {performanceData?.totalContratos || 0} contratos
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}