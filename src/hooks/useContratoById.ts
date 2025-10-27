import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Contrato } from "./useContratos";

export const useContratoById = (contratoId: string | null) => {
  return useQuery({
    queryKey: ["contrato-by-id", contratoId],
    queryFn: async () => {
      if (!contratoId?.trim()) {
        return null;
      }

      const { data, error } = await supabase
        .from("contratos")
        .select(`
          *,
          clientes:clientes (id, nome, cpf_cnpj, email, telefone),
          bancos:bancos_provisao (id, nome),
          analises_provisionamento (
            id,
            valor_divida,
            dias_atraso,
            meses_atraso,
            classificacao_risco,
            percentual_provisao,
            valor_provisao,
            data_calculo,
            observacoes,
            created_at
          ),
          analises_juros_abusivos (
            id,
            taxa_contratual,
            taxa_media_bacen,
            diferenca_percentual,
            abusividade_detectada,
            data_analise,
            observacoes,
            created_at
          )
        `)
        .eq("id", contratoId.trim())
        .maybeSingle();

      if (error) {
        throw new Error(`Erro ao buscar contrato: ${error.message}`);
      }

      if (!data) return null;

      // Mapear análise de Gestão de Passivo mais recente
      const analisesPassivo = data.analises_provisionamento || [];
      const analisePassivo = analisesPassivo.length > 0
        ? analisesPassivo.sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]
        : null;

      // Mapear análise de Juros mais recente
      const analisesJuros = data.analises_juros_abusivos || [];
      const analiseJuros = analisesJuros.length > 0
        ? analisesJuros.sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]
        : null;

      // Retornar contrato com dados das análises mais recentes
      return {
        ...data,
        // Dados da análise de Gestão de Passivo Bancário
        valor_divida: analisePassivo?.valor_divida || data.valor_contrato || data.valor_financiado,
        dias_atraso: analisePassivo?.dias_atraso || 0,
        meses_atraso: analisePassivo?.meses_atraso || 0,
        classificacao: analisePassivo?.classificacao_risco,
        percentual_provisao: analisePassivo?.percentual_provisao,
        valor_provisao: analisePassivo?.valor_provisao,
        estagio_risco: analisePassivo?.classificacao_risco?.includes('Estágio 1') ? 1
                     : analisePassivo?.classificacao_risco?.includes('Estágio 2') ? 2
                     : analisePassivo?.classificacao_risco?.includes('Estágio 3') ? 3
                     : null,
        // Dados da análise de Juros Abusivos
        taxa_contratual: analiseJuros?.taxa_contratual,
        taxa_media_bacen: analiseJuros?.taxa_media_bacen,
        diferenca_percentual: analiseJuros?.diferenca_percentual,
        abusividade_detectada: analiseJuros?.abusividade_detectada,
      } as Contrato;
    },
    enabled: !!contratoId?.trim(),
    staleTime: 0,
    gcTime: 0,
  });
};
