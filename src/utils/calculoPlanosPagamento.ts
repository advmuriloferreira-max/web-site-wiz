import type { Contrato, FasePagamento, CalculoFase, ResultadoPlano } from "@/types/superendividamento";

export function calcularPlanoCompleto(
  contratos: Contrato[],
  rendaLiquida: number,
  percentualRenda: number
): ResultadoPlano {
  const valorMensalDisponivel = rendaLiquida * (percentualRenda / 100);
  
  // Calcular encargo atual (soma das parcelas mensais atuais)
  const encargoAtual = contratos.reduce((soma, c) => soma + c.parcelaMensalAtual, 0);
  const percentualEncargoAtual = (encargoAtual / rendaLiquida) * 100;
  
  let contratosAtivos = [...contratos];
  let fases: FasePagamento[] = [];
  let mesesCalculados = 0;
  
  while (contratosAtivos.length > 0 && mesesCalculados < 60) {
    const totalDividas = contratosAtivos.reduce((soma, c) => soma + c.valorTotalDivida, 0);
    
    // Calcular parcela proporcional para cada contrato
    const calculosProporcionais = contratosAtivos.map(contrato => {
      const proporcao = contrato.valorTotalDivida / totalDividas;
      const novaParcela = valorMensalDisponivel * proporcao;
      const novoPercentual = (novaParcela / rendaLiquida) * 100;
      const percentualAtual = (contrato.parcelaMensalAtual / rendaLiquida) * 100;
      
      return {
        contrato,
        novaParcela,
        novoPercentual,
        percentualAtual,
        mesesNecessarios: contrato.valorTotalDivida / novaParcela
      };
    });
    
    // Descobrir quantos meses completos conseguimos fazer
    const menorQuantidadeMeses = Math.min(...calculosProporcionais.map(c => c.mesesNecessarios));
    const mesesCompletos = Math.floor(menorQuantidadeMeses);
    
    // Se conseguimos fazer meses completos (fase normal)
    if (mesesCompletos > 0) {
      const mesesRestantes = 60 - mesesCalculados;
      const mesesParaEstaFase = Math.min(mesesCompletos, mesesRestantes);
      
      const calculosFaseNormal: CalculoFase[] = calculosProporcionais.map(c => ({
        credor: c.contrato.credor,
        parcelaMensalAtual: c.contrato.parcelaMensalAtual,
        percentualAtual: c.percentualAtual,
        novaParcela: c.novaParcela,
        novoPercentual: c.novoPercentual,
        valorPago: c.novaParcela * mesesParaEstaFase,
        saldoRemanescente: c.contrato.valorTotalDivida - (c.novaParcela * mesesParaEstaFase),
        quitado: false
      }));
      
      fases.push({
        numeroFase: fases.length + 1,
        duracaoMeses: mesesParaEstaFase,
        tipoFase: "normal",
        calculos: calculosFaseNormal,
        creditoresQuitados: [],
        valorMensalTotal: valorMensalDisponivel,
        encargoAnterior: percentualEncargoAtual
      });
      
      mesesCalculados += mesesParaEstaFase;
      
      // Atualizar contratos ativos
      contratosAtivos = contratosAtivos.map((c, index) => ({
        ...c,
        valorTotalDivida: calculosFaseNormal[index].saldoRemanescente
      })).filter(c => c.valorTotalDivida > 0);
    }
    
    // Verificar se precisa de fase de ajuste (quando alguém vai quitar com sobra)
    if (contratosAtivos.length > 0 && mesesCalculados < 60) {
      const totalAtual = contratosAtivos.reduce((soma, c) => soma + c.valorTotalDivida, 0);
      
      const proporcoesAtuais = contratosAtivos.map(contrato => {
        const proporcao = contrato.valorTotalDivida / totalAtual;
        const novaParcela = valorMensalDisponivel * proporcao;
        const novoPercentual = (novaParcela / rendaLiquida) * 100;
        const percentualAtual = (contrato.parcelaMensalAtual / rendaLiquida) * 100;
        
        return {
          contrato,
          novaParcela,
          novoPercentual,
          percentualAtual
        };
      });
      
      // Encontrar quem precisa de menos dinheiro que sua parcela base (vai quitar)
      const quemVaiQuitar = proporcoesAtuais.filter(p => p.contrato.valorTotalDivida < p.novaParcela);
      
      if (quemVaiQuitar.length > 0) {
        const quemContinua = proporcoesAtuais.filter(p => !quemVaiQuitar.some(q => q.contrato.id === p.contrato.id));
        
        // Calcular sobra total
        let sobraTotal = 0;
        quemVaiQuitar.forEach(q => {
          sobraTotal += (q.novaParcela - q.contrato.valorTotalDivida);
        });
        
        // Dividir sobra igualmente entre quem continua
        const sobraPorContrato = quemContinua.length > 0 ? sobraTotal / quemContinua.length : 0;
        
        const calculosFaseAjuste: CalculoFase[] = [];
        
        // Adicionar quem vai quitar
        quemVaiQuitar.forEach(q => {
          calculosFaseAjuste.push({
            credor: q.contrato.credor,
            parcelaMensalAtual: q.contrato.parcelaMensalAtual,
            percentualAtual: q.percentualAtual,
            novaParcela: q.novaParcela,
            novoPercentual: q.novoPercentual,
            valorPago: q.contrato.valorTotalDivida,
            saldoRemanescente: 0,
            quitado: true
          });
        });
        
        // Adicionar quem continua (recebe sobra)
        quemContinua.forEach(q => {
          const novaParcelaComSobra = q.novaParcela + sobraPorContrato;
          const novoPercentualComSobra = (novaParcelaComSobra / rendaLiquida) * 100;
          
          calculosFaseAjuste.push({
            credor: q.contrato.credor,
            parcelaMensalAtual: q.contrato.parcelaMensalAtual,
            percentualAtual: q.percentualAtual,
            novaParcela: q.novaParcela,
            novoPercentual: novoPercentualComSobra,
            valorPago: novaParcelaComSobra,
            saldoRemanescente: Math.max(0, q.contrato.valorTotalDivida - novaParcelaComSobra),
            quitado: false,
            sobraRecebida: sobraPorContrato
          });
        });
        
        fases.push({
          numeroFase: fases.length + 1,
          duracaoMeses: 1,
          tipoFase: "ajuste",
          calculos: calculosFaseAjuste,
          creditoresQuitados: quemVaiQuitar.map(q => q.contrato.credor),
          valorMensalTotal: valorMensalDisponivel,
          encargoAnterior: percentualEncargoAtual
        });
        
        mesesCalculados += 1;
        
        // Atualizar contratos ativos
        contratosAtivos = contratosAtivos.map(c => {
          const calculo = calculosFaseAjuste.find(calc => calc.credor === c.credor);
          return {
            ...c,
            valorTotalDivida: calculo?.saldoRemanescente || 0
          };
        }).filter(c => c.valorTotalDivida > 0);
      }
    }
  }
  
  return {
    fases,
    resumo: {
      totalFases: fases.length,
      totalMeses: mesesCalculados,
      encargoAtual: percentualEncargoAtual,
      novoEncargo: (valorMensalDisponivel / rendaLiquida) * 100,
      reducaoPercentual: percentualEncargoAtual - ((valorMensalDisponivel / rendaLiquida) * 100)
    }
  };
}
