import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Relatorios() {
  const relatorios = [
    {
      id: 1,
      nome: "Relatório de Provisões",
      descricao: "Análise completa das provisões por período",
      status: "Disponível",
      ultimaAtualizacao: "23/09/2024",
      icon: TrendingUp,
    },
    {
      id: 2,
      nome: "Posição de Contratos",
      descricao: "Status atual de todos os contratos",
      status: "Disponível",
      ultimaAtualizacao: "23/09/2024",
      icon: FileText,
    },
    {
      id: 3,
      nome: "Análise de Risco",
      descricao: "Classificação de risco por cliente",
      status: "Em desenvolvimento",
      ultimaAtualizacao: "20/09/2024",
      icon: Calendar,
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground">
          Gere e visualize relatórios do sistema
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatorios.map((relatorio) => (
          <Card key={relatorio.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <relatorio.icon className="h-8 w-8 text-primary" />
                <Badge
                  variant={relatorio.status === "Disponível" ? "default" : "secondary"}
                >
                  {relatorio.status}
                </Badge>
              </div>
              <CardTitle className="text-lg">{relatorio.nome}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {relatorio.descricao}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Última atualização:</span>
                <span>{relatorio.ultimaAtualizacao}</span>
              </div>
              <Button 
                className="w-full" 
                disabled={relatorio.status !== "Disponível"}
              >
                <Download className="mr-2 h-4 w-4" />
                Gerar Relatório
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}