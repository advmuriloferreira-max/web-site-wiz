/**
 * Gerador de relatórios PDF para análises de contratos
 * Bacen Loan Wizard - Módulo independente
 */

import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface AnalysisReportData {
  contrato: {
    numero: string;
    cliente: string;
    banco: string;
    valorDivida: number;
    dataContrato: string;
  };
  metricas: {
    taxaEfetivaAnual: number;
    taxaEfetivaMensal: number;
    custoEfetivoTotal: number;
    valorPresenteLiquido: number;
    taxaInternaRetorno: number;
    indiceCoberturaDivida: number;
    relacaoGarantias: number;
  };
  taxaBacen?: {
    taxa: number;
    referencia: string;
    dataConsulta: string;
  };
  comparacao?: {
    diferenca: number;
    percentualDiferenca: number;
    acimaMercado: boolean;
  };
  recomendacoes?: string[];
}

/**
 * Formata valor monetário
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata percentual
 */
function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Adiciona cabeçalho ao PDF
 */
function addHeader(doc: jsPDF, title: string): void {
  doc.setFillColor(37, 99, 235); // Primary color
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INTELLBANK', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 105, 30, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
}

/**
 * Adiciona rodapé ao PDF
 */
function addFooter(doc: jsPDF, pageNumber: number): void {
  const pageHeight = doc.internal.pageSize.height;
  
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Página ${pageNumber} - Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
    105,
    pageHeight - 10,
    { align: 'center' }
  );
}

/**
 * Adiciona seção de informações do contrato
 */
function addContractInfo(doc: jsPDF, data: AnalysisReportData, yPos: number): number {
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Informações do Contrato', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const info = [
    ['Número do Contrato:', data.contrato.numero],
    ['Cliente:', data.contrato.cliente],
    ['Banco:', data.contrato.banco],
    ['Valor da Dívida:', formatCurrency(data.contrato.valorDivida)],
    ['Data do Contrato:', format(new Date(data.contrato.dataContrato), 'dd/MM/yyyy', { locale: ptBR })],
  ];
  
  info.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, yPos);
    yPos += 7;
  });
  
  return yPos + 5;
}

/**
 * Adiciona seção de métricas financeiras
 */
function addFinancialMetrics(doc: jsPDF, data: AnalysisReportData, yPos: number): number {
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Métricas Financeiras', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const metrics = [
    ['Taxa Efetiva Mensal (TEM):', formatPercent(data.metricas.taxaEfetivaMensal)],
    ['Taxa Efetiva Anual (TEA):', formatPercent(data.metricas.taxaEfetivaAnual)],
    ['Custo Efetivo Total (CET):', formatPercent(data.metricas.custoEfetivoTotal)],
    ['Valor Presente Líquido (VPL):', formatCurrency(data.metricas.valorPresenteLiquido)],
    ['Taxa Interna de Retorno (TIR):', formatPercent(data.metricas.taxaInternaRetorno)],
    ['Índice de Cobertura da Dívida:', data.metricas.indiceCoberturaDivida.toFixed(2)],
    ['Relação Garantias/Dívida:', formatPercent(data.metricas.relacaoGarantias)],
  ];
  
  metrics.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 110, yPos);
    yPos += 7;
  });
  
  return yPos + 5;
}

/**
 * Adiciona seção de comparação com Bacen
 */
function addBacenComparison(doc: jsPDF, data: AnalysisReportData, yPos: number): number {
  if (!data.taxaBacen || !data.comparacao) return yPos;
  
  // Verificar se precisa de nova página
  if (yPos > 220) {
    doc.addPage();
    addHeader(doc, 'Análise Financeira de Contrato');
    yPos = 50;
  }
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Comparação com Taxa Bacen', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const comparison = [
    ['Taxa de Referência (Bacen):', formatPercent(data.taxaBacen.taxa)],
    ['Fonte:', data.taxaBacen.referencia],
    ['Data da Consulta:', format(new Date(data.taxaBacen.dataConsulta), 'dd/MM/yyyy HH:mm', { locale: ptBR })],
    ['Diferença:', formatPercent(data.comparacao.diferenca)],
    ['Diferença Percentual:', formatPercent(data.comparacao.percentualDiferenca)],
    ['Status:', data.comparacao.acimaMercado ? 'Acima do mercado' : 'Dentro do mercado'],
  ];
  
  comparison.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 90, yPos);
    yPos += 7;
  });
  
  return yPos + 5;
}

/**
 * Adiciona seção de recomendações
 */
function addRecommendations(doc: jsPDF, data: AnalysisReportData, yPos: number): number {
  if (!data.recomendacoes || data.recomendacoes.length === 0) return yPos;
  
  // Verificar se precisa de nova página
  if (yPos > 220) {
    doc.addPage();
    addHeader(doc, 'Análise Financeira de Contrato');
    yPos = 50;
  }
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Recomendações', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  data.recomendacoes.forEach((recomendacao, index) => {
    // Verificar se precisa de nova página
    if (yPos > 270) {
      doc.addPage();
      addHeader(doc, 'Análise Financeira de Contrato');
      yPos = 50;
    }
    
    const bullet = `${index + 1}.`;
    doc.setFont('helvetica', 'bold');
    doc.text(bullet, 20, yPos);
    doc.setFont('helvetica', 'normal');
    
    // Quebra de linha para textos longos
    const lines = doc.splitTextToSize(recomendacao, 160);
    doc.text(lines, 30, yPos);
    yPos += lines.length * 7;
  });
  
  return yPos + 5;
}

/**
 * Gera relatório PDF completo de análise
 */
export async function generateAnalysisReport(data: AnalysisReportData): Promise<Blob> {
  const doc = new jsPDF();
  
  // Cabeçalho
  addHeader(doc, 'Análise Financeira de Contrato');
  
  let yPos = 50;
  
  // Informações do contrato
  yPos = addContractInfo(doc, data, yPos);
  
  // Métricas financeiras
  yPos = addFinancialMetrics(doc, data, yPos);
  
  // Comparação com Bacen
  yPos = addBacenComparison(doc, data, yPos);
  
  // Recomendações
  yPos = addRecommendations(doc, data, yPos);
  
  // Rodapé
  addFooter(doc, 1);
  
  return doc.output('blob');
}

/**
 * Salva relatório PDF
 */
export function saveAnalysisReport(data: AnalysisReportData): void {
  generateAnalysisReport(data).then((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analise-contrato-${data.contrato.numero}-${format(new Date(), 'yyyyMMdd')}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  });
}