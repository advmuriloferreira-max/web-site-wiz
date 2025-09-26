import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProvisaoPerda, useProvisaoPerdaIncorrida } from "./useProvisao";
import { 
  calcularProvisao, 
  calcularDiasAtraso,
  diasParaMeses,
  determinarEstagioRisco,
  ClassificacaoRisco 
} from "@/lib/calculoProvisao";

export interface ContratoInput {
  cliente_id: string;
  banco_id: string;
  numero_contrato?: string | null;
  tipo_operacao?: string;
  tipo_operacao_bcb?: string;
  valor_divida: number;
  saldo_contabil?: number | null;
  data_ultimo_pagamento?: string | null;
  dias_atraso?: number;
  meses_atraso?: number;
  classificacao?: ClassificacaoRisco | null;
  percentual_provisao?: number;
  valor_provisao?: number;
  proposta_acordo?: number;
  // Novos campos
  data_entrada_escritorio?: string | null;
  tempo_escritorio?: number;
  forma_pagamento?: string | null;
  numero_parcelas?: number | null;
  valor_parcela?: number;
  escritorio_banco_acordo?: string | null;
  contato_acordo_nome?: string | null;
  contato_acordo_telefone?: string | null;
  acordo_final?: number;
  reducao_divida?: number;
  percentual_honorarios?: number;
  valor_honorarios?: number;
  situacao?: string;
  observacoes?: string | null;
  // Campos de reestruturação
  is_reestruturado?: boolean;
  data_reestruturacao?: string | null;
}

export const useCreateContrato = () => {
  const queryClient = useQueryClient();
  const { data: tabelaPerda } = useProvisaoPerda();
  const { data: tabelaIncorrida } = useProvisaoPerdaIncorrida();
  
  return useMutation({
    mutationFn: async (contratoInput: ContratoInput) => {
      // Calcular dias de atraso baseado na data do último pagamento se fornecida
      let diasAtraso = 0;
      if (contratoInput.data_ultimo_pagamento) {
        diasAtraso = calcularDiasAtraso(contratoInput.data_ultimo_pagamento);
        console.log(`Calculando dias de atraso baseado na data: ${contratoInput.data_ultimo_pagamento} = ${diasAtraso} dias`);
      } else if (contratoInput.dias_atraso) {
        diasAtraso = Number(contratoInput.dias_atraso) || 0;
        console.log(`Usando dias de atraso informados: ${diasAtraso} dias`);
      }

      let mesesAtraso = diasParaMeses(diasAtraso);
      let classificacao = contratoInput.classificacao;
      let percentualProvisao = contratoInput.percentual_provisao || 0;
      let valorProvisao = contratoInput.valor_provisao || 0;

      // Calcular estágio de risco automaticamente baseado nos dias de atraso
      const estagioRisco = determinarEstagioRisco(diasAtraso, contratoInput.is_reestruturado, contratoInput.data_reestruturacao);
      console.log(`Estágio de risco calculado: ${estagioRisco} (baseado em ${diasAtraso} dias de atraso)`);

      // Calcular provisão automaticamente se temos dados suficientes e tabelas carregadas
      // A classificação deve ser informada pelo usuário (vem no contrato original)
      if (tabelaPerda && tabelaIncorrida && contratoInput.classificacao) {
        // Regra: usar saldo contábil (Registrato) quando presente, senão usar valor da dívida
        const valorParaCalculo = contratoInput.saldo_contabil || contratoInput.valor_divida;
        
        const resultado = calcularProvisao({
          valorDivida: valorParaCalculo,
          diasAtraso,
          classificacao: contratoInput.classificacao,
          tabelaPerda,
          tabelaIncorrida,
          criterioIncorrida: "Dias de Atraso",
          isReestruturado: contratoInput.is_reestruturado,
          dataReestruturacao: contratoInput.data_reestruturacao,
        });

        percentualProvisao = resultado.percentualProvisao;
        valorProvisao = resultado.valorProvisao;
      }

      const contratoData = {
        ...contratoInput,
        tipo_operacao: contratoInput.tipo_operacao || null, // Campo legado, manter para compatibilidade
        dias_atraso: diasAtraso,
        meses_atraso: mesesAtraso,
        classificacao: classificacao,
        percentual_provisao: percentualProvisao,
        valor_provisao: valorProvisao,
        estagio_risco: estagioRisco,
        situacao: contratoInput.situacao || "Em análise",
      };

      const { data, error } = await supabase
        .from("contratos")
        .insert(contratoData)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar contrato: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      queryClient.invalidateQueries({ queryKey: ["contratos-stats"] });
      
      // Mostrar informações sobre os cálculos automáticos realizados
      if (data.valor_provisao > 0) {
        toast.success(`Contrato criado com cálculo automático de provisão: ${(data.percentual_provisao || 0).toFixed(2)}%`);
      } else {
        toast.success("Contrato criado com sucesso!");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};