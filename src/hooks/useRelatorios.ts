import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RelatorioProvisao {
  total_contratos: number;
  valor_total_dividas: number;
  valor_total_provisao: number;
  percentual_medio_provisao: number;
  contratos_por_classificacao: {
    classificacao: string;
    quantidade: number;
    valor_total: number;
    valor_provisao: number;
  }[];
}

export interface RelatorioPosicaoContratos {
  total_contratos: number;
  por_situacao: {
    situacao: string;
    quantidade: number;
    percentual: number;
  }[];
  contratos_recentes: {
    id: string;
    numero_contrato: string;
    cliente_nome: string;
    banco_nome: string;
    valor_divida: number;
    situacao: string;
    data_entrada: string;
  }[];
}

export interface RelatorioRisco {
  distribuicao_risco: {
    classificacao: string;
    quantidade: number;
    valor_total: number;
    percentual_provisao_medio: number;
  }[];
  clientes_alto_risco: {
    cliente_nome: string;
    total_contratos: number;
    valor_total_dividas: number;
    valor_total_provisao: number;
    classificacao_predominante: string;
  }[];
}

export const useRelatorioProvisao = () => {
  return useQuery({
    queryKey: ["relatorio-provisao"],
    queryFn: async () => {
      // Buscar dados agregados de provisões
      const { data: contratos, error } = await supabase
        .from("contratos_provisao")
        .select(`
          *,
          clientes:clientes_provisao (nome),
          bancos:bancos_provisao (nome)
        `);

      if (error) throw error;

      const totalContratos = contratos.length;
      const valorTotalDividas = contratos.reduce((sum, c) => sum + (c.valor_divida || 0), 0);
      const valorTotalProvisao = contratos.reduce((sum, c) => sum + (c.valor_provisao || 0), 0);
      const percentualMedioProvisao = valorTotalDividas > 0 ? (valorTotalProvisao / valorTotalDividas) * 100 : 0;

      // Agrupar por classificação
      const porClassificacao = contratos.reduce((acc: any, contrato) => {
        const classificacao = contrato.classificacao || "Não classificado";
        if (!acc[classificacao]) {
          acc[classificacao] = {
            classificacao,
            quantidade: 0,
            valor_total: 0,
            valor_provisao: 0
          };
        }
        acc[classificacao].quantidade++;
        acc[classificacao].valor_total += contrato.valor_divida || 0;
        acc[classificacao].valor_provisao += contrato.valor_provisao || 0;
        return acc;
      }, {});

      const contratosPorClassificacao = Object.values(porClassificacao);

      return {
        total_contratos: totalContratos,
        valor_total_dividas: valorTotalDividas,
        valor_total_provisao: valorTotalProvisao,
        percentual_medio_provisao: percentualMedioProvisao,
        contratos_por_classificacao: contratosPorClassificacao
      } as RelatorioProvisao;
    },
  });
};

export const useRelatorioPosicaoContratos = () => {
  return useQuery({
    queryKey: ["relatorio-posicao"],
    queryFn: async () => {
      const { data: contratos, error } = await supabase
        .from("contratos_provisao")
        .select(`
          *,
          clientes:clientes_provisao (nome),
          bancos:bancos_provisao (nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalContratos = contratos.length;
      
      // Agrupar por situação
      const porSituacao = contratos.reduce((acc: any, contrato) => {
        const situacao = contrato.situacao || "Não informado";
        acc[situacao] = (acc[situacao] || 0) + 1;
        return acc;
      }, {});

      const porSituacaoArray = Object.entries(porSituacao).map(([situacao, quantidade]) => ({
        situacao,
        quantidade: quantidade as number,
        percentual: totalContratos > 0 ? ((quantidade as number) / totalContratos) * 100 : 0
      }));

      // Contratos mais recentes (últimos 10)
      const contratosRecentes = contratos.slice(0, 10).map((contrato: any) => ({
        id: contrato.id,
        numero_contrato: contrato.numero_contrato || "S/N",
        cliente_nome: contrato.clientes?.nome || "Cliente não informado",
        banco_nome: contrato.bancos?.nome || "Banco não informado",
        valor_divida: contrato.valor_divida || 0,
        situacao: contrato.situacao || "Não informado",
        data_entrada: contrato.data_entrada || contrato.created_at
      }));

      return {
        total_contratos: totalContratos,
        por_situacao: porSituacaoArray,
        contratos_recentes: contratosRecentes
      } as RelatorioPosicaoContratos;
    },
  });
};

export const useRelatorioRisco = () => {
  return useQuery({
    queryKey: ["relatorio-risco"],
    queryFn: async () => {
      const { data: contratos, error } = await supabase
        .from("contratos_provisao")
        .select(`
          *,
          clientes:clientes_provisao (nome),
          bancos:bancos_provisao (nome)
        `);

      if (error) throw error;

      // Distribuição por risco
      const distribuicaoRisco = contratos.reduce((acc: any, contrato) => {
        const classificacao = contrato.classificacao || "Não classificado";
        if (!acc[classificacao]) {
          acc[classificacao] = {
            classificacao,
            quantidade: 0,
            valor_total: 0,
            valor_provisao_total: 0
          };
        }
        acc[classificacao].quantidade++;
        acc[classificacao].valor_total += contrato.valor_divida || 0;
        acc[classificacao].valor_provisao_total += contrato.valor_provisao || 0;
        return acc;
      }, {});

      const distribuicaoArray = Object.values(distribuicaoRisco).map((item: any) => ({
        ...item,
        percentual_provisao_medio: item.valor_total > 0 ? (item.valor_provisao_total / item.valor_total) * 100 : 0
      }));

      // Clientes com alto risco (C4, C5 ou alta provisão)
      const clientesRisco = contratos.reduce((acc: any, contrato: any) => {
        const clienteId = contrato.cliente_id;
        const clienteNome = contrato.clientes?.nome || "Cliente não informado";
        
        if (!acc[clienteId]) {
          acc[clienteId] = {
            cliente_nome: clienteNome,
            total_contratos: 0,
            valor_total_dividas: 0,
            valor_total_provisao: 0,
            classificacoes: {}
          };
        }
        
        acc[clienteId].total_contratos++;
        acc[clienteId].valor_total_dividas += contrato.valor_divida || 0;
        acc[clienteId].valor_total_provisao += contrato.valor_provisao || 0;
        
        const classificacao = contrato.classificacao || "Não classificado";
        acc[clienteId].classificacoes[classificacao] = (acc[clienteId].classificacoes[classificacao] || 0) + 1;
        
        return acc;
      }, {});

      const clientesAltoRisco = Object.values(clientesRisco)
        .map((cliente: any) => {
          // Encontrar classificação predominante
          const classificacoes = Object.entries(cliente.classificacoes);
          const predominante = classificacoes.reduce((max, current) => 
            current[1] > max[1] ? current : max
          );
          
          return {
            ...cliente,
            classificacao_predominante: predominante[0],
            percentual_provisao: cliente.valor_total_dividas > 0 ? 
              (cliente.valor_total_provisao / cliente.valor_total_dividas) * 100 : 0
          };
        })
        .filter((cliente: any) => 
          cliente.classificacao_predominante === "C4" || 
          cliente.classificacao_predominante === "C5" ||
          cliente.percentual_provisao > 50
        )
        .sort((a: any, b: any) => b.valor_total_provisao - a.valor_total_provisao);

      return {
        distribuicao_risco: distribuicaoArray,
        clientes_alto_risco: clientesAltoRisco
      } as RelatorioRisco;
    },
  });
};