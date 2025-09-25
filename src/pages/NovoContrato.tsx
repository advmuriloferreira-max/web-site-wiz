import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ContratoForm } from "@/components/forms/ContratoForm";

export default function NovoContrato() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/contratos");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/contratos")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Novo Contrato</h1>
          <p className="text-muted-foreground">
            Registre um novo contrato no sistema
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Contrato</CardTitle>
        </CardHeader>
        <CardContent>
          <ContratoForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}