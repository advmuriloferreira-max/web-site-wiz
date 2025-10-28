import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUltimasAnalises } from "@/hooks/useDashboardData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExternalLink } from "lucide-react";

export function UltimasAnalisesTable() {
  const { data: analises, isLoading } = useUltimasAnalises();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Últimas Análises Realizadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Carregando análises...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analises || analises.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Últimas Análises Realizadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Nenhuma análise realizada ainda.</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Últimas Análises Realizadas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo de Análise</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analises.map((analise) => (
                <TableRow key={analise.id}>
                  <TableCell>
                    <Link 
                      to={`/app/clientes/${analise.cliente_id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {analise.cliente_nome}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{analise.tipo_analise}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(analise.data_analise), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={analise.resultado_badge as any}>
                      {analise.resultado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/app/clientes/${analise.cliente_id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
