export interface Divida {
  id: string;
  credor: string;
  valor: number;
}

export interface DistribuicaoParcela {
  credor: string;
  valorOriginal: number;
  parcelaBase: number;
  sobraRecebida: number;
  parcelaTotal: number;
  saldoRestante: number;
  quitado: boolean;
}

export interface FasePagamento {
  numeroFase: number;
  quantidadeParcelas: number;
  tipoFase: string; // "normal" ou "ajuste"
  distribuicoes: DistribuicaoParcela[];
  creditoresQuitados: string[];
}
