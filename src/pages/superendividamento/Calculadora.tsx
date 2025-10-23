import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";

export default function SuperendividamentoCalculadora() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            Calculadora Rápida
          </h1>
          <p className="text-muted-foreground mt-1">
            Cálculo rápido de capacidade de pagamento
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calculadora de Superendividamento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Ferramenta de cálculo rápido em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
