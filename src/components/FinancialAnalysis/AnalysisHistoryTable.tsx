import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useContratoAnalyses, useDeleteAnalysis } from "@/hooks/useBacenRates";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";

interface AnalysisHistoryTableProps {
  contratoId: string;
}

export default function AnalysisHistoryTable({ contratoId }: AnalysisHistoryTableProps) {
  const queryClient = useQueryClient();
  const { data: analyses, isLoading } = useContratoAnalyses(contratoId);
  const deleteAnalysis = useDeleteAnalysis();

  const handleDelete = async (analysisId: string) => {
    if (!confirm("Deseja realmente excluir esta análise?")) return;
    
    await deleteAnalysis.mutateAsync(analysisId);
    queryClient.invalidateQueries({ queryKey: ["contrato-analyses", contratoId] });
    queryClient.invalidateQueries({ queryKey: ["latest-analysis", contratoId] });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Carregando histórico...</p>
        </CardContent>
      </Card>
    );
  }

  if (!analyses || analyses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Análises</CardTitle>
          <CardDescription>
            Nenhuma análise realizada ainda
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Análises</CardTitle>
        <CardDescription>
          Consultas anteriores da taxa Bacen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data da Consulta</TableHead>
              <TableHead>Taxa Bacen</TableHead>
              <TableHead>Referência</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analyses.map((analysis) => (
              <TableRow key={analysis.id}>
                <TableCell>
                  {format(
                    new Date(analysis.data_consulta || analysis.created_at),
                    "dd/MM/yyyy HH:mm",
                    { locale: ptBR }
                  )}
                </TableCell>
                <TableCell>
                  {analysis.taxa_bacen ? `${analysis.taxa_bacen.toFixed(2)}%` : "N/A"}
                </TableCell>
                <TableCell>{analysis.taxa_referencia || "N/A"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(analysis.id)}
                    disabled={deleteAnalysis.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
