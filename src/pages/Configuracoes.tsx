import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Database, Calculator, Shield, ArrowLeft, Users, RefreshCw } from "lucide-react";
import { ConfiguracoesGerais } from "@/components/configuracoes/ConfiguracoesGerais";
import { TabelasReferencia } from "@/components/configuracoes/TabelasReferencia";
import { ParametrosCalculo } from "@/components/configuracoes/ParametrosCalculo";
import { ControleAcesso } from "@/components/configuracoes/ControleAcesso";
import { GerenciarUsuarios } from "@/components/admin/GerenciarUsuarios";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

type ConfiguracaoTipo = "usuarios" | "gerais" | "tabelas" | "calculos" | "acesso" | null;

export default function Configuracoes() {
  const [configuracaoAtiva, setConfiguracaoAtiva] = useState<ConfiguracaoTipo>(null);
  const { isAdmin } = useAuth();

  const configuracoes = [
    ...(isAdmin ? [{
      id: "usuarios" as ConfiguracaoTipo,
      nome: "Gerenciar Usuários",
      descricao: "Controle de usuários e permissões do sistema",
      categoria: "Administração",
      icon: Users,
      cor: "text-blue-600",
      disponivel: true
    }] : []),
    {
      id: "gerais" as ConfiguracaoTipo,
      nome: "Configurações Gerais",
      descricao: "Configurações básicas do sistema e personalização",
      categoria: "Sistema",
      icon: Settings,
      cor: "text-gray-600",
      disponivel: true
    },
    {
      id: "tabelas" as ConfiguracaoTipo,
      nome: "Tabelas de Referência",
      descricao: "Bancos, tipos de operação e outras referências",
      categoria: "Dados",
      icon: Database,
      cor: "text-green-600",
      disponivel: true
    },
    {
      id: "calculos" as ConfiguracaoTipo,
      nome: "Parâmetros de Cálculo",
      descricao: "Regras e percentuais para cálculo de provisão",
      categoria: "Negócio",
      icon: Calculator,
      cor: "text-purple-600",
      disponivel: true
    },
    {
      id: "acesso" as ConfiguracaoTipo,
      nome: "Controle de Acesso",
      descricao: "Permissões e níveis de acesso por usuário",
      categoria: "Segurança",
      icon: Shield,
      cor: "text-red-600",
      disponivel: isAdmin
    }
  ];

  const renderConfiguracao = () => {
    switch (configuracaoAtiva) {
      case "usuarios":
        return <GerenciarUsuarios />;
      case "gerais":
        return <ConfiguracoesGerais />;
      case "tabelas":
        return <TabelasReferencia />;
      case "calculos":
        return <ParametrosCalculo />;
      case "acesso":
        return <ControleAcesso />;
      default:
        return null;
    }
  };

  if (configuracaoAtiva) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setConfiguracaoAtiva(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {configuracoes.find(c => c.id === configuracaoAtiva)?.nome}
            </h1>
            <p className="text-muted-foreground">
              {configuracoes.find(c => c.id === configuracaoAtiva)?.descricao}
            </p>
          </div>
        </div>
        
        {renderConfiguracao()}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie todas as configurações do sistema de forma organizada
        </p>
      </div>

      {/* Resumo do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">✓</div>
            <div className="text-sm font-medium">Sistema</div>
            <div className="text-xs text-muted-foreground">Operacional</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{configuracoes.filter(c => c.disponivel).length}</div>
            <div className="text-sm font-medium">Módulos</div>
            <div className="text-xs text-muted-foreground">Disponíveis</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">100%</div>
            <div className="text-sm font-medium">Sincronizado</div>
            <div className="text-xs text-muted-foreground">Base de dados</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">v2.0</div>
            <div className="text-sm font-medium">Versão</div>
            <div className="text-xs text-muted-foreground">Atualizada</div>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Configuração */}
      <div className="grid gap-6 md:grid-cols-2">
        {configuracoes.map((config) => (
          <Card key={config.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <config.icon className={`h-8 w-8 ${config.cor}`} />
                  <div>
                    <CardTitle className="text-lg">{config.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {config.categoria}
                    </p>
                  </div>
                </div>
                <Badge variant={config.disponivel ? "default" : "secondary"}>
                  {config.disponivel ? "Disponível" : "Restrito"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {config.descricao}
              </p>
              <Button 
                onClick={() => setConfiguracaoAtiva(config.id)}
                disabled={!config.disponivel}
                className="w-full"
                variant={config.disponivel ? "default" : "secondary"}
              >
                {config.disponivel ? "Configurar" : "Acesso Restrito"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="font-medium">Última Sincronização</Label>
              <p className="text-muted-foreground">Agora mesmo</p>
            </div>
            <div>
              <Label className="font-medium">Backup Automático</Label>
              <p className="text-muted-foreground">Ativo (Diário às 02:00)</p>
            </div>
            <div>
              <Label className="font-medium">Modo de Operação</Label>
              <p className="text-muted-foreground">Produção</p>
            </div>
            <div>
              <Label className="font-medium">Suporte Técnico</Label>
              <p className="text-muted-foreground">Disponível 24/7</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}