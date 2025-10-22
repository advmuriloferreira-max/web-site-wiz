import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useContratoById } from "@/hooks/useContratoById";
import { useClientes } from "@/hooks/useClientes";
import { StatsCard } from "./StatsCard";
import { AnalisePresente } from "./AnalisePresente";
import { ProjecaoFutura } from "./ProjecaoFutura";
import { EstrategiaCompleta } from "./EstrategiaCompleta";
import { DashboardControls } from "./DashboardControls";
import { 
  FileText, 
  DollarSign, 
  Calculator, 
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ClienteAnalysisDetailsProps {
  contratoId: string;
}

export function ClienteAnalysisDetails({ contratoId }: ClienteAnalysisDetailsProps) {
  const { data: contrato, isLoading } = useContratoById(contratoId);
  const { data: clientes } = useClientes();
  
  const cliente = clientes?.find(c => c.id === contrato?.cliente_id);

  // Estados para controle de apresentação
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<HTMLDivElement[]>([]);

  const totalSections = 3; // Análise Presente, Projeção Futura, Estratégia

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
    
    const loadingToast = toast.loading("Preparando documento profissional...");
    
    try {
      const sections = sectionRefs.current.filter(ref => ref !== null);
      
      if (sections.length === 0) {
        toast.error("Nenhuma seção encontrada para exportar");
        return;
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      const headerHeight = 30;
      const footerHeight = 15;
      const availableHeight = pageHeight - headerHeight - footerHeight - margin;

      // Função para adicionar cabeçalho profissional
      const addHeader = (pageNum: number) => {
        pdf.setFillColor(30, 58, 138);
        pdf.rect(0, 0, pageWidth, 25, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Análise Estratégica de Contrato', margin, 12);
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${cliente?.nome || 'Cliente'}`, margin, 19);
        
        pdf.setTextColor(200, 200, 200);
        pdf.text(`Página ${pageNum}`, pageWidth - margin - 20, 19);
      };

      // Função para adicionar rodapé
      const addFooter = () => {
        pdf.setTextColor(120, 120, 120);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        const dataGeracao = new Date().toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        });
        pdf.text(`Gerado em ${dataGeracao} • IntelBank`, margin, pageHeight - 8);
        pdf.text(`Contrato: ${contrato?.numero_contrato || 'N/A'}`, pageWidth - margin - 60, pageHeight - 8);
      };

      let pageNumber = 1;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        
        toast.loading(`Processando seção ${i + 1} de ${sections.length}...`, { id: loadingToast });
        
        // Delay para renderização completa
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const canvas = await html2canvas(section, {
          scale: 2.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          imageTimeout: 0,
          windowWidth: 1200,
          onclone: (clonedDoc) => {
            const clonedSection = clonedDoc.body.querySelector('[data-html2canvas-ignore]');
            if (clonedSection) {
              clonedSection.remove();
            }
            // Remove animações e transições
            const allElements = clonedDoc.body.querySelectorAll('*');
            allElements.forEach((el) => {
              (el as HTMLElement).style.animation = 'none';
              (el as HTMLElement).style.transition = 'none';
            });
          }
        });

        if (canvas.width === 0 || canvas.height === 0) {
          console.error(`Seção ${i} vazia`);
          continue;
        }

        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        
        // Calcula dimensões mantendo aspect ratio
        const imgAspectRatio = canvas.height / canvas.width;
        const imgWidth = contentWidth;
        const imgHeight = imgWidth * imgAspectRatio;

        // Estratégia inteligente de paginação
        const maxHeightPerPage = availableHeight;
        
        if (imgHeight <= maxHeightPerPage) {
          // Cabe em uma página
          if (pageNumber > 1) {
            pdf.addPage();
          }
          
          addHeader(pageNumber);
          pdf.addImage(imgData, 'JPEG', margin, headerHeight, imgWidth, imgHeight);
          addFooter();
          pageNumber++;
        } else {
          // Divide em múltiplas páginas com quebra inteligente
          const pagesNeeded = Math.ceil(imgHeight / maxHeightPerPage);
          const overlap = 10; // mm de sobreposição para evitar cortes
          
          for (let page = 0; page < pagesNeeded; page++) {
            if (pageNumber > 1 || page > 0) {
              pdf.addPage();
            }
            
            addHeader(pageNumber);
            
            // Calcula posição Y com sobreposição
            const startY = page === 0 ? 0 : (page * maxHeightPerPage * (canvas.height / imgHeight)) - (overlap * canvas.height / imgHeight);
            const heightToCopy = Math.min(
              maxHeightPerPage * (canvas.height / imgHeight) + (page > 0 ? overlap * canvas.height / imgHeight : 0),
              canvas.height - startY
            );
            
            // Cria canvas temporário
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = heightToCopy;
            const tempCtx = tempCanvas.getContext('2d');
            
            if (tempCtx) {
              tempCtx.fillStyle = '#ffffff';
              tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
              
              tempCtx.drawImage(
                canvas,
                0, startY, canvas.width, heightToCopy,
                0, 0, canvas.width, heightToCopy
              );
              
              const tempImgData = tempCanvas.toDataURL('image/jpeg', 0.92);
              const tempImgHeight = imgWidth * (heightToCopy / canvas.width);
              
              pdf.addImage(
                tempImgData,
                'JPEG',
                margin,
                headerHeight,
                imgWidth,
                Math.min(tempImgHeight, maxHeightPerPage)
              );
            }
            
            addFooter();
            pageNumber++;
          }
        }
      }

      const nomeArquivo = `Analise_${cliente?.nome.replace(/\s+/g, '_')}_${contrato?.numero_contrato?.replace(/\//g, '-')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(nomeArquivo);
      
      toast.success("PDF profissional gerado com sucesso!", { id: loadingToast });
    } catch (error) {
      console.error("Erro detalhado ao gerar PDF:", error);
      toast.error(`Erro ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, { id: loadingToast });
    }
  };

  const handleShareWhatsApp = () => {
    if (!contrato) return;
    
    const valorDivida = contrato.saldo_contabil || contrato.valor_divida || 0;
    const valorProvisao = contrato.valor_provisao || 0;
    const percentualProvisao = valorDivida > 0 ? (valorProvisao / valorDivida) * 100 : 0;
    
    const estagioRisco = contrato.estagio_risco || (contrato.dias_atraso! <= 30 ? 1 : contrato.dias_atraso! <= 90 ? 2 : 3);
    
    const texto = `📊 *Análise de Contrato - ${cliente?.nome}*\n\n` +
      `📋 Contrato: ${contrato.numero_contrato || "Sem número"}\n` +
      `🏦 Banco: ${contrato.bancos?.nome || "Não informado"}\n` +
      `💰 Valor: ${valorDivida.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n` +
      `📊 Provisão: ${percentualProvisao.toFixed(1)}%\n` +
      `📂 Tipo: ${contrato.classificacao || "N/A"}\n` +
      `⏱️ Estágio: ${estagioRisco}\n\n` +
      `Análise completa gerada pelo IntelBank.\n` +
      `🔗 Acesse: ${window.location.origin}`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
    
    toast.success("Abrindo WhatsApp...");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Carregando análise do contrato...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!contrato) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contrato não encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">
              O contrato selecionado não foi encontrado no sistema.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dados do contrato individual - USAR DADOS REAIS DO BANCO
  const valorDivida = contrato.saldo_contabil || contrato.valor_divida || 0;
  const valorProvisao = contrato.valor_provisao || 0;
  const percentualProvisao = valorDivida > 0 ? (valorProvisao / valorDivida) * 100 : 0;
  const diasAtraso = contrato.dias_atraso || 0;
  const estagioRisco = contrato.estagio_risco || 1;

  return (
    <>
      <div 
        ref={containerRef}
        className={`${isFullscreen ? 'fixed inset-0 bg-white z-40 overflow-y-auto' : ''} space-y-6`}
      >
        {/* Header do Contrato */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Análise Individual: {contrato.numero_contrato || "Contrato sem número"}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">{cliente?.nome}</Badge>
              <Badge variant="outline">{contrato.bancos?.nome || "Banco não informado"}</Badge>
              <Badge variant="outline">Tipo: {contrato.classificacao || "N/A"}</Badge>
              <Badge variant="outline">Estágio {estagioRisco}</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* KPIs do Contrato Individual */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Valor da Dívida"
            value={`R$ ${(valorDivida / 1000).toFixed(0)}K`}
            description="Saldo atual"
            icon={DollarSign}
          />
          <StatsCard
            title="Provisão"
            value={`R$ ${(valorProvisao / 1000).toFixed(0)}K`}
            description="Valor provisionado"
            icon={Calculator}
          />
          <StatsCard
            title="% Provisão"
            value={`${percentualProvisao.toFixed(1)}%`}
            description="Oportunidade"
            icon={TrendingUp}
            className={
              percentualProvisao >= 70 
                ? "border-green-500/20 bg-green-500/5" 
                : percentualProvisao >= 40
                ? "border-blue-500/20 bg-blue-500/5"
                : "border-yellow-500/20 bg-yellow-500/5"
            }
          />
          <StatsCard
            title="Dias em Atraso"
            value={`${diasAtraso}`}
            description={`Estágio ${estagioRisco}`}
            icon={FileText}
          />
        </div>

        {/* Seção 0: Análise da Situação Presente */}
        <div ref={(el) => { if (el) sectionRefs.current[0] = el; }}>
          <AnalisePresente contrato={contrato} />
        </div>

        <Separator className="my-8" />

        {/* Seção 1: Projeção Futura */}
        <div ref={(el) => { if (el) sectionRefs.current[1] = el; }}>
          <ProjecaoFutura contrato={contrato} />
        </div>

        <Separator className="my-8" />

        {/* Seção 2: Estratégia Completa */}
        <div ref={(el) => { if (el) sectionRefs.current[2] = el; }}>
          <EstrategiaCompleta contrato={contrato} />
        </div>

        <Separator className="my-8" />
      
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