import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useContratosByCliente } from "@/hooks/useContratosByCliente";
import { useClientes } from "@/hooks/useClientes";
import { ClassificacaoChart } from "./ClassificacaoChart";
import { StatsCard } from "./StatsCard";
import { AnalisePresente } from "./AnalisePresente";
import { ProjecaoFutura } from "./ProjecaoFutura";
import { EstrategiaCompleta } from "./EstrategiaCompleta";
import { DashboardControls } from "./DashboardControls";
import { 
  FileText, 
  DollarSign, 
  Calculator, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Gavel
} from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ClienteAnalysisDetailsProps {
  clienteId: string;
}

export function ClienteAnalysisDetails({ clienteId }: ClienteAnalysisDetailsProps) {
  const { data: contratos, isLoading: loadingContratos } = useContratosByCliente(clienteId);
  const { data: clientes } = useClientes();
  
  const cliente = clientes?.find(c => c.id === clienteId);

  // Estados para controle de apresentação
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<HTMLDivElement[]>([]);

  const totalSections = 4; // Análise Presente, Projeção Futura, Estratégia, Detalhes

  // Detecta teclas de navegação
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      } else if (e.key === 'ArrowRight') {
        handleNavigate('next');
      } else if (e.key === 'ArrowLeft') {
        handleNavigate('prev');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen, currentSection]);

  // Scroll suave para seção
  useEffect(() => {
    if (isFullscreen && sectionRefs.current[currentSection]) {
      sectionRefs.current[currentSection].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [currentSection, isFullscreen]);

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'next' && currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1);
    } else if (direction === 'prev' && currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setCurrentSection(0);
      toast.success("Modo apresentação ativado", {
        description: "Use as setas para navegar ou ESC para sair"
      });
    }
  };

  const handleExportPDF = async () => {
    if (!containerRef.current) return;
    
    toast.loading("Gerando PDF...");
    
    try {
      const sections = sectionRefs.current.filter(ref => ref !== null);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const canvas = await html2canvas(section, {
          scale: 2,
          useCORS: true,
          logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pageHeight - 20));
      }

      const nomeArquivo = `analise_${cliente?.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(nomeArquivo);
      
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF");
    }
  };

  const handleShareWhatsApp = () => {
    const valorTotal = contratos?.reduce((sum, c) => sum + (c.saldo_contabil || c.valor_divida || 0), 0) || 0;
    const texto = `📊 *Análise Financeira - ${cliente?.nome}*\n\n` +
      `💰 Valor Total: ${valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n` +
      `📋 Contratos: ${contratos?.length}\n\n` +
      `Análise completa gerada pelo IntelBank.\n` +
      `🔗 Acesse: ${window.location.origin}`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
    
    toast.success("Abrindo WhatsApp...");
  };

  if (loadingContratos) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Carregando análise do cliente...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!contratos || contratos.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Análise do Cliente: {cliente?.nome}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">
              Este cliente não possui contratos cadastrados.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular estatísticas do cliente
  const totalContratos = contratos.length;
  const valorTotalDividas = contratos.reduce((sum, c) => sum + (Number(c.valor_divida) || 0), 0);
  const valorTotalProvisao = contratos.reduce((sum, c) => sum + (Number(c.valor_provisao) || 0), 0);
  const percentualProvisao = valorTotalDividas > 0 ? (valorTotalProvisao / valorTotalDividas) * 100 : 0;

  // Distribuição por classificação
  const porClassificacao = contratos.reduce((acc, contrato) => {
    const classificacao = contrato.classificacao || "Não classificado";
    acc[classificacao] = (acc[classificacao] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Distribuição por situação
  const porSituacao = contratos.reduce((acc, contrato) => {
    const situacao = contrato.situacao || "Não informado";
    acc[situacao] = (acc[situacao] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getSituacaoIcon = (situacao: string) => {
    switch (situacao) {
      case 'Acordo Finalizado': return CheckCircle;
      case 'Em processo judicial': return Gavel;
      case 'Em negociação': return TrendingUp;
      default: return Clock;
    }
  };

  const getSituacaoColor = (situacao: string) => {
    switch (situacao) {
      case 'Acordo Finalizado': return 'bg-green-500';
      case 'Em processo judicial': return 'bg-red-500';
      case 'Em negociação': return 'bg-blue-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <>
      <div 
        ref={containerRef}
        className={`${isFullscreen ? 'fixed inset-0 bg-white z-40 overflow-y-auto' : ''} space-y-6`}
      >
        {/* Seção 0: Análise da Situação Presente */}
        <div ref={(el) => { if (el) sectionRefs.current[0] = el; }}>
          <AnalisePresente contratos={contratos} />
        </div>

        <Separator className="my-8" />

        {/* Seção 1: Projeção Futura */}
        <div ref={(el) => { if (el) sectionRefs.current[1] = el; }}>
          <ProjecaoFutura contratos={contratos} />
        </div>

        <Separator className="my-8" />

        {/* Seção 2: Estratégia Completa */}
        <div ref={(el) => { if (el) sectionRefs.current[2] = el; }}>
          <EstrategiaCompleta contratos={contratos} />
        </div>

        <Separator className="my-8" />

      {/* Seção 3: Detalhes do Cliente */}
      <div ref={(el) => { if (el) sectionRefs.current[3] = el; }}>
        {/* Header do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Análise Detalhada: {cliente?.nome}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              {cliente?.cpf_cnpj && (
                <Badge variant="outline">{cliente.cpf_cnpj}</Badge>
              )}
              {cliente?.email && (
                <Badge variant="outline">{cliente.email}</Badge>
              )}
              {cliente?.telefone && (
                <Badge variant="outline">{cliente.telefone}</Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* KPIs do Cliente */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
          <StatsCard
            title="Contratos"
            value={totalContratos}
            description="Total de contratos"
            icon={FileText}
          />
          <StatsCard
            title="Total de Dívidas"
            value={`R$ ${(valorTotalDividas / 1000).toFixed(0)}K`}
            description="Valor total das dívidas"
            icon={DollarSign}
          />
          <StatsCard
            title="Provisão Total"
            value={`R$ ${(valorTotalProvisao / 1000).toFixed(0)}K`}
            description="Valor provisionado"
            icon={Calculator}
          />
          <StatsCard
            title="% Provisão"
            value={`${percentualProvisao.toFixed(1)}%`}
            description="Percentual de risco"
            icon={TrendingUp}
            className={
              percentualProvisao > 50 
                ? "border-destructive/20 bg-destructive/5" 
                : "border-primary/20 bg-primary/5"
            }
          />
        </div>

        {/* Gráficos */}
        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          <ClassificacaoChart data={porClassificacao} />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Status dos Contratos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(porSituacao).map(([situacao, quantidade]) => {
                  const Icon = getSituacaoIcon(situacao);
                  return (
                    <div key={situacao} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${getSituacaoColor(situacao)}`} />
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{situacao}</span>
                      </div>
                      <Badge variant="secondary">{quantidade}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Contratos */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Contratos do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {contratos.map(contrato => (
                <div key={contrato.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-sm">{contrato.numero_contrato || "Contrato sem número"}</p>
                      <Badge variant="outline" className="text-xs">
                        {contrato.classificacao || "Não classificado"}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{contrato.bancos?.nome || "Banco não informado"}</span>
                      <span>{contrato.situacao || "Situação não informada"}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">R$ {Number(contrato.valor_divida || 0).toLocaleString('pt-BR')}</p>
                     <p className="text-xs text-muted-foreground">
                        Provisão: R$ {Number(contrato.valor_provisao || 0).toLocaleString('pt-BR')} 
                        ({(((contrato.valor_provisao ?? 0) / (contrato.valor_divida || 1)) * 100).toFixed(1)}%)
                     </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Info Card Explicativo */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-3xl">💡</div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">
                Entendendo os Conceitos Regulatórios BCB
              </h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p>
                  <strong>Classificação (C1-C5):</strong> Representa o TIPO de operação bancária baseado em garantias 
                  (C1 = garantias sólidas, C3 = sem garantia forte, etc.). Não muda com o tempo.
                </p>
                <p>
                  <strong>Estágio (1, 2 ou 3):</strong> Baseado no TEMPO de atraso conforme BCB 4.966/2021. 
                  Estágio 1 (0-30 dias), Estágio 2 (31-90 dias), Estágio 3 (acima de 90 dias).
                </p>
                <p>
                  <strong>Provisão Bancária:</strong> Quanto MAIOR a provisão, MAIOR o interesse do banco em negociar, 
                  pois ele não quer manter recursos provisionados. Use isso a seu favor!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Controles de Apresentação */}
    <DashboardControls
      onFullscreen={handleFullscreen}
      isFullscreen={isFullscreen}
      currentSection={currentSection}
      totalSections={totalSections}
      onNavigate={handleNavigate}
      onExportPDF={handleExportPDF}
      onShareWhatsApp={handleShareWhatsApp}
    />
  </>
  );
}