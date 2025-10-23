import type { Divida, FasePagamento, DistribuicaoParcela } from "@/types/superendividamento";

export function calcularPlanoCompleto(
  dividas: Divida[],
  rendaLiquida: number,
  percentualRenda: number
): FasePagamento[] {
  const valorMensalDisponivel = rendaLiquida * (percentualRenda / 100);
  let dividasAtivas = [...dividas];
  let fases: FasePagamento[] = [];
  let parcelasJaCalculadas = 0;
  
  while (dividasAtivas.length > 0 && parcelasJaCalculadas < 60) {
    const totalDividas = dividasAtivas.reduce((soma, d) => soma + d.valor, 0);
    
    // Calcular parcela proporcional para cada credor
    const parcelasProporcionais = dividasAtivas.map(divida => {
      const proporcao = divida.valor / totalDividas;
      const parcelaBase = valorMensalDisponivel * proporcao;
      return {
        credor: divida.credor,
        valorDivida: divida.valor,
        parcelaBase: parcelaBase,
        parcelasNecessarias: divida.valor / parcelaBase
      };
    });
    
    // Descobrir quantas parcelas completas conseguimos fazer
    const menorQuantidadeParcelas = Math.min(...parcelasProporcionais.map(p => p.parcelasNecessarias));
    const parcelasCompletas = Math.floor(menorQuantidadeParcelas);
    
    // Se conseguimos fazer parcelas completas
    if (parcelasCompletas > 0) {
      const parcelasRestantes = 60 - parcelasJaCalculadas;
      const parcelasParaEstaFase = Math.min(parcelasCompletas, parcelasRestantes);
      
      const distribuicoesFaseNormal: DistribuicaoParcela[] = parcelasProporcionais.map(p => ({
        credor: p.credor,
        valorOriginal: p.valorDivida,
        parcelaBase: p.parcelaBase,
        sobraRecebida: 0,
        parcelaTotal: p.parcelaBase,
        saldoRestante: p.valorDivida - (p.parcelaBase * parcelasParaEstaFase),
        quitado: false
      }));
      
      fases.push({
        numeroFase: fases.length + 1,
        quantidadeParcelas: parcelasParaEstaFase,
        tipoFase: "normal",
        distribuicoes: distribuicoesFaseNormal,
        creditoresQuitados: []
      });
      
      parcelasJaCalculadas += parcelasParaEstaFase;
      
      // Atualizar dívidas ativas com os saldos restantes
      dividasAtivas = dividasAtivas.map((d, index) => ({
        ...d,
        valor: distribuicoesFaseNormal[index].saldoRestante
      })).filter(d => d.valor > 0);
    }
    
    // Verificar se precisa de fase de ajuste (quando alguém vai quitar com sobra)
    if (dividasAtivas.length > 0 && parcelasJaCalculadas < 60) {
      const totalAtual = dividasAtivas.reduce((soma, d) => soma + d.valor, 0);
      
      const proporcoesAtuais = dividasAtivas.map(divida => {
        const proporcao = divida.valor / totalAtual;
        return {
          credor: divida.credor,
          valorDivida: divida.valor,
          parcelaBase: valorMensalDisponivel * proporcao
        };
      });
      
      // Encontrar quem precisa de menos dinheiro que sua parcela base (vai quitar)
      const quemVaiQuitar = proporcoesAtuais.filter(p => p.valorDivida < p.parcelaBase);
      
      if (quemVaiQuitar.length > 0) {
        const quemContinua = proporcoesAtuais.filter(p => !quemVaiQuitar.some(q => q.credor === p.credor));
        
        // Calcular sobra total
        let sobraTotal = 0;
        quemVaiQuitar.forEach(q => {
          sobraTotal += (q.parcelaBase - q.valorDivida);
        });
        
        // Dividir sobra igualmente entre quem continua
        const sobraPorPessoa = quemContinua.length > 0 ? sobraTotal / quemContinua.length : 0;
        
        const distribuicoesFaseAjuste: DistribuicaoParcela[] = [];
        
        // Adicionar quem vai quitar
        quemVaiQuitar.forEach(q => {
          distribuicoesFaseAjuste.push({
            credor: q.credor,
            valorOriginal: q.valorDivida,
            parcelaBase: q.parcelaBase,
            sobraRecebida: 0,
            parcelaTotal: q.valorDivida,
            saldoRestante: 0,
            quitado: true
          });
        });
        
        // Adicionar quem continua (recebe sobra)
        quemContinua.forEach(q => {
          const parcelaTotal = q.parcelaBase + sobraPorPessoa;
          distribuicoesFaseAjuste.push({
            credor: q.credor,
            valorOriginal: q.valorDivida,
            parcelaBase: q.parcelaBase,
            sobraRecebida: sobraPorPessoa,
            parcelaTotal: parcelaTotal,
            saldoRestante: Math.max(0, q.valorDivida - parcelaTotal),
            quitado: false
          });
        });
        
        fases.push({
          numeroFase: fases.length + 1,
          quantidadeParcelas: 1,
          tipoFase: "ajuste",
          distribuicoes: distribuicoesFaseAjuste,
          creditoresQuitados: quemVaiQuitar.map(q => q.credor)
        });
        
        parcelasJaCalculadas += 1;
        
        // Atualizar dívidas ativas
        dividasAtivas = dividasAtivas.map(d => {
          const distribuicao = distribuicoesFaseAjuste.find(dist => dist.credor === d.credor);
          return {
            ...d,
            valor: distribuicao?.saldoRestante || 0
          };
        }).filter(d => d.valor > 0);
      }
    }
  }
  
  return fases;
}
