import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";

export default function SuperendividamentoAnalise() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            Análise Socioeconômica
          </h1>
          <p className="text-muted-foreground mt-1">
            Avaliação de capacidade de pagamento e mínimo existencial
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecione um Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Selecione um cliente para iniciar a análise socioeconômica completa.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
