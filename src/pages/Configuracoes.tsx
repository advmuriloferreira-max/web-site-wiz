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
import { ResponsiveContainer } from "@/components/ui/layout-consistency";
import { GlassCard } from "@/components/ui/glassmorphism";
import { GradientText } from "@/components/ui/gradient-elements";
import { ColoredIcon } from "@/components/ui/color-consistency";
import { ModernBadge } from "@/components/ui/modern-badge";

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
      <ResponsiveContainer className="py-8 animate-fade-in">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setConfiguracaoAtiva(null)}
            className="flex items-center gap-2 interactive-button"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <GradientText variant="primary" className="text-2xl font-bold">
              {configuracoes.find(c => c.id === configuracaoAtiva)?.nome}
            </GradientText>
            <p className="text-muted-foreground">
              {configuracoes.find(c => c.id === configuracaoAtiva)?.descricao}
            </p>
          </div>
        </div>
        
        <GlassCard variant="subtle" className="animate-slide-up">
          {renderConfiguracao()}
        </GlassCard>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer className="py-8 animate-fade-in">
      <div className="mb-8">
        <GradientText variant="primary" className="text-3xl font-bold mb-2 flex items-center">
          <ColoredIcon icon={Settings} className="mr-3" />
          Configurações do Sistema
        </GradientText>
        <p className="text-muted-foreground">
          Gerencie todas as configurações do sistema de forma organizada
        </p>
      </div>

      {/* Resumo do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-slide-up">
        <GlassCard variant="subtle" className="text-center animate-scale-in">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">✓</div>
            <div className="font-medium text-foreground">Sistema</div>
            <div className="text-sm text-muted-foreground">Operacional</div>
          </CardContent>
        </GlassCard>
        
        <GlassCard variant="subtle" className="text-center animate-scale-in animate-delay-1">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {configuracoes.filter(c => c.disponivel).length}
            </div>
            <div className="font-medium text-foreground">Módulos</div>
            <div className="text-sm text-muted-foreground">Disponíveis</div>
          </CardContent>
        </GlassCard>
        
        <GlassCard variant="subtle" className="text-center animate-scale-in animate-delay-2">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
            <div className="font-medium text-foreground">Sincronizado</div>
            <div className="text-sm text-muted-foreground">Base de dados</div>
          </CardContent>
        </GlassCard>
        
        <GlassCard variant="subtle" className="text-center animate-scale-in animate-delay-3">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-orange-600 mb-2">v2.0</div>
            <div className="font-medium text-foreground">Versão</div>
            <div className="text-sm text-muted-foreground">Atualizada</div>
          </CardContent>
        </GlassCard>
      </div>

      {/* Cards de Configuração */}
      <div className="grid gap-6 md:grid-cols-2 mb-8 animate-slide-up animate-stagger-1">
        {configuracoes.map((config, index) => (
          <div 
            key={config.id} 
            className="cursor-pointer group animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => config.disponivel && setConfiguracaoAtiva(config.id)}
          >
            <GlassCard 
              variant="subtle" 
              className="h-full interactive-card group-hover:shadow-xl transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="glass-element p-3 rounded-full">
                      <ColoredIcon icon={config.icon} className={config.cor} />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">{config.nome}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {config.categoria}
                      </p>
                    </div>
                  </div>
                  <ModernBadge 
                    variant={config.disponivel ? "success" : "secondary"}
                    size="sm"
                  >
                    {config.disponivel ? "Disponível" : "Restrito"}
                  </ModernBadge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {config.descricao}
                </p>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    config.disponivel && setConfiguracaoAtiva(config.id);
                  }}
                  disabled={!config.disponivel}
                  className="w-full interactive-button"
                  variant={config.disponivel ? "default" : "secondary"}
                >
                  {config.disponivel ? "Configurar" : "Acesso Restrito"}
                </Button>
              </CardContent>
            </GlassCard>
          </div>
        ))}
      </div>

      {/* Informações Adicionais */}
      <GlassCard variant="subtle" className="animate-slide-up animate-stagger-2">
        <CardHeader className="glass-header border-b border-white/10">
          <CardTitle className="flex items-center gap-3">
            <ColoredIcon icon={RefreshCw} className="text-primary" />
            <GradientText variant="primary">Informações do Sistema</GradientText>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="glass-element p-4 rounded-lg">
              <Label className="font-medium text-foreground">Última Sincronização</Label>
              <p className="text-muted-foreground mt-1">Agora mesmo</p>
            </div>
            <div className="glass-element p-4 rounded-lg">
              <Label className="font-medium text-foreground">Backup Automático</Label>
              <p className="text-muted-foreground mt-1">Ativo (Diário às 02:00)</p>
            </div>
            <div className="glass-element p-4 rounded-lg">
              <Label className="font-medium text-foreground">Modo de Operação</Label>
              <p className="text-muted-foreground mt-1">Produção</p>
            </div>
            <div className="glass-element p-4 rounded-lg">
              <Label className="font-medium text-foreground">Suporte Técnico</Label>
              <p className="text-muted-foreground mt-1">Disponível 24/7</p>
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </ResponsiveContainer>
  );
}