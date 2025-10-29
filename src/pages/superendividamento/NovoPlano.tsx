import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Plus, FileText, Save, Calculator, Trash2, Home, Download, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDividasSuperendividamento } from "@/hooks/useDividasSuperendividamento";
import { calcularPlanoCompleto } from "@/utils/calculoPlanosPagamento";
import type { Contrato, ResultadoPlano } from "@/types/superendividamento";

interface NovaDivida {
  credor: string;
  valor_original: number;
  valor_atual: number;
  parcela_mensal_atual: number;
  tipo_divida: "inclusa" | "excluida";
}

export default function NovoPlano() {
  const { clienteId } = useParams<{ clienteId?: string }>();
  const navigate = useNavigate();

  // Seleção de cliente (se não fornecido)
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<string | undefined>(clienteId);

  // Buscar todos os clientes para seleção
  const { data: clientes } = useQuery({
    queryKey: ["clientes-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome, cpf_cnpj")
        .order("nome");

      if (error) throw error;
      return data;
    },
    enabled: !clienteId,
  });

  // Buscar cliente selecionado
  const { data: cliente, isLoading: loadingCliente } = useQuery({
    queryKey: ["cliente", clienteSelecionadoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", clienteSelecionadoId!)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!clienteSelecionadoId,
  });

  // Buscar relatório socioeconômico existente
  const { data: relatorioSocioeconomico } = useQuery({
    queryKey: ["relatorio-socioeconomico", clienteSelecionadoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analises_socioeconomicas")
        .select("*")
        .eq("cliente_id", clienteSelecionadoId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!clienteSelecionadoId,
  });

  // Buscar dívidas existentes
  const { dividas, isLoading: loadingDividas } = useDividasSuperendividamento(clienteSelecionadoId);

  const [rendaLiquida, setRendaLiquida] = useState<string>("");
  const [percentualRenda, setPercentualRenda] = useState<string>("30");
  const [observacoes, setObservacoes] = useState<string>("");

  // Estado para adicionar novas dívidas
  const [mostrarFormDivida, setMostrarFormDivida] = useState(false);
  const [novaDivida, setNovaDivida] = useState<NovaDivida>({
    credor: "",
    valor_original: 0,
    valor_atual: 0,
    parcela_mensal_atual: 0,
    tipo_divida: "inclusa",
  });

  const [calculando, setCalculando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoPlano | null>(null);

  // Importar dados do relatório socioeconômico
  const importarDadosRelatorio = () => {
    if (!relatorioSocioeconomico) {
      toast.error("Nenhum relatório socioeconômico encontrado para este cliente");
      return;
    }

    setRendaLiquida(relatorioSocioeconomico.renda_liquida?.toString() || "");
    toast.success("Dados importados do relatório socioeconômico!");
  };

  const adicionarDivida = async () => {
    if (!novaDivida.credor || novaDivida.valor_atual <= 0 || novaDivida.parcela_mensal_atual <= 0) {
      toast.error("Preencha todos os campos da dívida");
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: escritorioData } = await supabase
        .from("usuarios_escritorio")
        .select("escritorio_id")
        .eq("user_id", userData.user?.id)
        .single();

      const { error } = await supabase.from("dividas_superendividamento").insert({
        escritorio_id: escritorioData?.escritorio_id,
        cliente_id: clienteSelecionadoId,
        credor: novaDivida.credor,
        valor_original: novaDivida.valor_original || novaDivida.valor_atual,
        valor_atual: novaDivida.valor_atual,
        parcela_mensal_atual: novaDivida.parcela_mensal_atual,
        tipo_divida: novaDivida.tipo_divida,
      });

      if (error) throw error;

      toast.success("Dívida adicionada!");
      setNovaDivida({
        credor: "",
        valor_original: 0,
        valor_atual: 0,
        parcela_mensal_atual: 0,
        tipo_divida: "inclusa",
      });
      setMostrarFormDivida(false);

      // Recarregar dívidas
      await supabase.from("dividas_superendividamento").select("*").eq("cliente_id", clienteId);
    } catch (error: any) {
      console.error("Erro ao adicionar dívida:", error);
      toast.error("Erro ao adicionar dívida");
    }
  };

  const excluirDivida = async (dividaId: string) => {
    try {
      const { error } = await supabase
        .from("dividas_superendividamento")
        .delete()
        .eq("id", dividaId);

      if (error) throw error;
      toast.success("Dívida excluída!");
    } catch (error: any) {
      console.error("Erro ao excluir dívida:", error);
      toast.error("Erro ao excluir dívida");
    }
  };

  const calcularPlano = () => {
    if (!rendaLiquida || !dividas || dividas.length === 0) {
      toast.error("Informe a renda líquida e adicione pelo menos uma dívida");
      return;
    }

    setCalculando(true);

    try {
      const renda = parseFloat(rendaLiquida);
      const percentual = parseInt(percentualRenda);

      // Converter dívidas para o formato esperado
      const contratosParaCalculo: Contrato[] = dividas
        .filter((d) => d.tipo_divida === "inclusa")
        .map((d) => ({
          id: d.id,
          credor: d.credor,
          valorTotalDivida: d.valor_atual,
          parcelaMensalAtual: d.parcela_mensal_atual || 0,
        }));

      if (contratosParaCalculo.length === 0) {
        toast.error("Adicione pelo menos uma dívida do tipo 'inclusa'");
        setCalculando(false);
        return;
      }

      // Usar a função existente
      const plano = calcularPlanoCompleto(contratosParaCalculo, renda, percentual);

      setResultado(plano);
      toast.success("Plano calculado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao calcular plano:", error);
      toast.error("Erro ao calcular plano");
    } finally {
      setCalculando(false);
    }
  };

  const salvarPlano = async () => {
    if (!resultado || !clienteSelecionadoId) {
      toast.error("Selecione um cliente e calcule o plano antes de salvar");
      return;
    }

    setSalvando(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: escritorioData } = await supabase
        .from("usuarios_escritorio")
        .select("escritorio_id")
        .eq("user_id", userData.user?.id)
        .single();

      const renda = parseFloat(rendaLiquida);

      // 1. Salvar dados de renda e percentual
      const { data: analiseData, error: analiseError } = await supabase
        .from("analises_superendividamento")
        .insert({
          escritorio_id: escritorioData?.escritorio_id,
          cliente_id: clienteSelecionadoId,
          renda_liquida: renda,
          percentual_comprometimento: parseInt(percentualRenda),
          total_dividas: dividas?.reduce((sum, d) => sum + d.valor_atual, 0),
          encargo_mensal_atual: resultado.resumo.encargoAtual,
          encargo_mensal_proposto: resultado.resumo.novoEncargo,
          reducao_mensal: resultado.resumo.encargoAtual - resultado.resumo.novoEncargo,
          reducao_percentual: resultado.resumo.reducaoPercentual,
          usuario_id: userData.user?.id,
          metodologia: "Lei 14.181/2021 - Limite de 30% da renda",
          observacoes,
        })
        .select()
        .single();

      if (analiseError) throw analiseError;

      // 2. Salvar plano de pagamento
      const { data: planoData, error: planoError } = await supabase
        .from("planos_pagamento")
        .insert({
          escritorio_id: escritorioData?.escritorio_id,
          cliente_id: clienteSelecionadoId,
          percentual_renda: parseInt(percentualRenda),
          valor_mensal_total: resultado.resumo.novoEncargo,
          total_dividas: dividas?.reduce((sum, d) => sum + d.valor_atual, 0),
          total_fases: resultado.resumo.totalFases,
          total_parcelas: resultado.resumo.totalMeses,
          status: "ativo",
        })
        .select()
        .single();

      if (planoError) throw planoError;

      // 3. Salvar fases do plano
      const fasesParaSalvar = resultado.fases.map((fase) => ({
        escritorio_id: escritorioData?.escritorio_id,
        plano_pagamento_id: planoData.id,
        numero_fase: fase.numeroFase,
        duracao_meses: fase.duracaoMeses,
        valor_mensal_total: fase.valorMensalTotal,
        tipo_fase: fase.tipoFase,
        detalhes_json: {
          calculos: fase.calculos,
          creditoresQuitados: fase.creditoresQuitados,
        } as any,
      }));

      const { error: fasesError } = await supabase
        .from("fases_plano_super")
        .insert(fasesParaSalvar);

      if (fasesError) throw fasesError;

      // 4. Se houver dívidas impagáveis, salvar na análise
      if (resultado.dividasImpagaveis && resultado.dividasImpagaveis.length > 0) {
        const { error: dividasImpError } = await supabase
          .from("dividas_analise_super")
          .insert(
            resultado.dividasImpagaveis.map((div) => ({
              escritorio_id: escritorioData?.escritorio_id,
              analise_superendividamento_id: analiseData.id,
              credor: div.credor,
              valor_total_divida: div.saldoImpagavel,
              parcela_mensal_atual: 0,
              tipo_divida: "impagavel",
            }))
          );

        if (dividasImpError) throw dividasImpError;
      }

      toast.success("Plano de superendividamento salvo com sucesso!");
      navigate(-1);
    } catch (error: any) {
      console.error("Erro ao salvar plano:", error);
      toast.error("Erro ao salvar plano: " + error.message);
    } finally {
      setSalvando(false);
    }
  };

  const gerarPeticao = () => {
    toast.info("Gerando petição judicial...");
    // TODO: Implementar geração de petição
  };

  if (!clienteSelecionadoId && !clientes) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

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
            <BreadcrumbPage>Novo Plano de Pagamento</BreadcrumbPage>
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
            <h1 className="text-3xl font-bold">Plano de Pagamento</h1>
            <p className="text-muted-foreground">Lei 14.181/2021 - Limite de 30% ou 35% da renda</p>
          </div>
        </div>
        {resultado && (
          <Button onClick={gerarPeticao} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Gerar Petição
          </Button>
        )}
      </div>

      {/* Seleção de Cliente (se não foi fornecido) */}
      {!clienteSelecionadoId && (
        <Alert>
          <User className="h-4 w-4" />
          <AlertTitle>Selecione um Cliente</AlertTitle>
          <AlertDescription>
            <div className="mt-4 space-y-2">
              <Label>Cliente</Label>
              <Select onValueChange={setClienteSelecionadoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome} - {c.cpf_cnpj || "CPF não informado"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Informações do Cliente */}
      {cliente && (
        <Card>
          <CardHeader>
            <CardTitle>Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Nome</Label>
              <p className="font-medium">{cliente.nome}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">CPF/CNPJ</Label>
              <p className="font-medium">{cliente.cpf_cnpj || "-"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{cliente.email || "-"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Telefone</Label>
              <p className="font-medium">{cliente.telefone || "-"}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert se houver relatório socioeconômico */}
      {clienteSelecionadoId && relatorioSocioeconomico && (
        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200">
          <Download className="h-4 w-4" />
          <AlertTitle>Relatório Socioeconômico Encontrado</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Você pode importar os dados de renda do relatório existente.</span>
            <Button 
              onClick={importarDadosRelatorio} 
              variant="outline" 
              size="sm"
              className="ml-4"
            >
              <Download className="h-4 w-4 mr-2" />
              Importar Dados
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Cálculo da Renda Líquida */}
      {clienteSelecionadoId && (
        <Card>
          <CardHeader>
            <CardTitle>Cálculo da Renda Líquida Mensal Disponível</CardTitle>
            <CardDescription>
              Informe a renda líquida do cliente e escolha o percentual disponível para pagamento de dívidas (30% ou 35% conforme Lei 14.181/2021).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rendaLiquida">
                  Renda Líquida <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="rendaLiquida"
                  type="number"
                  step="0.01"
                  value={rendaLiquida}
                  onChange={(e) => setRendaLiquida(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="percentualRenda">
                  Percentual da Renda <span className="text-destructive">*</span>
                </Label>
                <Select value={percentualRenda} onValueChange={setPercentualRenda}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30%</SelectItem>
                    <SelectItem value="35">35% (Recomendada)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Dívidas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Dívidas do Cliente</CardTitle>
          <Button size="sm" onClick={() => setMostrarFormDivida(!mostrarFormDivida)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Dívida
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {mostrarFormDivida && (
            <Card className="border-2 border-primary/20">
              <CardContent className="pt-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Credor</Label>
                    <Input
                      value={novaDivida.credor}
                      onChange={(e) =>
                        setNovaDivida({ ...novaDivida, credor: e.target.value })
                      }
                      placeholder="Nome do credor"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={novaDivida.tipo_divida}
                      onValueChange={(value: "inclusa" | "excluida") =>
                        setNovaDivida({ ...novaDivida, tipo_divida: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inclusa">Inclusa no plano</SelectItem>
                        <SelectItem value="excluida">Excluída do plano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Valor Atual</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={novaDivida.valor_atual || ""}
                      onChange={(e) =>
                        setNovaDivida({
                          ...novaDivida,
                          valor_atual: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Parcela Mensal Atual</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={novaDivida.parcela_mensal_atual || ""}
                      onChange={(e) =>
                        setNovaDivida({
                          ...novaDivida,
                          parcela_mensal_atual: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={adicionarDivida} size="sm">
                    Adicionar
                  </Button>
                  <Button
                    onClick={() => setMostrarFormDivida(false)}
                    size="sm"
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Credor</TableHead>
                  <TableHead>Valor Atual</TableHead>
                  <TableHead>Parcela Mensal</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dividas && dividas.length > 0 ? (
                  dividas.map((divida) => (
                    <TableRow key={divida.id}>
                      <TableCell className="font-medium">{divida.credor}</TableCell>
                      <TableCell>
                        R${" "}
                        {divida.valor_atual.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        R${" "}
                        {(divida.parcela_mensal_atual || 0).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={divida.tipo_divida === "inclusa" ? "default" : "secondary"}>
                          {divida.tipo_divida}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => excluirDivida(divida.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhuma dívida cadastrada. Clique em "Adicionar Dívida" para começar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações sobre o caso..."
              rows={3}
            />
          </div>

          <Button
            onClick={calcularPlano}
            disabled={calculando || !rendaLiquida || !dividas || dividas.length === 0}
            className="gap-2"
          >
            <Calculator className="h-4 w-4" />
            {calculando ? "Calculando..." : "Calcular Plano"}
          </Button>
        </CardContent>
      </Card>

      {/* Resultado */}
      {resultado && (
        <>
          {/* Resumo */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Plano</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Encargo Atual</Label>
                  <p className="text-2xl font-bold text-destructive">
                    R${" "}
                    {resultado.resumo.encargoAtual.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">Novo Encargo (30%)</Label>
                  <p className="text-2xl font-bold text-primary">
                    R${" "}
                    {resultado.resumo.novoEncargo.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">Redução</Label>
                  <p className="text-2xl font-bold text-green-600">
                    {resultado.resumo.reducaoPercentual.toFixed(2)}%
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">Total de Fases</Label>
                  <p className="text-2xl font-bold">{resultado.resumo.totalFases}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">Total de Meses</Label>
                  <p className="text-2xl font-bold">{resultado.resumo.totalMeses}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">Dentro do Limite Legal</Label>
                  <p className={`text-2xl font-bold ${resultado.resumo.limiteLegalRespeitado ? 'text-green-600' : 'text-destructive'}`}>
                    {resultado.resumo.limiteLegalRespeitado ? "SIM" : "NÃO"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fases */}
          <Card>
            <CardHeader>
              <CardTitle>Fases do Plano</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resultado.fases.map((fase) => (
                <Card key={fase.numeroFase} className="border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle>Fase {fase.numeroFase}</CardTitle>
                        <Badge variant={fase.tipoFase === "ajuste" ? "secondary" : "default"}>
                          {fase.tipoFase === "ajuste" ? "Ajuste" : "Normal"}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {fase.duracaoMeses} {fase.duracaoMeses === 1 ? "mês" : "meses"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Credor</TableHead>
                            <TableHead>Nova Parcela</TableHead>
                            <TableHead>Valor Pago</TableHead>
                            <TableHead>Saldo Restante</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fase.calculos.map((calc) => (
                            <TableRow key={calc.credor}>
                              <TableCell className="font-medium">{calc.credor}</TableCell>
                              <TableCell>
                                R${" "}
                                {calc.novaParcela.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </TableCell>
                              <TableCell>
                                R${" "}
                                {calc.valorPago.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </TableCell>
                              <TableCell>
                                R${" "}
                                {calc.saldoRemanescente.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </TableCell>
                              <TableCell>
                                {calc.quitado ? (
                                  <Badge className="bg-green-600">Quitado</Badge>
                                ) : (
                                  <Badge variant="secondary">Em pagamento</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Dívidas Impagáveis */}
          {resultado.dividasImpagaveis && resultado.dividasImpagaveis.length > 0 && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">
                  ⚠️ Dívidas Impagáveis (Limite 60 meses atingido)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Credor</TableHead>
                        <TableHead>Valor Original</TableHead>
                        <TableHead>Saldo Impagável</TableHead>
                        <TableHead>% Quitado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resultado.dividasImpagaveis.map((div) => (
                        <TableRow key={div.credor}>
                          <TableCell className="font-medium">{div.credor}</TableCell>
                          <TableCell>
                            R${" "}
                            {div.valorTotalOriginal.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell className="text-destructive font-medium">
                            R${" "}
                            {div.saldoImpagavel.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell>{div.percentualQuitado.toFixed(2)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Estas dívidas ultrapassaram o limite de 60 meses. Considere incluir pedido de
                  extinção parcial na petição judicial.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <div className="flex gap-2">
            <Button onClick={salvarPlano} disabled={salvando} className="gap-2">
              <Save className="h-4 w-4" />
              {salvando ? "Salvando..." : "Salvar Plano"}
            </Button>
            <Button onClick={gerarPeticao} variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Gerar Petição Judicial
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
