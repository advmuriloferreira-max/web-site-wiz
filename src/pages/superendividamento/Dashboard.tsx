import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Users, FileText, TrendingUp } from "lucide-react";

export default function SuperendividamentoDashboard() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Scale className="h-8 w-8" />
            Superendividamento
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão conforme Lei 14.181/2021
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Planos Ativos
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Volume Total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0,00</div>
            <p className="text-xs text-muted-foreground">
              Em dívidas gerenciadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Sucesso
            </CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">
              Planos concluídos
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sobre o Módulo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Este módulo permite a gestão completa de casos de superendividamento conforme a Lei 14.181/2021,
            incluindo análise socioeconômica, cálculo de capacidade de pagamento e criação de planos de
            repactuação de dívidas.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Funcionalidades Principais</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Cadastro completo de clientes</li>
                <li>• Análise de renda e despesas</li>
                <li>• Cálculo do mínimo existencial</li>
                <li>• Criação automática de planos</li>
                <li>• Distribuição proporcional de dívidas</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Conformidade Legal</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Lei 14.181/2021</li>
                <li>• Código de Defesa do Consumidor</li>
                <li>• Limite de 30% ou 35% da renda</li>
                <li>• Respeito ao mínimo existencial</li>
                <li>• Priorização de dívidas essenciais</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
