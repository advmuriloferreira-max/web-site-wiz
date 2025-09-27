import { z } from "zod";

// Schema para cada etapa do wizard
export const etapa1Schema = z.object({
  cliente_id: z.string().min(1, "Cliente é obrigatório"),
  banco_id: z.string().min(1, "Banco é obrigatório"),
  numero_contrato: z.string().optional(),
});

export const etapa2Schema = z.object({
  tipo_operacao_bcb: z.string().min(1, "Tipo de operação BCB é obrigatório"),
  valor_divida: z.string().min(1, "Valor da dívida é obrigatório").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Valor da dívida deve ser um número válido maior que zero" }
  ),
  saldo_contabil: z.string().optional(),
  data_ultimo_pagamento: z.string().optional(),
  data_entrada_escritorio: z.string().optional(),
});

export const etapa3Schema = z.object({
  dias_atraso: z.string().optional(),
  meses_atraso: z.string().optional(),
  classificacao: z.enum(["C1", "C2", "C3", "C4", "C5"]).optional(),
  percentual_provisao: z.string().optional(),
  valor_provisao: z.string().optional(),
  proposta_acordo: z.string().optional(),
});

export const etapa4Schema = z.object({
  forma_pagamento: z.enum(["a_vista", "parcelado"]).optional(),
  numero_parcelas: z.string().optional(),
  valor_parcela: z.string().optional(),
  escritorio_banco_acordo: z.string().optional(),
  contato_acordo_nome: z.string().optional(),
  contato_acordo_telefone: z.string().optional(),
  observacoes: z.string().optional(),
  is_reestruturado: z.boolean().optional(),
  data_reestruturacao: z.date().optional(),
}).partial(); // Tornar todos os campos completamente opcionais

export const etapa5Schema = z.object({
  acordo_final: z.string().optional(),
  reducao_divida: z.string().optional(),
  percentual_honorarios: z.enum(["10", "15", "20"]).optional(),
  valor_honorarios: z.string().optional(),
  situacao: z.enum(["Em análise", "Em negociação", "Em processo judicial", "Acordo Finalizado"]).optional(),
  tempo_escritorio: z.string().optional(),
}).partial(); // Tornar todos os campos completamente opcionais

// Schema completo
export const contratoWizardSchema = etapa1Schema
  .merge(etapa2Schema)
  .merge(etapa3Schema)
  .merge(etapa4Schema)
  .merge(etapa5Schema);

export type Etapa1Data = z.infer<typeof etapa1Schema>;
export type Etapa2Data = z.infer<typeof etapa2Schema>;
export type Etapa3Data = z.infer<typeof etapa3Schema>;
export type Etapa4Data = z.infer<typeof etapa4Schema>;
export type Etapa5Data = z.infer<typeof etapa5Schema>;
export type ContratoWizardData = z.infer<typeof contratoWizardSchema>;

export interface WizardStep {
  id: number;
  title: string;
  description: string;
  schema: z.ZodSchema<any>;
  isCompleted?: boolean;
}