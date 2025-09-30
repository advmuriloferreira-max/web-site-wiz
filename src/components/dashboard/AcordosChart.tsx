import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function AcordosChart() {
  const { data: acordosData, isLoading } = useQuery({
    queryKey: ["acordos-provisao-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contratos_provisao")
        .select("situacao, acordo_final, proposta_acordo");
      
      if (error) throw error;

      const acordosFirmados = data.filter(c => c.acordo_final && c.acordo_final > 0).length;
      const acordosPropostos = data.filter(c => c.proposta_acordo && c.proposta_acordo > 0).length;
      const semAcordo = data.filter(c => !c.acordo_final || c.acordo_final === 0).length;
      
      const percentualSucesso = acordosPropostos > 0 ? (acordosFirmados / acordosPropostos * 100) : 0;

      return {
        acordosFirmados,
        acordosPropostos,
        semAcordo,
        percentualSucesso: Math.round(percentualSucesso * 10) / 10,
        total: data.length
      };
    }
  });

  const chartData = [
    {
      name: "Acordos Firmados",
      value: acordosData?.acordosFirmados || 0,
      color: "#10B981"
    },
    {
      name: "Propostas Pendentes", 
      value: (acordosData?.acordosPropostos || 0) - (acordosData?.acordosFirmados || 0),
      color: "#F59E0B"
    },
    {
      name: "Sem Acordo",
      value: acordosData?.semAcordo || 0,
      color: "#EF4444"
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-lg font-bold text-primary">
            {payload[0].value} contratos
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Acordos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Análise de Acordos</CardTitle>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Taxa de Sucesso: <span className="font-bold text-primary">{acordosData?.percentualSucesso}%</span>
          </span>
          <span className="text-muted-foreground">
            Total: {acordosData?.total} contratos
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}