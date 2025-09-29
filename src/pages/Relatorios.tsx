import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, TrendingUp, AlertTriangle, Users, Building, FileDown, BarChart3, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  useRelatorioProvisao, 
  useRelatorioPosicaoContratos, 
  useRelatorioRisco 
} from "@/hooks/useRelatorios";
import { 
  exportarRelatorioProvisaoPDF, 
  exportarRelatorioPosicaoPDF, 
  exportarRelatorioRiscoPDF,
  exportarRelatorioCSV
} from "@/lib/exportRelatorios";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ResponsiveGrid, ResponsiveCard, ResponsiveContainer, PageHeader } from "@/components/ui/responsive-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type RelatorioTipo = "provisao" | "posicao" | "risco" | null;

export default function Relatorios() {
  const [relatorioAtivo, setRelatorioAtivo] = useState<RelatorioTipo>(null);
  
  const { data: dadosProvisao, isLoading: loadingProvisao } = useRelatorioProvisao();
  const { data: dadosPosicao, isLoading: loadingPosicao } = useRelatorioPosicaoContratos();
  const { data: dadosRisco, isLoading: loadingRisco } = useRelatorioRisco();

  const relatorios = [
    {
      id: "provisao" as RelatorioTipo,
      nome: "Provisões",
      titulo: "Relatório de Provisões",
      descricao: "Análise completa das provisões por período e classificação de risco",
      icon: TrendingUp,
      cor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      dados: dadosProvisao,
      loading: loadingProvisao,
      category: "Financeiro"
    },
    {
      id: "posicao" as RelatorioTipo,
      nome: "Posição de Contratos",
      titulo: "Posição de Contratos",
      descricao: "Status atual de todos os contratos organizados por situação e banco",
      icon: BarChart3,
      cor: "text-blue-600",
      bgColor: "bg-blue-50",
      dados: dadosPosicao,
      loading: loadingPosicao,
      category: "Operacional"
    },
    {
      id: "risco" as RelatorioTipo,
      nome: "Análise de Risco",
      titulo: "Análise de Risco",
      descricao: "Distribuição detalhada de contratos por classificação de risco BCB",
      icon: PieChart,
      cor: "text-amber-600",
      bgColor: "bg-amber-50",
      dados: dadosRisco,
      loading: loadingRisco,
      category: "Compliance"
    }
  ];

  const handleExportPDF = async (tipo: RelatorioTipo) => {
    try {
      switch (tipo) {
        case "provisao":
          if (dadosProvisao) await exportarRelatorioProvisaoPDF(dadosProvisao);
          break;
        case "posicao":
          if (dadosPosicao) await exportarRelatorioPosicaoPDF(dadosPosicao);
          break;
        case "risco":
          if (dadosRisco) await exportarRelatorioRiscoPDF(dadosRisco);
          break;
      }
      toast.success("Relatório PDF exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar relatório PDF");
    }
  };

  const handleExportCSV = async (tipo: RelatorioTipo) => {
    try {
      let dados;
      let filename;
      
      switch (tipo) {
        case "provisao":
          dados = dadosProvisao;
          filename = "relatorio-provisao";
          break;
        case "posicao":
          dados = dadosPosicao;
          filename = "relatorio-posicao";
          break;
        case "risco":
          dados = dadosRisco;
          filename = "relatorio-risco";
          break;
      }
      
      if (dados) {
        await exportarRelatorioCSV(dados, filename);
        toast.success("Relatório CSV exportado com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao exportar relatório CSV");
    }
  };

  const categorias = [...new Set(relatorios.map(r => r.category))];

  return (
    <ResponsiveContainer>
      {/* Header Section */}
      <div className="space-y-2 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          Relatórios Gerenciais
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Análises e relatórios para tomada de decisão estratégica em conformidade BCB
        </p>
      </div>

      {/* Tabs por Categoria */}
      <Tabs defaultValue="todos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="todos" className="text-xs md:text-sm">Todos</TabsTrigger>
          {categorias.map(categoria => (
            <TabsTrigger key={categoria} value={categoria.toLowerCase()} className="text-xs md:text-sm">
              {categoria}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="todos">
          <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }}>
            {relatorios.map((relatorio) => (
              <RelatorioCard 
                key={relatorio.id}
                relatorio={relatorio}
                onSelect={setRelatorioAtivo}
                onExportPDF={handleExportPDF}
                onExportCSV={handleExportCSV}
              />
            ))}
          </ResponsiveGrid>
        </TabsContent>

        {categorias.map(categoria => (
          <TabsContent key={categoria} value={categoria.toLowerCase()}>
            <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }}>
              {relatorios
                .filter(r => r.category === categoria)
                .map((relatorio) => (
                  <RelatorioCard 
                    key={relatorio.id}
                    relatorio={relatorio}
                    onSelect={setRelatorioAtivo}
                    onExportPDF={handleExportPDF}
                    onExportCSV={handleExportCSV}
                  />
                ))}
            </ResponsiveGrid>
          </TabsContent>
        ))}
      </Tabs>

      {/* Detalhes do Relatório Selecionado */}
      {relatorioAtivo && (
        <div className="mt-8">
          <ResponsiveCard className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {(() => {
                      const relatorio = relatorios.find(r => r.id === relatorioAtivo);
                      const IconComponent = relatorio?.icon || FileText;
                      return <IconComponent className="w-5 h-5 text-primary" />;
                    })()}
                  </div>
                  <div>
                    <CardTitle className="text-lg md:text-xl">
                      {relatorios.find(r => r.id === relatorioAtivo)?.titulo}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Atualizado em {new Date().toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setRelatorioAtivo(null)}
                  className="w-full sm:w-auto"
                >
                  Fechar Visualização
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Relatório em Desenvolvimento</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Este relatório estará disponível em breve com análises detalhadas e visualizações interativas
                </p>
              </div>
            </CardContent>
          </ResponsiveCard>
        </div>
      )}
    </ResponsiveContainer>
  );
}

// Componente individual do card de relatório
function RelatorioCard({ 
  relatorio, 
  onSelect, 
  onExportPDF, 
  onExportCSV 
}: {
  relatorio: any;
  onSelect: (id: RelatorioTipo) => void;
  onExportPDF: (id: RelatorioTipo) => void;
  onExportCSV: (id: RelatorioTipo) => void;
}) {
  const IconComponent = relatorio.icon;
  
  return (
    <div 
      className="cursor-pointer group transition-all duration-200"
      onClick={() => onSelect(relatorio.id)}
    >
      <ResponsiveCard className="h-full hover:shadow-lg hover:scale-[1.02]">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${relatorio.bgColor} group-hover:scale-110 transition-transform duration-200`}>
            <IconComponent className={`w-6 h-6 ${relatorio.cor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-base font-semibold truncate">
                {relatorio.nome}
              </CardTitle>
              <Badge variant="secondary" className="text-xs shrink-0">
                {relatorio.category}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {relatorio.descricao}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
          {relatorio.loading ? (
            <Skeleton className="h-5 w-20" />
          ) : (
            <Badge variant="outline" className="text-xs">
              {Array.isArray(relatorio.dados) ? relatorio.dados.length : 0} registros
            </Badge>
          )}
        </div>
        
        <Separator />
        
        {/* Botões de Ação */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onExportPDF(relatorio.id);
            }}
            className="text-xs"
            disabled={relatorio.loading}
          >
            <FileDown className="w-3 h-3 mr-1" />
            PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onExportCSV(relatorio.id);
            }}
            className="text-xs"
            disabled={relatorio.loading}
          >
            <Download className="w-3 h-3 mr-1" />
            CSV
          </Button>
        </div>
      </CardContent>
    </ResponsiveCard>
    </div>
  );
}