import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface DadosRelatorio {
  tipo: "provisionamento" | "juros_abusivos" | "superendividamento";
  cliente: {
    nome: string;
    cpf_cnpj?: string;
  };
  contrato?: {
    numero?: string;
    banco?: string;
  };
  escritorio: {
    nome: string;
    oab?: string;
    endereco?: string;
  };
  resultado: any;
  dataAnalise: Date;
}

export function gerarRelatorioPDF(dados: DadosRelatorio) {
  const doc = new jsPDF();
  let yPos = 20;

  // Cabeçalho
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("INTELLBANK", 105, yPos, { align: "center" });
  
  yPos += 8;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema Especializado em Direito Bancário", 105, yPos, { align: "center"});
  
  yPos += 15;
  doc.setDrawColor(0, 102, 204);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  
  yPos += 10;

  // Título do Relatório
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  const titulos = {
    provisionamento: "RELATÓRIO DE PROVISIONAMENTO BANCÁRIO",
    juros_abusivos: "RELATÓRIO DE ANÁLISE DE JUROS ABUSIVOS",
    superendividamento: "PLANO DE SUPERENDIVIDAMENTO",
  };
  doc.text(titulos[dados.tipo], 105, yPos, { align: "center"});
  
  yPos += 10;

  // Dados do Escritório
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("ESCRITÓRIO:", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(dados.escritorio.nome, 50, yPos);
  
  if (dados.escritorio.oab) {
    yPos += 6;
    doc.setFont("helvetica", "bold");
    doc.text("OAB:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(dados.escritorio.oab, 50, yPos);
  }
  
  yPos += 10;

  // Dados do Cliente
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DO CLIENTE", 20, yPos);
  yPos += 6;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Nome:", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(dados.cliente.nome, 50, yPos);
  
  if (dados.cliente.cpf_cnpj) {
    yPos += 6;
    doc.setFont("helvetica", "bold");
    doc.text("CPF/CNPJ:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(dados.cliente.cpf_cnpj, 50, yPos);
  }
  
  yPos += 10;

  // Dados do Contrato (se aplicável)
  if (dados.contrato) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DADOS DO CONTRATO", 20, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    if (dados.contrato.banco) {
      doc.setFont("helvetica", "bold");
      doc.text("Banco:", 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(dados.contrato.banco, 50, yPos);
      yPos += 6;
    }
    
    if (dados.contrato.numero) {
      doc.setFont("helvetica", "bold");
      doc.text("Nº Contrato:", 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(dados.contrato.numero, 50, yPos);
      yPos += 6;
    }
    
    yPos += 4;
  }

  // Resultado da Análise (específico por tipo)
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("RESULTADO DA ANÁLISE", 20, yPos);
  yPos += 8;

  if (dados.tipo === "provisionamento") {
    gerarSecaoProvisionamento(doc, dados.resultado, yPos);
  } else if (dados.tipo === "juros_abusivos") {
    gerarSecaoJurosAbusivos(doc, dados.resultado, yPos);
  } else if (dados.tipo === "superendividamento") {
    gerarSecaoSuperendividamento(doc, dados.resultado, yPos);
  }

  // Rodapé
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Gerado em ${dados.dataAnalise.toLocaleDateString("pt-BR")} às ${dados.dataAnalise.toLocaleTimeString("pt-BR")}`,
      105,
      285,
      { align: "center" }
    );
    doc.text(`Página ${i} de ${totalPages}`, 105, 290, { align: "center" });
  }

  // Salvar PDF
  const nomeArquivo = `${titulos[dados.tipo]}_${dados.cliente.nome.replace(/\s/g, "_")}_${dados.dataAnalise.toISOString().split("T")[0]}.pdf`;
  doc.save(nomeArquivo);
}

function gerarSecaoProvisionamento(doc: jsPDF, resultado: any, yPos: number) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  autoTable(doc, {
    startY: yPos,
    head: [["Item", "Valor"]],
    body: [
      ["Saldo Contábil", formatCurrency(resultado.valorDivida || 0)],
      ["Dias de Atraso", `${resultado.diasAtraso || 0} dias`],
      ["Classificação de Risco", resultado.classificacao || "N/A"],
      ["Percentual de Provisão", `${(resultado.percentualProvisao || 0).toFixed(2)}%`],
      ["Valor da Provisão", formatCurrency(resultado.valorProvisao || 0)],
    ],
    theme: "grid",
    headStyles: { fillColor: [0, 102, 204] },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("FUNDAMENTAÇÃO LEGAL", 20, finalY);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const texto = "Cálculo realizado conforme Resolução BCB nº 4.966/2021 e Resolução CMN nº 352/2023, que estabelecem os critérios de classificação de risco e percentuais de provisão para operações de crédito.";
  const linhas = doc.splitTextToSize(texto, 170);
  doc.text(linhas, 20, finalY + 8);
}

function gerarSecaoJurosAbusivos(doc: jsPDF, resultado: any, yPos: number) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  autoTable(doc, {
    startY: yPos,
    head: [["Item", "Valor"]],
    body: [
      ["Valor Financiado", formatCurrency(resultado.valorFinanciado || 0)],
      ["Taxa Real Aplicada", `${(resultado.taxaRealMensal || 0).toFixed(2)}% a.m.`],
      ["Taxa Média BACEN", `${(resultado.taxaMediaBacen || 0).toFixed(2)}% a.m.`],
      ["Diferença", `${(resultado.diferencaPercentual || 0).toFixed(2)}%`],
      ["Abusividade", resultado.abusividadeDetectada ? "SIM" : "NÃO"],
      ["Valor Indevido (estimado)", formatCurrency(resultado.valorIndevido || 0)],
    ],
    theme: "grid",
    headStyles: { fillColor: [220, 53, 69] },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("FUNDAMENTAÇÃO LEGAL", 20, finalY);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const texto = "Análise baseada em comparação com as séries temporais de taxas médias de juros divulgadas pelo Banco Central do Brasil (BACEN). Considera-se abusiva a taxa que excede em mais de 20% a taxa média de mercado para a modalidade de crédito.";
  const linhas = doc.splitTextToSize(texto, 170);
  doc.text(linhas, 20, finalY + 8);
}

function gerarSecaoSuperendividamento(doc: jsPDF, resultado: any, yPos: number) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  autoTable(doc, {
    startY: yPos,
    head: [["Item", "Valor"]],
    body: [
      ["Renda Líquida", formatCurrency(resultado.rendaLiquida || 0)],
      ["Valor Disponível (30%)", formatCurrency(resultado.valorDisponivelMensal || 0)],
      ["Total de Dívidas", formatCurrency(resultado.totalDividas || 0)],
      ["Prazo Médio", `${resultado.prazoMedio || 0} meses`],
    ],
    theme: "grid",
    headStyles: { fillColor: [13, 110, 253] },
  });

  let finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("PLANO DE PAGAMENTO PROPOSTO", 20, finalY);
  finalY += 8;

  if (resultado.planoDetalhado && resultado.planoDetalhado.length > 0) {
    autoTable(doc, {
      startY: finalY,
      head: [["Credor", "Valor Atual", "Nova Parcela", "Prazo"]],
      body: resultado.planoDetalhado.map((item: any) => [
        item.credor,
        formatCurrency(item.valorAtual),
        formatCurrency(item.novaParcelaMensal),
        `${item.prazoMeses} meses`,
      ]),
      theme: "striped",
      headStyles: { fillColor: [13, 110, 253] },
    });
    
    finalY = (doc as any).lastAutoTable.finalY + 10;
  }
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("FUNDAMENTAÇÃO LEGAL", 20, finalY);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const texto = "Plano de pagamento elaborado conforme Lei nº 14.181/2021, que institui o regime de repactuação de dívidas e o Programa Desenrola Brasil. O plano considera até 30% da renda líquida mensal para pagamento de dívidas, com prazo máximo de 60 meses.";
  const linhas = doc.splitTextToSize(texto, 170);
  doc.text(linhas, 20, finalY + 8);
}
