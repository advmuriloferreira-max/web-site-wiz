import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, FileText, Calculator, AlertTriangle, Shield, BarChart3, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ContratoWizard } from "@/components/forms/ContratoWizard";
import { GarantiaImpactDisplay } from "@/components/garantias/GarantiaImpactDisplay";
import { GarantiasSection } from "@/components/garantias/GarantiasSection";
import { useContratoById } from "@/hooks/useContratoById";
import { useProvisaoPerda, useProvisaoPerdaIncorrida } from "@/hooks/useProvisao";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  verificarPeriodoObservacaoReestruturacao, 
  calcularProvisaoAvancada, 
  ClassificacaoRisco,
  ResultadoCalculo 
} from "@/lib/calculoProvisao";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import AssistenteVirtual from "@/components/assistente/AssistenteVirtual";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";

// Import visual effects components
import { HeroParticleBackground, SuccessConfetti } from "@/components/ui/particle-effects";
import { AdvancedGlassmorphism } from "@/components/ui/advanced-glassmorphism";
import { GlowEffect, MouseShadowCaster, SpotlightEffect } from "@/components/ui/lighting-effects";
import { MorphingButton, MorphingNumber } from "@/components/ui/morphing-elements";

// Import trust and security components
import { 
  SecurityBadge, 
  CertificationSeal, 
  DataSourceIndicator, 
  CalculationTransparency, 
  SystemStatus,
  UpdateNotification
} from "@/components/ui/trust-elements";
import { 
  RegulatoryCompliance, 
  TransparencyPanel, 
  ActivityTimestamp, 
  AuditLog 
} from "@/components/ui/security-indicators";

const getClassificacaoColor = (classificacao: string | null) => {
  switch (classificacao) {
    case "C1": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "C2": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "C3": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case "C4": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "C5": return "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-200";
    default: return "bg-muted text-muted-foreground";
  }
};

const getEstagioRiscoColor = (estagio: number | null) => {
  switch (estagio) {
    case 1: return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case 2: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case 3: return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default: return "bg-muted text-muted-foreground";
  }
};

const getEstagioRiscoLabel = (estagio: number | null) => {
  switch (estagio) {
    case 1: return "Estágio 1";
    case 2: return "Estágio 2";
    case 3: return "Estágio 3";
    default: return "N/A";
  }
};

const getSituacaoColor = (situacao: string | null) => {
  switch (situacao) {
    case "Em análise": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "Em negociação": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "Em processo judicial": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "Acordo Finalizado": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    default: return "bg-muted text-muted-foreground";
  }
};

export default function ContratoDetalhes() {
  const { contratoId } = useParams<{ contratoId: string }>();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [resultadoProvisao, setResultadoProvisao] = useState<ResultadoCalculo | null>(null);
  const [showSuccessEffect, setShowSuccessEffect] = useState(false);
  
  const { data: contrato, isLoading, error } = useContratoById(contratoId || null);
  const { data: tabelaPerda } = useProvisaoPerda();
  const { data: tabelaIncorrida } = useProvisaoPerdaIncorrida();

  // Buscar análise de Gestão de Passivo Bancário
  const { data: analisePassivo } = useQuery({
    queryKey: ["analise-passivo", contratoId],
    queryFn: async () => {
      if (!contratoId) return null;
      const { data } = await supabase
        .from("analises_provisionamento")
        .select("*")
        .eq("contrato_id", contratoId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!contratoId,
  });

  // Buscar análise de Juros Abusivos
  const { data: analiseJuros } = useQuery({
    queryKey: ["analise-juros", contratoId],
    queryFn: async () => {
      if (!contratoId) return null;
      const { data } = await supabase
        .from("analises_juros_abusivos")
        .select("*")
        .eq("contrato_id", contratoId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!contratoId,
  });

  // Buscar análise de Superendividamento (vinculada ao cliente, não ao contrato)
  const { data: analiseSuperendividamento } = useQuery({
    queryKey: ["analise-superendividamento", contrato?.cliente_id],
    queryFn: async () => {
      if (!contrato?.cliente_id) return null;
      const { data } = await supabase
        .from("analises_socioeconomicas")
        .select("*")
        .eq("cliente_id", contrato.cliente_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!contrato?.cliente_id,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy");
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setShowSuccessEffect(true);
  };

  // Calcular provisão avançada com garantias quando o contrato for carregado
  useEffect(() => {
    const calcularProvisao = async () => {
      if (!contrato || !tabelaPerda || !tabelaIncorrida) return;

      try {
        console.log('🔄 Iniciando cálculo de provisão para contrato:', contrato.id);
        const resultado = await calcularProvisaoAvancada({
          valorDivida: contrato.valor_divida,
          diasAtraso: contrato.dias_atraso || 0,
          classificacao: (contrato.classificacao as ClassificacaoRisco) || 'C5',
          tabelaPerda,
          tabelaIncorrida,
          contratoId: contrato.id,
          isReestruturado: (contrato as any).is_reestruturado,
          dataReestruturacao: (contrato as any).data_reestruturacao,
          fatorRecuperacaoGarantia: 0.5
        });
        
        console.log('✅ Resultado do cálculo:', resultado);
        setResultadoProvisao(resultado);
      } catch (error) {
        console.error('❌ Erro ao calcular provisão avançada:', error);
      }
    };

    calcularProvisao();
  }, [contrato, tabelaPerda, tabelaIncorrida]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !contrato) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Contrato não encontrado</h2>
          <p className="text-muted-foreground mb-4">
            O contrato com ID "{contratoId}" não pôde ser encontrado.
          </p>
          <Button onClick={() => navigate("/contratos")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Contratos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="container mx-auto p-6 space-y-6">
        <PageBreadcrumbs 
          segments={[
            { label: "Contratos", path: "/contratos" },
            { label: contrato?.numero_contrato || "Detalhes" },
          ]}
        />

        {/* SEÇÃO: ANÁLISES DISPONÍVEIS */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Análises do Contrato</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: Gestão de Passivo Bancário */}
            <Card className="border-2 hover:border-orange-500 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                  Gestão de Passivo Bancário
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analisePassivo ? (
                  <div className="space-y-2">
                    <Badge variant="default" className="bg-green-600">
                      ✓ Análise Realizada
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Última análise: {format(new Date(analisePassivo.created_at), "dd/MM/yyyy")}
                    </p>
                    <Button 
                      className="w-full mt-3" 
                      size="sm"
                      onClick={() => navigate(`/app/contratos/${contratoId}/provisionamento`)}
                    >
                      Ver Análise Completa
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Badge variant="outline" className="border-orange-300">
                      Não Analisado
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Calcule a provisão bancária conforme BCB
                    </p>
                    <Button 
                      className="w-full mt-3 bg-orange-600 hover:bg-orange-700" 
                      size="sm"
                      onClick={() => navigate(`/app/contratos/${contratoId}/provisionamento`)}
                    >
                      Analisar Agora
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card 2: Análise de Abusividades (Juros) */}
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Análise de Abusividades
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analiseJuros ? (
                  <div className="space-y-2">
                    <Badge variant="default" className="bg-green-600">
                      ✓ Análise Realizada
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Última análise: {format(new Date(analiseJuros.created_at), "dd/MM/yyyy")}
                    </p>
                    <Button 
                      className="w-full mt-3" 
                      size="sm"
                      onClick={() => navigate(`/app/contratos/${contratoId}/juros`)}
                    >
                      Ver Análise Completa
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Badge variant="outline" className="border-blue-300">
                      Não Analisado
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Verifique juros abusivos para ação revisional
                    </p>
                    <Button 
                      className="w-full mt-3 bg-blue-600 hover:bg-blue-700" 
                      size="sm"
                      onClick={() => navigate(`/app/contratos/${contratoId}/juros`)}
                    >
                      Analisar Agora
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card 3: Superendividamento */}
            <Card className="border-2 hover:border-purple-500 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  Superendividamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analiseSuperendividamento ? (
                  <div className="space-y-2">
                    <Badge variant="default" className="bg-green-600">
                      ✓ Análise Realizada
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Última análise: {format(new Date(analiseSuperendividamento.created_at), "dd/MM/yyyy")}
                    </p>
                    <Button 
                      className="w-full mt-3" 
                      size="sm"
                      onClick={() => navigate(`/app/clientes/${contrato?.cliente_id}/superendividamento`)}
                    >
                      Ver Análise Completa
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Badge variant="outline" className="border-purple-300">
                      Não Analisado
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Análise socioeconômica + plano de pagamento
                    </p>
                    <Button 
                      className="w-full mt-3 bg-purple-600 hover:bg-purple-700" 
                      size="sm"
                      onClick={() => navigate(`/app/clientes/${contrato?.cliente_id}/superendividamento`)}
                    >
                      Analisar Agora
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>

        <Separator className="my-6" />
        
        {/* Success Confetti - disabled */}

        {/* Header */}
        <div className="p-6 bg-card border border-border rounded-lg">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/contratos")}
                  className="flex items-center gap-2 hover-glow"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-foreground">
                      Contrato {contrato.numero_contrato || "Sem número"}
                    </h1>
                    <SecurityBadge />
                  </div>
                  <p className="text-muted-foreground text-lg">
                    Cliente: {contrato.clientes?.nome} • Banco: {contrato.bancos?.nome}
                  </p>
                  <ActivityTimestamp 
                    action="Visualizado" 
                    timestamp={new Date()} 
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => {
                    console.log('🔘 Botão Editar Contrato clicado');
                    console.log('🔘 Estado atual do dialog:', isEditDialogOpen);
                    setIsEditDialogOpen(true);
                    console.log('🔘 Dialog deve abrir agora');
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Contrato
                </Button>
              </div>
            </div>
        </div>
        
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Contrato</DialogTitle>
            </DialogHeader>
            <ContratoWizard 
              onSuccess={handleEditSuccess} 
              contratoParaEditar={contrato.id} 
            />
          </DialogContent>
        </Dialog>

        {/* Alerta para contratos reestruturados */}
        {(contrato as any).is_reestruturado && (contrato as any).data_reestruturacao && (() => {
          const observacao = verificarPeriodoObservacaoReestruturacao((contrato as any).data_reestruturacao);
          if (observacao.emPeriodo) {
            return (
              <Alert className="border-yellow-200 bg-yellow-50/80 dark:border-yellow-800 dark:bg-yellow-950/80 backdrop-blur-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                    <strong>Operação Reestruturada - Período de Observação</strong>
                    <br />
                    Este contrato está em período de observação regulamentar de 6 meses. 
                    Mantido em Estágio de Risco mínimo 2 conforme normativas.
                    <br />
                    <span className="text-sm">
                      Restam {observacao.diasRestantes} dias para conclusão do período de observação.
                      Data da reestruturação: {format(new Date((contrato as any).data_reestruturacao), "dd/MM/yyyy")}
                    </span>
                  </AlertDescription>
                </Alert>
            );
          }
          return null;
        })()}

        {/* Ferramentas de Análise */}
        <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calculator className="h-6 w-6 text-primary" />
              Ferramentas de Análise
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Escolha a ferramenta de análise que deseja utilizar para este contrato
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Botão Provisionamento */}
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Provisionamento Bancário</CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cálculo de provisões conforme Resolução BCB 352/2023
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4 text-muted-foreground">
                    Análise de risco de crédito e cálculo automático de provisões para perdas esperadas e incorridas.
                  </p>
                  <Button 
                    className="w-full" 
                    variant="default"
                    onClick={() => {
                      // A lógica já existe na página - fazer scroll até a seção de cálculo
                      const calculoSection = document.querySelector('[data-section="calculo-provisao"]');
                      if (calculoSection) {
                        calculoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    Ver Provisionamento
                  </Button>
                </CardContent>
              </Card>

              {/* Botão Análise de Juros */}
              <Card className="border-2 border-secondary/20 hover:border-secondary/40 transition-all cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                      <BarChart3 className="h-5 w-5 text-secondary" />
                    </div>
                    <CardTitle className="text-base">ABUSIVIDADE DE JUROS - REVISIONAIS</CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Comparação com taxas de referência do BACEN
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4 text-muted-foreground">
                    Consulte taxas de mercado, analise métricas financeiras e gere relatórios comparativos.
                  </p>
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    onClick={() => navigate(`/contratos/${contrato.id}/analise-juros`)}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Analisar Juros
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Informações Básicas */}
              <div className="lg:col-span-2 bg-card border border-border rounded-lg" data-section="calculo-provisao">
                <Card className="border-0 bg-transparent shadow-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Informações do Contrato
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <DataSourceIndicator 
                      source="Base Interna INTELLBANK" 
                      lastUpdate={new Date()} 
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                        <p className="text-lg font-medium">{contrato.clientes?.nome}</p>
                        <p className="text-sm text-muted-foreground">{contrato.clientes?.cpf_cnpj}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Banco</label>
                        <p className="text-lg font-medium">{contrato.bancos?.nome}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Número do Contrato</label>
                        <p className="text-lg font-medium">{contrato.numero_contrato || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tipo de Operação</label>
                        <p className="text-lg font-medium">{contrato.tipo_operacao || "-"}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Situação</label>
                        <div className="mt-1">
                          <Badge className={getSituacaoColor(contrato.situacao)}>
                            {contrato.situacao}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Classificação</label>
                        <div className="mt-1">
                          {contrato.classificacao ? (
                            <Badge className={getClassificacaoColor(contrato.classificacao)}>
                              {contrato.classificacao}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Estágio de Risco</label>
                        <div className="mt-1">
                          {(contrato as any).estagio_risco ? (
                            <Badge className={getEstagioRiscoColor((contrato as any).estagio_risco)}>
                              {getEstagioRiscoLabel((contrato as any).estagio_risco)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Dias de Atraso</label>
                        <div className="mt-1">
                          {contrato.dias_atraso > 0 ? (
                            <Badge variant="destructive">{contrato.dias_atraso} dias</Badge>
                          ) : (
                            <Badge variant="secondary">Em dia</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Data de Entrada</label>
                        <p className="text-lg">{formatDate(contrato.data_entrada)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Data Último Pagamento</label>
                        <p className="text-lg">{formatDate(contrato.data_ultimo_pagamento)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Data de Vencimento</label>
                        <p className="text-lg">{formatDate(contrato.data_vencimento)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Data de Conclusão</label>
                        <p className="text-lg">{formatDate(contrato.data_conclusao)}</p>
                      </div>
                      {(contrato as any).is_reestruturado && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Data da Reestruturação</label>
                          <p className="text-lg">{formatDate((contrato as any).data_reestruturacao)}</p>
                          <Badge variant="outline" className="mt-1">
                            Operação Reestruturada
                          </Badge>
                        </div>
                      )}
                    </div>

                    {contrato.observacoes && (
                      <>
                        <Separator />
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Observações</label>
                          <p className="text-sm mt-1 p-3 bg-muted rounded-md">{contrato.observacoes}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Informações Financeiras */}
              <div className="bg-card border border-border rounded-lg">
                  <Card className="border-0 bg-transparent shadow-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Valores Financeiros
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Valor da Dívida</label>
                        <p className="text-lg font-bold text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          {formatCurrency(contrato.valor_divida)}
                        </p>
                      </div>

                      {contrato.saldo_contabil && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Dívida Contábil</label>
                          <p className="text-xl font-semibold">
                            {formatCurrency(contrato.saldo_contabil)}
                          </p>
                        </div>
                      )}

                      <Separator />

                      {contrato.valor_provisao > 0 && (
                         <div>
                           <label className="text-sm font-medium text-muted-foreground">Provisão</label>
                           <p className="text-lg font-medium">
                             {(contrato.percentual_provisao ?? 0).toFixed(2)}%
                           </p>
                          <p className="text-xl font-semibold text-orange-600">
                            {formatCurrency(contrato.valor_provisao)}
                          </p>
                          {(contrato as any).is_reestruturado && (contrato as any).data_reestruturacao && (() => {
                            const observacao = verificarPeriodoObservacaoReestruturacao((contrato as any).data_reestruturacao);
                            if (observacao.emPeriodo) {
                              return (
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                  ⚠️ Provisão ajustada por reestruturação
                                </p>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}

                      {contrato.acordo_final > 0 && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Acordo Final</label>
                          <p className="text-xl font-semibold text-green-700">
                            {formatCurrency(contrato.acordo_final)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
              </div>
              
              {/* Trust Elements Sidebar */}
              <div className="space-y-4">
                <CertificationSeal />
                <SystemStatus />
                <UpdateNotification 
                  version="v2.1.4" 
                  date={new Date()} 
                />
              </div>
            </div>

            {/* Cálculo Avançado de Provisão com Garantias */}
            {resultadoProvisao && (() => {
              console.log('🎯 Mostrando resultado da provisão:', resultadoProvisao);
              return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <GarantiaImpactDisplay resultado={resultadoProvisao} />
                  </div>
                  <div className="space-y-4">
                    <TransparencyPanel />
                    <CalculationTransparency 
                      formula="Provisão = Valor × Percentual × (1 - Fator Garantia)"
                      steps={[
                        "Identificar classificação de risco do contrato",
                        "Aplicar percentual conforme BCB 352/2023",
                        "Calcular impacto das garantias (se aplicável)",
                        "Verificar período de observação (reestruturadas)",
                        "Aplicar resultado final"
                      ]}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Garantias e Auditoria */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Garantias do Contrato */}
              <AdvancedGlassmorphism variant="subtle" animated className="lg:col-span-2">
                <Card className="border-0 bg-transparent shadow-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Garantias do Contrato
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GarantiasSection contratoId={contrato.id} />
                  </CardContent>
                </Card>
              </AdvancedGlassmorphism>

              {/* Conformidade e Auditoria */}
              <div className="space-y-4">
                <RegulatoryCompliance />
                <AuditLog />
              </div>
            </div>

            {/* Assistente Virtual com contexto do contrato */}
            <AssistenteVirtual contratoContext={contrato} />
      </div>
    </div>
  );
}