import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useValidacaoLimites() {
  const { usuarioEscritorio } = useAuth();

  const { data: limites } = useQuery({
    queryKey: ["limites-escritorio", usuarioEscritorio?.escritorio_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("escritorios")
        .select("limite_usuarios, limite_clientes, limite_contratos")
        .eq("id", usuarioEscritorio?.escritorio_id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!usuarioEscritorio?.escritorio_id,
  });

  const validarNovoUsuario = async () => {
    const { count } = await supabase
      .from("usuarios_escritorio")
      .select("*", { count: "exact", head: true })
      .eq("escritorio_id", usuarioEscritorio?.escritorio_id);

    return count! < limites!.limite_usuarios;
  };

  const validarNovoCliente = async () => {
    const { count } = await supabase
      .from("clientes")
      .select("*", { count: "exact", head: true })
      .eq("escritorio_id", usuarioEscritorio?.escritorio_id);

    return count! < limites!.limite_clientes;
  };

  const validarNovoContrato = async () => {
    const { count } = await supabase
      .from("contratos")
      .select("*", { count: "exact", head: true })
      .eq("escritorio_id", usuarioEscritorio?.escritorio_id);

    return count! < limites!.limite_contratos;
  };

  return {
    limites,
    validarNovoUsuario,
    validarNovoCliente,
    validarNovoContrato,
  };
}
