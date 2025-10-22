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
    classificacao?: string;
    tipoOperacao?: string;
    situacao?: string;
  };
  situacaoAtual: {
    diasAtraso: number;
    mesesAtraso: number;
    estagioRisco: number;
    valorProvisao: number;
    percentualProvisao: number;
    saldoContabil: number;
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
  projecoes: {
    valor30Dias: number;
    valor60Dias: number;
    valor90Dias: number;
    valor180Dias: number;
    valor360Dias: number;
    provisao30Dias: number;
    provisao60Dias: number;
    provisao90Dias: number;
    provisao180Dias: number;
    provisao360Dias: number;
  };
  estrategia: {
    momentoIdeal: string;
    descontoEsperado: number;
    valorAcordoEstimado: number;
    economiaEstimada: number;
    janelaNegociacao: string;
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
 * Adiciona seção de situação atual
 */
function addSituacaoAtual(doc: jsPDF, data: AnalysisReportData, yPos: number): number {
  if (yPos > 220) {
    doc.addPage();
    addHeader(doc, 'Análise Financeira de Contrato');
    yPos = 50;
  }
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Situação Atual do Contrato', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const situacao = [
    ['Dias em Atraso:', `${data.situacaoAtual.diasAtraso} dias`],
    ['Meses em Atraso:', `${data.situacaoAtual.mesesAtraso.toFixed(1)} meses`],
    ['Estágio de Risco (BCB):', `Estágio ${data.situacaoAtual.estagioRisco}`],
    ['Saldo Contábil:', formatCurrency(data.situacaoAtual.saldoContabil)],
    ['Valor Provisão:', formatCurrency(data.situacaoAtual.valorProvisao)],
    ['% Provisão:', formatPercent(data.situacaoAtual.percentualProvisao)],
  ];
  
  situacao.forEach(([label, value]) => {
    if (yPos > 270) {
      doc.addPage();
      addHeader(doc, 'Análise Financeira de Contrato');
      yPos = 50;
    }
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 90, yPos);
    yPos += 7;
  });
  
  // Interpretação do estágio
  yPos += 5;
  if (yPos > 250) {
    doc.addPage();
    addHeader(doc, 'Análise Financeira de Contrato');
    yPos = 50;
  }
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Interpretação:', 20, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'normal');
  let interpretacao = '';
  if (data.situacaoAtual.estagioRisco === 1) {
    interpretacao = 'Estágio 1: Atraso de até 30 dias. Provisão inicial conforme BCB 4.966/2021.';
  } else if (data.situacaoAtual.estagioRisco === 2) {
    interpretacao = 'Estágio 2: Atraso de 31-90 dias. Provisão aumentada - boa oportunidade para negociação.';
  } else {
    interpretacao = 'Estágio 3: Atraso acima de 90 dias. Alta provisão - excelente poder de negociação.';
  }
  
  const lines = doc.splitTextToSize(interpretacao, 170);
  doc.text(lines, 20, yPos);
  yPos += lines.length * 6 + 5;
  
  return yPos;
}

/**
 * Adiciona seção de métricas financeiras
 */
function addFinancialMetrics(doc: jsPDF, data: AnalysisReportData, yPos: number): number {
  if (yPos > 220) {
    doc.addPage();
    addHeader(doc, 'Análise Financeira de Contrato');
    yPos = 50;
  }
  
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
    if (yPos > 270) {
      doc.addPage();
      addHeader(doc, 'Análise Financeira de Contrato');
      yPos = 50;
    }
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 110, yPos);
    yPos += 7;
  });
  
  return yPos + 5;
}

/**
 * Adiciona seção de projeções futuras
 */
function addProjecoesFuturas(doc: jsPDF, data: AnalysisReportData, yPos: number): number {
  if (yPos > 200) {
    doc.addPage();
    addHeader(doc, 'Análise Financeira de Contrato');
    yPos = 50;
  }
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Projeções Futuras', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Evolução estimada do valor da dívida e provisão bancária', 20, yPos);
  
  yPos += 12;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  
  // Tabela de projeções
  const tableY = yPos;
  const col1 = 20;
  const col2 = 80;
  const col3 = 140;
  const rowHeight = 8;
  
  // Cabeçalho da tabela
  doc.setFillColor(37, 99, 235);
  doc.rect(col1, tableY, 170, rowHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('Período', col1 + 2, tableY + 6);
  doc.text('Valor Dívida', col2 + 2, tableY + 6);
  doc.text('Provisão (%)', col3 + 2, tableY + 6);
  
  yPos = tableY + rowHeight;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  const projecoes = [
    ['30 dias', formatCurrency(data.projecoes.valor30Dias), formatPercent(data.projecoes.provisao30Dias)],
    ['60 dias', formatCurrency(data.projecoes.valor60Dias), formatPercent(data.projecoes.provisao60Dias)],
    ['90 dias', formatCurrency(data.projecoes.valor90Dias), formatPercent(data.projecoes.provisao90Dias)],
    ['180 dias', formatCurrency(data.projecoes.valor180Dias), formatPercent(data.projecoes.provisao180Dias)],
    ['360 dias', formatCurrency(data.projecoes.valor360Dias), formatPercent(data.projecoes.provisao360Dias)],
  ];
  
  projecoes.forEach(([periodo, valor, provisao], index) => {
    // Linha zebrada
    if (index % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(col1, yPos, 170, rowHeight, 'F');
    }
    
    doc.text(periodo, col1 + 2, yPos + 6);
    doc.text(valor, col2 + 2, yPos + 6);
    doc.text(provisao, col3 + 2, yPos + 6);
    yPos += rowHeight;
  });
  
  yPos += 5;
  
  // Interpretação
  if (yPos > 240) {
    doc.addPage();
    addHeader(doc, 'Análise Financeira de Contrato');
    yPos = 50;
  }
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Interpretação da Projeção:', 20, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'normal');
  const interpretacao = 'Quanto mais tempo passar, maior será o valor da dívida devido a juros e encargos, ' +
    'e maior será a provisão bancária. Uma provisão elevada indica maior poder de negociação, ' +
    'pois o banco tem interesse em recuperar o crédito e liberar recursos provisionados.';
  
  const lines = doc.splitTextToSize(interpretacao, 170);
  doc.text(lines, 20, yPos);
  yPos += lines.length * 6 + 5;
  
  return yPos;
}

/**
 * Adiciona seção de estratégia de negociação
 */
function addEstrategiaNegociacao(doc: jsPDF, data: AnalysisReportData, yPos: number): number {
  if (yPos > 220) {
    doc.addPage();
    addHeader(doc, 'Análise Financeira de Contrato');
    yPos = 50;
  }
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Estratégia de Negociação', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const estrategia = [
    ['Momento Ideal para Negociar:', data.estrategia.momentoIdeal],
    ['Desconto Esperado:', formatPercent(data.estrategia.descontoEsperado)],
    ['Valor do Acordo Estimado:', formatCurrency(data.estrategia.valorAcordoEstimado)],
    ['Economia Estimada:', formatCurrency(data.estrategia.economiaEstimada)],
    ['Janela de Negociação:', data.estrategia.janelaNegociacao],
  ];
  
  estrategia.forEach(([label, value]) => {
    if (yPos > 270) {
      doc.addPage();
      addHeader(doc, 'Análise Financeira de Contrato');
      yPos = 50;
    }
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPos);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(value, 100);
    doc.text(lines, 90, yPos);
    yPos += Math.max(7, lines.length * 6);
  });
  
  yPos += 5;
  
  // Box de destaque
  if (yPos > 220) {
    doc.addPage();
    addHeader(doc, 'Análise Financeira de Contrato');
    yPos = 50;
  }
  
  doc.setFillColor(34, 197, 94);
  doc.setDrawColor(34, 197, 94);
  doc.roundedRect(20, yPos, 170, 40, 3, 3, 'FD');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DICA ESTRATÉGICA', 105, yPos + 10, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const dicaTexto = 'Negocie próximo ao fechamento de balanço do banco (fim de trimestre/ano). ' +
    'Bancos têm maior interesse em reduzir provisões nestes períodos, aumentando seu poder de barganha.';
  const dicaLines = doc.splitTextToSize(dicaTexto, 160);
  doc.text(dicaLines, 105, yPos + 20, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  yPos += 45;
  
  return yPos;
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
  let pageNumber = 1;
  
  // === PÁGINA 1: CAPA E INFORMAÇÕES DO CONTRATO ===
  addHeader(doc, 'Análise Financeira de Contrato');
  let yPos = 50;
  
  // Informações do contrato
  yPos = addContractInfo(doc, data, yPos);
  
  // Situação atual
  yPos = addSituacaoAtual(doc, data, yPos);
  
  addFooter(doc, pageNumber++);
  
  // === PÁGINA 2: MÉTRICAS FINANCEIRAS ===
  doc.addPage();
  addHeader(doc, 'Análise Financeira de Contrato');
  yPos = 50;
  
  yPos = addFinancialMetrics(doc, data, yPos);
  
  // Comparação com Bacen
  yPos = addBacenComparison(doc, data, yPos);
  
  addFooter(doc, pageNumber++);
  
  // === PÁGINA 3: PROJEÇÕES FUTURAS ===
  doc.addPage();
  addHeader(doc, 'Análise Financeira de Contrato');
  yPos = 50;
  
  yPos = addProjecoesFuturas(doc, data, yPos);
  
  addFooter(doc, pageNumber++);
  
  // === PÁGINA 4: ESTRATÉGIA DE NEGOCIAÇÃO ===
  doc.addPage();
  addHeader(doc, 'Análise Financeira de Contrato');
  yPos = 50;
  
  yPos = addEstrategiaNegociacao(doc, data, yPos);
  
  addFooter(doc, pageNumber++);
  
  // === PÁGINA 5: RECOMENDAÇÕES E CONCLUSÃO ===
  doc.addPage();
  addHeader(doc, 'Análise Financeira de Contrato');
  yPos = 50;
  
  yPos = addRecommendations(doc, data, yPos);
  
  // Conclusão
  if (yPos > 220) {
    doc.addPage();
    addHeader(doc, 'Análise Financeira de Contrato');
    yPos = 50;
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Conclusão', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const conclusao = 'Este relatório apresenta uma análise completa da situação do contrato, ' +
    'incluindo métricas financeiras, projeções futuras e estratégias de negociação baseadas nas ' +
    'normas do Banco Central do Brasil (Resoluções 4.966/2021 e 352/2023). As informações aqui ' +
    'contidas são fundamentais para uma negociação eficaz e consciente com a instituição financeira.';
  
  const conclusaoLines = doc.splitTextToSize(conclusao, 170);
  doc.text(conclusaoLines, 20, yPos);
  yPos += conclusaoLines.length * 6 + 10;
  
  doc.setFont('helvetica', 'italic');
  doc.text('Documento gerado automaticamente pelo IntelBank - Sistema de Análise Financeira', 105, yPos, { align: 'center' });
  
  addFooter(doc, pageNumber);
  
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