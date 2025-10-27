import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, MapPin, FileText, TrendingDown, Calculator, PiggyBank, MoreVertical, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function ClienteDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Buscar dados do cliente
  const { data: cliente, isLoading: clienteLoading } = useQuery({
    queryKey: ["cliente", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Buscar contratos do cliente
  const { data: contratos, isLoading: contratosLoading } = useQuery({
    queryKey: ["contratos-cliente", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contratos")
        .select(`
          *,
          bancos:bancos_provisao(nome),
          analises_provisionamento(
            id,
            classificacao_risco,
            valor_provisao,
            percentual_provisao
          ),
          analises_juros_abusivos(
            id,
            abusividade_detectada,
            diferenca_percentual
          )
        `)
        .eq("cliente_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Buscar análises de superendividamento
  const { data: analisesSuperendividamento } = useQuery({
    queryKey: ["analises-superendividamento-cliente", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analises_superendividamento")
        .select("*")
        .eq("cliente_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Buscar planos de pagamento
  const { data: planosPagamento } = useQuery({
    queryKey: ["planos-pagamento-cliente", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("planos_pagamento")
        .select("*")
        .eq("cliente_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar planos:", error);
        return [];
      }
      return data;
    },
    enabled: !!id,
  });

  const formatCurrency = (value: number | null) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getClassificacaoBadge = (classificacao: string | null) => {
    if (!classificacao) return <Badge variant="outline">N/A</Badge>;
    
    const colors: Record<string, string> = {
      C1: "bg-green-500",
      C2: "bg-blue-500",
      C3: "bg-yellow-500",
      C4: "bg-orange-500",
      C5: "bg-red-500",
    };

    return (
      <Badge className={colors[classificacao] || "bg-gray-500"}>
        {classificacao}
      </Badge>
    );
  };

  if (clienteLoading || contratosLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cliente não encontrado</p>
          <Button onClick={() => navigate("/app/clientes")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Clientes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageBreadcrumbs 
        segments={[
          { label: "Clientes", path: "/app/clientes" },
          { label: cliente?.nome || "Detalhes" },
        ]}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/app/clientes")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{cliente.nome}</h1>
            <p className="text-muted-foreground">Hub Central do Cliente</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/clientes/${id}/editar`)}>
          Editar Cliente
        </Button>
      </div>

      {/* Dados do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cliente.cpf_cnpj && (
              <div>
                <span className="text-sm text-muted-foreground">CPF/CNPJ</span>
                <p className="font-medium">{cliente.cpf_cnpj}</p>
              </div>
            )}
            {cliente.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground">Email</span>
                  <p className="font-medium">{cliente.email}</p>
                </div>
              </div>
            )}
            {cliente.telefone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground">Telefone</span>
                  <p className="font-medium">{cliente.telefone}</p>
                </div>
              </div>
            )}
            {(cliente.cidade || cliente.estado) && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground">Localização</span>
                  <p className="font-medium">
                    {[cliente.cidade, cliente.estado].filter(Boolean).join(" - ")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seção de Superendividamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-6 w-6 text-primary" />
            Superendividamento
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Duas análises independentes para demonstrar superendividamento e criar plano de repactuação.
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1: Análise Socioeconômica */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">1. Análise Socioeconômica</CardTitle>
                {analisesSuperendividamento && analisesSuperendividamento.length > 0 && (
                  <Badge variant="default" className="bg-green-600">Feita</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Demonstrativo do Mínimo Existencial
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Raio-X completo da situação financeira: renda, despesas e dívidas.
              </p>
              
              {analisesSuperendividamento && analisesSuperendividamento.length > 0 && (
                <div className="mb-4 p-3 bg-muted rounded-lg space-y-1">
                  <p className="text-xs text-muted-foreground">Última análise:</p>
                  <p className="text-sm font-semibold">
                    {format(new Date(analisesSuperendividamento[0].created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Renda: {formatCurrency(analisesSuperendividamento[0].renda_liquida)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Comprometimento: {analisesSuperendividamento[0].percentual_comprometimento}%
                  </p>
                </div>
              )}
              
              <Button 
                onClick={() => navigate(`/app/clientes/${id}/analise-socioeconomica`)}
                className="w-full"
              >
                {analisesSuperendividamento && analisesSuperendividamento.length > 0 
                  ? "Ver/Editar Análise" 
                  : "Fazer Análise"}
              </Button>
            </CardContent>
          </Card>

          {/* Card 2: Plano de Pagamento */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">2. Plano de Pagamento</CardTitle>
                {planosPagamento && planosPagamento.length > 0 && (
                  <Badge variant="default" className="bg-green-600">Criado</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Repactuação de Dívidas
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Crie um plano de repactuação com base na capacidade de pagamento.
              </p>
              
              {planosPagamento && planosPagamento.length > 0 && (
                <div className="mb-4 p-3 bg-muted rounded-lg space-y-1">
                  <p className="text-xs text-muted-foreground">Último plano:</p>
                  <p className="text-sm font-semibold">
                    {format(new Date(planosPagamento[0].created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              )}
              
              <Button 
                onClick={() => navigate(`/app/clientes/${id}/superendividamento`)}
                className="w-full"
                disabled={!analisesSuperendividamento || analisesSuperendividamento.length === 0}
              >
                {planosPagamento && planosPagamento.length > 0 
                  ? "Ver/Editar Plano" 
                  : "Criar Plano"}
              </Button>
              
              {(!analisesSuperendividamento || analisesSuperendividamento.length === 0) && (
                <p className="text-xs text-destructive mt-2 text-center">
                  Faça a Análise Socioeconômica primeiro
                </p>
              )}
            </CardContent>
          </Card>
          
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Contratos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contratos ({contratos?.length || 0})
            </div>
            <Button onClick={() => navigate(`/app/contratos/novo?cliente_id=${id}`)}>
              Novo Contrato
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contratos && contratos.length > 0 ? (
            <div className="space-y-4">
              {contratos.map((contrato) => {
                const analiseProvisionamento = contrato.analises_provisionamento?.[0];
                const analiseJuros = contrato.analises_juros_abusivos?.[0];
                
                return (
                  <Card key={contrato.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-semibold text-lg">
                              Contrato {contrato.numero_contrato || "S/N"}
                            </h3>
                            {analiseProvisionamento?.classificacao_risco && 
                              getClassificacaoBadge(analiseProvisionamento.classificacao_risco)
                            }
                            <Badge variant="outline">{contrato.status}</Badge>
                          </div>
                          
                          {/* Badges de análises realizadas */}
                          {(analiseProvisionamento || analiseJuros) && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {analiseProvisionamento && (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-100">
                                  <Calculator className="mr-1 h-3 w-3" />
                                  Gestão de Passivo
                                </Badge>
                              )}
                              {analiseJuros && (
                                <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100">
                                  <TrendingDown className="mr-1 h-3 w-3" />
                                  Juros Analisados
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Banco</span>
                              <p className="font-medium">{contrato.bancos?.nome || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Valor</span>
                              <p className="font-medium">{formatCurrency(contrato.valor_contrato)}</p>
                            </div>
                            {analiseProvisionamento?.valor_provisao && (
                              <div>
                                <span className="text-muted-foreground">Provisão</span>
                                <p className="font-medium text-orange-600">
                                  {formatCurrency(analiseProvisionamento.valor_provisao)}
                                </p>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">Data</span>
                              <p className="font-medium">
                                {contrato.data_assinatura
                                  ? format(new Date(contrato.data_assinatura), "dd/MM/yyyy", { locale: ptBR })
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="ml-4">
                              Analisar
                              <MoreVertical className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 bg-background">
                            <DropdownMenuLabel>Escolha o tipo de análise</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            {/* Gestão de Passivo Bancário */}
                            <DropdownMenuItem
                              onClick={() => navigate(`/app/contratos/${contrato.id}/provisionamento`)}
                              className="cursor-pointer"
                            >
                              <Calculator className="mr-2 h-4 w-4" />
                              <div>
                                <p className="font-medium">Gestão de Passivo Bancário</p>
                                <p className="text-xs text-muted-foreground">
                                  Calcular provisão (BCB 4966/2021)
                                </p>
                              </div>
                            </DropdownMenuItem>
                            
                            {/* Análise de Abusividades */}
                            <DropdownMenuItem
                              onClick={() => navigate(`/app/contratos/${contrato.id}/juros`)}
                              className="cursor-pointer"
                            >
                              <TrendingDown className="mr-2 h-4 w-4" />
                              <div>
                                <p className="font-medium">Análise de Abusividades</p>
                                <p className="text-xs text-muted-foreground">
                                  Comparar com taxas BACEN (Ação Revisional)
                                </p>
                              </div>
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Ver Detalhes do Contrato */}
                            <DropdownMenuItem
                              onClick={() => navigate(`/app/contratos/${contrato.id}`)}
                              className="cursor-pointer"
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              <span>Ver Detalhes Completos</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Nenhum contrato cadastrado</p>
              <Button onClick={() => navigate(`/app/contratos/novo?cliente_id=${id}`)}>
                Cadastrar Primeiro Contrato
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análises de Superendividamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5" />
              Análises de Superendividamento
            </div>
            <Button 
              onClick={() => navigate(`/app/clientes/${id}/superendividamento`)}
              variant="outline"
            >
              Nova Análise
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analisesSuperendividamento && analisesSuperendividamento.length > 0 ? (
            <div className="space-y-3">
              {analisesSuperendividamento.map((analise) => (
                <div
                  key={analise.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/app/clientes/${id}/superendividamento`)}
                >
                  <div>
                    <p className="font-medium">
                      Análise de {format(new Date(analise.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Renda líquida: {formatCurrency(analise.renda_liquida)} • 
                      Comprometimento: {analise.percentual_comprometimento}%
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhuma análise de superendividamento realizada
              </p>
              <Button 
                onClick={() => navigate(`/app/clientes/${id}/superendividamento`)}
                variant="outline"
              >
                Realizar Primeira Análise
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
