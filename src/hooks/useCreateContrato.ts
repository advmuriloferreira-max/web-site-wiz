import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProvisaoPerda, useProvisaoPerdaIncorrida } from "./useProvisao";
import { 
  calcularProvisao, 
  classificarRisco, 
  calcularDiasAtraso,
  diasParaMeses,
  ClassificacaoRisco 
} from "@/lib/calculoProvisao";

export interface ContratoInput {
  cliente_id: string;
  banco_id: string;
  numero_contrato?: string | null;
  tipo_operacao: string;
  valor_divida: number;
  saldo_contabil?: number | null;
  data_ultimo_pagamento?: string | null;
  data_vencimento?: string | null;
  dias_atraso?: number;
  meses_atraso?: number;
  classificacao?: ClassificacaoRisco | null;
  percentual_provisao?: number;
  valor_provisao?: number;
  situacao?: string;
  observacoes?: string | null;
}

export const useCreateContrato = () => {
  const queryClient = useQueryClient();
  const { data: tabelaPerda } = useProvisaoPerda();
  const { data: tabelaIncorrida } = useProvisaoPerdaIncorrida();
  
  return useMutation({
    mutationFn: async (contratoInput: ContratoInput) => {
      // Calcular automações baseadas nos dados informados
      let diasAtraso = contratoInput.dias_atraso || 0;
      let mesesAtraso = contratoInput.meses_atraso || 0;
      let classificacao = contratoInput.classificacao;
      let percentualProvisao = contratoInput.percentual_provisao || 0;
      let valorProvisao = contratoInput.valor_provisao || 0;

      // Se tem data de vencimento, calcular dias de atraso automaticamente
      if (contratoInput.data_vencimento) {
        diasAtraso = calcularDiasAtraso(contratoInput.data_vencimento);
        mesesAtraso = diasParaMeses(diasAtraso);
      }

      // Calcular provisão automaticamente se temos dados suficientes e tabelas carregadas
      // A classificação deve ser informada pelo usuário (vem no contrato original)
      if (tabelaPerda && tabelaIncorrida && contratoInput.classificacao) {
        const resultado = calcularProvisao({
          valorDivida: contratoInput.valor_divida,
          diasAtraso,
          classificacao: contratoInput.classificacao,
          tabelaPerda,
          tabelaIncorrida,
          criterioIncorrida: "Dias de Atraso",
        });

        percentualProvisao = Math.max(resultado.percentualPerda, resultado.percentualIncorrida);
        valorProvisao = resultado.valorProvisaoTotal;
      }

      const contratoData = {
        ...contratoInput,
        dias_atraso: diasAtraso,
        meses_atraso: mesesAtraso,
        classificacao: classificacao,
        percentual_provisao: percentualProvisao,
        valor_provisao: valorProvisao,
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