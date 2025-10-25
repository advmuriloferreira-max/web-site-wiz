export interface Contrato {
  id: string;
  credor: string;
  valorTotalDivida: number;
  parcelaMensalAtual: number;  // Campo obrigatório para cálculo de percentuais
  parcelasRestantes?: number;  // Opcional, apenas informativo
}

export interface CalculoFase {
  credor: string;
  parcelaMensalAtual: number;
  percentualAtual: number;
  novaParcela: number;
  novoPercentual: number;
  valorPago: number;
  saldoRemanescente: number;
  quitado: boolean;
  sobraRecebida?: number;
}

export interface FasePagamento {
  numeroFase: number;
  duracaoMeses: number;
  tipoFase: 'normal' | 'ajuste';
  calculos: CalculoFase[];
  creditoresQuitados: string[];
  valorMensalTotal: number;
  encargoAnterior: number;
}

export interface ResultadoPlano {
  fases: FasePagamento[];
  resumo: {
    totalFases: number;
    totalMeses: number;
    encargoAtual: number;
    novoEncargo: number;
    reducaoPercentual: number;
  };
}
