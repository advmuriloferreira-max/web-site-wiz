import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TendenciaData {
  mes: string;
  totalContratos: number;
  valorDividas: number;
  valorProvisao: number;
  percentualProvisao: number;
}

export function TendenciasChart() {
  const { data: tendenciasData, isLoading } = useQuery({
    queryKey: ["tendencias-provisao"],
    queryFn: async () => {
      const mesesPassados = 6;
      const dataAtual = new Date();
      const tendencias: TendenciaData[] = [];

      for (let i = mesesPassados - 1; i >= 0; i--) {
        const mesReferencia = subMonths(dataAtual, i);
        const inicioMes = startOfMonth(mesReferencia);
        const fimMes = endOfMonth(mesReferencia);

        const { data, error } = await supabase
          .from("contratos_provisao")
          .select("valor_divida, valor_provisao, created_at")
          .gte("created_at", inicioMes.toISOString())
          .lte("created_at", fimMes.toISOString());

        if (error) throw error;

        const totalContratos = data.length;
        const valorDividas = data.reduce((sum, c) => sum + (Number(c.valor_divida) || 0), 0);
        const valorProvisao = data.reduce((sum, c) => sum + (Number(c.valor_provisao) || 0), 0);
        const percentualProvisao = valorDividas > 0 ? (valorProvisao / valorDividas) * 100 : 0;

        tendencias.push({
          mes: format(mesReferencia, "MMM/yy", { locale: ptBR }),
          totalContratos,
          valorDividas: valorDividas / 1000, // Converter para milhares
          valorProvisao: valorProvisao / 1000, // Converter para milhares
          percentualProvisao: Math.round(percentualProvisao * 10) / 10
        });
      }

      return tendencias;
    }
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">
                {entry.dataKey === 'totalContratos' && `Contratos: ${entry.value}`}
                {entry.dataKey === 'valorDividas' && `Dívidas: R$ ${entry.value.toFixed(0)}K`}
                {entry.dataKey === 'valorProvisao' && `Provisão: R$ ${entry.value.toFixed(0)}K`}
                {entry.dataKey === 'percentualProvisao' && `% Provisão: ${entry.value}%`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

   if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendências de Gestão de Passivo</CardTitle>
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
        <CardTitle className="text-lg font-semibold">Tendências de Gestão de Passivo</CardTitle>
        <p className="text-sm text-muted-foreground">
          Evolução dos últimos 6 meses
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={tendenciasData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="mes" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="valorDividas"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                name="Valor Dívidas (R$ K)"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="valorProvisao"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
                name="Valor Provisão (R$ K)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="percentualProvisao"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                name="% Provisão"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legenda personalizada */}
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-muted-foreground">Valor Dívidas (R$ K)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-muted-foreground">Valor Provisão (R$ K)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">% Provisão</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}