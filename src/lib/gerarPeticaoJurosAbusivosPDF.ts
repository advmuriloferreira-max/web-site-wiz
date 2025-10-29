import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DadosPeticao {
  // Dados do Cliente
  cliente: {
    nome: string;
    cpf: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
  };
  
  // Dados do Banco
  banco: {
    nome: string;
    cnpj?: string;
  };
  
  // Dados do Contrato
  contrato: {
    numero?: string;
    dataAssinatura?: string;
    modalidade: string;
    valorFinanciado: number;
    numeroParcelas: number;
    valorParcela: number;
    parcelasJaPagas: number;
    saldoDevedor: number;
  };
  
  // Análise Técnica
  analise: {
    taxaMensalContrato: number;
    taxaAnualContrato: number;
    taxaMensalBacen: number;
    taxaAnualBacen: number;
    diferencaTaxa: number;
    percentualAbusividade: number;
    grauAbusividade: string;
    temDiscrepancia?: boolean;
  };
  
  // Cálculo de Prejuízo
  prejuizo: {
    valorPagoIndevido: number;
    parcelaCorreta: number;
    economiaFutura: number;
    devolucaoDobro: number;
    totalPrejuizo: number;
  };
  
  // Tabelas Price
  tabelaAbusiva: any[];
  tabelaCorreta: any[];
  
  // Dados do Advogado
  advogado?: {
    nome: string;
    oab: string;
    estadoOab: string;
  };
  
  // Dados do Escritório
  escritorio?: {
    nome: string;
    endereco: string;
    cidade: string;
    estado: string;
  };
}

export async function gerarPeticaoJurosAbusivosPDF(dados: DadosPeticao): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Configurações globais
  const primaryColor: [number, number, number] = [79, 70, 229]; // Indigo
  const textColor: [number, number, number] = [30, 30, 30];

  // Função para adicionar cabeçalho
  const addHeader = (pageNum: number) => {
    if (pageNum > 1) {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Ação Revisional - ${dados.cliente.nome} vs ${dados.banco.nome}`, margin, 15);
      doc.line(margin, 18, pageWidth - margin, 18);
    }
  };

  // Função para adicionar rodapé
  const addFooter = (pageNum: number) => {
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    doc.text(`Página ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  };

  // Função para verificar quebra de página
  const checkPageBreak = (requiredSpace: number): number => {
    if (yPosition + requiredSpace > pageHeight - 25) {
      addFooter(doc.getCurrentPageInfo().pageNumber);
      doc.addPage();
      addHeader(doc.getCurrentPageInfo().pageNumber);
      return 25;
    }
    return yPosition;
  };

  // ============================================
  // PÁGINA 1: CAPA
  // ============================================
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  
  yPosition = 80;
  doc.text('AÇÃO REVISIONAL DE CONTRATO BANCÁRIO', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  doc.setFontSize(16);
  doc.text('C/ PEDIDO DE TUTELA DE URGÊNCIA', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 40;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  
  doc.text('AUTOR:', margin, yPosition);
  yPosition += 10;
  doc.setFont('helvetica', 'bold');
  doc.text(dados.cliente.nome.toUpperCase(), margin + 10, yPosition);
  doc.setFont('helvetica', 'normal');
  yPosition += 8;
  doc.text(`CPF: ${dados.cliente.cpf}`, margin + 10, yPosition);
  
  yPosition += 20;
  doc.text('RÉU:', margin, yPosition);
  yPosition += 10;
  doc.setFont('helvetica', 'bold');
  doc.text(dados.banco.nome.toUpperCase(), margin + 10, yPosition);
  doc.setFont('helvetica', 'normal');
  if (dados.banco.cnpj) {
    yPosition += 8;
    doc.text(`CNPJ: ${dados.banco.cnpj}`, margin + 10, yPosition);
  }
  
  yPosition = pageHeight - 60;
  doc.setFontSize(12);
  doc.text(dados.escritorio?.cidade || 'São Paulo', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;
  doc.text(format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }), pageWidth / 2, yPosition, { align: 'center' });

  // ============================================
  // PÁGINA 2: SUMÁRIO EXECUTIVO
  // ============================================
  doc.addPage();
  addHeader(2);
  yPosition = 25;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('SUMÁRIO EXECUTIVO', margin, yPosition);
  
  yPosition += 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  
  const sumario = [
    `O presente autor firmou contrato de ${dados.contrato.modalidade} com o banco réu no valor de ${formatCurrency(dados.contrato.valorFinanciado)}, para pagamento em ${dados.contrato.numeroParcelas} parcelas de ${formatCurrency(dados.contrato.valorParcela)}.`,
    '',
    `Após análise técnica detalhada, constatou-se que a taxa de juros contratual (${dados.analise.taxaMensalContrato.toFixed(4)}% a.m. / ${dados.analise.taxaAnualContrato.toFixed(2)}% a.a.) está ${dados.analise.percentualAbusividade.toFixed(2)}% acima da taxa média de mercado divulgada pelo Banco Central (${dados.analise.taxaMensalBacen.toFixed(4)}% a.m. / ${dados.analise.taxaAnualBacen.toFixed(2)}% a.a.), caracterizando abusividade de grau "${dados.analise.grauAbusividade}".`,
    '',
    `O cliente já pagou indevidamente ${formatCurrency(dados.prejuizo.valorPagoIndevido)} e, se mantido o contrato nas condições atuais, ainda pagará ${formatCurrency(dados.prejuizo.economiaFutura)} a mais do que deveria. O prejuízo total estimado é de ${formatCurrency(dados.prejuizo.totalPrejuizo)}.`,
    '',
    `Nos termos do CDC Art. 42, parágrafo único, requer-se a devolução em dobro dos valores pagos indevidamente (${formatCurrency(dados.prejuizo.devolucaoDobro)}), além da revisão do contrato para aplicação da taxa média BACEN.`
  ];

  sumario.forEach(paragrafo => {
    if (paragrafo === '') {
      yPosition += 5;
    } else {
      const lines = doc.splitTextToSize(paragrafo, contentWidth);
      yPosition = checkPageBreak(lines.length * 6 + 5);
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * 6 + 3;
    }
  });

  yPosition += 10;
  doc.setFont('helvetica', 'bold');
  doc.text(`VALOR DA CAUSA: ${formatCurrency(dados.prejuizo.devolucaoDobro + dados.prejuizo.economiaFutura)}`, margin, yPosition);

  // ============================================
  // PÁGINA 3-4: DADOS DO CONTRATO
  // ============================================
  doc.addPage();
  addHeader(doc.getCurrentPageInfo().pageNumber);
  yPosition = 25;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('I. DADOS DO CONTRATO', margin, yPosition);
  
  yPosition += 10;

  autoTable(doc, {
    startY: yPosition,
    head: [['Campo', 'Valor']],
    body: [
      ['Número do Contrato', dados.contrato.numero || 'N/D'],
      ['Data de Assinatura', dados.contrato.dataAssinatura ? format(new Date(dados.contrato.dataAssinatura), 'dd/MM/yyyy') : 'N/D'],
      ['Modalidade', dados.contrato.modalidade],
      ['Valor Financiado', formatCurrency(dados.contrato.valorFinanciado)],
      ['Número de Parcelas', dados.contrato.numeroParcelas.toString()],
      ['Valor da Parcela', formatCurrency(dados.contrato.valorParcela)],
      ['Parcelas Já Pagas', dados.contrato.parcelasJaPagas.toString()],
      ['Saldo Devedor Atual', formatCurrency(dados.contrato.saldoDevedor)],
      ['Taxa Mensal Contratual', `${dados.analise.taxaMensalContrato.toFixed(4)}%`],
      ['Taxa Anual Contratual', `${dados.analise.taxaAnualContrato.toFixed(2)}%`],
    ],
    headStyles: { fillColor: primaryColor, fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;
  yPosition = checkPageBreak(40);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO AUTOR', margin, yPosition);
  yPosition += 10;

  autoTable(doc, {
    startY: yPosition,
    head: [['Campo', 'Valor']],
    body: [
      ['Nome', dados.cliente.nome],
      ['CPF', dados.cliente.cpf],
      ['Endereço', dados.cliente.endereco || 'N/D'],
      ['Cidade/Estado', `${dados.cliente.cidade || 'N/D'} / ${dados.cliente.estado || 'N/D'}`],
    ],
    headStyles: { fillColor: primaryColor, fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;
  yPosition = checkPageBreak(40);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO RÉU', margin, yPosition);
  yPosition += 10;

  autoTable(doc, {
    startY: yPosition,
    head: [['Campo', 'Valor']],
    body: [
      ['Instituição Financeira', dados.banco.nome],
      ['CNPJ', dados.banco.cnpj || 'N/D'],
    ],
    headStyles: { fillColor: primaryColor, fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: margin, right: margin },
  });

  // ============================================
  // PÁGINAS 5-8: ANÁLISE TÉCNICA DETALHADA
  // ============================================
  doc.addPage();
  addHeader(doc.getCurrentPageInfo().pageNumber);
  yPosition = 25;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('II. ANÁLISE TÉCNICA DETALHADA', margin, yPosition);
  
  yPosition += 15;
  doc.setFontSize(12);
  doc.text('2.1 Metodologia de Cálculo', margin, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);

  const metodologia = [
    'A análise técnica foi realizada utilizando o Sistema de Amortização Tabela Price (Sistema Francês), que é o método mais comumente utilizado em contratos de financiamento no Brasil.',
    '',
    'A taxa de juros real foi calculada através do método de aproximação sucessiva (Newton-Raphson), considerando:',
    '• Valor Financiado (PV): Valor presente do empréstimo',
    '• Valor da Parcela (PMT): Prestação mensal',
    '• Prazo (n): Número total de parcelas',
    '',
    'Fórmula utilizada: PMT = PV × [i × (1+i)ⁿ] / [(1+i)ⁿ - 1]',
    '',
    'Onde "i" é a taxa de juros mensal a ser determinada.'
  ];

  metodologia.forEach(linha => {
    if (linha === '') {
      yPosition += 5;
    } else {
      const lines = doc.splitTextToSize(linha, contentWidth);
      yPosition = checkPageBreak(lines.length * 5 + 3);
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * 5 + 2;
    }
  });

  yPosition += 10;
  yPosition = checkPageBreak(40);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2.2 Cálculo da Taxa Real', margin, yPosition);
  
  yPosition += 10;

  autoTable(doc, {
    startY: yPosition,
    head: [['Parâmetro', 'Valor']],
    body: [
      ['Valor Financiado (PV)', formatCurrency(dados.contrato.valorFinanciado)],
      ['Parcela Mensal (PMT)', formatCurrency(dados.contrato.valorParcela)],
      ['Prazo (n)', `${dados.contrato.numeroParcelas} meses`],
      ['Taxa Mensal Calculada (i)', `${dados.analise.taxaMensalContrato.toFixed(4)}%`],
      ['Taxa Anual Calculada', `${dados.analise.taxaAnualContrato.toFixed(2)}%`],
    ],
    headStyles: { fillColor: primaryColor, fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;
  yPosition = checkPageBreak(50);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2.3 Comparação com Taxa BACEN', margin, yPosition);
  
  yPosition += 10;

  autoTable(doc, {
    startY: yPosition,
    head: [['Taxas', 'Mensal', 'Anual']],
    body: [
      [
        'Taxa Contratual',
        `${dados.analise.taxaMensalContrato.toFixed(4)}%`,
        `${dados.analise.taxaAnualContrato.toFixed(2)}%`
      ],
      [
        'Taxa Média BACEN',
        `${dados.analise.taxaMensalBacen.toFixed(4)}%`,
        `${dados.analise.taxaAnualBacen.toFixed(2)}%`
      ],
      [
        'Diferença',
        `${dados.analise.diferencaTaxa.toFixed(4)} p.p.`,
        `${((dados.analise.taxaAnualContrato - dados.analise.taxaAnualBacen)).toFixed(2)} p.p.`
      ],
      [
        'Percentual de Abusividade',
        `${dados.analise.percentualAbusividade.toFixed(2)}%`,
        '-'
      ],
    ],
    headStyles: { fillColor: primaryColor, fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;
  yPosition = checkPageBreak(30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(200, 0, 0);
  doc.text(`GRAU DE ABUSIVIDADE: ${dados.analise.grauAbusividade.toUpperCase()}`, margin, yPosition);

  yPosition += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...textColor);

  const explicacaoAbusividade = `A taxa contratual de ${dados.analise.taxaMensalContrato.toFixed(4)}% a.m. está ${dados.analise.percentualAbusividade.toFixed(2)}% acima da taxa média de mercado divulgada pelo Banco Central (${dados.analise.taxaMensalBacen.toFixed(4)}% a.m.), o que caracteriza abusividade de grau "${dados.analise.grauAbusividade}" segundo os parâmetros jurisprudenciais consolidados.`;
  
  const lines = doc.splitTextToSize(explicacaoAbusividade, contentWidth);
  doc.text(lines, margin, yPosition);
  yPosition += lines.length * 5 + 10;

  // Tabela Price Comparativa (primeiras 12 parcelas)
  if (dados.tabelaAbusiva.length > 0 && dados.tabelaCorreta.length > 0) {
    yPosition = checkPageBreak(80);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2.4 Comparação das Tabelas Price (Primeiras 12 Parcelas)', margin, yPosition);
    
    yPosition += 10;

    const tabelaComparativa = [];
    const maxParcelas = Math.min(12, dados.tabelaAbusiva.length, dados.tabelaCorreta.length);
    
    for (let i = 0; i < maxParcelas; i++) {
      tabelaComparativa.push([
        (i + 1).toString(),
        formatCurrency(dados.tabelaAbusiva[i].parcela || dados.contrato.valorParcela),
        formatCurrency(dados.tabelaCorreta[i].parcela),
        formatCurrency((dados.tabelaAbusiva[i].parcela || dados.contrato.valorParcela) - dados.tabelaCorreta[i].parcela),
      ]);
    }

    autoTable(doc, {
      startY: yPosition,
      head: [['Nº', 'Parcela Abusiva', 'Parcela Correta', 'Diferença']],
      body: tabelaComparativa,
      headStyles: { fillColor: primaryColor, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'right', cellWidth: 50 },
        2: { halign: 'right', cellWidth: 50 },
        3: { halign: 'right', cellWidth: 50 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 5;
  }

  // ============================================
  // PÁGINAS 9-11: CÁLCULO DE PREJUÍZO
  // ============================================
  doc.addPage();
  addHeader(doc.getCurrentPageInfo().pageNumber);
  yPosition = 25;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('III. CÁLCULO DE PREJUÍZO', margin, yPosition);
  
  yPosition += 15;
  doc.setFontSize(12);
  doc.text('3.1 Demonstrativo de Valores Pagos Indevidamente', margin, yPosition);
  
  yPosition += 10;

  autoTable(doc, {
    startY: yPosition,
    head: [['Descrição', 'Valor']],
    body: [
      ['Parcela Contratual (Abusiva)', formatCurrency(dados.contrato.valorParcela)],
      ['Parcela Correta (Taxa BACEN)', formatCurrency(dados.prejuizo.parcelaCorreta)],
      ['Diferença por Parcela', formatCurrency(dados.contrato.valorParcela - dados.prejuizo.parcelaCorreta)],
      ['Parcelas Já Pagas', dados.contrato.parcelasJaPagas.toString()],
      ['Total Pago Indevidamente', formatCurrency(dados.prejuizo.valorPagoIndevido)],
    ],
    headStyles: { fillColor: primaryColor, fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;
  yPosition = checkPageBreak(50);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3.2 Projeção de Economia Futura', margin, yPosition);
  
  yPosition += 10;

  const parcelasRestantes = dados.contrato.numeroParcelas - dados.contrato.parcelasJaPagas;

  autoTable(doc, {
    startY: yPosition,
    head: [['Descrição', 'Valor']],
    body: [
      ['Parcelas Restantes', parcelasRestantes.toString()],
      ['Economia por Parcela', formatCurrency(dados.contrato.valorParcela - dados.prejuizo.parcelaCorreta)],
      ['Economia Futura Total', formatCurrency(dados.prejuizo.economiaFutura)],
    ],
    headStyles: { fillColor: primaryColor, fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;
  yPosition = checkPageBreak(50);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3.3 Resumo Financeiro e Devolução em Dobro (CDC Art. 42)', margin, yPosition);
  
  yPosition += 10;

  autoTable(doc, {
    startY: yPosition,
    head: [['Descrição', 'Valor']],
    body: [
      ['Total Pago Indevidamente', formatCurrency(dados.prejuizo.valorPagoIndevido)],
      ['Economia Futura', formatCurrency(dados.prejuizo.economiaFutura)],
      ['Prejuízo Total', formatCurrency(dados.prejuizo.totalPrejuizo)],
      ['', ''],
      ['Devolução em Dobro (Art. 42 CDC)', formatCurrency(dados.prejuizo.devolucaoDobro)],
    ],
    headStyles: { fillColor: primaryColor, fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: margin, right: margin },
    didParseCell: (data) => {
      if (data.row.index === 4) {
        data.cell.styles.fillColor = [220, 38, 38];
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;
  yPosition = checkPageBreak(30);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);

  const explicacaoDobro = 'Nos termos do Art. 42, parágrafo único do Código de Defesa do Consumidor: "O consumidor cobrado em quantia indevida tem direito à repetição do indébito, por valor igual ao dobro do que pagou em excesso, acrescido de correção monetária e juros legais, salvo hipótese de engano justificável."';
  
  const linesDobro = doc.splitTextToSize(explicacaoDobro, contentWidth);
  doc.text(linesDobro, margin, yPosition);

  // ============================================
  // PÁGINAS 12-17: FUNDAMENTAÇÃO LEGAL
  // ============================================
  doc.addPage();
  addHeader(doc.getCurrentPageInfo().pageNumber);
  yPosition = 25;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('IV. FUNDAMENTAÇÃO LEGAL', margin, yPosition);
  
  yPosition += 15;

  const fundamentacoes = [
    {
      titulo: '4.1 Código de Defesa do Consumidor - Art. 42 (Devolução em Dobro)',
      texto: [
        '"Art. 42. Na cobrança de débitos, o consumidor inadimplente não será exposto a ridículo, nem será submetido a qualquer tipo de constrangimento ou ameaça."',
        '',
        '"Parágrafo único. O consumidor cobrado em quantia indevida tem direito à repetição do indébito, por valor igual ao dobro do que pagou em excesso, acrescido de correção monetária e juros legais, salvo hipótese de engano justificável."',
        '',
        'No presente caso, o banco cobrou juros abusivos, configurando cobrança indevida que autoriza a devolução em dobro dos valores pagos em excesso.'
      ]
    },
    {
      titulo: '4.2 Código de Defesa do Consumidor - Art. 51, IV (Cláusulas Abusivas)',
      texto: [
        '"Art. 51. São nulas de pleno direito, entre outras, as cláusulas contratuais relativas ao fornecimento de produtos e serviços que:"',
        '',
        '"IV - estabeleçam obrigações consideradas iníquas, abusivas, que coloquem o consumidor em desvantagem exagerada, ou sejam incompatíveis com a boa-fé ou a equidade;"',
        '',
        'A aplicação de taxa de juros muito superior à média de mercado configura vantagem manifestamente excessiva e coloca o consumidor em desvantagem exagerada.'
      ]
    },
    {
      titulo: '4.3 Súmula 530 do STJ',
      texto: [
        '"Nos contratos bancários na modalidade de crédito rotativo, ainda que celebrados antes da vigência da Lei n. 12.738/2013, não se exige demonstração da abusividade para a limitação dos juros remuneratórios aos juros médios de mercado apurados pelo Banco Central do Brasil."',
        '',
        'Embora esta súmula trate especificamente de crédito rotativo, a jurisprudência do STJ a aplica analogicamente a outras modalidades de crédito quando há abusividade manifesta.'
      ]
    },
    {
      titulo: '4.4 REsp 1.061.530/RS (Taxa Média BACEN como Parâmetro)',
      texto: [
        'O Superior Tribunal de Justiça consolidou o entendimento de que a taxa média de mercado divulgada pelo Banco Central do Brasil é o parâmetro objetivo para aferição da abusividade das taxas de juros.',
        '',
        'Quando a taxa contratual supera significativamente a taxa média, presume-se a abusividade, cabendo à instituição financeira comprovar motivo justificável para a cobrança de taxa superior.'
      ]
    },
    {
      titulo: '4.5 Critério Jurisprudencial de Abusividade',
      texto: [
        'A jurisprudência dos Tribunais Superiores e dos Tribunais de Justiça tem considerado abusivas as taxas que superam a média de mercado divulgada pelo BACEN em percentuais que variam conforme o caso concreto.',
        '',
        `No presente caso, a taxa contratual é ${dados.analise.percentualAbusividade.toFixed(2)}% superior à taxa média BACEN, o que caracteriza abusividade manifesta e autoriza a revisão judicial do contrato.`,
        '',
        'Precedentes: REsp 1.112.879/PR, REsp 1.139.997/SP, entre outros.'
      ]
    },
    {
      titulo: '4.6 Doutrina',
      texto: [
        'Conforme leciona Cláudia Lima Marques em "Contratos no Código de Defesa do Consumidor":',
        '',
        '"A boa-fé objetiva impõe ao fornecedor o dever de informar adequadamente o consumidor sobre todas as características do produto ou serviço, especialmente sobre o custo efetivo total da operação financeira."',
        '',
        'A aplicação de taxas muito superiores à média de mercado, sem justificativa adequada, viola os princípios da boa-fé objetiva e da transparência que devem reger as relações de consumo.'
      ]
    }
  ];

  fundamentacoes.forEach((fund, index) => {
    if (index > 0) {
      yPosition += 10;
    }
    
    yPosition = checkPageBreak(30);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(fund.titulo, margin, yPosition);
    
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);

    fund.texto.forEach(paragrafo => {
      if (paragrafo === '') {
        yPosition += 5;
      } else {
        const lines = doc.splitTextToSize(paragrafo, contentWidth);
        yPosition = checkPageBreak(lines.length * 5 + 5);
        
        if (paragrafo.startsWith('"')) {
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(60, 60, 60);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...textColor);
        }
        
        doc.text(lines, margin + (paragrafo.startsWith('"') ? 5 : 0), yPosition);
        yPosition += lines.length * 5 + 3;
      }
    });
  });

  // ============================================
  // PÁGINAS 18-19: PEDIDOS
  // ============================================
  doc.addPage();
  addHeader(doc.getCurrentPageInfo().pageNumber);
  yPosition = 25;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('V. DOS PEDIDOS', margin, yPosition);
  
  yPosition += 15;

  doc.setFontSize(12);
  doc.setTextColor(200, 0, 0);
  doc.text('DA TUTELA DE URGÊNCIA', margin, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);

  const tutela = [
    'Presentes os requisitos do art. 300 do CPC (probabilidade do direito e perigo de dano), requer-se a concessão de TUTELA DE URGÊNCIA para:',
    '',
    'a) Determinar a suspensão da exigibilidade do débito objeto do contrato mencionado nos autos, até o julgamento final da presente ação;',
    '',
    'b) Determinar que o banco réu se abstenha de negativar o nome do autor junto aos órgãos de proteção ao crédito (SPC, SERASA, etc.) em decorrência do contrato objeto desta ação;',
    '',
    'c) Caso o nome do autor já esteja negativado, determinar o imediato levantamento da restrição.'
  ];

  tutela.forEach(item => {
    if (item === '') {
      yPosition += 5;
    } else {
      const lines = doc.splitTextToSize(item, contentWidth - 5);
      yPosition = checkPageBreak(lines.length * 5 + 5);
      doc.text(lines, margin + 5, yPosition);
      yPosition += lines.length * 5 + 3;
    }
  });

  yPosition += 10;
  yPosition = checkPageBreak(40);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('DO MÉRITO', margin, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);

  const pedidosMerito = [
    'Ao final, requer-se seja a presente ação julgada PROCEDENTE para:',
    '',
    '1) DECLARAR a abusividade da taxa de juros aplicada no contrato objeto desta ação;',
    '',
    `2) DETERMINAR a revisão do contrato para aplicação da taxa média de mercado divulgada pelo Banco Central (${dados.analise.taxaMensalBacen.toFixed(4)}% a.m. / ${dados.analise.taxaAnualBacen.toFixed(2)}% a.a.);`,
    '',
    '3) DETERMINAR o recálculo do saldo devedor com base na taxa revista;',
    '',
    `4) CONDENAR o banco réu a devolver ao autor, em dobro, os valores pagos indevidamente, no montante de ${formatCurrency(dados.prejuizo.devolucaoDobro)}, corrigidos monetariamente e acrescidos de juros legais;`,
    '',
    '5) CONDENAR o banco réu ao pagamento de honorários advocatícios de sucumbência no percentual de 20% sobre o valor da condenação, nos termos do art. 85, §2º do CPC;',
    '',
    '6) CONDENAR o banco réu ao pagamento das custas processuais.'
  ];

  pedidosMerito.forEach(item => {
    if (item === '') {
      yPosition += 5;
    } else {
      const lines = doc.splitTextToSize(item, contentWidth - 5);
      yPosition = checkPageBreak(lines.length * 5 + 5);
      doc.text(lines, margin + 5, yPosition);
      yPosition += lines.length * 5 + 3;
    }
  });

  yPosition += 10;
  yPosition = checkPageBreak(20);

  doc.setFont('helvetica', 'bold');
  doc.text(`VALOR DA CAUSA: ${formatCurrency(dados.prejuizo.devolucaoDobro + dados.prejuizo.economiaFutura)}`, margin, yPosition);

  // ============================================
  // PÁGINA 20: TERMOS FINAIS
  // ============================================
  doc.addPage();
  addHeader(doc.getCurrentPageInfo().pageNumber);
  yPosition = 25;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('VI. REQUERIMENTOS FINAIS', margin, yPosition);
  
  yPosition += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);

  const requerimentos = [
    'Requer-se:',
    '',
    'a) A citação do banco réu para, querendo, apresentar contestação no prazo legal;',
    '',
    'b) A produção de todas as provas em direito admitidas, especialmente perícia contábil, se necessário;',
    '',
    'c) A condenação do réu nos ônus da sucumbência;',
    '',
    'd) A intimação pessoal do advogado subscrito para todos os atos do processo.'
  ];

  requerimentos.forEach(item => {
    if (item === '') {
      yPosition += 5;
    } else {
      const lines = doc.splitTextToSize(item, contentWidth);
      yPosition = checkPageBreak(lines.length * 5 + 5);
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * 5 + 3;
    }
  });

  yPosition += 15;
  yPosition = checkPageBreak(60);

  doc.setFont('helvetica', 'normal');
  doc.text('Termos em que,', margin, yPosition);
  yPosition += 8;
  doc.text('Pede deferimento.', margin, yPosition);

  yPosition += 20;
  doc.text(`${dados.escritorio?.cidade || 'São Paulo'}, ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`, margin, yPosition);

  yPosition += 30;
  doc.line(margin, yPosition, margin + 80, yPosition);
  yPosition += 5;
  
  if (dados.advogado) {
    doc.setFont('helvetica', 'bold');
    doc.text(dados.advogado.nome, margin, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(`OAB/${dados.advogado.estadoOab} ${dados.advogado.oab}`, margin, yPosition);
  } else {
    doc.text('Advogado(a) do Autor', margin, yPosition);
    yPosition += 5;
    doc.text('OAB/XX XXXXX', margin, yPosition);
  }

  // ============================================
  // PÁGINA 21: ANEXOS (Referência)
  // ============================================
  doc.addPage();
  addHeader(doc.getCurrentPageInfo().pageNumber);
  yPosition = 25;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('VII. LISTA DE ANEXOS', margin, yPosition);
  
  yPosition += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);

  const anexos = [
    'Anexo I - Cópia do contrato bancário original',
    'Anexo II - Taxa média BACEN para a modalidade na data de contratação',
    'Anexo III - Tabela Price completa com taxa abusiva',
    'Anexo IV - Tabela Price completa com taxa correta (BACEN)',
    'Anexo V - Memória de cálculo detalhada',
    'Anexo VI - Documentos pessoais do autor (RG, CPF)',
    'Anexo VII - Comprovante de residência',
    'Anexo VIII - Procuração (se aplicável)'
  ];

  anexos.forEach(anexo => {
    yPosition = checkPageBreak(8);
    doc.text(`• ${anexo}`, margin, yPosition);
    yPosition += 8;
  });

  // Adicionar rodapé na última página
  addFooter(doc.getCurrentPageInfo().pageNumber);

  // Salvar o PDF
  const nomeArquivo = `Peticao_${dados.cliente.nome.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(nomeArquivo);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}
