import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Database, Calculator, Shield } from "lucide-react";

export default function Configuracoes() {
  const configuracoes = [
    {
      id: 1,
      categoria: "Sistema",
      nome: "Configurações Gerais",
      descricao: "Ajustes básicos do sistema",
      status: "Ativo",
      icon: Settings,
    },
    {
      id: 2,
      categoria: "Banco de Dados",
      nome: "Tabelas de Referência",
      descricao: "Gerenciar tabelas de provisão BCB",
      status: "Ativo",
      icon: Database,
    },
    {
      id: 3,
      categoria: "Cálculos",
      nome: "Parâmetros de Cálculo",
      descricao: "Configurar regras de provisão",
      status: "Ativo",
      icon: Calculator,
    },
    {
      id: 4,
      categoria: "Segurança",
      nome: "Controle de Acesso",
      descricao: "Gerenciar usuários e permissões",
      status: "Em desenvolvimento",
      icon: Shield,
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {configuracoes.map((config) => (
          <Card key={config.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <config.icon className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{config.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {config.categoria}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={config.status === "Ativo" ? "default" : "secondary"}
                >
                  {config.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {config.descricao}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}