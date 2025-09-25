import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ClassificacaoChartProps {
  data: Record<string, number>;
}

const COLORS = {
  C1: '#10B981', // green-500
  C2: '#F59E0B', // amber-500
  C3: '#EF4444', // red-500
  C4: '#8B5CF6', // violet-500
  C5: '#EC4899', // pink-500
};

export function ClassificacaoChart({ data }: ClassificacaoChartProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: key,
    value,
    color: COLORS[key as keyof typeof COLORS] || '#6B7280'
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground">{`${data.name}: ${data.value}`}</p>
          <p className="text-sm text-muted-foreground">contratos</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Distribuição por Classificação de Risco
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {Object.entries(COLORS).map(([key, color]) => (
            <div key={key} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-muted-foreground">
                {key}: {data[key] || 0}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}