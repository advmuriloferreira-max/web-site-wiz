import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, TrendingUp, AlertTriangle, Users, Building, FileDown } from "lucide-react";
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
import { ResponsiveContainer } from "@/components/ui/layout-consistency";
import { GlassCard } from "@/components/ui/glassmorphism";
import { GradientText } from "@/components/ui/gradient-elements";
import { ColoredIcon } from "@/components/ui/color-consistency";

type RelatorioTipo = "provisao" | "posicao" | "risco" | null;

export default function Relatorios() {
  const [relatorioAtivo, setRelatorioAtivo] = useState<RelatorioTipo>(null);
  
  const { data: dadosProvisao, isLoading: loadingProvisao } = useRelatorioProvisao();
  const { data: dadosPosicao, isLoading: loadingPosicao } = useRelatorioPosicaoContratos();
  const { data: dadosRisco, isLoading: loadingRisco } = useRelatorioRisco();

  const relatorios = [
    {
      id: "provisao" as RelatorioTipo,
      nome: "Relatório de Provisões",
      descricao: "Análise completa das provisões por período e classificação",
      icon: TrendingUp,
      cor: "text-green-600",
      dados: dadosProvisao,
      loading: loadingProvisao
    },
    {
      id: "posicao" as RelatorioTipo,
      nome: "Posição de Contratos",
      descricao: "Status atual de todos os contratos por situação",
      icon: FileText,
      cor: "text-blue-600",
      dados: dadosPosicao,
      loading: loadingPosicao
    },
    {
      id: "risco" as RelatorioTipo,
      nome: "Análise de Risco",
      descricao: "Distribuição de contratos por classificação de risco",
      icon: AlertTriangle,
      cor: "text-red-600",
      dados: dadosRisco,
      loading: loadingRisco
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

  return (
    <ResponsiveContainer className="py-8 animate-fade-in">
      <div className="mb-8">
        <GradientText variant="primary" className="text-3xl font-bold mb-2 flex items-center">
          <ColoredIcon icon={FileText} className="mr-3" />
          Relatórios Gerenciais
        </GradientText>
        <p className="text-muted-foreground">
          Análises e relatórios para tomada de decisão estratégica
        </p>
      </div>

      {/* Grid de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up">
        {relatorios.map((relatorio, index) => (
          <div 
            key={relatorio.id} 
            className={`cursor-pointer group animate-scale-in animate-delay-${index}`}
            onClick={() => setRelatorioAtivo(relatorio.id)}
          >
            <GlassCard 
              variant="subtle" 
              className="h-full interactive-card group-hover:shadow-xl transition-all duration-300"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-4">
                  <div className="glass-element p-3 rounded-full flex-shrink-0">
                    <ColoredIcon icon={relatorio.icon} className={relatorio.cor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold mb-2 line-clamp-1">
                      {relatorio.nome}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {relatorio.descricao}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Status Badge */}
                  <div className="flex justify-start">
                    {relatorio.loading ? (
                      <Skeleton className="h-6 w-24" />
                    ) : (
                      <Badge variant="outline" className="font-medium">
                        {Array.isArray(relatorio.dados) ? relatorio.dados.length : 0} registros
                      </Badge>
                    )}
                  </div>
                  
                  <Separator className="opacity-50" />
                  
                  {/* Botões de Ação */}
                  <div className="flex justify-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportPDF(relatorio.id);
                      }}
                      className="interactive-button flex-1 max-w-[100px]"
                      disabled={relatorio.loading}
                    >
                      <FileDown className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportCSV(relatorio.id);
                      }}
                      className="interactive-button flex-1 max-w-[100px]"
                      disabled={relatorio.loading}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </GlassCard>
          </div>
        ))}
      </div>

      {/* Detalhes do Relatório Selecionado */}
      {relatorioAtivo && (
        <GlassCard variant="subtle" className="animate-slide-up animate-stagger-1">
          <CardHeader className="glass-header border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ColoredIcon 
                  icon={relatorios.find(r => r.id === relatorioAtivo)?.icon || FileText} 
                  className="text-primary" 
                />
                <div>
                  <CardTitle className="text-xl">
                    {relatorios.find(r => r.id === relatorioAtivo)?.nome}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Última atualização: {new Date().toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setRelatorioAtivo(null)}
                className="interactive-button"
              >
                Fechar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <ColoredIcon icon={Building} size="lg" className="text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">
                Relatório em Desenvolvimento
              </p>
              <p className="text-muted-foreground">
                Este relatório estará disponível em breve com análises detalhadas
              </p>
            </div>
          </CardContent>
        </GlassCard>
      )}
    </ResponsiveContainer>
  );
}