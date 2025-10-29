// src/lib/gerarRelatorioPDF.ts

import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

interface AnaliseParaPDF {
  numeroContrato?: string;
  contrato?: string;
  cliente: string;
  banco: string;
  modalidade?: string;
  carteira?: string;
  saldoDevedor: number;
  diasAtraso: number;
  provisaoPercentual: number;
  propostaValor: number;
  marco: string;
}

// Supondo que a análise completa seja passada para esta função
// Em um caso real, você pode querer buscar os dados aqui ou passá-los de forma mais estruturada
export function gerarRelatorioPDFPassivoBancario(analise: AnaliseParaPDF) {
  const doc = new jsPDF();

  // ==============================================================================
  // FUNÇÕES AUXILIARES DE DESIGN
  // ==============================================================================

  const addHeader = () => {
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.setFont("helvetica", "bold");
    doc.text("INTELLBANK SAAS", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Análise de Gestão de Passivo Bancário", 105, 28, { align: "center" });
  };

  const addFooter = () => {
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(10);
    doc.setTextColor(150);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Página ${i} de ${pageCount}`, 105, 287, { align: "center" });
      doc.text(`Relatório gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 20, 287);
    }
  };

  const addSectionTitle = (title: string, y: number) => {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 51, 102);
    doc.text(title, 20, y);
    doc.setDrawColor(0, 51, 102);
    doc.line(20, y + 2, 190, y + 2);
    return y + 15;
  };

  // ==============================================================================
  // CONSTRUÇÃO DO PDF PÁGINA POR PÁGINA
  // ==============================================================================

  const contratoNome = analise.numeroContrato || analise.contrato || 'N/A';

  // --- PÁGINA 1: CAPA E SUMÁRIO EXECUTIVO ---
  addHeader();
  
  let currentY = 50;
  currentY = addSectionTitle("Sumário Executivo", currentY);

  autoTable(doc, {
    startY: currentY,
    head: [['Item', 'Detalhe']],
    body: [
        ['Contrato', contratoNome],
        ['Cliente', analise.cliente],
        ['Banco', analise.banco],
        ['Saldo Devedor', analise.saldoDevedor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
        ['Provisão Atual', `${analise.provisaoPercentual}% (${(analise.saldoDevedor * analise.provisaoPercentual / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`],
        ['Proposta de Acordo', analise.propostaValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
        ['Marco Estratégico', analise.marco],
    ],
    theme: 'grid'
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.setFont("helvetica", "bold");
  doc.text("Recomendação Estratégica:", 20, currentY);
  doc.setFontSize(11);
  doc.setTextColor(80);
  doc.setFont("helvetica", "normal");
  doc.text("Baseado na análise, recomenda-se iniciar a negociação imediatamente para aproveitar o desconto oferecido, que tende a diminuir com o tempo.", 20, currentY + 7, { maxWidth: 170 });


  // --- PÁGINA 2: ANÁLISE TÉCNICA E FUNDAMENTAÇÃO ---
  doc.addPage();
  addHeader();
  currentY = 40;

  currentY = addSectionTitle("Análise Técnica da Provisão", currentY);
  doc.text(`A operação, com ${analise.diasAtraso} dias de atraso, enquadra-se na seguinte faixa de provisionamento conforme a Resolução BCB 352/2023:`, 20, currentY, { maxWidth: 170 });
  currentY += 20;

  // Tabela de Anexo I ou II
  autoTable(doc, {
      startY: currentY,
      head: [['Faixa de Atraso (dias)', 'Provisão Mínima (%)']],
      body: [
          // Lógica para mostrar a faixa correta
          analise.diasAtraso <= 90 ? ['61-90 dias', '3%'] : ['181-240 dias', '50%'] // Exemplo simplificado
      ],
      theme: 'striped'
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  currentY = addSectionTitle("Fundamentação Legal", currentY);
  doc.setFontSize(10);
  doc.text("A metodologia de cálculo segue estritamente o determinado pelas seguintes resoluções do Banco Central do Brasil:", 20, currentY, { maxWidth: 170 });
  currentY += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Resolução CMN Nº 4.966, de 25 de novembro de 2021:", 20, currentY);
  doc.setFont("helvetica", "normal");
  doc.text("- Define os critérios para classificação da carteira de crédito e a apuração da perda esperada (Expected Loss - EL).", 22, currentY + 5, { maxWidth: 168 });
  currentY += 15;
  doc.setFont("helvetica", "bold");
  doc.text("Resolução BCB Nº 352, de 23 de novembro de 2023:", 20, currentY);
  doc.setFont("helvetica", "normal");
  doc.text("- Dispõe sobre o cálculo da provisão para perdas incorridas (operações em atraso > 90 dias), detalhando as faixas nos Anexos I e II.", 22, currentY + 5, { maxWidth: 168 });
  
  // --- PÁGINA 3: PROPOSTA FORMAL ---
  doc.addPage();
  addHeader();
  currentY = 40;

  currentY = addSectionTitle("Proposta de Acordo para Quitação", currentY);
  doc.setFontSize(12);
  doc.text(`Prezado(a) ${analise.cliente},`, 20, currentY);
  currentY += 10;
  doc.text(`Com base na análise do contrato ${contratoNome}, apresentamos a seguinte proposta para quitação integral do saldo devedor:`, 20, currentY, { maxWidth: 170 });
  currentY += 20;
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Valor da Proposta:", 20, currentY);
  doc.setTextColor(0, 102, 0); // Verde
  doc.text(analise.propostaValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 70, currentY);
  currentY += 15;

  doc.setTextColor(40);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Esta proposta representa um desconto de ${((1 - (analise.propostaValor / analise.saldoDevedor)) * 100).toFixed(2)}% sobre o saldo devedor atual.`, 20, currentY, { maxWidth: 170 });
  currentY += 10;
  doc.text("Condições de pagamento: à vista.", 20, currentY);
  currentY += 5;
  doc.text(`Validade da proposta: 10 dias úteis a partir da data de emissão deste relatório.`, 20, currentY);

  // ==============================================================================
  // FINALIZAÇÃO E DOWNLOAD
  // ==============================================================================

  addFooter();
  doc.save(`Relatorio_${contratoNome.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}
