import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AnaliseGestaoPassivo } from '@/types/gestaoPassivo';

// Configurações globais
const COLORS = {
  primary: '#1e40af', // Azul
  black: '#000000',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
};

const MARGINS = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};

// Formatadores
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(2)}%`;
};

// Função auxiliar para adicionar cabeçalho
const addHeader = (doc: jsPDF, pageNumber: number) => {
  if (pageNumber === 1) return; // Não adiciona header na capa

  doc.setFontSize(10);
  doc.setTextColor(COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('INTELLIBANK', MARGINS.left, 15);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.gray);
  doc.text('Gestão de Passivo Bancário', MARGINS.left + 30, 15);
  
  // Linha separadora
  doc.setDrawColor(COLORS.lightGray);
  doc.line(MARGINS.left, 18, 210 - MARGINS.right, 18);
};

// Função auxiliar para adicionar rodapé
const addFooter = (doc: jsPDF, pageNumber: number, totalPages: number) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Linha separadora
  doc.setDrawColor(COLORS.lightGray);
  doc.line(MARGINS.left, pageHeight - 15, 210 - MARGINS.right, pageHeight - 15);
  
  doc.setFontSize(8);
  doc.setTextColor(COLORS.gray);
  doc.setFont('helvetica', 'italic');
  doc.text('Documento confidencial - Uso exclusivo para fins jurídicos', MARGINS.left, pageHeight - 10);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Página ${pageNumber} de ${totalPages}`, 210 - MARGINS.right - 20, pageHeight - 10);
};

// Adicionar nova página com header e footer
const addNewPage = (doc: jsPDF, pageNumber: number, totalPages: number) => {
  doc.addPage();
  addHeader(doc, pageNumber);
  return MARGINS.top + 5;
};

// FUNÇÃO PRINCIPAL DE EXPORT
export const gerarRelatorioGestaoPassivoBancarioPDF = (analise: AnaliseGestaoPassivo) => {
  const doc = new jsPDF();
  
  // PÁGINA 1: CAPA
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;
  
  // Logo INTELLIBANK (simulado com texto estilizado)
  doc.setFontSize(32);
  doc.setTextColor(COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('INTELLIBANK', centerX, 60, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(COLORS.gray);
  doc.setFont('helvetica', 'normal');
  doc.text('Gestão Estratégica de Passivo Bancário', centerX, 70, { align: 'center' });
  
  // Título
  doc.setFontSize(18);
  doc.setTextColor(COLORS.black);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO TÉCNICO DE', centerX, 100, { align: 'center' });
  doc.text('GESTÃO DE PASSIVO BANCÁRIO', centerX, 110, { align: 'center' });
  
  // Subtítulo
  doc.setFontSize(12);
  doc.setTextColor(COLORS.gray);
  doc.setFont('helvetica', 'normal');
  doc.text('Análise Fundamentada nas Resoluções', centerX, 125, { align: 'center' });
  doc.text('BCB 352/2023 e CMN 4.966/2021', centerX, 133, { align: 'center' });
  
  // Box com informações do contrato
  doc.setDrawColor(COLORS.primary);
  doc.setLineWidth(0.5);
  doc.rect(40, 150, 130, 50);
  
  doc.setFontSize(10);
  doc.setTextColor(COLORS.black);
  doc.setFont('helvetica', 'bold');
  doc.text('Número do Contrato:', 45, 160);
  doc.setFont('helvetica', 'normal');
  doc.text(analise.numero_contrato, 45, 168);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Banco:', 45, 178);
  doc.setFont('helvetica', 'normal');
  doc.text(analise.banco_nome, 45, 186);
  
  // Data de emissão
  doc.setFontSize(10);
  doc.setTextColor(COLORS.gray);
  doc.setFont('helvetica', 'normal');
  const dataEmissao = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  doc.text(`Data de Emissão: ${dataEmissao}`, centerX, 230, { align: 'center' });
  
  // Rodapé página 1
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(COLORS.gray);
  doc.text('Documento confidencial - Uso exclusivo para fins jurídicos', centerX, pageHeight - 20, { align: 'center' });

  // PÁGINA 2: IDENTIFICAÇÃO
  let y = addNewPage(doc, 2, 8);
  
  doc.setFontSize(14);
  doc.setTextColor(COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('1. IDENTIFICAÇÃO DO CONTRATO', MARGINS.left, y);
  y += 10;
  
  autoTable(doc, {
    startY: y,
    head: [['Campo', 'Informação']],
    body: [
      ['Número do Contrato', analise.numero_contrato],
      ['Banco', analise.banco_nome],
      ['Tipo de Operação', analise.tipo_operacao],
      ['Tipo de Pessoa', analise.tipo_pessoa || 'N/A'],
      ['Saldo Devedor', formatCurrency(analise.saldo_devedor_atual)],
      ['Dias de Atraso', `${analise.dias_atraso} dias`],
      ['Meses de Atraso', `${analise.meses_atraso} meses`],
      ['Em Default', analise.em_default ? 'Sim (>90 dias)' : 'Não'],
    ],
    theme: 'striped',
    headStyles: { fillColor: COLORS.primary, fontSize: 10 },
    styles: { fontSize: 9 },
    margin: { left: MARGINS.left, right: MARGINS.right },
  });
  
  addFooter(doc, 2, 8);

  // PÁGINA 3: CLASSIFICAÇÃO
  y = addNewPage(doc, 3, 8);
  
  doc.setFontSize(14);
  doc.setTextColor(COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('2. CLASSIFICAÇÃO REGULATÓRIA', MARGINS.left, y);
  y += 10;
  
  const percentualProvisao = analise.percentual_provisao_bcb352 * 100;
  
  autoTable(doc, {
    startY: y,
    head: [['Item', 'Valor']],
    body: [
      ['Carteira BCB 352', analise.carteira_bcb352],
      ['Estágio CMN 4.966', analise.estagio_cmn4966 ? `Estágio ${analise.estagio_cmn4966}` : 'N/A'],
      ['Percentual de Provisão', formatPercentage(percentualProvisao)],
      ['Valor da Provisão', formatCurrency(analise.valor_provisao_bcb352)],
      ['Possui Garantias', analise.possui_garantias ? 'Sim' : 'Não'],
    ],
    theme: 'striped',
    headStyles: { fillColor: COLORS.primary, fontSize: 10 },
    styles: { fontSize: 9 },
    margin: { left: MARGINS.left, right: MARGINS.right },
  });
  
  addFooter(doc, 3, 8);

  // PÁGINA 4: PROPOSTA DE ACORDO
  y = addNewPage(doc, 4, 8);
  
  doc.setFontSize(14);
  doc.setTextColor(COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('3. PROPOSTA DE ACORDO', MARGINS.left, y);
  y += 10;
  
  const economia = analise.saldo_devedor_atual - (analise.valor_proposta_acordo || 0);
  
  autoTable(doc, {
    startY: y,
    head: [['Item', 'Valor']],
    body: [
      ['Saldo Devedor Original', formatCurrency(analise.saldo_devedor_atual)],
      ['Valor Provisionado', formatCurrency(analise.valor_provisao_bcb352)],
      ['━━━━━━━━━━━━━━', '━━━━━━━━━━━━━━'],
      ['VALOR DA PROPOSTA', formatCurrency(analise.valor_proposta_acordo || 0)],
      ['Desconto', formatPercentage(analise.percentual_proposta_acordo || 0)],
      ['Economia', formatCurrency(economia)],
    ],
    theme: 'striped',
    headStyles: { fillColor: COLORS.primary, fontSize: 10 },
    styles: { fontSize: 9 },
    margin: { left: MARGINS.left, right: MARGINS.right },
  });
  
  addFooter(doc, 4, 8);

  // Salvar PDF
  const nomeArquivo = `Relatorio_Passivo_${analise.numero_contrato.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(nomeArquivo);
  
  return nomeArquivo;
};
