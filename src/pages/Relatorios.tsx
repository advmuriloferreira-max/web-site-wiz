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
      descricao: "Classificação de risco por cliente e distribuição",
      icon: AlertTriangle,
      cor: "text-red-600",
      dados: dadosRisco,
      loading: loadingRisco
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = () => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date());
  };

  const handleExportarPDF = (tipo: RelatorioTipo) => {
    try {
      if (tipo === "provisao" && dadosProvisao) {
        exportarRelatorioProvisaoPDF(dadosProvisao);
        toast.success("Relatório de Provisões exportado em PDF!");
      } else if (tipo === "posicao" && dadosPosicao) {
        exportarRelatorioPosicaoPDF(dadosPosicao);
        toast.success("Relatório de Posição exportado em PDF!");
      } else if (tipo === "risco" && dadosRisco) {
        exportarRelatorioRiscoPDF(dadosRisco);
        toast.success("Relatório de Risco exportado em PDF!");
      }
    } catch (error) {
      toast.error("Erro ao exportar relatório");
    }
  };

  const handleExportarCSV = (tipo: RelatorioTipo) => {
    try {
      if (tipo === "provisao" && dadosProvisao) {
        exportarRelatorioCSV(dadosProvisao, 'provisao');
        toast.success("Relatório de Provisões exportado em CSV!");
      } else if (tipo === "posicao" && dadosPosicao) {
        exportarRelatorioCSV(dadosPosicao, 'posicao');
        toast.success("Relatório de Posição exportado em CSV!");
      } else if (tipo === "risco" && dadosRisco) {
        exportarRelatorioCSV(dadosRisco, 'risco');
        toast.success("Relatório de Risco exportado em CSV!");
      }
    } catch (error) {
      toast.error("Erro ao exportar relatório");
    }
  };

  const renderRelatorioProvisao = () => {
    if (loadingProvisao) return <Skeleton className="h-40 w-full" />;
    if (!dadosProvisao) return <p>Dados não disponíveis</p>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{dadosProvisao.total_contratos}</div>
              <p className="text-sm text-muted-foreground">Total de Contratos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(dadosProvisao.valor_total_dividas)}</div>
              <p className="text-sm text-muted-foreground">Valor Total das Dívidas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(dadosProvisao.valor_total_provisao)}</div>
              <p className="text-sm text-muted-foreground">Valor Total Provisionado</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{dadosProvisao.percentual_medio_provisao.toFixed(2)}%</div>
              <p className="text-sm text-muted-foreground">% Médio de Provisão</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Provisões por Classificação de Risco</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dadosProvisao.contratos_por_classificacao.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <span className="font-semibold">{item.classificacao}</span>
                    <p className="text-sm text-muted-foreground">{item.quantidade} contratos</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(item.valor_provisao)}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.valor_total > 0 ? ((item.valor_provisao / item.valor_total) * 100).toFixed(1) : 0}% do valor total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRelatorioPosicao = () => {
    if (loadingPosicao) return <Skeleton className="h-40 w-full" />;
    if (!dadosPosicao) return <p>Dados não disponíveis</p>;

    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{dadosPosicao.total_contratos}</div>
              <p className="text-lg text-muted-foreground">Total de Contratos no Sistema</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Distribuição por Situação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dadosPosicao.por_situacao.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{item.situacao}</span>
                    <div className="text-right">
                      <span className="font-bold">{item.quantidade}</span>
                      <span className="text-sm text-muted-foreground ml-2">({item.percentual.toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contratos Mais Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dadosPosicao.contratos_recentes.slice(0, 5).map((contrato, index) => (
                  <div key={index} className="p-2 border rounded text-sm">
                    <div className="font-semibold">{contrato.numero_contrato}</div>
                    <div className="text-muted-foreground">{contrato.cliente_nome}</div>
                    <div className="flex justify-between">
                      <span>{formatCurrency(contrato.valor_divida)}</span>
                      <Badge variant="outline">{contrato.situacao}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderRelatorioRisco = () => {
    if (loadingRisco) return <Skeleton className="h-40 w-full" />;
    if (!dadosRisco) return <p>Dados não disponíveis</p>;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Distribuição de Risco por Classificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {dadosRisco.distribuicao_risco.map((item, index) => (
                <Card key={index} className={item.classificacao.includes('C4') || item.classificacao.includes('C5') ? 'border-red-200' : ''}>
                  <CardContent className="p-4 text-center">
                    <div className="text-xl font-bold">{item.quantidade}</div>
                    <div className="text-sm font-semibold">{item.classificacao}</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {formatCurrency(item.valor_total)}
                    </div>
                    <div className="text-xs font-medium text-orange-600">
                      {item.percentual_provisao_medio.toFixed(1)}% provisão
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {dadosRisco.clientes_alto_risco.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Users className="h-5 w-5" />
                Clientes de Alto Risco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dadosRisco.clientes_alto_risco.map((cliente, index) => (
                  <div key={index} className="p-4 border border-red-200 rounded bg-red-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-red-800">{cliente.cliente_nome}</div>
                        <div className="text-sm text-red-600">
                          {cliente.total_contratos} contratos • Classificação: {cliente.classificacao_predominante}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-700">{formatCurrency(cliente.valor_total_provisao)}</div>
                        <div className="text-sm text-red-600">provisionado</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderRelatorioSelecionado = () => {
    switch (relatorioAtivo) {
      case "provisao":
        return renderRelatorioProvisao();
      case "posicao":
        return renderRelatorioPosicao();
      case "risco":
        return renderRelatorioRisco();
      default:
        return null;
    }
  };

  if (relatorioAtivo) {
    const relatorioData = relatorios.find(r => r.id === relatorioAtivo);
    
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {relatorioData?.nome}
            </h1>
            <p className="text-muted-foreground">
              Gerado em {formatDate()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExportarCSV(relatorioAtivo)}
              disabled={relatorioData?.loading}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExportarPDF(relatorioAtivo)}
              disabled={relatorioData?.loading}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setRelatorioAtivo(null)}
            >
              Voltar aos Relatórios
            </Button>
          </div>
        </div>
        <Separator />
        {renderRelatorioSelecionado()}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground">
          Gere e visualize relatórios atualizados do sistema
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatorios.map((relatorio) => (
          <Card key={relatorio.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <relatorio.icon className={`h-8 w-8 ${relatorio.cor}`} />
                <Badge variant="default">
                  Disponível
                </Badge>
              </div>
              <CardTitle className="text-lg">{relatorio.nome}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {relatorio.descricao}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Última atualização:</span>
                <span>Em tempo real</span>
              </div>
              <Button 
                className="w-full" 
                onClick={() => setRelatorioAtivo(relatorio.id)}
                disabled={relatorio.loading}
              >
                <FileText className="mr-2 h-4 w-4" />
                {relatorio.loading ? "Carregando..." : "Ver Relatório"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}