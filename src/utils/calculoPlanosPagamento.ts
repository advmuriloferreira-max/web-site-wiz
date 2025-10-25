import type { Contrato, FasePagamento, CalculoFase, ResultadoPlano } from "@/types/superendividamento";

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
  
  while (contratosAtivos.length > 0) {
    
    // 5. Calcular quantos meses cada contrato levaria para quitar
    const prazosQuitacao = contratosAtivos.map(c => ({
      ...c,
      mesesParaQuitar: c.saldoAtual / c.novaParcela
    }));
    
    // 6. Encontrar o menor prazo e arredondar PARA BAIXO
    const menorPrazo = Math.floor(Math.min(...prazosQuitacao.map(p => p.mesesParaQuitar)));
    
    // 7. Calcular o que cada um paga nesta fase
    const calculosFase: CalculoFase[] = prazosQuitacao.map(c => {
      const valorPago = c.novaParcela * menorPrazo;
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
    fases.push({
      numeroFase: numeroFase++,
      duracaoMeses: menorPrazo,
      tipoFase: 'normal',
      calculos: calculosFase,
      creditoresQuitados: calculosFase.filter(c => c.quitado).map(c => c.credor),
      valorMensalTotal: novoEncargoMensal,
      encargoAnterior: encargoMensalAtual
    });
    
    // 9. Verificar se precisa de fase de ajuste
    const contratoComSaldoMenor = calculosFase.find(c => 
      !c.quitado && c.saldoRemanescente < c.novaParcela
    );
    
    if (contratoComSaldoMenor) {
      // Precisa de uma fase de ajuste
      const valorExato = contratoComSaldoMenor.saldoRemanescente;
      const sobra = contratoComSaldoMenor.novaParcela - valorExato;
      const contratosRestantes = calculosFase.filter(c => 
        !c.quitado && c.credor !== contratoComSaldoMenor.credor
      );
      const sobraPorContrato = contratosRestantes.length > 0 ? sobra / contratosRestantes.length : 0;
      
      const calculosAjuste: CalculoFase[] = calculosFase.map(c => {
        if (c.credor === contratoComSaldoMenor.credor) {
          return {
            ...c,
            novaParcela: valorExato,
            valorPago: valorExato,
            saldoRemanescente: 0,
            quitado: true
          };
        } else if (!c.quitado) {
          const novaParcelaComSobra = c.novaParcela + sobraPorContrato;
          return {
            ...c,
            novaParcela: novaParcelaComSobra,
            sobraRecebida: sobraPorContrato,
            valorPago: novaParcelaComSobra,
            saldoRemanescente: Math.max(0, c.saldoRemanescente - novaParcelaComSobra)
          };
        }
        return c;
      });
      
      fases.push({
        numeroFase: numeroFase++,
        duracaoMeses: 1,
        tipoFase: 'ajuste',
        calculos: calculosAjuste,
        creditoresQuitados: [contratoComSaldoMenor.credor],
        valorMensalTotal: novoEncargoMensal,
        encargoAnterior: encargoMensalAtual
      });
      
      // Atualizar contratos ativos após ajuste
      contratosAtivos = calculosAjuste
        .filter(c => !c.quitado)
        .map(c => {
          const contratoOriginal = contratosAtivos.find(orig => orig.credor === c.credor)!;
          return {
            ...contratoOriginal,
            saldoAtual: c.saldoRemanescente,
            novaParcela: c.novaParcela
          };
        });
    } else {
      // Atualizar contratos ativos normalmente
      contratosAtivos = calculosFase
        .filter(c => !c.quitado)
        .map(c => {
          const contratoOriginal = contratosAtivos.find(orig => orig.credor === c.credor)!;
          return {
            ...contratoOriginal,
            saldoAtual: c.saldoRemanescente
          };
        });
    }
    
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
  
  return {
    fases,
    resumo: {
      totalFases: fases.length,
      totalMeses,
      encargoAtual: encargoMensalAtual,
      novoEncargo: novoEncargoMensal,
      reducaoPercentual
    }
  };
}
