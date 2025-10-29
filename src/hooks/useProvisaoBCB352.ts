import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Hook para buscar dados da tabela provisao_bcb352_anexo1 (Perda Incorrida - 90+ dias)
export function useProvisaoAnexo1() {
  return useQuery({
    queryKey: ["provisao_bcb352_anexo1"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provisao_bcb352_anexo1")
        .select("*")
        .order("meses_min", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

// Hook para buscar dados da tabela provisao_bcb352_anexo2 (Perda Esperada - 0-90 dias)
export function useProvisaoAnexo2() {
  return useQuery({
    queryKey: ["provisao_bcb352_anexo2"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provisao_bcb352_anexo2")
        .select("*")
        .order("dias_min", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

// Hook para buscar percentual específico do Anexo I
export function usePercentualAnexo1(carteira: string, mesesAtraso: number) {
  return useQuery({
    queryKey: ["provisao_anexo1", carteira, mesesAtraso],
    queryFn: async () => {
      const colunaCarteira = `${carteira.toLowerCase()}_percentual`;
      
      const { data, error } = await supabase
        .from("provisao_bcb352_anexo1")
        .select(colunaCarteira)
        .lte("meses_min", mesesAtraso)
        .or(`meses_max.gte.${mesesAtraso},meses_max.is.null`)
        .single();

      if (error) throw error;
      return (data?.[colunaCarteira] || 100) / 100;
    },
    enabled: !!carteira && mesesAtraso >= 0,
  });
}

// Hook para buscar percentual específico do Anexo II
export function usePercentualAnexo2(carteira: string, diasAtraso: number) {
  return useQuery({
    queryKey: ["provisao_anexo2", carteira, diasAtraso],
    queryFn: async () => {
      const colunaCarteira = `${carteira.toLowerCase()}_percentual`;
      
      const { data, error } = await supabase
        .from("provisao_bcb352_anexo2")
        .select(colunaCarteira)
        .gte("dias_max", diasAtraso)
        .lte("dias_min", diasAtraso)
        .single();

      if (error) throw error;
      return (data?.[colunaCarteira] || 10) / 100;
    },
    enabled: !!carteira && diasAtraso >= 0 && diasAtraso <= 90,
  });
}
