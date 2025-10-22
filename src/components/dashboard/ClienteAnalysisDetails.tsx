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
import { saveAnalysisReport } from "@/modules/FinancialAnalysis/lib/analysisReportGenerator";
import type { AnalysisReportData } from "@/modules/FinancialAnalysis/lib/analysisReportGenerator";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

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
    if (!contrato || !cliente) return;
    
    const loadingToast = toast.loading("Gerando relatório completo profissional...");
    
    try {
      // Calcular projeções
      const taxaJurosMensal = 0.02; // 2% ao mês (estimativa conservadora)
      const valor30Dias = valorDivida * (1 + taxaJurosMensal);
      const valor60Dias = valorDivida * Math.pow(1 + taxaJurosMensal, 2);
      const valor90Dias = valorDivida * Math.pow(1 + taxaJurosMensal, 3);
      const valor180Dias = valorDivida * Math.pow(1 + taxaJurosMensal, 6);
      const valor360Dias = valorDivida * Math.pow(1 + taxaJurosMensal, 12);
      
      // Calcular provisões projetadas (baseado nas regras BCB)
      const calcularProvisao = (dias: number, classificacao?: string) => {
        let base = 0;
        if (classificacao === 'C1') base = 0.5;
        else if (classificacao === 'C2') base = 1;
        else if (classificacao === 'C3') base = 3;
        else if (classificacao === 'C4') base = 10;
        else base = 30;
        
        if (dias <= 30) return base;
        if (dias <= 60) return base * 1.5;
        if (dias <= 90) return base * 2;
        if (dias <= 180) return base * 3;
        return Math.min(base * 5, 100);
      };
      
      const provisao30Dias = calcularProvisao(diasAtraso + 30, contrato.classificacao);
      const provisao60Dias = calcularProvisao(diasAtraso + 60, contrato.classificacao);
      const provisao90Dias = calcularProvisao(diasAtraso + 90, contrato.classificacao);
      const provisao180Dias = calcularProvisao(diasAtraso + 180, contrato.classificacao);
      const provisao360Dias = calcularProvisao(diasAtraso + 360, contrato.classificacao);
      
      // Calcular estratégia
      const descontoEsperado = percentualProvisao >= 70 ? 60 : percentualProvisao >= 40 ? 40 : 25;
      const valorAcordoEstimado = valorDivida * (1 - descontoEsperado / 100);
      const economiaEstimada = valorDivida - valorAcordoEstimado;
      
      let momentoIdeal = '';
      const hoje = new Date();
      const mesAtual = hoje.getMonth();
      if (mesAtual >= 8) {
        momentoIdeal = 'Final de trimestre (Setembro) ou fim de ano (Dezembro) - Momento ideal!';
      } else if (mesAtual >= 5) {
        momentoIdeal = 'Aguardar até Setembro (fim de trimestre) para maximizar desconto';
      } else if (mesAtual >= 2) {
        momentoIdeal = 'Aguardar até Junho (fim de semestre) ou Setembro (fim de trimestre)';
      } else {
        momentoIdeal = 'Próximo ao fim de trimestre (Março, Junho, Setembro ou Dezembro)';
      }
      
      const janelaNegociacao = diasAtraso >= 90 
        ? 'Janela aberta AGORA - Alta provisão favorece negociação imediata'
        : diasAtraso >= 60
        ? 'Aguardar mais 30 dias para aumentar poder de negociação'
        : 'Aguardar 60-90 dias para melhor posicionamento';
      
      // Preparar dados para o relatório
      const reportData: AnalysisReportData = {
        contrato: {
          numero: contrato.numero_contrato || "Sem número",
          cliente: cliente.nome || "Cliente não identificado",
          banco: contrato.bancos?.nome || "Banco não informado",
          valorDivida: valorDivida,
          dataContrato: contrato.data_entrada || new Date().toISOString(),
          classificacao: contrato.classificacao || "Não definida",
          tipoOperacao: contrato.tipo_operacao || "Não informado",
          situacao: contrato.situacao || "Em análise",
        },
        situacaoAtual: {
          diasAtraso: diasAtraso,
          mesesAtraso: contrato.meses_atraso || 0,
          estagioRisco: estagioRisco,
          valorProvisao: valorProvisao,
          percentualProvisao: percentualProvisao,
          saldoContabil: valorDivida,
        },
        metricas: {
          taxaEfetivaAnual: contrato.taxa_bacen || 0,
          taxaEfetivaMensal: contrato.taxa_bacen ? contrato.taxa_bacen / 12 : 0,
          custoEfetivoTotal: contrato.taxa_bacen || 0,
          valorPresenteLiquido: valorDivida - valorProvisao,
          taxaInternaRetorno: contrato.taxa_bacen || 0,
          indiceCoberturaDivida: valorProvisao > 0 ? valorDivida / valorProvisao : 0,
          relacaoGarantias: percentualProvisao,
        },
        projecoes: {
          valor30Dias,
          valor60Dias,
          valor90Dias,
          valor180Dias,
          valor360Dias,
          provisao30Dias,
          provisao60Dias,
          provisao90Dias,
          provisao180Dias,
          provisao360Dias,
        },
        estrategia: {
          momentoIdeal,
          descontoEsperado,
          valorAcordoEstimado,
          economiaEstimada,
          janelaNegociacao,
        },
        recomendacoes: [
          `O contrato está no Estágio ${estagioRisco} com ${diasAtraso} dias de atraso, classificação ${contrato.classificacao || 'não definida'}.`,
          `Provisão atual de ${percentualProvisao.toFixed(1)}% indica ${percentualProvisao >= 70 ? 'ALTA' : percentualProvisao >= 40 ? 'MÉDIA' : 'BAIXA'} oportunidade de negociação.`,
          `Valor atual da dívida: ${formatCurrency(valorDivida)}. Provisão bancária: ${formatCurrency(valorProvisao)}.`,
          percentualProvisao >= 70 
            ? "✓ RECOMENDAÇÃO: Negociar AGORA com desconto agressivo de 50-70%. Alta provisão dá forte poder de barganha."
            : percentualProvisao >= 40
            ? "✓ RECOMENDAÇÃO: Propor acordo com desconto moderado de 30-50%. Boa oportunidade de negociação."
            : "✓ RECOMENDAÇÃO: Foco em renegociação de prazo. Aguardar aumento da provisão para melhor desconto.",
          `Economia estimada com negociação: ${formatCurrency(economiaEstimada)} (desconto de ${descontoEsperado}%).`,
          `${momentoIdeal}`,
          `${janelaNegociacao}`,
          "IMPORTANTE: Prepare documentação completa antes de iniciar negociação (contrato, comprovantes, correspondências).",
          "DICA: Bancos são mais flexíveis no fim de trimestre/ano. Use isso a seu favor!",
        ],
      };

      saveAnalysisReport(reportData);
      
      toast.success("Relatório completo gerado com sucesso!", { id: loadingToast });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
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