import React, { useState, useRef, useCallback } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Sector
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PremiumChartControls } from '@/components/ui/premium-chart-controls';
import { ChartSettings } from '@/hooks/useChartCustomization';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface DataPoint {
  name: string;
  value: number;
  color?: string;
  [key: string]: any;
}

interface PremiumPieChartProps {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  chartId: string;
  className?: string;
  onSegmentClick?: (data: any, index: number) => void;
  enableDrillDown?: boolean;
  showPercentages?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  settings: ChartSettings;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, settings }) => {
  if (!active || !payload || payload.length === 0 || !settings.showTooltip) {
    return null;
  }

  const data = payload[0];
  const total = payload[0]?.payload?.total || data.payload.value;
  const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-4 min-w-[200px]"
    >
      <div className="flex items-center space-x-3 mb-3">
        <div 
          className="w-4 h-4 rounded-full border-2 border-background shadow-sm" 
          style={{ backgroundColor: data.payload.fill || data.color }}
        />
        <p className="font-semibold text-foreground">{data.name}</p>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Valor</span>
          <span className="font-mono text-lg font-bold">
            {typeof data.value === 'number' ? data.value.toLocaleString('pt-BR') : data.value}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Porcentagem</span>
          <span className="font-mono text-lg font-bold text-primary">
            {percentage}%
          </span>
        </div>

        {/* Additional payload data */}
        {Object.entries(data.payload).map(([key, value]) => {
          if (key === 'name' || key === 'value' || key === 'color' || key === 'fill' || key === 'total') return null;
          return (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}</span>
              <span className="font-medium">
                {typeof value === 'number' ? value.toLocaleString('pt-BR') : String(value)}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// Custom active shape for enhanced interaction
const renderActiveShape = (props: any) => {
  const {
    cx, cy, midAngle, innerRadius, outerRadius,
    startAngle, endAngle, fill, payload, percent, value, name
  } = props;

  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontSize="12" fontWeight="bold">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
        }}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
        opacity={0.3}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none"/>
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none"/>
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 12} 
        y={ey} 
        textAnchor={textAnchor} 
        fill="#333"
        fontSize="12"
        fontWeight="500"
      >
        {`${value.toLocaleString('pt-BR')}`}
      </text>
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 12} 
        y={ey} 
        dy={16} 
        textAnchor={textAnchor} 
        fill="#999"
        fontSize="10"
      >
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

export function PremiumPieChart({
  data,
  title,
  subtitle,
  chartId,
  className,
  onSegmentClick,
  enableDrillDown = true,
  showPercentages = true,
  innerRadius = 60,
  outerRadius = 120
}: PremiumPieChartProps) {
  const [settings, setSettings] = useState<ChartSettings>({
    colors: {
      primary: '#3B82F6',
      secondary: '#64748B',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#06B6D4',
      gradient: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4'],
    },
    chartType: 'pie',
    showGrid: false,
    showLegend: true,
    showTooltip: true,
    showAnimation: true,
    theme: 'auto',
  });

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedSegments, setSelectedSegments] = useState<Set<number>>(new Set());
  const [hiddenSegments, setHiddenSegments] = useState<Set<number>>(new Set());
  
  const chartRef = useRef<HTMLDivElement>(null);

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);

  // Prepare data with colors and percentages
  const chartData = data.map((item, index) => ({
    ...item,
    percentage: total > 0 ? ((item.value / total) * 100) : 0,
    fill: item.color || (settings.colors.gradient[index % settings.colors.gradient.length]),
    hidden: hiddenSegments.has(index)
  })).filter(item => !item.hidden);

  // Handle segment interaction
  const handleSegmentClick = (data: any, index: number) => {
    if (enableDrillDown) {
      const newSelected = new Set(selectedSegments);
      if (newSelected.has(index)) {
        newSelected.delete(index);
      } else {
        newSelected.add(index);
      }
      setSelectedSegments(newSelected);
    }
    onSegmentClick?.(data, index);
  };

  const toggleSegmentVisibility = (index: number) => {
    const newHidden = new Set(hiddenSegments);
    if (newHidden.has(index)) {
      newHidden.delete(index);
    } else {
      newHidden.add(index);
    }
    setHiddenSegments(newHidden);
  };

  // Custom legend with toggle functionality
  const CustomLegend = ({ payload }: any) => {
    if (!settings.showLegend || !payload) return null;

    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <motion.div
            key={entry.value}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-2 group cursor-pointer"
            onClick={() => toggleSegmentVisibility(index)}
          >
            <div 
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                hiddenSegments.has(index) 
                  ? 'opacity-30 scale-75' 
                  : 'opacity-100 scale-100 group-hover:scale-110'
              }`}
              style={{ backgroundColor: entry.color }}
            />
            <span className={`text-sm transition-opacity ${
              hiddenSegments.has(index) ? 'opacity-50 line-through' : 'opacity-100'
            }`}>
              {entry.value}
            </span>
            <span className="text-xs text-muted-foreground">
              ({((entry.payload.value / total) * 100).toFixed(1)}%)
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {hiddenSegments.has(index) ? 
                <Eye className="h-3 w-3" /> : 
                <EyeOff className="h-3 w-3" />
              }
            </Button>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <PremiumChartControls
          chartId={chartId}
          chartElement={chartRef.current}
          chartData={data}
          onSettingsChange={setSettings}
        />
      </CardHeader>

      <CardContent>
        <div ref={chartRef} className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={showPercentages ? (entry: any) => `${entry.percentage.toFixed(1)}%` : false}
                outerRadius={outerRadius}
                innerRadius={innerRadius}
                paddingAngle={2}
                dataKey="value"
                animationBegin={settings.showAnimation ? 0 : undefined}
                animationDuration={settings.showAnimation ? 800 : 0}
                activeIndex={activeIndex || undefined}
                activeShape={enableDrillDown ? renderActiveShape : undefined}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={handleSegmentClick}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill}
                    stroke={selectedSegments.has(index) ? '#fff' : 'none'}
                    strokeWidth={selectedSegments.has(index) ? 3 : 0}
                    style={{ 
                      cursor: enableDrillDown ? 'pointer' : 'default',
                      filter: selectedSegments.has(index) 
                        ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' 
                        : 'none'
                    }}
                  />
                ))}
              </Pie>

              {settings.showTooltip && (
                <Tooltip content={<CustomTooltip settings={settings} />} />
              )}

              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Data Summary */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-muted-foreground mb-1">Total</div>
            <div className="font-bold text-lg">
              {total.toLocaleString('pt-BR')}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-muted-foreground mb-1">Categorias</div>
            <div className="font-bold text-lg">
              {chartData.length}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-muted-foreground mb-1">Maior</div>
            <div className="font-bold text-lg">
              {Math.max(...chartData.map(d => d.value)).toLocaleString('pt-BR')}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-muted-foreground mb-1">Menor</div>
            <div className="font-bold text-lg">
              {Math.min(...chartData.map(d => d.value)).toLocaleString('pt-BR')}
            </div>
          </div>
        </div>

        {/* Selection Summary */}
        <AnimatePresence>
          {selectedSegments.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-primary">
                  {selectedSegments.size} segmento{selectedSegments.size > 1 ? 's' : ''} selecionado{selectedSegments.size > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setSelectedSegments(new Set())}
                  className="text-primary hover:text-primary/80 underline"
                >
                  Limpar seleção
                </button>
              </div>
              
              <div className="mt-2 text-xs text-primary/80">
                Valor selecionado: {Array.from(selectedSegments)
                  .reduce((sum, index) => sum + (data[index]?.value || 0), 0)
                  .toLocaleString('pt-BR')}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}