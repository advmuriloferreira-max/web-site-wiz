import type { Contrato, FasePagamento, CalculoFase, ResultadoPlano, DividaImpagavel } from "@/types/superendividamento";

export function calcularPlanoCompleto(
  contratos: Contrato[],
  rendaLiquida: number,
  percentualRenda: number
): ResultadoPlano {
  
  // 1. Calcular encargo mensal total ATUAL
  const encargoMensalAtual = contratos.reduce((total, c) => total + c.parcelaMensalAtual, 0);
  
  // 2. Calcular novo valor mensal limitado (2 casas decimais)
  const novoEncargoMensal = Math.round(rendaLiquida * (percentualRenda / 100) * 100) / 100;
  
  // 3. Calcular percentual de cada parcela atual
  const contratosComPercentual = contratos.map(contrato => ({
    ...contrato,
    percentualAtual: Math.round((contrato.parcelaMensalAtual / encargoMensalAtual) * 100 * 100) / 100,
    saldoAtual: Math.round(contrato.valorTotalDivida * 100) / 100
  }));
  
  // 4. Calcular novas parcelas proporcionais (2 casas decimais)
  let contratosAtivos = contratosComPercentual.map(c => ({
    ...c,
    novaParcela: Math.round((c.percentualAtual / 100) * novoEncargoMensal * 100) / 100
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
    
    // 7. Calcular o que cada um paga nesta fase (2 casas decimais)
    const calculosFase: CalculoFase[] = prazosQuitacao.map(c => {
      const valorPago = Math.round(c.novaParcela * duracaoFase * 100) / 100;
      const novoSaldo = Math.round(Math.max(0, c.saldoAtual - valorPago) * 100) / 100;
      
      return {
        credor: c.credor,
        parcelaMensalAtual: Math.round(c.parcelaMensalAtual * 100) / 100,
        percentualAtual: Math.round(c.percentualAtual * 100) / 100,
        novaParcela: Math.round(c.novaParcela * 100) / 100,
        novoPercentual: Math.round((c.novaParcela / novoEncargoMensal) * 100 * 100) / 100,
        valorPago: valorPago,
        saldoRemanescente: novoSaldo,
        quitado: novoSaldo === 0
      };
    });
    
    // 8. Adicionar a fase normal
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
    
    // Atualizar contratos ativos após fase normal
    contratosAtivos = calculosFase
      .filter(c => !c.quitado)
      .map(c => {
        const contratoOriginal = contratosAtivos.find(orig => orig.credor === c.credor)!;
        return {
          ...contratoOriginal,
          saldoAtual: c.saldoRemanescente
        };
      });
    
    // 9. Loop para processar TODAS as fases de ajuste necessárias
    let precisaAjuste = true;
    let calculosAtuais = calculosFase;
    
    while (precisaAjuste && mesesAcumulados < LIMITE_MESES) {
      const contratoComSaldoMenor = calculosAtuais.find(c => 
        !c.quitado && c.saldoRemanescente < c.novaParcela
      );
      
      if (!contratoComSaldoMenor) {
        precisaAjuste = false;
        break;
      }
      
      // Criar fase de ajuste com valor exato (2 casas decimais)
      const valorExato = Math.round(contratoComSaldoMenor.saldoRemanescente * 100) / 100;
      const sobra = Math.round((contratoComSaldoMenor.novaParcela - valorExato) * 100) / 100;
      const contratosRestantes = calculosAtuais.filter(c => 
        !c.quitado && c.credor !== contratoComSaldoMenor.credor
      );
      const sobraPorContrato = contratosRestantes.length > 0 
        ? Math.round((sobra / contratosRestantes.length) * 100) / 100 
        : 0;
      
      const calculosAjuste: CalculoFase[] = calculosAtuais.map(c => {
        if (c.credor === contratoComSaldoMenor.credor) {
          return {
            ...c,
            novaParcela: valorExato,
            valorPago: valorExato,
            saldoRemanescente: 0,
            quitado: true
          };
        } else if (!c.quitado) {
          const novaParcelaComSobra = Math.round((c.novaParcela + sobraPorContrato) * 100) / 100;
          const novoSaldoAjuste = Math.round(Math.max(0, c.saldoRemanescente - novaParcelaComSobra) * 100) / 100;
          return {
            ...c,
            novaParcela: novaParcelaComSobra,
            sobraRecebida: sobraPorContrato,
            valorPago: novaParcelaComSobra,
            saldoRemanescente: novoSaldoAjuste
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
      
      mesesAcumulados += 1;
      
      // Atualizar contratos ativos e preparar para próxima possível fase de ajuste
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
      
      calculosAtuais = calculosAjuste;
    }
    
    // 10. Recalcular percentuais para próxima fase se ainda há contratos (2 casas decimais)
    if (contratosAtivos.length > 0) {
      const totalParcelasRestantes = contratosAtivos.reduce((total, c) => total + c.novaParcela, 0);
      contratosAtivos = contratosAtivos.map(c => ({
        ...c,
        percentualAtual: totalParcelasRestantes > 0 
          ? Math.round((c.novaParcela / totalParcelasRestantes) * 100 * 100) / 100 
          : 0,
        novaParcela: totalParcelasRestantes > 0 
          ? Math.round((c.novaParcela / totalParcelasRestantes) * novoEncargoMensal * 100) / 100 
          : 0
      }));
    }
  }
  
  const totalMeses = fases.reduce((total, fase) => total + fase.duracaoMeses, 0);
  const reducaoPercentual = Math.round(((encargoMensalAtual - novoEncargoMensal) / encargoMensalAtual) * 100 * 100) / 100;
  
  // Calcular dívidas impagáveis (2 casas decimais)
  const dividasImpagaveis = contratosAtivos.length > 0 ? contratosAtivos.map(c => ({
    credor: c.credor,
    saldoImpagavel: Math.round(c.saldoAtual * 100) / 100,
    valorTotalOriginal: Math.round(c.valorTotalDivida * 100) / 100,
    percentualQuitado: Math.round(((c.valorTotalDivida - c.saldoAtual) / c.valorTotalDivida) * 100 * 100) / 100
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
