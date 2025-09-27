import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ClassificacaoChartProps {
  data: Record<string, number>;
}

const COLORS = {
  C1: '#10B981', // emerald-500
  C2: '#F59E0B', // amber-500
  C3: '#EF4444', // red-500
  C4: '#3B82F6', // blue-500
  C5: '#8B5CF6', // violet-500
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
    <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-700/50 p-6 border-b border-white/20">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Distribuição por Classificação de Risco
        </h3>
      </div>
      <div className="p-6">
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
                animationBegin={0}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-sm text-slate-900 dark:text-white">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {Object.entries(COLORS).map(([key, color]) => (
            <div key={key} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full shadow-sm" 
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-slate-600 dark:text-slate-300">
                {key}: {data[key] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}