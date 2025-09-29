import React, { useState, useRef, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
  ReferenceArea,
  Dot
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PremiumChartControls } from '@/components/ui/premium-chart-controls';
import { ChartSettings } from '@/hooks/useChartCustomization';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

interface PremiumLineChartProps {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  chartId: string;
  className?: string;
  onPointClick?: (data: any, index: number) => void;
  showBrush?: boolean;
  enableZoom?: boolean;
  showTrendline?: boolean;
  multiLine?: boolean;
  dataKeys?: string[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  settings: ChartSettings;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, settings }) => {
  if (!active || !payload || payload.length === 0 || !settings.showTooltip) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-4 min-w-[200px]"
    >
      <p className="font-semibold text-foreground mb-3 border-b border-border pb-2">{label}</p>
      <div className="space-y-2">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full border-2 border-background shadow-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground capitalize">
                {entry.dataKey.replace('_', ' ')}
              </span>
            </div>
            <span className="font-mono text-base font-bold">
              {typeof entry.value === 'number' 
                ? entry.value.toLocaleString('pt-BR')
                : entry.value
              }
            </span>
          </div>
        ))}
      </div>
      
      {/* Show additional data */}
      {payload[0]?.payload && Object.entries(payload[0].payload).map(([key, value]) => {
        if (key === 'name' || key === 'value' || payload.some(p => p.dataKey === key)) return null;
        return (
          <div key={key} className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-border/50">
            <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}</span>
            <span className="font-medium">
              {typeof value === 'number' ? value.toLocaleString('pt-BR') : String(value)}
            </span>
          </div>
        );
      })}
    </motion.div>
  );
};

// Custom animated dot component
const CustomDot = (props: any) => {
  const { cx, cy, fill, payload, dataKey, index, isActive } = props;
  
  if (!isActive && !payload.highlighted) return null;
  
  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.5 }}
      transition={{ duration: 0.2 }}
    >
      <Dot 
        cx={cx} 
        cy={cy} 
        r={6} 
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
          cursor: 'pointer'
        }}
      />
      {payload.highlighted && (
        <motion.circle
          cx={cx}
          cy={cy}
          r={12}
          fill="none"
          stroke={fill}
          strokeWidth={2}
          opacity={0.6}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        />
      )}
    </motion.g>
  );
};

export function PremiumLineChart({
  data,
  title,
  subtitle,
  chartId,
  className,
  onPointClick,
  showBrush = true,
  enableZoom = true,
  showTrendline = false,
  multiLine = false,
  dataKeys = ['value']
}: PremiumLineChartProps) {
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
    chartType: 'line',
    showGrid: true,
    showLegend: true,
    showTooltip: true,
    showAnimation: true,
    theme: 'auto',
  });

  const [zoomDomain, setZoomDomain] = useState<{ left?: number; right?: number }>({});
  const [refAreaLeft, setRefAreaLeft] = useState<string>('');
  const [refAreaRight, setRefAreaRight] = useState<string>('');
  const [selectedPoints, setSelectedPoints] = useState<Set<number>>(new Set());
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  
  const chartRef = useRef<HTMLDivElement>(null);

  // Calculate trendline using linear regression
  const calculateTrendline = useCallback((data: DataPoint[], dataKey: string = 'value') => {
    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, d) => sum + (d[dataKey] || 0), 0);
    const sumXY = data.reduce((sum, d, i) => sum + i * (d[dataKey] || 0), 0);
    const sumXX = data.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.map((_, i) => ({
      x: i,
      y: slope * i + intercept
    }));
  }, []);

  // Handle zoom
  const handleMouseDown = (e: any) => {
    if (!enableZoom || !e) return;
    setRefAreaLeft(e.activeLabel);
  };

  const handleMouseMove = (e: any) => {
    if (!enableZoom || !refAreaLeft || !e) return;
    setRefAreaRight(e.activeLabel);
  };

  const handleMouseUp = () => {
    if (!enableZoom || !refAreaLeft || !refAreaRight) {
      setRefAreaLeft('');
      setRefAreaRight('');
      return;
    }

    const left = Math.min(
      data.findIndex(d => d.name === refAreaLeft),
      data.findIndex(d => d.name === refAreaRight)
    );
    const right = Math.max(
      data.findIndex(d => d.name === refAreaLeft),
      data.findIndex(d => d.name === refAreaRight)
    );

    if (left >= 0 && right >= 0 && left !== right) {
      setZoomDomain({ left, right });
    }

    setRefAreaLeft('');
    setRefAreaRight('');
  };

  const resetZoom = () => {
    setZoomDomain({});
  };

  // Get display data based on zoom
  const displayData = zoomDomain.left !== undefined && zoomDomain.right !== undefined
    ? data.slice(zoomDomain.left, zoomDomain.right + 1)
    : data;

  // Calculate trendline data
  const trendlineData = showTrendline 
    ? calculateTrendline(displayData).map((point, index) => ({
        name: displayData[index]?.name || '',
        trendValue: point.y
      }))
    : [];

  // Get line colors
  const getLineColor = (index: number) => {
    if (settings.colors.gradient && settings.colors.gradient.length > index) {
      return settings.colors.gradient[index];
    }
    const colors = [
      settings.colors.primary,
      settings.colors.success,
      settings.colors.warning,
      settings.colors.error,
      settings.colors.info,
      settings.colors.secondary,
    ];
    return colors[index % colors.length];
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
        
        <div className="flex items-center space-x-2">
          {enableZoom && (
            <div className="flex items-center space-x-1 mr-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetZoom}
                disabled={!zoomDomain.left && !zoomDomain.right}
                className="h-8 px-2"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          <PremiumChartControls
            chartId={chartId}
            chartElement={chartRef.current}
            chartData={data}
            onSettingsChange={setSettings}
          />
        </div>
      </CardHeader>

      <CardContent>
        <div ref={chartRef} className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={displayData}
              margin={{ top: 20, right: 30, left: 20, bottom: showBrush ? 60 : 20 }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
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
                domain={zoomDomain.left !== undefined ? ['dataMin', 'dataMax'] : undefined}
              />
              
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString('pt-BR')}
                domain={['dataMin - 5%', 'dataMax + 5%']}
              />

              {settings.showTooltip && (
                <Tooltip 
                  content={<CustomTooltip settings={settings} />}
                  cursor={{ stroke: settings.colors.primary, strokeWidth: 1, strokeDasharray: '4 4' }}
                />
              )}

              {/* Reference area for zoom selection */}
              {refAreaLeft && refAreaRight && (
                <ReferenceArea
                  x1={refAreaLeft}
                  x2={refAreaRight}
                  strokeOpacity={0.3}
                  fill={settings.colors.primary}
                  fillOpacity={0.1}
                />
              )}

              {/* Main data lines */}
              {dataKeys.map((dataKey, index) => (
                <Line
                  key={dataKey}
                  type="monotone"
                  dataKey={dataKey}
                  stroke={getLineColor(index)}
                  strokeWidth={3}
                  strokeDasharray={index > 0 ? "8 8" : "0 0"}
                  dot={<CustomDot dataKey={dataKey} index={index} />}
                  activeDot={{
                    r: 6,
                    stroke: getLineColor(index),
                    strokeWidth: 2,
                    fill: '#fff',
                    style: { 
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                      cursor: 'pointer'
                    }
                  }}
                  connectNulls={false}
                  animationBegin={settings.showAnimation ? index * 200 : 0}
                  animationDuration={settings.showAnimation ? 1000 : 0}
                />
              ))}

              {/* Trendline */}
              {showTrendline && trendlineData.length > 0 && (
                <Line
                  type="linear"
                  dataKey="trendValue"
                  data={trendlineData}
                  stroke={settings.colors.error}
                  strokeWidth={2}
                  strokeDasharray="12 12"
                  dot={false}
                  activeDot={false}
                  opacity={0.7}
                />
              )}

              {showBrush && data.length > 10 && (
                <Brush
                  dataKey="name"
                  height={30}
                  stroke={settings.colors.primary}
                  fill="rgba(59, 130, 246, 0.1)"
                  onChange={(brushData: any) => {
                    if (brushData) {
                      setZoomDomain({
                        left: brushData.startIndex || 0,
                        right: brushData.endIndex || data.length - 1
                      });
                    } else {
                      setZoomDomain({});
                    }
                  }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Zoom instructions */}
        {enableZoom && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            {zoomDomain.left !== undefined || zoomDomain.right !== undefined ? (
              <span>Visualizando dados filtrados • Use o botão de reset para ver todos os dados</span>
            ) : (
              <span>Clique e arraste no gráfico para fazer zoom • Use a barra inferior para navegar</span>
            )}
          </div>
        )}

        {/* Data insights */}
        <AnimatePresence>
          {displayData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"
            >
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-muted-foreground mb-1">Máximo</div>
                <div className="font-bold text-lg">
                  {Math.max(...displayData.map(d => d.value || 0)).toLocaleString('pt-BR')}
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-muted-foreground mb-1">Mínimo</div>
                <div className="font-bold text-lg">
                  {Math.min(...displayData.map(d => d.value || 0)).toLocaleString('pt-BR')}
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-muted-foreground mb-1">Média</div>
                <div className="font-bold text-lg">
                  {Math.round(displayData.reduce((sum, d) => sum + (d.value || 0), 0) / displayData.length).toLocaleString('pt-BR')}
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-muted-foreground mb-1">Pontos</div>
                <div className="font-bold text-lg">
                  {displayData.length}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}