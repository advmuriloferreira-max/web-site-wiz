import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, TrendingUp, DollarSign } from "lucide-react";

interface ClienteRisco {
  nome: string;
  totalDividas: number;
  totalProvisao: number;
  percentualProvisao: number;
  quantidadeContratos: number;
  classificacaoMaisAlta: string;
}

export function ClientesAnalysisChart() {
  const { data: clientesRisco, isLoading } = useQuery({
    queryKey: ["clientes-provisao-analise"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contratos_provisao")
        .select(`
          valor_divida,
          valor_provisao,
          percentual_provisao,
          classificacao,
          clientes:clientes_provisao (nome)
        `);
      
      if (error) throw error;

      // Agrupar por cliente
      const clientesMap = new Map<string, ClienteRisco>();
      
      data.forEach((contrato: any) => {
        const nomeCliente = contrato.clientes?.nome || "Cliente não identificado";
        
        if (!clientesMap.has(nomeCliente)) {
          clientesMap.set(nomeCliente, {
            nome: nomeCliente,
            totalDividas: 0,
            totalProvisao: 0,
            percentualProvisao: 0,
            quantidadeContratos: 0,
            classificacaoMaisAlta: "C1"
          });
        }
        
        const cliente = clientesMap.get(nomeCliente)!;
        cliente.totalDividas += Number(contrato.valor_divida) || 0;
        cliente.totalProvisao += Number(contrato.valor_provisao) || 0;
        cliente.quantidadeContratos += 1;
        
        // Determinar classificação mais alta (C5 > C4 > C3 > C2 > C1)
        const classificacoes = ["C1", "C2", "C3", "C4", "C5"];
        const classificacaoAtual = contrato.classificacao || "C1";
        const classificacaoAtualIndex = classificacoes.indexOf(classificacaoAtual);
        const classificacaoMaisAltaIndex = classificacoes.indexOf(cliente.classificacaoMaisAlta);
        
        if (classificacaoAtualIndex > classificacaoMaisAltaIndex) {
          cliente.classificacaoMaisAlta = classificacaoAtual;
        }
      });
      
      // Calcular percentual de provisão e ordenar por risco
      const clientesArray = Array.from(clientesMap.values()).map(cliente => {
        cliente.percentualProvisao = cliente.totalDividas > 0 
          ? (cliente.totalProvisao / cliente.totalDividas) * 100 
          : 0;
        return cliente;
      });
      
      // Ordenar por percentual de provisão (maior risco primeiro)
      return clientesArray
        .sort((a, b) => b.percentualProvisao - a.percentualProvisao)
        .slice(0, 8); // Top 8 clientes de maior risco
    }
  });

  // Classificação representa TIPO de operação, não risco temporal
  const getClassificacaoColor = (classificacao: string) => {
    switch (classificacao) {
      case "C1": return "bg-blue-100 text-blue-800 border-blue-200";
      case "C2": return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "C3": return "bg-purple-100 text-purple-800 border-purple-200";
      case "C4": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "C5": return "bg-violet-100 text-violet-800 border-violet-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Quanto MAIOR a provisão, MELHOR a oportunidade de negociação
  const getOportunidadeLevel = (percentual: number) => {
    if (percentual >= 70) return { level: "Excelente", color: "text-green-600", icon: TrendingUp };
    if (percentual >= 40) return { level: "Boa", color: "text-blue-600", icon: TrendingUp };
    if (percentual >= 20) return { level: "Regular", color: "text-yellow-600", icon: AlertTriangle };
    return { level: "Aguardar", color: "text-gray-600", icon: AlertTriangle };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Clientes por Risco</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Melhores Oportunidades de Negociação</CardTitle>
        <p className="text-sm text-muted-foreground">
          Top 8 clientes com maior % de provisão bancária (maior interesse do banco em negociar)
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {clientesRisco?.map((cliente, index) => {
            const oportunidade = getOportunidadeLevel(cliente.percentualProvisao);
            const OportunidadeIcon = oportunidade.icon;
            
            return (
              <div key={cliente.nome} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{cliente.nome}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className={getClassificacaoColor(cliente.classificacaoMaisAlta)}>
                        {cliente.classificacaoMaisAlta}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {cliente.quantidadeContratos} contrato{cliente.quantidadeContratos !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-1">
                    <OportunidadeIcon className={`h-4 w-4 ${oportunidade.color}`} />
                    <span className={`text-sm font-medium ${oportunidade.color}`}>
                      {cliente.percentualProvisao.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className={oportunidade.color}>{oportunidade.level}</span>
                    {" • "}
                    <span>R$ {(cliente.totalDividas / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}