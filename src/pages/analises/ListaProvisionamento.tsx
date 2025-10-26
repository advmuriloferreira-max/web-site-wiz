import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { FileText, Eye, Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function ListaProvisionamento() {
  const navigate = useNavigate();
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [busca, setBusca] = useState("");
  const [classificacao, setClassificacao] = useState<string>("");

  const { data: analises, isLoading, error } = useQuery({
    queryKey: ["analises-provisionamento", dataInicio, dataFim, busca, classificacao],
    queryFn: async () => {
      try {
        let query = supabase
          .from("analises_provisionamento")
          .select(`
            *,
            contrato:contratos(
              id,
              numero_contrato,
              cliente:clientes(id, nome)
            )
          `)
          .order("created_at", { ascending: false });

        if (dataInicio) {
          query = query.gte("data_calculo", dataInicio);
        }
        if (dataFim) {
          query = query.lte("data_calculo", dataFim);
        }
        if (classificacao) {
          query = query.eq("classificacao_risco", classificacao);
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
            analise.contrato?.cliente?.nome?.toLowerCase().includes(busca.toLowerCase())
          );
        }

        return data || [];
      } catch (error) {
        console.error("Erro na query:", error);
        return [];
      }
    },
  });

  // Mostrar erro se houver
  useEffect(() => {
    if (error) {
      toast.error("Erro ao carregar análises de provisionamento");
    }
  }, [error]);

  const getClassificacaoBadge = (classificacao: string) => {
    const classes: Record<string, string> = {
      "Estágio 1": "bg-green-500",
      "Estágio 2": "bg-yellow-500",
      "Estágio 3": "bg-red-500",
    };
    return classes[classificacao] || "bg-secondary";
  };

  const gerarRelatorio = (analiseId: string) => {
    toast.info("Gerando relatório...");
    // TODO: Implementar geração de relatório
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
          { label: "Provisionamento" },
        ]}
      />
      
      <div>
        <h1 className="text-3xl font-bold">Análises de Provisionamento</h1>
        <p className="text-muted-foreground">
          Conforme Resolução 4966 BACEN e 352 CMN
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
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

            <div className="space-y-2">
              <Label>Classificação</Label>
              <Select value={classificacao} onValueChange={setClassificacao}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Estágio 1">Estágio 1</SelectItem>
                  <SelectItem value="Estágio 2">Estágio 2</SelectItem>
                  <SelectItem value="Estágio 3">Estágio 3</SelectItem>
                </SelectContent>
              </Select>
              {classificacao && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setClassificacao("")}
                  className="w-full text-xs"
                >
                  Limpar filtro
                </Button>
              )}
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
                  <TableHead>Contrato</TableHead>
                  <TableHead>Valor Dívida</TableHead>
                  <TableHead>Dias Atraso</TableHead>
                  <TableHead>Classificação</TableHead>
                  <TableHead>Provisão</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analises && analises.length > 0 ? (
                  analises.map((analise: any) => (
                    <TableRow key={analise.id}>
                      <TableCell>
                        {analise.data_calculo
                          ? format(new Date(analise.data_calculo), "dd/MM/yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {analise.contrato?.cliente?.nome || "-"}
                      </TableCell>
                      <TableCell>
                        {analise.contrato?.numero_contrato || "-"}
                      </TableCell>
                      <TableCell>
                        R${" "}
                        {(analise.valor_divida || 0).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>{analise.dias_atraso || 0} dias</TableCell>
                      <TableCell>
                        <Badge className={getClassificacaoBadge(analise.classificacao_risco)}>
                          {analise.classificacao_risco || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        R${" "}
                        {(analise.valor_provisao || 0).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/app/contratos/${analise.contrato_id}/provisionamento`)
                            }
                            title="Visualizar análise"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => gerarRelatorio(analise.id)}
                            title="Gerar relatório"
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
                            Realize análises de provisionamento através dos contratos
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
