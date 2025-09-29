import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Brush,
  ReferenceLine
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PremiumChartControls } from '@/components/ui/premium-chart-controls';
import { ChartSettings } from '@/hooks/useChartCustomization';

interface PremiumBarChartProps {
  data: Array<{
    name: string;
    value: number;
    [key: string]: any;
  }>;
  title?: string;
  subtitle?: string;
  chartId: string;
  className?: string;
  onBarClick?: (data: any, index: number) => void;
  showBrush?: boolean;
  showReferenceLine?: boolean;
  referenceValue?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    payload: any;
    color: string;
  }>;
  label?: string;
  settings: ChartSettings;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, settings }) => {
  if (!active || !payload || payload.length === 0 || !settings.showTooltip) {
    return null;
  }

  const data = payload[0];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-4 min-w-[200px]"
    >
      <p className="font-semibold text-foreground mb-2">{label}</p>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <span className="text-sm text-muted-foreground">Valor</span>
          </div>
          <span className="font-mono text-lg font-bold">
            {typeof data.value === 'number' ? data.value.toLocaleString('pt-BR') : data.value}
          </span>
        </div>
        
        {/* Additional data from payload */}
        {Object.entries(data.payload).map(([key, value]) => {
          if (key === 'name' || key === 'value' || key === 'color') return null;
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

export function PremiumBarChart({
  data,
  title,
  subtitle,
  chartId,
  className,
  onBarClick,
  showBrush = true,
  showReferenceLine = false,
  referenceValue
}: PremiumBarChartProps) {
  const [settings, setSettings] = useState<ChartSettings>({
    colors: {
      primary: '#3B82F6',
      secondary: '#64748B',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#06B6D4',
      gradient: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'],
    },
    chartType: 'bar',
    showGrid: true,
    showLegend: true,
    showTooltip: true,
    showAnimation: true,
    theme: 'auto',
  });

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedBars, setSelectedBars] = useState<Set<number>>(new Set());
  const [brushDomain, setBrushDomain] = useState<[number, number] | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Generate colors for bars
  const getBarColor = (index: number, isHovered: boolean = false, isSelected: boolean = false) => {
    if (isSelected) return settings.colors.warning;
    if (isHovered) return d3.color(settings.colors.primary)?.brighter(0.3)?.toString() || settings.colors.primary;
    
    if (settings.colors.gradient && settings.colors.gradient.length > 1) {
      const ratio = index / Math.max(data.length - 1, 1);
      return d3.interpolate(settings.colors.gradient[0], settings.colors.gradient[1])(ratio);
    }
    
    return settings.colors.primary;
  };

  // Handle bar click with multi-selection
  const handleBarClick = (entry: any, index: number) => {
    const newSelected = new Set(selectedBars);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedBars(newSelected);
    onBarClick?.(entry, index);
  };

  // Custom animation for bars
  const BarAnimation = ({ entry, index, ...props }: any) => {
    const isHovered = hoveredIndex === index;
    const isSelected = selectedBars.has(index);
    
    return (
      <motion.g
        initial={settings.showAnimation ? { scaleY: 0, transformOrigin: 'bottom' } : false}
        animate={{ 
          scaleY: 1,
          transformOrigin: 'bottom'
        }}
        transition={{ 
          duration: 0.6, 
          delay: index * 0.05,
          ease: "easeOut"
        }}
        whileHover={{ 
          scaleY: 1.05,
          transformOrigin: 'bottom'
        }}
      >
        <Bar
          {...props}
          fill={getBarColor(index, isHovered, isSelected)}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => handleBarClick(entry, index)}
          style={{ 
            cursor: 'pointer',
            filter: isSelected ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'none'
          }}
        />
      </motion.g>
    );
  };

  // Enhanced data with brush filtering
  const displayData = brushDomain 
    ? data.slice(brushDomain[0], brushDomain[1] + 1)
    : data;

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
            <BarChart
              data={displayData}
              margin={{ top: 20, right: 30, left: 20, bottom: showBrush ? 60 : 20 }}
            >
              {settings.showGrid && (
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={settings.theme === 'dark' ? '#374151' : '#E5E7EB'}
                  opacity={0.3}
                />
              )}
              
              <XAxis 
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                height={60}
                interval={0}
                angle={data.length > 6 ? -45 : 0}
                textAnchor={data.length > 6 ? 'end' : 'middle'}
              />
              
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString('pt-BR')}
              />

              {settings.showTooltip && (
                <Tooltip 
                  content={<CustomTooltip settings={settings} />}
                  cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                />
              )}

              {showReferenceLine && referenceValue && (
                <ReferenceLine 
                  y={referenceValue} 
                  stroke={settings.colors.error}
                  strokeDasharray="8 8"
                  label="Referência"
                />
              )}

              <Bar 
                dataKey="value"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              >
                {displayData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={getBarColor(index, hoveredIndex === index, selectedBars.has(index))}
                    style={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out'
                    }}
                    onClick={() => handleBarClick(entry, index)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                ))}
              </Bar>

              {showBrush && data.length > 10 && (
                <Brush
                  dataKey="name"
                  height={30}
                  stroke={settings.colors.primary}
                  fill="rgba(59, 130, 246, 0.1)"
                  onChange={(brushData: any) => {
                    if (brushData) {
                      setBrushDomain([brushData.startIndex || 0, brushData.endIndex || data.length - 1]);
                    } else {
                      setBrushDomain(null);
                    }
                  }}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Selection Summary */}
        <AnimatePresence>
          {selectedBars.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-4 p-3 bg-muted/50 rounded-lg border border-dashed border-border"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {selectedBars.size} item{selectedBars.size > 1 ? 's' : ''} selecionado{selectedBars.size > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setSelectedBars(new Set())}
                  className="text-primary hover:text-primary/80 underline"
                >
                  Limpar seleção
                </button>
              </div>
              
              {selectedBars.size > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Total selecionado: {Array.from(selectedBars)
                    .reduce((sum, index) => sum + (data[index]?.value || 0), 0)
                    .toLocaleString('pt-BR')}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}