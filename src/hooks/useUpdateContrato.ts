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
import { ContratoInput } from "./useCreateContrato";

export interface UpdateContratoInput extends ContratoInput {
  id: string;
}

export const useUpdateContrato = () => {
  const queryClient = useQueryClient();
  const { data: tabelaPerda } = useProvisaoPerda();
  const { data: tabelaIncorrida } = useProvisaoPerdaIncorrida();
  
  return useMutation({
    mutationFn: async (contratoInput: UpdateContratoInput) => {
      // Calcular dias de atraso baseado na data do último pagamento se fornecida
      let diasAtraso = 0;
      if (contratoInput.data_ultimo_pagamento) {
        diasAtraso = calcularDiasAtraso(contratoInput.data_ultimo_pagamento);
        console.log(`Atualizando - Calculando dias de atraso baseado na data: ${contratoInput.data_ultimo_pagamento} = ${diasAtraso} dias`);
      } else if (contratoInput.dias_atraso) {
        diasAtraso = Number(contratoInput.dias_atraso) || 0;
        console.log(`Atualizando - Usando dias de atraso informados: ${diasAtraso} dias`);
      }

      let mesesAtraso = diasParaMeses(diasAtraso);
      let classificacao = contratoInput.classificacao;
      let percentualProvisao = contratoInput.percentual_provisao || 0;
      let valorProvisao = contratoInput.valor_provisao || 0;

      // Calcular estágio de risco automaticamente baseado nos dias de atraso
      const estagioRisco = determinarEstagioRisco(diasAtraso);
      console.log(`Atualizando - Estágio de risco calculado: ${estagioRisco} (baseado em ${diasAtraso} dias de atraso)`);

      // Calcular provisão automaticamente se temos dados suficientes e tabelas carregadas
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
        });

        percentualProvisao = resultado.percentualProvisao;
        valorProvisao = resultado.valorProvisao;
      }

      const { id, ...updateData } = contratoInput;
      const contratoData = {
        ...updateData,
        tipo_operacao: updateData.tipo_operacao || null, // Campo legado, manter para compatibilidade
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
        .update(contratoData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar contrato: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      queryClient.invalidateQueries({ queryKey: ["contratos-stats"] });
      queryClient.invalidateQueries({ queryKey: ["contrato-by-numero"] });
      
      // Mostrar informações sobre os cálculos automáticos realizados
      if (data.valor_provisao > 0) {
        toast.success(`Contrato atualizado com cálculo automático de provisão: ${(data.percentual_provisao || 0).toFixed(2)}%`);
      } else {
        toast.success("Contrato atualizado com sucesso!");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};