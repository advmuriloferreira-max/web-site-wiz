import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Users, FileText, TrendingUp, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function SuperendividamentoDashboard() {
  const navigate = useNavigate();
  const [metricas, setMetricas] = useState({
    totalClientes: 0,
    planosAtivos: 0,
    planosConcluidos: 0,
    valorTotalRenegociado: 0,
    taxaSucesso: 0
  });

  useEffect(() => {
    const buscarMetricas = async () => {
      try {
        // Query para contar clientes
        const { count: clientesCount } = await supabase
          .from('clientes_superendividamento')
          .select('*', { count: 'exact', head: true });
        
        // Query para contar planos ativos
        const { count: planosAtivosCount } = await supabase
          .from('planos_pagamento')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'ativo');
        
        // Query para contar planos concluídos
        const { count: planosConcluidosCount } = await supabase
          .from('planos_pagamento')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'concluido');
        
        // Query para somar valor total renegociado
        const { data: planosData } = await supabase
          .from('planos_pagamento')
          .select('total_dividas');
        
        const valorTotal = planosData?.reduce((sum, plano) => sum + (plano.total_dividas || 0), 0) || 0;
        const taxaSucessoCalc = planosConcluidosCount && (planosAtivosCount + planosConcluidosCount) 
          ? (planosConcluidosCount / (planosAtivosCount + planosConcluidosCount)) * 100 
          : 0;
        
        setMetricas({
          totalClientes: clientesCount || 0,
          planosAtivos: planosAtivosCount || 0,
          planosConcluidos: planosConcluidosCount || 0,
          valorTotalRenegociado: valorTotal,
          taxaSucesso: taxaSucessoCalc
        });
      } catch (error) {
        console.error('Erro ao buscar métricas:', error);
      }
    };
    
    buscarMetricas();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Scale className="h-8 w-8" />
            Superendividamento
          </h1>
          <p className="text-muted-foreground mt-1">
            Módulo especializado na Lei 14.181/2021 para análise e repactuação de dívidas
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              Cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Planos Ativos
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.planosAtivos}</div>
            <p className="text-xs text-muted-foreground">
              Planos em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Renegociado</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {metricas.valorTotalRenegociado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Total renegociado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Sucesso
            </CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.taxaSucesso.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Taxa de sucesso ({metricas.planosConcluidos} concluídos)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/superendividamento/clientes')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gerenciar Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Cadastre e gerencie clientes superendividados
            </p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/superendividamento/analise')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Análise Socioeconômica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Calcule o mínimo existencial e capacidade de pagamento
            </p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/superendividamento/planos')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Planos de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Estruture repactuações em fases de até 60 meses
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
