import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardKPIs {
  totalClientes: number;
  totalContratos: number;
  analisesJurosAbusivos: number;
  totalAnalisesJuros: number;
  analisesPassivoAltoRisco: number;
  totalAnalisesPassivo: number;
  valorTotalEmAnalise: number;
}

interface UltimaAnalise {
  id: string;
  cliente_nome: string;
  cliente_id: string;
  tipo_analise: "Juros Abusivos" | "Passivo Bancário" | "Superendividamento";
  data_analise: string;
  resultado: string;
  resultado_badge: string;
}

interface BancoDistribuicao {
  banco_nome: string;
  total_contratos: number;
}

interface JurosStatus {
  status: string;
  total: number;
}

interface Alerta {
  tipo: "info" | "warning" | "error";
  mensagem: string;
  acao?: {
    label: string;
    url: string;
  };
}

export function useDashboardKPIs() {
  return useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: async (): Promise<DashboardKPIs> => {
      // Total de clientes
      const { count: totalClientes } = await supabase
        .from("clientes")
        .select("*", { count: "exact", head: true });

      // Total de contratos
      const { count: totalContratos } = await supabase
        .from("contratos")
        .select("*", { count: "exact", head: true });

      // Análises de juros abusivos
      const { data: analisesJuros } = await supabase
        .from("analises_juros_abusivos")
        .select("abusividade_detectada");

      const analisesJurosAbusivos = analisesJuros?.filter(a => a.abusividade_detectada).length || 0;
      const totalAnalisesJuros = analisesJuros?.length || 0;

      // Análises de passivo bancário (alto risco = C4 ou C5)
      const { data: analisesPassivo } = await supabase
        .from("analises_provisionamento")
        .select("classificacao_risco");

      const analisesPassivoAltoRisco = analisesPassivo?.filter(
        a => a.classificacao_risco === "C4" || a.classificacao_risco === "C5"
      ).length || 0;
      const totalAnalisesPassivo = analisesPassivo?.length || 0;

      // Valor total em análise (contratos com alguma análise)
      const { data: contratosComAnalise } = await supabase
        .from("contratos")
        .select(`
          valor_financiado,
          analises_juros_abusivos(id),
          analises_provisionamento(id)
        `);

      const valorTotalEmAnalise = contratosComAnalise?.reduce((acc, contrato) => {
        const temAnalise = 
          (contrato.analises_juros_abusivos && contrato.analises_juros_abusivos.length > 0) ||
          (contrato.analises_provisionamento && contrato.analises_provisionamento.length > 0);
        
        return temAnalise ? acc + (contrato.valor_financiado || 0) : acc;
      }, 0) || 0;

      return {
        totalClientes: totalClientes || 0,
        totalContratos: totalContratos || 0,
        analisesJurosAbusivos,
        totalAnalisesJuros,
        analisesPassivoAltoRisco,
        totalAnalisesPassivo,
        valorTotalEmAnalise,
      };
    },
  });
}

export function useUltimasAnalises() {
  return useQuery({
    queryKey: ["dashboard-ultimas-analises"],
    queryFn: async (): Promise<UltimaAnalise[]> => {
      const analises: UltimaAnalise[] = [];

      // Buscar últimas análises de juros abusivos
      const { data: juros } = await supabase
        .from("analises_juros_abusivos")
        .select(`
          id,
          data_analise,
          abusividade_detectada,
          diferenca_percentual,
          contratos!inner(
            id,
            clientes!inner(
              id,
              nome
            )
          )
        `)
        .order("data_analise", { ascending: false })
        .limit(5);

      if (juros) {
        juros.forEach((j: any) => {
          analises.push({
            id: j.id,
            cliente_nome: j.contratos.clientes.nome,
            cliente_id: j.contratos.clientes.id,
            tipo_analise: "Juros Abusivos",
            data_analise: j.data_analise,
            resultado: j.abusividade_detectada 
              ? `Abusividade Detectada (${j.diferenca_percentual?.toFixed(1)}%)` 
              : "Sem Abusividade",
            resultado_badge: j.abusividade_detectada ? "destructive" : "success",
          });
        });
      }

      // Buscar últimas análises de passivo bancário
      const { data: passivo } = await supabase
        .from("analises_provisionamento")
        .select(`
          id,
          data_calculo,
          classificacao_risco,
          percentual_provisao,
          contratos!inner(
            id,
            clientes!inner(
              id,
              nome
            )
          )
        `)
        .order("data_calculo", { ascending: false })
        .limit(5);

      if (passivo) {
        passivo.forEach((p: any) => {
          analises.push({
            id: p.id,
            cliente_nome: p.contratos.clientes.nome,
            cliente_id: p.contratos.clientes.id,
            tipo_analise: "Passivo Bancário",
            data_analise: p.data_calculo,
            resultado: `Provisão ${p.classificacao_risco} (${p.percentual_provisao?.toFixed(1)}%)`,
            resultado_badge: p.classificacao_risco === "C5" || p.classificacao_risco === "C4" 
              ? "destructive" 
              : "warning",
          });
        });
      }

      // Buscar últimas análises de superendividamento
      const { data: super_endiv } = await supabase
        .from("analises_superendividamento")
        .select(`
          id,
          data_analise,
          percentual_comprometimento,
          clientes!inner(
            id,
            nome
          )
        `)
        .order("data_analise", { ascending: false })
        .limit(5);

      if (super_endiv) {
        super_endiv.forEach((s: any) => {
          analises.push({
            id: s.id,
            cliente_nome: s.clientes.nome,
            cliente_id: s.clientes.id,
            tipo_analise: "Superendividamento",
            data_analise: s.data_analise,
            resultado: `Comprometimento ${s.percentual_comprometimento?.toFixed(1)}%`,
            resultado_badge: s.percentual_comprometimento > 30 ? "destructive" : "warning",
          });
        });
      }

      // Ordenar por data e retornar as 10 mais recentes
      return analises
        .sort((a, b) => new Date(b.data_analise).getTime() - new Date(a.data_analise).getTime())
        .slice(0, 10);
    },
  });
}

export function useBancoDistribuicao() {
  return useQuery({
    queryKey: ["dashboard-banco-distribuicao"],
    queryFn: async (): Promise<BancoDistribuicao[]> => {
      const { data, error } = await supabase
        .from("contratos")
        .select(`
          banco_id,
          bancos_provisao!inner(nome)
        `);

      if (error) throw error;

      // Agrupar por banco
      const bancoMap = new Map<string, number>();
      data?.forEach((contrato: any) => {
        const bancoNome = contrato.bancos_provisao?.nome || "Sem Banco";
        bancoMap.set(bancoNome, (bancoMap.get(bancoNome) || 0) + 1);
      });

      return Array.from(bancoMap.entries())
        .map(([banco_nome, total_contratos]) => ({ banco_nome, total_contratos }))
        .sort((a, b) => b.total_contratos - a.total_contratos);
    },
  });
}

export function useJurosStatusDistribuicao() {
  return useQuery({
    queryKey: ["dashboard-juros-status"],
    queryFn: async (): Promise<JurosStatus[]> => {
      const { data: contratos } = await supabase
        .from("contratos")
        .select(`
          id,
          analises_juros_abusivos(abusividade_detectada)
        `);

      let comAbusividade = 0;
      let semAbusividade = 0;
      let naoAnalisados = 0;

      contratos?.forEach((contrato: any) => {
        if (!contrato.analises_juros_abusivos || contrato.analises_juros_abusivos.length === 0) {
          naoAnalisados++;
        } else {
          const temAbusividade = contrato.analises_juros_abusivos.some(
            (a: any) => a.abusividade_detectada
          );
          if (temAbusividade) {
            comAbusividade++;
          } else {
            semAbusividade++;
          }
        }
      });

      return [
        { status: "Com Abusividade", total: comAbusividade },
        { status: "Sem Abusividade", total: semAbusividade },
        { status: "Não Analisados", total: naoAnalisados },
      ];
    },
  });
}

export function useDashboardAlertas() {
  return useQuery({
    queryKey: ["dashboard-alertas"],
    queryFn: async (): Promise<Alerta[]> => {
      const alertas: Alerta[] = [];

      // Contratos sem análise
      const { data: contratosSemAnalise } = await supabase
        .from("contratos")
        .select(`
          id,
          created_at,
          analises_juros_abusivos(id),
          analises_provisionamento(id)
        `)
        .order("created_at", { ascending: false });

      const contratosSemAnaliseCount = contratosSemAnalise?.filter((c: any) => 
        (!c.analises_juros_abusivos || c.analises_juros_abusivos.length === 0) &&
        (!c.analises_provisionamento || c.analises_provisionamento.length === 0)
      ).length || 0;

      if (contratosSemAnaliseCount > 0) {
        alertas.push({
          tipo: "warning",
          mensagem: `Você tem ${contratosSemAnaliseCount} contrato(s) recém-adicionado(s) que ainda não possuem nenhuma análise.`,
          acao: {
            label: "Ver Contratos",
            url: "/app/clientes",
          },
        });
      }

      // Análises com abusividade detectada
      const { count: analisesComAbusividade } = await supabase
        .from("analises_juros_abusivos")
        .select("*", { count: "exact", head: true })
        .eq("abusividade_detectada", true);

      if (analisesComAbusividade && analisesComAbusividade > 0) {
        alertas.push({
          tipo: "info",
          mensagem: `${analisesComAbusividade} análise(s) de juros indicaram abusividade e estão prontas para gerar relatório.`,
          acao: {
            label: "Ver Análises",
            url: "/app/analises/juros-abusivos",
          },
        });
      }

      // Clientes superendividados sem plano
      const { data: clientesSuperendividados } = await supabase
        .from("analises_superendividamento")
        .select(`
          id,
          cliente_id,
          percentual_comprometimento,
          planos_pagamento(id)
        `)
        .gt("percentual_comprometimento", 30);

      const clientesSemPlano = clientesSuperendividados?.filter(
        (c: any) => !c.planos_pagamento || c.planos_pagamento.length === 0
      ).length || 0;

      if (clientesSemPlano > 0) {
        alertas.push({
          tipo: "error",
          mensagem: `${clientesSemPlano} cliente(s) foram marcados como superendividados mas ainda não têm plano de pagamento.`,
          acao: {
            label: "Criar Planos",
            url: "/app/analises/superendividamento",
          },
        });
      }

      return alertas;
    },
  });
}
