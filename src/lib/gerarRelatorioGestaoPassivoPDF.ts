import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';
import { determinarMarcoProvisionamento, determinarMomentoNegociacao } from './calculoGestaoPassivo';

interface AnaliseCompleta {
  id: string;
  numero_contrato: string;
  banco_nome: string;
  banco_codigo_compe: string | null;
  banco_segmento: string | null;
  tipo_operacao: string;
  carteira_bcb352: string;
  valor_original: number;
  saldo_devedor_atual: number;
  data_contratacao: string;
  data_vencimento_original: string | null;
  data_inadimplencia: string;
  dias_atraso: number;
  meses_atraso: number;
  em_default: boolean;
  motivo_default: string[] | null;
  foi_reestruturado: boolean;
  data_reestruturacao: string | null;
  possui_garantias: boolean;
  valor_garantias: number | null;
  tipo_garantias: string[] | null;
  percentual_provisao_bcb352: number;
  valor_provisao_bcb352: number;
  valor_proposta_acordo: number | null;
  percentual_proposta_acordo: number | null;
  estrategia_negociacao: string | null;
  fundamentacao_juridica: string | null;
  observacoes: string | null;
  created_at: string;
}

export async function gerarRelatorioGestaoPassivoPDF(analiseId: string) {
  try {
    // Buscar dados da análise
    const { data: analise, error } = await supabase
      .from('analises_gestao_passivo')
      .select('*')
      .eq('id', analiseId)
      .single();

    if (error || !analise) {
      throw new Error('Análise não encontrada');
    }

    const doc = new jsPDF();
    let currentPage = 1;
    const totalPages = 8;

    // Cores do tema
    const primaryColor = '#2563eb';
    const secondaryColor = '#1e40af';
    const accentColor = '#3b82f6';
    const textColor = '#1f2937';
    const lightGray = '#f3f4f6';

    // Função auxiliar para formatar moeda
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    // Função auxiliar para formatar data
    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('pt-BR');
    };

    // Função auxiliar para adicionar rodapé
    const addFooter = (page: number) => {
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${page} de ${totalPages}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      doc.text(
        `Gerado por INTELLIBANK - Gestão de Passivo Bancário em ${new Date().toLocaleString('pt-BR')}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 5,
        { align: 'center' }
      );
    };

    // PÁGINA 1 - CAPA
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, doc.internal.pageSize.width, 60, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('INTELLIBANK', doc.internal.pageSize.width / 2, 30, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Gestão Inteligente de Passivo Bancário', doc.internal.pageSize.width / 2, 45, { align: 'center' });

    doc.setTextColor(textColor);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(
      'RELATÓRIO TÉCNICO DE',
      doc.internal.pageSize.width / 2,
      90,
      { align: 'center' }
    );
    doc.text(
      'ANÁLISE DE PASSIVO BANCÁRIO',
      doc.internal.pageSize.width / 2,
      105,
      { align: 'center' }
    );

    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100);
    doc.text(
      'Conforme Resoluções CMN 4.966/2021 e BCB 352/2023',
      doc.internal.pageSize.width / 2,
      120,
      { align: 'center' }
    );

    // Box com número do contrato
    doc.setFillColor(lightGray);
    doc.roundedRect(40, 140, doc.internal.pageSize.width - 80, 30, 3, 3, 'F');
    doc.setTextColor(textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Contrato:', 50, 150);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(analise.numero_contrato, 50, 162);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Banco:', 50, 190);
    doc.setFont('helvetica', 'bold');
    doc.text(analise.banco_nome, 50, 200);

    doc.setFont('helvetica', 'normal');
    doc.text('Data de Emissão:', 50, 220);
    doc.setFont('helvetica', 'bold');
    doc.text(new Date().toLocaleDateString('pt-BR'), 50, 230);

    addFooter(currentPage++);

    // PÁGINA 2 - IDENTIFICAÇÃO
    doc.addPage();
    
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, doc.internal.pageSize.width, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('1. IDENTIFICAÇÃO DO CONTRATO', 20, 13);

    let yPos = 35;

    // Seção 1.1 - Dados do Contrato
    doc.setTextColor(textColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('1.1 Dados do Contrato', 20, yPos);
    yPos += 10;

    const dadosContrato = [
      ['Número do Contrato', analise.numero_contrato],
      ['Banco', `${analise.banco_nome}${analise.banco_codigo_compe ? ` (${analise.banco_codigo_compe})` : ''}`],
      ['Segmento Bancário', analise.banco_segmento || 'N/A'],
      ['Tipo de Operação', analise.tipo_operacao],
      ['Carteira BCB 352', analise.carteira_bcb352],
      ['Data de Contratação', formatDate(analise.data_contratacao)],
      ['Data de Vencimento Original', analise.data_vencimento_original ? formatDate(analise.data_vencimento_original) : 'N/A']
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: dadosContrato,
      theme: 'grid',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: lightGray, cellWidth: 60 },
        1: { cellWidth: 110 }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Seção 1.2 - Dados Financeiros
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('1.2 Dados Financeiros', 20, yPos);
    yPos += 10;

    const dadosFinanceiros = [
      ['Valor Original', formatCurrency(Number(analise.valor_original))],
      ['Saldo Devedor Atual', formatCurrency(Number(analise.saldo_devedor_atual))],
      ['Data de Inadimplência', formatDate(analise.data_inadimplencia)],
      ['Dias de Atraso', `${analise.dias_atraso} dias`],
      ['Meses de Atraso', `${analise.meses_atraso} meses`]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: dadosFinanceiros,
      theme: 'grid',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: lightGray, cellWidth: 60 },
        1: { cellWidth: 110 }
      }
    });

    addFooter(currentPage++);

    // PÁGINA 3 - ANÁLISE DE INADIMPLÊNCIA
    doc.addPage();
    
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, doc.internal.pageSize.width, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('2. ANÁLISE DE INADIMPLÊNCIA', 20, 13);

    yPos = 35;

    // Seção 2.1 - Status de Default
    doc.setTextColor(textColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('2.1 Status de Default', 20, yPos);
    yPos += 10;

    // Box de status
    const statusColor = analise.em_default ? '#ef4444' : '#22c55e';
    doc.setFillColor(statusColor);
    doc.roundedRect(20, yPos, 170, 15, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Em Default: ${analise.em_default ? 'SIM' : 'NÃO'}`,
      30,
      yPos + 10
    );

    yPos += 25;

    if (analise.em_default && analise.motivo_default && analise.motivo_default.length > 0) {
      doc.setTextColor(textColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Motivos do Default:', 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      analise.motivo_default.forEach((motivo: string) => {
        doc.text(`• ${motivo}`, 25, yPos);
        yPos += 6;
      });
      yPos += 5;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Fundamentação Legal:', 20, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const fundamentacaoText = 'Art. 3º da Resolução CMN 4.966/2021: Define critérios para caracterização de operações em situação de default, incluindo atrasos superiores a 90 dias e outras situações específicas.';
    const splitText = doc.splitTextToSize(fundamentacaoText, 170);
    doc.text(splitText, 20, yPos);
    yPos += splitText.length * 5 + 10;

    // Seção 2.2 - Histórico
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('2.2 Histórico da Operação', 20, yPos);
    yPos += 10;

    const historico = [
      ['Foi Reestruturado?', analise.foi_reestruturado ? 'Sim' : 'Não'],
      ['Data da Reestruturação', analise.data_reestruturacao ? formatDate(analise.data_reestruturacao) : 'N/A'],
      ['Possui Garantias?', analise.possui_garantias ? 'Sim' : 'Não'],
      ['Valor das Garantias', analise.valor_garantias ? formatCurrency(Number(analise.valor_garantias)) : 'N/A'],
      ['Tipos de Garantias', analise.tipo_garantias ? analise.tipo_garantias.join(', ') : 'N/A']
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: historico,
      theme: 'grid',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: lightGray, cellWidth: 60 },
        1: { cellWidth: 110 }
      }
    });

    addFooter(currentPage++);

    // PÁGINA 4 - CÁLCULO DE PROVISÃO
    doc.addPage();
    
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, doc.internal.pageSize.width, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('3. CÁLCULO DE PROVISÃO BCB 352/2023', 20, 13);

    yPos = 35;

    // Seção 3.1 - Provisão para Perdas Incorridas
    doc.setTextColor(textColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('3.1 Provisão para Perdas Incorridas (BCB 352)', 20, yPos);
    yPos += 10;

    const calculoProvisao = [
      ['Saldo Devedor', formatCurrency(Number(analise.saldo_devedor_atual))],
      ['Carteira BCB 352', analise.carteira_bcb352],
      ['Meses de Atraso', `${analise.meses_atraso} meses`],
      ['Percentual de Provisão (Anexo I)', `${analise.percentual_provisao_bcb352.toFixed(2)}%`],
      ['VALOR DA PROVISÃO', formatCurrency(Number(analise.valor_provisao_bcb352))]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: calculoProvisao,
      theme: 'striped',
      styles: { fontSize: 11, cellPadding: 5 },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: lightGray, cellWidth: 80 },
        1: { cellWidth: 90 }
      },
      didParseCell: (data) => {
        if (data.row.index === 4) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = 12;
          data.cell.styles.fillColor = accentColor;
          data.cell.styles.textColor = [255, 255, 255];
        }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Seção 3.2 - Fundamentação Legal
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('3.2 Fundamentação Legal', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Resolução BCB 352/2023 - Art. 76:', 20, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    const art76Text = '"As instituições financeiras devem constituir provisão para fazer face às perdas esperadas, associadas ao risco de crédito de suas operações, conforme os percentuais mínimos estabelecidos no Anexo I desta Resolução."';
    const art76Split = doc.splitTextToSize(art76Text, 170);
    doc.text(art76Split, 20, yPos);
    yPos += art76Split.length * 5 + 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Anexo I - Percentuais Mínimos de Provisão:', 20, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    const anexoText = `Para a Carteira ${analise.carteira_bcb352} com ${analise.meses_atraso} meses de atraso, aplica-se o percentual de ${analise.percentual_provisao_bcb352.toFixed(2)}% conforme tabela de referência da BCB 352/2023.`;
    const anexoSplit = doc.splitTextToSize(anexoText, 170);
    doc.text(anexoSplit, 20, yPos);

    addFooter(currentPage++);

    // PÁGINA 5 - PROJEÇÃO DE PROVISÃO
    doc.addPage();
    
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, doc.internal.pageSize.width, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('4. PROJEÇÃO DE PROVISÃO', 20, 13);

    yPos = 35;

    doc.setTextColor(textColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const projecaoText = 'A tabela abaixo projeta a evolução da provisão bancária nos próximos meses, demonstrando os momentos mais oportunos para negociação:';
    const projecaoSplit = doc.splitTextToSize(projecaoText, 170);
    doc.text(projecaoSplit, 20, yPos);
    yPos += projecaoSplit.length * 5 + 10;

    // Criar projeção mensal
    const projecaoData = [];
    const mesesParaProjetar = Math.min(12, Math.ceil((24 - analise.meses_atraso) / 3));
    
    for (let i = 0; i <= mesesParaProjetar; i++) {
      const mesesFuturos = analise.meses_atraso + (i * 3);
      let percentualProvisao = analise.percentual_provisao_bcb352;
      
      // Simular crescimento de provisão (isso deveria vir de uma tabela real)
      if (mesesFuturos >= 24) percentualProvisao = 100;
      else if (mesesFuturos >= 18) percentualProvisao = Math.max(percentualProvisao, 90);
      else if (mesesFuturos >= 12) percentualProvisao = Math.max(percentualProvisao, 70);
      else if (mesesFuturos >= 6) percentualProvisao = Math.max(percentualProvisao, 50);

      const valorProvisao = Number(analise.saldo_devedor_atual) * (percentualProvisao / 100);
      const valorProposta = percentualProvisao >= 90 
        ? Number(analise.saldo_devedor_atual) * 0.10
        : Number(analise.saldo_devedor_atual) - valorProvisao;

      projecaoData.push([
        i === 0 ? 'Atual' : `+${i * 3} meses`,
        `${mesesFuturos} meses`,
        `${percentualProvisao.toFixed(0)}%`,
        formatCurrency(valorProvisao),
        formatCurrency(valorProposta)
      ]);

      if (percentualProvisao >= 100) break;
    }

    autoTable(doc, {
      startY: yPos,
      head: [['Momento', 'Atraso', 'Provisão', 'Valor Provisão', 'Valor Proposta']],
      body: projecaoData,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: secondaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 40 },
        4: { cellWidth: 40 }
      },
      didParseCell: (data) => {
        if (data.row.index === 0 && data.section === 'body') {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [254, 243, 199];
        }
      }
    });

    addFooter(currentPage++);

    // PÁGINA 6 - PROPOSTA DE ACORDO
    doc.addPage();
    
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, doc.internal.pageSize.width, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('5. PROPOSTA DE ACORDO', 20, 13);

    yPos = 35;

    // Seção 5.1 - Cálculo da Proposta
    doc.setTextColor(textColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('5.1 Cálculo da Proposta', 20, yPos);
    yPos += 10;

    const marco = determinarMarcoProvisionamento(analise.percentual_provisao_bcb352);
    const momento = determinarMomentoNegociacao(analise.percentual_provisao_bcb352);

    // Box destacado
    const marcoColor = marco === '90%' || marco === '100%' ? '#8b5cf6' : marco === '80%' ? '#22c55e' : '#f59e0b';
    doc.setFillColor(marcoColor);
    doc.roundedRect(20, yPos, 170, 40, 3, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Marco de Provisionamento: ${marco}%`, 30, yPos + 10);
    doc.text(`Momento: ${momento.toUpperCase().replace('_', ' ')}`, 30, yPos + 18);
    
    doc.setFontSize(14);
    const valorProposta = analise.valor_proposta_acordo || 0;
    const percentualProposta = analise.percentual_proposta_acordo || 0;
    doc.text(
      `Proposta: ${formatCurrency(Number(valorProposta))}`,
      30,
      yPos + 28
    );
    doc.setFontSize(10);
    doc.text(`(${percentualProposta.toFixed(2)}% do saldo devedor)`, 30, yPos + 36);

    yPos += 50;

    doc.setTextColor(textColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Lógica de Cálculo:', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const logicaTexto = analise.percentual_provisao_bcb352 >= 90
      ? '• Provisão >= 90%: Proposta fixa de 10% do saldo devedor\n• Banco já provisionou 90%+, aceita recuperar apenas 10% para limpar balanço'
      : '• Provisão < 90%: Saldo Devedor - Valor Provisionado\n• Banco busca recuperar o que não foi provisionado';
    const logicaSplit = doc.splitTextToSize(logicaTexto, 170);
    doc.text(logicaSplit, 20, yPos);
    yPos += logicaSplit.length * 5 + 15;

    // Seção 5.2 - Recomendação Estratégica
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('5.2 Recomendação Estratégica', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const recomendacao = analise.estrategia_negociacao || 'Recomendação estratégica não disponível.';
    const recomendacaoSplit = doc.splitTextToSize(recomendacao, 170);
    doc.text(recomendacaoSplit, 20, yPos);

    addFooter(currentPage++);

    // PÁGINA 7 - FUNDAMENTAÇÃO JURÍDICA
    doc.addPage();
    
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, doc.internal.pageSize.width, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('6. FUNDAMENTAÇÃO JURÍDICA', 20, 13);

    yPos = 35;

    // Seção 6.1 - Base Legal
    doc.setTextColor(textColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('6.1 Base Legal', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Resolução CMN 4.966/2021:', 20, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    const cmn4966 = 'Estabelece os critérios para classificação das operações de crédito e regras para constituição de provisão para perdas esperadas associadas ao risco de crédito.';
    const cmn4966Split = doc.splitTextToSize(cmn4966, 170);
    doc.text(cmn4966Split, 20, yPos);
    yPos += cmn4966Split.length * 5 + 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Resolução BCB 352/2023:', 20, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    const bcb352 = 'Disciplina a constituição e a manutenção de provisão para perdas esperadas associadas ao risco de crédito da carteira de créditos das instituições financeiras.';
    const bcb352Split = doc.splitTextToSize(bcb352, 170);
    doc.text(bcb352Split, 20, yPos);
    yPos += bcb352Split.length * 5 + 8;

    // Seção 6.2 - Argumentação
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('6.2 Argumentação Técnico-Jurídica', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const fundamentacao = analise.fundamentacao_juridica || 'A presente proposta baseia-se nos percentuais de provisão estabelecidos pela Resolução BCB 352/2023, demonstrando que o banco já reconheceu contabilmente a perda parcial desta operação. A negociação proposta permite ao banco recuperar parte do crédito e regularizar sua situação contábil, evitando custos adicionais com cobrança judicial e preservando seu relacionamento institucional.';
    const fundamentacaoSplit = doc.splitTextToSize(fundamentacao, 170);
    doc.text(fundamentacaoSplit, 20, yPos);
    yPos += fundamentacaoSplit.length * 5 + 10;

    if (analise.observacoes) {
      doc.setFont('helvetica', 'bold');
      doc.text('Observações Adicionais:', 20, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      const obsSplit = doc.splitTextToSize(analise.observacoes, 170);
      doc.text(obsSplit, 20, yPos);
    }

    addFooter(currentPage++);

    // PÁGINA 8 - CONCLUSÃO
    doc.addPage();
    
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, doc.internal.pageSize.width, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('7. CONCLUSÃO', 20, 13);

    yPos = 35;

    doc.setTextColor(textColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const conclusaoIntro = 'Com base na análise técnica apresentada e fundamentada nas Resoluções CMN 4.966/2021 e BCB 352/2023, apresentamos os seguintes dados conclusivos:';
    const conclusaoIntroSplit = doc.splitTextToSize(conclusaoIntro, 170);
    doc.text(conclusaoIntroSplit, 20, yPos);
    yPos += conclusaoIntroSplit.length * 5 + 10;

    // Quadro resumo
    const resumoConclusao = [
      ['Saldo Devedor', formatCurrency(Number(analise.saldo_devedor_atual))],
      ['Provisão Bancária (BCB 352)', `${analise.percentual_provisao_bcb352.toFixed(2)}% - ${formatCurrency(Number(analise.valor_provisao_bcb352))}`],
      ['Marco de Provisionamento', `${marco}%`],
      ['Proposta Recomendada', formatCurrency(Number(valorProposta))],
      ['Desconto Oferecido', `${(100 - percentualProposta).toFixed(2)}%`]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: resumoConclusao,
      theme: 'grid',
      styles: { fontSize: 11, cellPadding: 5 },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: lightGray, cellWidth: 70 },
        1: { cellWidth: 100 }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Condições de Pagamento Sugeridas:', 20, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const condicoes = [
      '• Pagamento à vista com desconto máximo, OU',
      '• Parcelamento em até 3x sem juros, OU',
      '• Entrada de 30% + saldo em até 6x'
    ];
    condicoes.forEach(condicao => {
      doc.text(condicao, 20, yPos);
      yPos += 6;
    });

    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Prazo para Resposta:', 20, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text('30 (trinta) dias corridos a contar da data de recebimento desta proposta.', 20, yPos);

    yPos += 20;
    
    // Assinatura
    doc.setDrawColor(0);
    doc.line(20, yPos, 90, yPos);
    yPos += 5;
    doc.setFontSize(9);
    doc.text('Responsável Técnico', 55, yPos, { align: 'center' });
    yPos += 4;
    doc.text('OAB/UF XXXXX', 55, yPos, { align: 'center' });

    addFooter(currentPage);

    // Salvar PDF
    doc.save(`Relatorio_Passivo_${analise.numero_contrato}_${new Date().toISOString().split('T')[0]}.pdf`);

    return true;
  } catch (error) {
    console.error('Erro ao gerar relatório PDF:', error);
    throw error;
  }
}
