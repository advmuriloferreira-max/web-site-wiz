import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function SuperendividamentoPlanos() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Planos de Pagamento
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão de planos de repactuação de dívidas
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planos Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Nenhum plano de pagamento criado ainda.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
