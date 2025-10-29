import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProvisaoPerda = () => {
  return useQuery({
    queryKey: ["provisao-perda-esperada"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provisao_perda_esperada")
        .select("*")
        .order("prazo_inicial", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useProvisaoPerdaIncorrida = () => {
  return useQuery({
    queryKey: ["provisao-perdas-incorridas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provisao_perdas_incorridas")
        .select("*")
        .order("prazo_inicial", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};
