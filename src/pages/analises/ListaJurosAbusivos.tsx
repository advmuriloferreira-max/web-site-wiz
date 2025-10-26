import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { FileText, Eye, Download, AlertTriangle } from "lucide-react";

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

export default function ListaJurosAbusivos() {
  const navigate = useNavigate();
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [busca, setBusca] = useState("");
  const [apenasAbusivos, setApenasAbusivos] = useState<string>("todos");

  const { data: analises, isLoading } = useQuery({
    queryKey: ["analises-juros-abusivos", dataInicio, dataFim, busca, apenasAbusivos],
    queryFn: async () => {
      let query = supabase
        .from("analises_juros_abusivos")
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
        query = query.gte("data_analise", dataInicio);
      }
      if (dataFim) {
        query = query.lte("data_analise", dataFim);
      }
      if (apenasAbusivos === "sim") {
        query = query.eq("abusividade_detectada", true);
      } else if (apenasAbusivos === "nao") {
        query = query.eq("abusividade_detectada", false);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filtrar por busca no cliente
      if (busca && data) {
        return data.filter((analise: any) => 
          analise.contrato?.cliente?.nome?.toLowerCase().includes(busca.toLowerCase())
        );
      }

      return data;
    },
  });

  const gerarRelatorio = (analiseId: string) => {
    toast.info("Gerando relatório judicial...");
    // TODO: Implementar geração de relatório judicial
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageBreadcrumbs 
        segments={[
          { label: "Análises", path: "/analises" },
          { label: "Juros Abusivos" },
        ]}
      />
      
      <div>
        <h1 className="text-3xl font-bold">Análises de Juros Abusivos</h1>
        <p className="text-muted-foreground">
          Comparação com Séries Temporais BACEN
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
              <Label>Abusividade</Label>
              <Select value={apenasAbusivos} onValueChange={setApenasAbusivos}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="sim">Apenas abusivos</SelectItem>
                  <SelectItem value="nao">Sem abusividade</SelectItem>
                </SelectContent>
              </Select>
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
                  <TableHead>Taxa Real</TableHead>
                  <TableHead>Taxa BACEN</TableHead>
                  <TableHead>Diferença</TableHead>
                  <TableHead>Abusividade</TableHead>
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
                        {analise.contrato?.cliente?.nome || "-"}
                      </TableCell>
                      <TableCell>
                        {analise.contrato?.numero_contrato || "-"}
                      </TableCell>
                      <TableCell>
                        {(analise.taxa_real_aplicada || 0).toFixed(4)}% a.m.
                      </TableCell>
                      <TableCell>
                        {(analise.taxa_media_bacen || 0).toFixed(4)}% a.m.
                      </TableCell>
                      <TableCell className={analise.diferenca_percentual > 20 ? "text-destructive font-medium" : ""}>
                        {(analise.diferenca_percentual || 0).toFixed(2)}%
                      </TableCell>
                      <TableCell>
                        {analise.abusividade_detectada ? (
                          <Badge className="bg-destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            DETECTADA
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Não detectada</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/app/contratos/${analise.contrato_id}/juros-abusivos`)
                            }
                            title="Visualizar análise"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => gerarRelatorio(analise.id)}
                            title="Gerar relatório judicial"
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
                            Realize análises de juros abusivos através dos contratos
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
