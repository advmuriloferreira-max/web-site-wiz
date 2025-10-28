export type CarteiraBCB352 = 'C1' | 'C2' | 'C3' | 'C4' | 'C5';

export type TipoOperacaoGestaoPassivo = 
  | 'Cartão de Crédito'
  | 'Cheque Especial'
  | 'Empréstimo Pessoal'
  | 'Empréstimo Consignado'
  | 'Capital de Giro'
  | 'CCB Empresarial'
  | 'Financiamento de Veículo'
  | 'Leasing'
  | 'Outros';

export type MotivoDefault = 
  | 'Atraso superior a 90 dias'
  | 'Reestruturação'
  | 'Falência decretada'
  | 'Recuperação judicial'
  | 'Recuperação extrajudicial'
  | 'Medida judicial'
  | 'Descumprimento de cláusulas contratuais';

export type TipoGarantia = 
  | 'Hipoteca'
  | 'Penhor'
  | 'Alienação Fiduciária'
  | 'Aval'
  | 'Fiança'
  | 'Outras';

export type StatusNegociacao = 
  | 'pendente'
  | 'proposta_enviada'
  | 'em_analise'
  | 'contraproposta'
  | 'aceita'
  | 'recusada'
  | 'acordo_fechado';

export type MomentoNegociacao = 
  | 'inicial'
  | 'favoravel'
  | 'muito_favoravel'
  | 'otimo'
  | 'premium'
  | 'total';

export interface AnaliseGestaoPassivo {
  id: string;
  usuario_id: string;
  cliente_id: string;
  numero_contrato: string;
  banco_nome: string;
  banco_codigo_compe: string | null;
  banco_segmento: string | null;
  carteira_bcb352: CarteiraBCB352;
  tipo_operacao: TipoOperacaoGestaoPassivo;
  valor_original: number;
  saldo_devedor_atual: number;
  data_contratacao: string;
  data_vencimento_original: string | null;
  data_inadimplencia: string;
  dias_atraso: number;
  meses_atraso: number;
  percentual_provisao_bcb352: number;
  valor_provisao_bcb352: number;
  valor_proposta_acordo: number | null;
  percentual_proposta_acordo: number | null;
  marco_provisionamento: string | null;
  momento_negociacao: MomentoNegociacao | null;
  em_default: boolean;
  motivo_default: MotivoDefault[] | null;
  foi_reestruturado: boolean;
  data_reestruturacao: string | null;
  provisao_adicional_reestruturacao: number | null;
  possui_garantias: boolean;
  valor_garantias: number | null;
  tipo_garantias: TipoGarantia[] | null;
  status_negociacao: StatusNegociacao;
  data_proposta_enviada: string | null;
  data_resposta_banco: string | null;
  observacoes_negociacao: string | null;
  fundamentacao_juridica: string | null;
  estrategia_negociacao: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export const TIPO_OPERACAO_CARTEIRA_MAP: Record<TipoOperacaoGestaoPassivo, CarteiraBCB352> = {
  'Cartão de Crédito': 'C1',
  'Cheque Especial': 'C1',
  'Empréstimo Pessoal': 'C1',
  'Empréstimo Consignado': 'C2',
  'Capital de Giro': 'C3',
  'CCB Empresarial': 'C3',
  'Financiamento de Veículo': 'C4',
  'Leasing': 'C4',
  'Outros': 'C5'
};
