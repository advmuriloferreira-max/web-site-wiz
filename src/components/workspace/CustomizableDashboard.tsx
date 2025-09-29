import React, { useState, useCallback, useMemo } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PremiumBarChart } from '@/components/charts/PremiumBarChart';
import { PremiumLineChart } from '@/components/charts/PremiumLineChart';
import { PremiumPieChart } from '@/components/charts/PremiumPieChart';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useContratos } from '@/hooks/useContratos';
import { useClientes } from '@/hooks/useClientes';
import { 
  Plus, 
  Settings, 
  Grip, 
  X, 
  BarChart3, 
  LineChart,
  PieChart,
  TrendingUp,
  Users,
  FileText,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface Widget {
  id: string;
  type: 'stats' | 'chart' | 'list' | 'calendar';
  title: string;
  component: string;
  config: Record<string, any>;
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
  };
}

const WIDGET_TYPES = [
  {
    type: 'stats',
    title: 'Estatísticas',
    icon: TrendingUp,
    components: [
      { id: 'total-contracts', name: 'Total de Contratos', component: 'TotalContracts' },
      { id: 'total-clients', name: 'Total de Clientes', component: 'TotalClients' },
      { id: 'provision-value', name: 'Valor Provisão', component: 'ProvisionValue' },
      { id: 'avg-agreement', name: 'Média de Acordos', component: 'AvgAgreement' }
    ]
  },
  {
    type: 'chart',
    title: 'Gráficos',
    icon: BarChart3,
    components: [
      { id: 'contracts-trend', name: 'Tendência de Contratos', component: 'ContractsTrend' },
      { id: 'clients-analysis', name: 'Análise de Clientes', component: 'ClientsAnalysis' },
      { id: 'classification-chart', name: 'Classificação', component: 'ClassificationChart' },
      { id: 'agreements-chart', name: 'Acordos', component: 'AgreementsChart' }
    ]
  }
];

export function CustomizableDashboard() {
  const { activeWorkspace, saveDashboardLayout, dashboardLayouts } = useWorkspace();
  const { data: contratos = [] } = useContratos();
  const { data: clientes = [] } = useClientes();
  
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [layouts, setLayouts] = useState<{ [key: string]: Layout[] }>({});
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);

  // Load dashboard layout
  React.useEffect(() => {
    if (activeWorkspace && Array.isArray(dashboardLayouts) && dashboardLayouts.length > 0) {
      const defaultLayout = dashboardLayouts.find(l => 
        l.workspace_id === activeWorkspace.id && l.is_default
      ) || dashboardLayouts.find(l => l.workspace_id === activeWorkspace.id);

      if (defaultLayout) {
        setLayouts(defaultLayout.layout as any || {});
        setWidgets(Object.values(defaultLayout.widgets || {}));
      }
    }
  }, [activeWorkspace, dashboardLayouts]);

  const handleLayoutChange = useCallback((layout: Layout[], layouts: { [key: string]: Layout[] }) => {
    setLayouts(layouts);
  }, []);

  const handleBreakpointChange = useCallback((breakpoint: string) => {
    setCurrentBreakpoint(breakpoint);
  }, []);

  const addWidget = useCallback((type: string, component: string, title: string) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: type as any,
      title,
      component,
      config: {},
      layout: {
        x: 0,
        y: 0,
        w: type === 'stats' ? 3 : 6,
        h: type === 'stats' ? 2 : 4,
        minW: type === 'stats' ? 2 : 4,
        minH: type === 'stats' ? 2 : 3
      }
    };

    setWidgets(prev => [...prev, newWidget]);
    setShowWidgetPicker(false);
  }, []);

  const removeWidget = useCallback((widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  }, []);

  const saveLayout = useCallback(async () => {
    if (!activeWorkspace) return;

    const widgetsMap = widgets.reduce((acc, widget) => {
      acc[widget.id] = widget;
      return acc;
    }, {} as Record<string, Widget>);

    await saveDashboardLayout(
      activeWorkspace.id,
      'Dashboard Principal',
      layouts as any,
      widgetsMap
    );

    setIsEditMode(false);
  }, [activeWorkspace, layouts, widgets, saveDashboardLayout]);

  const renderWidget = useCallback((widget: Widget) => {
    const { component, title, config } = widget;

    const commonProps = {
      data: contratos,
      clientes,
      config
    };

    switch (component) {
      case 'TotalContracts':
        return (
          <StatsCard
            title="Total de Contratos"
            value={contratos.length.toString()}
            description="Contratos cadastrados"
            trend={{ value: 12, isPositive: true }}
            icon={FileText}
            className="h-full"
          />
        );

      case 'TotalClients':
        return (
          <StatsCard
            title="Total de Clientes"
            value={clientes.length.toString()}
            description="Clientes cadastrados"
            trend={{ value: 8, isPositive: true }}
            icon={Users}
            className="h-full"
          />
        );

      case 'ProvisionValue':
        const totalProvision = contratos.reduce((sum, c) => sum + (c.valor_provisao || 0), 0);
        return (
          <StatsCard
            title="Valor Provisão"
            value={`R$ ${totalProvision.toLocaleString('pt-BR')}`}
            description="Total provisionado"
            trend={{ value: 5, isPositive: false }}
            icon={TrendingUp}
            className="h-full"
          />
        );

      case 'ContractsTrend':
        const contractsData = contratos.slice(0, 10).map((c, index) => ({
          name: new Date(c.created_at).toLocaleDateString('pt-BR'),
          value: Number(c.valor_divida) || 0,
          provision: Number(c.valor_provisao) || 0
        }));
        
        return (
          <div className="h-full p-4">
            <h3 className="text-sm font-medium mb-2">Tendência de Contratos</h3>
            <div className="h-32 bg-muted rounded flex items-center justify-center text-muted-foreground">
              Gráfico de linha - {contractsData.length} contratos
            </div>
          </div>
        );

      case 'ClientsAnalysis':
        const clientsData = clientes.slice(0, 10).map(c => ({
          name: c.nome.substring(0, 10),
          value: contratos.filter(ct => ct.cliente_id === c.id).length
        }));
        
        return (
          <div className="h-full p-4">
            <h3 className="text-sm font-medium mb-2">Análise de Clientes</h3>
            <div className="h-32 bg-muted rounded flex items-center justify-center text-muted-foreground">
              Gráfico de barras - {clientsData.length} clientes
            </div>
          </div>
        );

      case 'ClassificationChart':
        const classifications = contratos.reduce((acc, c) => {
          const classif = c.classificacao || 'Não classificado';
          acc[classif] = (acc[classif] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const classificationData = Object.entries(classifications).map(([name, value]) => ({
          name,
          value
        }));

        return (
          <div className="h-full p-4">
            <h3 className="text-sm font-medium mb-2">Classificação</h3>
            <div className="h-32 bg-muted rounded flex items-center justify-center text-muted-foreground">
              Gráfico de pizza - {classificationData.length} categorias
            </div>
          </div>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Widget não implementado: {component}
          </div>
        );
    }
  }, [contratos, clientes]);

  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">
            {activeWorkspace?.name || 'Dashboard'}
          </h2>
          <Badge variant="secondary">{widgets.length} widgets</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWidgetPicker(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Widget
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={saveLayout}
              >
                Salvar Layout
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditMode(false)}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditMode(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="flex-1 p-4">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={60}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          onLayoutChange={handleLayoutChange}
          onBreakpointChange={handleBreakpointChange}
          margin={[16, 16]}
          containerPadding={[0, 0]}
        >
          {widgets.map((widget) => (
            <Card 
              key={widget.id}
              className={cn(
                "relative overflow-hidden transition-all duration-200",
                isEditMode && "ring-2 ring-primary/20"
              )}
            >
              {isEditMode && (
                <div className="absolute top-2 right-2 z-10 flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0 bg-background/80"
                    onClick={() => removeWidget(widget.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="h-6 w-6 flex items-center justify-center bg-background/80 rounded border cursor-move">
                    <Grip className="h-3 w-3" />
                  </div>
                </div>
              )}
              
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{widget.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0 h-[calc(100%-4rem)]">
                {renderWidget(widget)}
              </CardContent>
            </Card>
          ))}
        </ResponsiveGridLayout>
      </div>

      {/* Widget Picker Modal */}
      {showWidgetPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[600px] max-h-[80vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Adicionar Widget</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWidgetPicker(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="overflow-y-auto">
              <Tabs defaultValue={WIDGET_TYPES[0].type}>
                <TabsList className="grid w-full grid-cols-2">
                  {WIDGET_TYPES.map(category => (
                    <TabsTrigger key={category.type} value={category.type}>
                      <category.icon className="h-4 w-4 mr-2" />
                      {category.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {WIDGET_TYPES.map(category => (
                  <TabsContent key={category.type} value={category.type} className="space-y-2">
                    {category.components.map(component => (
                      <Card 
                        key={component.id}
                        className="p-4 cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => addWidget(category.type, component.component, component.name)}
                      >
                        <div className="flex items-center gap-3">
                          <category.icon className="h-5 w-5 text-primary" />
                          <div>
                            <h4 className="font-medium">{component.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Adicionar widget de {component.name.toLowerCase()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}