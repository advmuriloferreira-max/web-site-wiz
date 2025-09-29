import React, { useState } from 'react';
import { 
  Download, 
  Settings, 
  Palette, 
  Share2, 
  Copy, 
  BarChart3, 
  LineChart, 
  PieChart, 
  AreaChart,
  Grid3X3,
  Eye,
  EyeOff,
  RotateCcw,
  Zap,
  ZapOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useChartCustomization, ChartSettings } from '@/hooks/useChartCustomization';
import { useChartExport, ExportOptions } from '@/hooks/useChartExport';
import { toast } from '@/hooks/use-toast';

interface PremiumChartControlsProps {
  chartId: string;
  chartElement?: HTMLElement | null;
  chartData?: any[];
  className?: string;
  onSettingsChange?: (settings: ChartSettings) => void;
}

const chartTypeIcons = {
  bar: BarChart3,
  line: LineChart,
  pie: PieChart,
  area: AreaChart,
  mixed: Grid3X3,
};

const chartTypeLabels = {
  bar: 'Barras',
  line: 'Linha',
  pie: 'Pizza',
  area: 'Área',
  mixed: 'Misto',
};

const colorPresets = [
  { name: 'Azul', colors: ['#3B82F6', '#1E40AF', '#93C5FD', '#DBEAFE'] },
  { name: 'Verde', colors: ['#10B981', '#047857', '#6EE7B7', '#D1FAE5'] },
  { name: 'Roxo', colors: ['#8B5CF6', '#5B21B6', '#C4B5FD', '#EDE9FE'] },
  { name: 'Rosa', colors: ['#EC4899', '#BE185D', '#F9A8D4', '#FCE7F3'] },
  { name: 'Laranja', colors: ['#F59E0B', '#D97706', '#FCD34D', '#FEF3C7'] },
  { name: 'Gradiente', colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c'] },
];

export function PremiumChartControls({
  chartId,
  chartElement,
  chartData = [],
  className,
  onSettingsChange
}: PremiumChartControlsProps) {
  const { settings, updateChartType, updateSetting, updateColors, resetToDefault } = useChartCustomization(chartId);
  const { exportChart, generateShareableLink, copyChartData } = useChartExport();
  const [isExporting, setIsExporting] = useState(false);

  React.useEffect(() => {
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  const handleExport = async (format: ExportOptions['format']) => {
    if (!chartElement) {
      toast({
        title: "Erro",
        description: "Gráfico não encontrado para exportação",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      await exportChart(chartElement, {
        format,
        filename: `grafico-${chartId}-${Date.now()}`,
      });
      
      toast({
        title: "Sucesso",
        description: `Gráfico exportado como ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o gráfico",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = await generateShareableLink(settings, chartData);
      toast({
        title: "Link copiado!",
        description: "Link do gráfico copiado para a área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o link de compartilhamento",
        variant: "destructive",
      });
    }
  };

  const handleCopyData = async (format: 'json' | 'csv' | 'tsv') => {
    try {
      await copyChartData(chartData, format);
      toast({
        title: "Dados copiados!",
        description: `Dados do gráfico copiados como ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar os dados",
        variant: "destructive",
      });
    }
  };

  const handleColorPresetSelect = (preset: typeof colorPresets[0]) => {
    updateColors({
      primary: preset.colors[0],
      secondary: preset.colors[1],
      success: preset.colors[2],
      info: preset.colors[3],
      gradient: preset.colors,
    });
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Chart Type Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            {React.createElement(chartTypeIcons[settings.chartType], { className: "h-4 w-4" })}
            <span className="hidden sm:inline">{chartTypeLabels[settings.chartType]}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Tipo de Gráfico</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(chartTypeIcons).map(([type, Icon]) => (
            <DropdownMenuItem
              key={type}
              onClick={() => updateChartType(type as any)}
              className="flex items-center space-x-2"
            >
              <Icon className="h-4 w-4" />
              <span>{chartTypeLabels[type as keyof typeof chartTypeLabels]}</span>
              {settings.chartType === type && (
                <Badge variant="secondary" className="ml-auto">Ativo</Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Color Customization */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Cores</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-3">Paletas de Cores</h4>
              <div className="grid grid-cols-2 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleColorPresetSelect(preset)}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="flex space-x-1">
                      {preset.colors.slice(0, 4).map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-sm">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium text-sm mb-3">Cor Principal</h4>
              <input
                type="color"
                value={settings.colors.primary}
                onChange={(e) => updateColors({ primary: e.target.value })}
                className="w-full h-10 rounded-md border border-border cursor-pointer"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Chart Settings */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Opções</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Configurações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuCheckboxItem
            checked={settings.showGrid}
            onCheckedChange={(checked) => updateSetting('showGrid', checked)}
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Grade
          </DropdownMenuCheckboxItem>
          
          <DropdownMenuCheckboxItem
            checked={settings.showLegend}
            onCheckedChange={(checked) => updateSetting('showLegend', checked)}
          >
            {settings.showLegend ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
            Legenda
          </DropdownMenuCheckboxItem>
          
          <DropdownMenuCheckboxItem
            checked={settings.showTooltip}
            onCheckedChange={(checked) => updateSetting('showTooltip', checked)}
          >
            {settings.showTooltip ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
            Tooltips
          </DropdownMenuCheckboxItem>
          
          <DropdownMenuCheckboxItem
            checked={settings.showAnimation}
            onCheckedChange={(checked) => updateSetting('showAnimation', checked)}
          >
            {settings.showAnimation ? <Zap className="h-4 w-4 mr-2" /> : <ZapOff className="h-4 w-4 mr-2" />}
            Animações
          </DropdownMenuCheckboxItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={resetToDefault}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Export Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isExporting}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Exportar</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Exportar Gráfico</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => handleExport('png')}>
            Imagem PNG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('jpg')}>
            Imagem JPG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('svg')}>
            Vetor SVG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            PDF
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Exportar Dados</DropdownMenuLabel>
          
          <DropdownMenuItem onClick={() => handleCopyData('json')}>
            <Copy className="h-4 w-4 mr-2" />
            JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCopyData('csv')}>
            <Copy className="h-4 w-4 mr-2" />
            CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCopyData('tsv')}>
            <Copy className="h-4 w-4 mr-2" />
            TSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Share */}
      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline ml-2">Compartilhar</span>
      </Button>
    </div>
  );
}