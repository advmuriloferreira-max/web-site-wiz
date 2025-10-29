import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Home,
  Search,
  FileText,
  PiggyBank,
  Edit,
  Download,
  Trash2,
  MoreVertical,
  Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";

interface AnaliseCompleta {
  id: string;
  cliente_id: string;
  cliente: {
    nome: string;
    cpf_cnpj: string;
  };
  created_at: string;
  renda_liquida: number;
  total_dividas: number;
  percentual_comprometimento: number;
  encargo_mensal_atual: number;
  encargo_mensal_proposto: number;
  reducao_percentual: number;
  tem_plano: boolean;
  status: "relatorio" | "plano" | "completo";
}

export default function ListaAnalises() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  // Buscar análises socioeconômicas
  const { data: analises, isLoading, refetch } = useQuery({
    queryKey: ["analises-superendividamento-lista", busca, filtroStatus],
    queryFn: async () => {
      let query = supabase
        .from("analises_socioeconomicas")
        .select(`
          id,
          cliente_id,
          created_at,
          renda_liquida,
          percentual_comprometimento,
          capacidade_pagamento,
          minimo_existencial,
          despesas_essenciais,
          clientes!inner(
            nome,
            cpf_cnpj
          )
        `)
        .order("created_at", { ascending: false });

      // Aplicar filtro de busca
      if (busca) {
        query = query.ilike("clientes.nome", `%${busca}%`);
      }

      const { data: analisesData, error: analisesError } = await query;
      if (analisesError) throw analisesError;

      // Buscar planos de pagamento para verificar status
      const { data: planosData } = await supabase
        .from("planos_pagamento")
        .select("cliente_id, created_at, percentual_renda, valor_mensal_total, total_dividas, status");

      // Buscar análises de superendividamento para dados adicionais
      const { data: analisesSuper } = await supabase
        .from("analises_superendividamento")
        .select("cliente_id, total_dividas, encargo_mensal_atual, encargo_mensal_proposto, reducao_percentual");

      // Combinar dados
      const resultado: AnaliseCompleta[] = (analisesData || []).map((analise: any) => {
        const plano = planosData?.find((p: any) => p.cliente_id === analise.cliente_id);
        const analiseSuper = analisesSuper?.find((a: any) => a.cliente_id === analise.cliente_id);

        const temPlano = !!plano;
        let status: "relatorio" | "plano" | "completo" = "relatorio";
        
        if (temPlano && analiseSuper) {
          status = "completo";
        } else if (temPlano) {
          status = "plano";
        }

        const comprometimentoAtual = analise.renda_liquida > 0 
          ? ((analiseSuper?.encargo_mensal_atual || 0) / analise.renda_liquida) * 100 
          : 0;

        const novoComprometimento = analise.renda_liquida > 0
          ? ((analiseSuper?.encargo_mensal_proposto || 0) / analise.renda_liquida) * 100
          : 0;

        return {
          id: analise.id,
          cliente_id: analise.cliente_id,
          cliente: {
            nome: analise.clientes?.nome || "Cliente não informado",
            cpf_cnpj: analise.clientes?.cpf_cnpj || "-",
          },
          created_at: analise.created_at,
          renda_liquida: analise.renda_liquida || 0,
          total_dividas: analiseSuper?.total_dividas || plano?.total_dividas || 0,
          percentual_comprometimento: comprometimentoAtual,
          encargo_mensal_atual: analiseSuper?.encargo_mensal_atual || 0,
          encargo_mensal_proposto: analiseSuper?.encargo_mensal_proposto || 0,
          reducao_percentual: analiseSuper?.reducao_percentual || 0,
          tem_plano: temPlano,
          status,
        };
      });

      // Aplicar filtro de status
      if (filtroStatus !== "todos") {
        return resultado.filter((a) => a.status === filtroStatus);
      }

      return resultado;
    },
  });

  const getStatusBadge = (status: "relatorio" | "plano" | "completo") => {
    const variants: Record<string, { variant: any; label: string; className: string }> = {
      relatorio: { 
        variant: "outline", 
        label: "Relatório Criado",
        className: "border-blue-500 text-blue-700 dark:text-blue-400"
      },
      plano: { 
        variant: "default", 
        label: "Plano Criado",
        className: "bg-purple-500 hover:bg-purple-600"
      },
      completo: { 
        variant: "default", 
        label: "Completo",
        className: "bg-green-500 hover:bg-green-600"
      },
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleVerRelatorio = (clienteId: string) => {
    navigate(`/app/superendividamento/novo-relatorio/${clienteId}`);
  };

  const handleVerPlano = (clienteId: string) => {
    navigate(`/app/superendividamento/novo-plano/${clienteId}`);
  };

  const handleEditar = (clienteId: string) => {
    navigate(`/app/clientes/${clienteId}/analise-socioeconomica`);
  };

  const handleGerarPDF = (analise: AnaliseCompleta) => {
    toast.info("Gerando PDF da análise...");
    // TODO: Implementar geração de PDF
  };

  const handleExcluir = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta análise?")) return;

    try {
      const { error } = await supabase
        .from("analises_socioeconomicas")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Análise excluída com sucesso!");
      refetch();
    } catch (error: any) {
      console.error("Erro ao excluir análise:", error);
      toast.error("Erro ao excluir análise");
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/app">
              <Home className="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/app/superendividamento/dashboard">
              Superendividamento
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Lista de Análises Completas</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Análises Completas</h1>
            <p className="text-muted-foreground">
              Relatórios socioeconômicos e planos de pagamento
            </p>
          </div>
        </div>
        <Button onClick={() => navigate("/app/superendividamento/novo-relatorio")}>
          <FileText className="h-4 w-4 mr-2" />
          Novo Relatório
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Buscar Cliente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome do cliente..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="relatorio">Relatório Criado</SelectItem>
                  <SelectItem value="plano">Plano Criado</SelectItem>
                  <SelectItem value="completo">Completo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Análises de Superendividamento</CardTitle>
          <CardDescription>
            {analises?.length || 0} análise(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !analises || analises.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma análise encontrada
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Renda Líquida</TableHead>
                    <TableHead>Total Dívidas</TableHead>
                    <TableHead>Compr. Atual</TableHead>
                    <TableHead>Novo Compr.</TableHead>
                    <TableHead>Redução</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analises.map((analise) => (
                    <TableRow key={analise.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{analise.cliente.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {analise.cliente.cpf_cnpj}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(analise.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>{formatCurrency(analise.renda_liquida)}</TableCell>
                      <TableCell>{formatCurrency(analise.total_dividas)}</TableCell>
                      <TableCell>
                        <span className={`font-semibold ${
                          analise.percentual_comprometimento > 70 
                            ? "text-red-600" 
                            : analise.percentual_comprometimento > 50 
                            ? "text-orange-600" 
                            : "text-green-600"
                        }`}>
                          {analise.percentual_comprometimento.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        {analise.encargo_mensal_proposto > 0 ? (
                          <span className="font-semibold text-blue-600">
                            {((analise.encargo_mensal_proposto / analise.renda_liquida) * 100).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {analise.reducao_percentual > 0 ? (
                          <span className="font-semibold text-green-600">
                            -{analise.reducao_percentual.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(analise.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleVerRelatorio(analise.cliente_id)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Ver Relatório Socioeconômico
                            </DropdownMenuItem>
                            {analise.tem_plano && (
                              <DropdownMenuItem onClick={() => handleVerPlano(analise.cliente_id)}>
                                <PiggyBank className="h-4 w-4 mr-2" />
                                Ver Plano de Pagamento
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleEditar(analise.cliente_id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleGerarPDF(analise)}>
                              <Download className="h-4 w-4 mr-2" />
                              Gerar PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleExcluir(analise.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
