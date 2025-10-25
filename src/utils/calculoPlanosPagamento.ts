import type { Contrato, FasePagamento, CalculoFase, ResultadoPlano, DividaImpagavel } from "@/types/superendividamento";

export function calcularPlanoCompleto(
  contratos: Contrato[],
  rendaLiquida: number,
  percentualRenda: number
): ResultadoPlano {
  
  // 1. Calcular encargo mensal total ATUAL
  const encargoMensalAtual = contratos.reduce((total, c) => total + c.parcelaMensalAtual, 0);
  
  // 2. Calcular novo valor mensal limitado
  const novoEncargoMensal = rendaLiquida * (percentualRenda / 100);
  
  // 3. Calcular percentual de cada parcela atual
  const contratosComPercentual = contratos.map(contrato => ({
    ...contrato,
    percentualAtual: (contrato.parcelaMensalAtual / encargoMensalAtual) * 100,
    saldoAtual: contrato.valorTotalDivida
  }));
  
  // 4. Calcular novas parcelas proporcionais
  let contratosAtivos = contratosComPercentual.map(c => ({
    ...c,
    novaParcela: (c.percentualAtual / 100) * novoEncargoMensal
  }));
  
  const fases: FasePagamento[] = [];
  let numeroFase = 1;
  let mesesAcumulados = 0;
  const LIMITE_MESES = 60;
  
  while (contratosAtivos.length > 0 && mesesAcumulados < LIMITE_MESES) {
    
    // 5. Calcular quantos meses cada contrato levaria para quitar
    const prazosQuitacao = contratosAtivos.map(c => ({
      ...c,
      mesesParaQuitar: c.saldoAtual / c.novaParcela
    }));
    
    // 6. Encontrar o menor prazo e arredondar PARA BAIXO
    const menorPrazo = Math.floor(Math.min(...prazosQuitacao.map(p => p.mesesParaQuitar)));
    
    // Verificar quantos meses restam até o limite de 60
    const mesesRestantes = LIMITE_MESES - mesesAcumulados;
    
    // A duração da fase é o menor entre: prazo necessário OU meses restantes até 60
    const duracaoFase = menorPrazo > 0 ? Math.min(menorPrazo, mesesRestantes) : mesesRestantes;
    
    // Se não houver meses restantes, parar
    if (duracaoFase <= 0 || mesesRestantes <= 0) {
      break;
    }
    
    // 7. Calcular o que cada um paga nesta fase
    const calculosFase: CalculoFase[] = prazosQuitacao.map(c => {
      const valorPago = c.novaParcela * duracaoFase;
      const novoSaldo = Math.max(0, c.saldoAtual - valorPago);
      
      return {
        credor: c.credor,
        parcelaMensalAtual: c.parcelaMensalAtual,
        percentualAtual: c.percentualAtual,
        novaParcela: c.novaParcela,
        novoPercentual: (c.novaParcela / novoEncargoMensal) * 100,
        valorPago: valorPago,
        saldoRemanescente: novoSaldo,
        quitado: novoSaldo === 0
      };
    });
    
    // 8. Adicionar a fase normal
    const faseAtual = numeroFase;
    console.log(`=== FASE ${faseAtual} (NORMAL) ===`);
    calculosFase.forEach(c => {
      console.log(`${c.credor}: novaParcela=${c.novaParcela.toFixed(2)}, saldoRemanescente=${c.saldoRemanescente.toFixed(2)}, quitado=${c.quitado}`);
    });
    
    fases.push({
      numeroFase: numeroFase++,
      duracaoMeses: duracaoFase,
      tipoFase: 'normal',
      calculos: calculosFase,
      creditoresQuitados: calculosFase.filter(c => c.quitado).map(c => c.credor),
      valorMensalTotal: novoEncargoMensal,
      encargoAnterior: encargoMensalAtual
    });
    
    mesesAcumulados += duracaoFase;
    
    // 9. Processar todas as fases de ajuste necessárias
    let calculosAtuais = calculosFase;
    
    while (true) {
      // Verificar se algum contrato tem saldo menor que a parcela
      const contratoComSaldoMenor = calculosAtuais.find(c => 
        !c.quitado && c.saldoRemanescente < c.novaParcela && c.saldoRemanescente > 0
      );
      
      if (!contratoComSaldoMenor || mesesAcumulados >= LIMITE_MESES) {
        break; // Não há mais ajustes necessários ou atingiu o limite
      }
      
      // Criar fase de ajuste
      console.log(`=== FASE ${numeroFase} (AJUSTE) - Quitando ${contratoComSaldoMenor.credor} ===`);
      console.log(`Contrato ${contratoComSaldoMenor.credor} antes do ajuste: saldo=${contratoComSaldoMenor.saldoRemanescente.toFixed(2)}, parcela=${contratoComSaldoMenor.novaParcela.toFixed(2)}, quitado=${contratoComSaldoMenor.quitado}`);
      
      const valorExato = Math.round(contratoComSaldoMenor.saldoRemanescente * 100) / 100;
      const sobra = Math.round((contratoComSaldoMenor.novaParcela - valorExato) * 100) / 100;
      const contratosRestantes = calculosAtuais.filter(c => 
        !c.quitado && c.credor !== contratoComSaldoMenor.credor
      );
      const sobraPorContrato = contratosRestantes.length > 0 
        ? Math.round((sobra / contratosRestantes.length) * 100) / 100 
        : 0;
      
      console.log(`Valor exato para quitação: ${valorExato.toFixed(2)}, sobra: ${sobra.toFixed(2)}, sobra por contrato: ${sobraPorContrato.toFixed(2)}`);
      
      const calculosAjuste: CalculoFase[] = calculosAtuais.map(c => {
        if (c.credor === contratoComSaldoMenor.credor) {
          return {
            ...c,
            novaParcela: Math.round(valorExato * 100) / 100,
            valorPago: Math.round(valorExato * 100) / 100,
            saldoRemanescente: 0,
            quitado: true
          };
        } else if (!c.quitado) {
          const novaParcelaComSobra = Math.round((c.novaParcela + sobraPorContrato) * 100) / 100;
          const novoSaldoAjuste = Math.round((c.saldoRemanescente - novaParcelaComSobra) * 100) / 100;
          return {
            ...c,
            novaParcela: novaParcelaComSobra,
            sobraRecebida: sobraPorContrato,
            valorPago: novaParcelaComSobra,
            saldoRemanescente: Math.max(0, novoSaldoAjuste)
          };
        }
        return c;
      });
      
      calculosAjuste.forEach(c => {
        console.log(`${c.credor} após ajuste: novaParcela=${c.novaParcela.toFixed(2)}, saldoRemanescente=${c.saldoRemanescente.toFixed(2)}, quitado=${c.quitado}`);
      });
      
      fases.push({
        numeroFase: numeroFase++,
        duracaoMeses: 1,
        tipoFase: 'ajuste',
        calculos: calculosAjuste,
        creditoresQuitados: [contratoComSaldoMenor.credor],
        valorMensalTotal: Math.round(novoEncargoMensal * 100) / 100,
        encargoAnterior: Math.round(encargoMensalAtual * 100) / 100
      });
      
      mesesAcumulados += 1;
      calculosAtuais = calculosAjuste; // Atualizar para próxima iteração
    }
    
    // Atualizar contratos ativos após todas as fases de ajuste
    console.log(`\n--- Atualizando contratos ativos ---`);
    console.log(`Contratos ANTES do filtro:`, calculosAtuais.map(c => `${c.credor}(quitado=${c.quitado})`).join(', '));
    
    contratosAtivos = calculosAtuais
      .filter(c => !c.quitado)
      .map(c => {
        const contratoOriginal = contratosAtivos.find(orig => orig.credor === c.credor)!;
        return {
          ...contratoOriginal,
          saldoAtual: Math.round(c.saldoRemanescente * 100) / 100,
          novaParcela: Math.round(c.novaParcela * 100) / 100
        };
      });
    
    console.log(`Contratos APÓS o filtro (ativos):`, contratosAtivos.map(c => `${c.credor}(saldo=${c.saldoAtual.toFixed(2)})`).join(', '));
    console.log(`---\n`);
    
    // 10. Recalcular percentuais para próxima fase se ainda há contratos
    if (contratosAtivos.length > 0) {
      const totalParcelasRestantes = contratosAtivos.reduce((total, c) => total + c.novaParcela, 0);
      contratosAtivos = contratosAtivos.map(c => ({
        ...c,
        percentualAtual: totalParcelasRestantes > 0 ? (c.novaParcela / totalParcelasRestantes) * 100 : 0,
        novaParcela: totalParcelasRestantes > 0 ? (c.novaParcela / totalParcelasRestantes) * novoEncargoMensal : 0
      }));
    }
  }
  
  const totalMeses = fases.reduce((total, fase) => total + fase.duracaoMeses, 0);
  const reducaoPercentual = ((encargoMensalAtual - novoEncargoMensal) / encargoMensalAtual) * 100;
  
  // Calcular dívidas impagáveis
  const dividasImpagaveis = contratosAtivos.length > 0 ? contratosAtivos.map(c => ({
    credor: c.credor,
    saldoImpagavel: c.saldoAtual,
    valorTotalOriginal: c.valorTotalDivida,
    percentualQuitado: ((c.valorTotalDivida - c.saldoAtual) / c.valorTotalDivida) * 100
  })) : [];
  
  return {
    fases,
    dividasImpagaveis: dividasImpagaveis.length > 0 ? dividasImpagaveis : undefined,
    resumo: {
      totalFases: fases.length,
      totalMeses,
      encargoAtual: encargoMensalAtual,
      novoEncargo: novoEncargoMensal,
      reducaoPercentual,
      limiteLegalRespeitado: mesesAcumulados <= LIMITE_MESES,
      mesesUtilizados: mesesAcumulados
    }
  };
}
