import jsPDF from 'jspdf';
import { RelatorioProvisao, RelatorioPosicaoContratos, RelatorioRisco } from '@/hooks/useRelatorios';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const exportarRelatorioProvisaoPDF = (dados: RelatorioProvisao) => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(20);
  doc.text('RELATÓRIO DE PROVISÕES', 20, 20);
  
  // Data
  doc.setFontSize(12);
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  doc.text(`Gerado em: ${dataAtual}`, 20, 30);
  
  // Resumo Executivo
  doc.setFontSize(14);
  doc.text('RESUMO EXECUTIVO', 20, 50);
  
  doc.setFontSize(11);
  doc.text(`Total de Contratos: ${dados.total_contratos}`, 20, 60);
  doc.text(`Valor Total das Dívidas: ${formatCurrency(dados.valor_total_dividas)}`, 20, 70);
  doc.text(`Valor Total Provisionado: ${formatCurrency(dados.valor_total_provisao)}`, 20, 80);
  doc.text(`Percentual Médio de Provisão: ${dados.percentual_medio_provisao.toFixed(2)}%`, 20, 90);
  
  // Detalhamento por Classificação
  doc.setFontSize(14);
  doc.text('PROVISÕES POR CLASSIFICAÇÃO', 20, 110);
  
  let yPosition = 120;
  doc.setFontSize(11);
  
  dados.contratos_por_classificacao.forEach((item) => {
    doc.text(`${item.classificacao}:`, 25, yPosition);
    doc.text(`${item.quantidade} contratos`, 25, yPosition + 8);
    doc.text(`Valor Total: ${formatCurrency(item.valor_total)}`, 25, yPosition + 16);
    doc.text(`Provisão: ${formatCurrency(item.valor_provisao)}`, 25, yPosition + 24);
    
    const percentual = item.valor_total > 0 ? ((item.valor_provisao / item.valor_total) * 100).toFixed(1) : '0';
    doc.text(`Percentual: ${percentual}%`, 25, yPosition + 32);
    
    yPosition += 45;
    
    // Nova página se necessário
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
  });
  
  doc.save(`relatorio-provisoes-${dataAtual.replace(/\//g, '-')}.pdf`);
};

export const exportarRelatorioPosicaoPDF = (dados: RelatorioPosicaoContratos) => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(20);
  doc.text('RELATÓRIO POSIÇÃO DOS CONTRATOS', 20, 20);
  
  // Data
  doc.setFontSize(12);
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  doc.text(`Gerado em: ${dataAtual}`, 20, 30);
  
  // Total de Contratos
  doc.setFontSize(14);
  doc.text(`TOTAL DE CONTRATOS: ${dados.total_contratos}`, 20, 50);
  
  // Distribuição por Situação
  doc.setFontSize(14);
  doc.text('DISTRIBUIÇÃO POR SITUAÇÃO', 20, 70);
  
  let yPosition = 80;
  doc.setFontSize(11);
  
  dados.por_situacao.forEach((item) => {
    doc.text(`${item.situacao}: ${item.quantidade} contratos (${item.percentual.toFixed(1)}%)`, 25, yPosition);
    yPosition += 10;
  });
  
  // Contratos Recentes
  yPosition += 10;
  doc.setFontSize(14);
  doc.text('CONTRATOS MAIS RECENTES', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  dados.contratos_recentes.slice(0, 10).forEach((contrato) => {
    doc.text(`${contrato.numero_contrato} - ${contrato.cliente_nome}`, 25, yPosition);
    doc.text(`Valor: ${formatCurrency(contrato.valor_divida)} - Status: ${contrato.situacao}`, 25, yPosition + 8);
    yPosition += 20;
    
    // Nova página se necessário
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
  });
  
  doc.save(`relatorio-posicao-contratos-${dataAtual.replace(/\//g, '-')}.pdf`);
};

export const exportarRelatorioRiscoPDF = (dados: RelatorioRisco) => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(20);
  doc.text('RELATÓRIO DE ANÁLISE DE RISCO', 20, 20);
  
  // Data
  doc.setFontSize(12);
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  doc.text(`Gerado em: ${dataAtual}`, 20, 30);
  
  // Distribuição de Risco
  doc.setFontSize(14);
  doc.text('DISTRIBUIÇÃO POR CLASSIFICAÇÃO DE RISCO', 20, 50);
  
  let yPosition = 60;
  doc.setFontSize(11);
  
  dados.distribuicao_risco.forEach((item) => {
    doc.text(`${item.classificacao}:`, 25, yPosition);
    doc.text(`${item.quantidade} contratos`, 25, yPosition + 8);
    doc.text(`Valor Total: ${formatCurrency(item.valor_total)}`, 25, yPosition + 16);
    doc.text(`% Provisão Médio: ${item.percentual_provisao_medio.toFixed(1)}%`, 25, yPosition + 24);
    yPosition += 35;
  });
  
  // Clientes de Alto Risco
  if (dados.clientes_alto_risco.length > 0) {
    yPosition += 10;
    doc.setFontSize(14);
    doc.text('CLIENTES DE ALTO RISCO', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    dados.clientes_alto_risco.forEach((cliente) => {
      doc.text(`${cliente.cliente_nome}`, 25, yPosition);
      doc.text(`${cliente.total_contratos} contratos - Classificação: ${cliente.classificacao_predominante}`, 25, yPosition + 8);
      doc.text(`Provisão Total: ${formatCurrency(cliente.valor_total_provisao)}`, 25, yPosition + 16);
      yPosition += 25;
      
      // Nova página se necessário
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
    });
  }
  
  doc.save(`relatorio-analise-risco-${dataAtual.replace(/\//g, '-')}.pdf`);
};

export const exportarRelatorioCSV = (dados: any, tipo: string) => {
  let csvContent = '';
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  
  if (tipo === 'provisao') {
    csvContent = 'Classificação,Quantidade,Valor Total,Valor Provisão,Percentual\n';
    dados.contratos_por_classificacao.forEach((item: any) => {
      const percentual = item.valor_total > 0 ? ((item.valor_provisao / item.valor_total) * 100).toFixed(1) : '0';
      csvContent += `${item.classificacao},${item.quantidade},"${formatCurrency(item.valor_total)}","${formatCurrency(item.valor_provisao)}",${percentual}%\n`;
    });
  } else if (tipo === 'posicao') {
    csvContent = 'Situação,Quantidade,Percentual\n';
    dados.por_situacao.forEach((item: any) => {
      csvContent += `${item.situacao},${item.quantidade},${item.percentual.toFixed(1)}%\n`;
    });
  } else if (tipo === 'risco') {
    csvContent = 'Classificação,Quantidade,Valor Total,Percentual Provisão Médio\n';
    dados.distribuicao_risco.forEach((item: any) => {
      csvContent += `${item.classificacao},${item.quantidade},"${formatCurrency(item.valor_total)}",${item.percentual_provisao_medio.toFixed(1)}%\n`;
    });
  }
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `relatorio-${tipo}-${dataAtual.replace(/\//g, '-')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};