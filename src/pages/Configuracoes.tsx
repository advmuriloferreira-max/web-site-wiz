import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Database, Calculator, Shield, ArrowLeft } from "lucide-react";
import { ConfiguracoesGerais } from "@/components/configuracoes/ConfiguracoesGerais";
import { TabelasReferencia } from "@/components/configuracoes/TabelasReferencia";
import { ParametrosCalculo } from "@/components/configuracoes/ParametrosCalculo";
import { ControleAcesso } from "@/components/configuracoes/ControleAcesso";
import { Separator } from "@/components/ui/separator";

type ConfiguracaoTipo = "gerais" | "tabelas" | "calculos" | "acesso" | null;

export default function Configuracoes() {
  const [configuracaoAtiva, setConfiguracaoAtiva] = useState<ConfiguracaoTipo>(null);

  const configuracoes = [
    {
      id: "gerais" as ConfiguracaoTipo,
      nome: "Configurações Gerais",
      descricao: "Informações da empresa e configurações básicas do sistema",
      categoria: "Sistema",
      icon: Settings,
      cor: "text-blue-600",
      disponivel: true
    },
    {
      id: "tabelas" as ConfiguracaoTipo,
      nome: "Tabelas de Referência",
      descricao: "Gerenciar tabelas oficiais BCB para cálculo de provisões",
      categoria: "Banco de Dados",
      icon: Database,
      cor: "text-green-600",
      disponivel: true
    },
    {
      id: "calculos" as ConfiguracaoTipo,
      nome: "Parâmetros de Cálculo",
      descricao: "Configurar regras automáticas para cálculos e provisões",
      categoria: "Cálculos",
      icon: Calculator,
      cor: "text-orange-600",
      disponivel: true
    },
    {
      id: "acesso" as ConfiguracaoTipo,
      nome: "Controle de Acesso",
      descricao: "Gerenciar usuários, permissões e segurança do sistema",
      categoria: "Segurança",
      icon: Shield,
      cor: "text-red-600",
      disponivel: true
    },
  ];

  const renderConfiguracaoSelecionada = () => {
    switch (configuracaoAtiva) {
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
    const config = configuracoes.find(c => c.id === configuracaoAtiva);
    
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {config?.nome}
            </h1>
            <p className="text-muted-foreground">
              {config?.descricao}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setConfiguracaoAtiva(null)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar às Configurações
          </Button>
        </div>
        <Separator />
        {renderConfiguracaoSelecionada()}
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
            <div className="text-2xl font-bold text-green-600">✓</div>
            <div className="text-sm font-medium">Banco de Dados</div>
            <div className="text-xs text-muted-foreground">Conectado</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">✓</div>
            <div className="text-sm font-medium">Cálculos BCB</div>
            <div className="text-xs text-muted-foreground">Atualizados</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">1</div>
            <div className="text-sm font-medium">Usuários Ativos</div>
            <div className="text-xs text-muted-foreground">Sistema</div>
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
                  {config.disponivel ? "Disponível" : "Em breve"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {config.descricao}
              </p>
              <Button 
                className="w-full" 
                onClick={() => setConfiguracaoAtiva(config.id)}
                disabled={!config.disponivel}
              >
                <Settings className="mr-2 h-4 w-4" />
                {config.disponivel ? "Configurar" : "Em breve"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-semibold">Versão:</span>
              <p className="text-muted-foreground">1.0.0</p>
            </div>
            <div>
              <span className="font-semibold">Ambiente:</span>
              <p className="text-muted-foreground">Produção</p>
            </div>
            <div>
              <span className="font-semibold">Última Atualização:</span>
              <p className="text-muted-foreground">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <span className="font-semibold">Conformidade BCB:</span>
              <p className="text-green-600 font-medium">✓ Atualizado</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}