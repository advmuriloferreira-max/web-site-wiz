import { useNavigate } from "react-router-dom";
import { Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ListaAnalises() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Gestão de Passivo Bancário</h1>
        <p className="text-muted-foreground">
          Análise de provisões conforme Resolução BCB 352/2023
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/app/gestao-passivo/nova")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Nova Análise</CardTitle>
                <CardDescription>Criar análise de passivo bancário</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Preencha os dados do contrato para calcular provisões e oportunidades de negociação
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-primary/50 bg-gradient-to-br from-primary/5 to-background" onClick={() => navigate("/app/gestao-passivo/dashboard")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Dashboard de Oportunidades</CardTitle>
                <CardDescription className="text-primary">Premium</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Visualize as melhores oportunidades de negociação baseadas em provisões BCB
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
