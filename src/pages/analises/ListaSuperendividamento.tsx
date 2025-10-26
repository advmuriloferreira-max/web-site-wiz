import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { FileText, Eye, Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";

export default function ListaSuperendividamento() {
  const navigate = useNavigate();
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [busca, setBusca] = useState("");

  const { data: analises, isLoading, error } = useQuery({
    queryKey: ["analises-superendividamento", dataInicio, dataFim, busca],
    queryFn: async () => {
      try {
        let query = supabase
          .from("analises_superendividamento")
          .select(`
            *,
            cliente:clientes(id, nome, cpf_cnpj)
          `)
          .order("created_at", { ascending: false });

        if (dataInicio) {
          query = query.gte("data_analise", dataInicio);
        }
        if (dataFim) {
          query = query.lte("data_analise", dataFim);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error("Erro ao buscar análises:", error);
          toast.error(`Erro ao carregar análises: ${error.message}`);
          throw error;
        }

        // Filtrar por busca no cliente
        if (busca && data) {
          return data.filter((analise: any) => 
            analise.cliente?.nome?.toLowerCase().includes(busca.toLowerCase())
          );
        }

        return data || [];
      } catch (error) {
        console.error("Erro na query:", error);
        return [];
      }
    },
  });

  useEffect(() => {
    if (error) {
      toast.error("Erro ao carregar análises de superendividamento");
    }
  }, [error]);

  const gerarPeticao = (analiseId: string, clienteId: string) => {
    toast.info("Gerando petição judicial...");
    // TODO: Implementar geração de petição judicial
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageBreadcrumbs 
        segments={[
          { label: "Análises", path: "/analises" },
          { label: "Superendividamento" },
        ]}
      />
      
      <div>
        <h1 className="text-3xl font-bold">Análises de Superendividamento</h1>
        <p className="text-muted-foreground">
          Lei 14.181/2021 - Limite de 30% da renda
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Buscar Cliente</Label>
              <Input
                placeholder="Nome do cliente..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Análises Realizadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Renda Líquida</TableHead>
                  <TableHead>Total Dívidas</TableHead>
                  <TableHead>Encargo Atual</TableHead>
                  <TableHead>Novo Encargo</TableHead>
                  <TableHead>Redução</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analises && analises.length > 0 ? (
                  analises.map((analise: any) => (
                    <TableRow key={analise.id}>
                      <TableCell>
                        {analise.data_analise
                          ? format(new Date(analise.data_analise), "dd/MM/yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {analise.cliente?.nome || "-"}
                      </TableCell>
                      <TableCell>
                        R${" "}
                        {(analise.renda_liquida || 0).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        R${" "}
                        {(analise.total_dividas || 0).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-destructive font-medium">
                        R${" "}
                        {(analise.encargo_mensal_atual || 0).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-primary font-medium">
                        R${" "}
                        {(analise.encargo_mensal_proposto || 0).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-600">
                          {(analise.reducao_percentual || 0).toFixed(2)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/app/clientes/${analise.cliente_id}/superendividamento`)
                            }
                            title="Visualizar plano"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => gerarPeticao(analise.id, analise.cliente_id)}
                            title="Gerar petição judicial"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-4">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                        <div className="space-y-2">
                          <p className="font-medium">Nenhuma análise encontrada</p>
                          <p className="text-sm text-muted-foreground">
                            Realize análises de superendividamento através dos clientes
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
