import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, Calculator, FileText } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PremiumSection } from "@/components/ui/premium-section";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { LegalIcons } from "@/components/ui/legal-icons";

interface DespesaEssencial {
  categoria: string;
  valor: number;
}

export default function AnaliseSocioeconomica() {
  const { id: clienteId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Buscar cliente
  const { data: cliente, isLoading: loadingCliente } = useQuery({
    queryKey: ["cliente", clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", clienteId!)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!clienteId,
  });

  // Buscar análise socioeconômica existente
  const { data: analiseExistente, isLoading: loadingAnalise } = useQuery({
    queryKey: ["analise-socioeconomica", clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analises_socioeconomicas")
        .select("*")
        .eq("cliente_id", clienteId!)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!clienteId,
  });

  // Estados do formulário
  const [rendaLiquida, setRendaLiquida] = useState<string>("");
  const [despesasEssenciais, setDespesasEssenciais] = useState<DespesaEssencial[]>([
    { categoria: "Alimentação", valor: 0 },
    { categoria: "Moradia (aluguel/prestação)", valor: 0 },
    { categoria: "Energia Elétrica", valor: 0 },
    { categoria: "Água", valor: 0 },
    { categoria: "Gás", valor: 0 },
    { categoria: "Transporte", valor: 0 },
    { categoria: "Medicamentos", valor: 0 },
    { categoria: "Plano de Saúde", valor: 0 },
    { categoria: "Educação", valor: 0 },
    { categoria: "Vestuário Básico", valor: 0 },
  ]);
  const [minimoExistencial, setMinimoExistencial] = useState<string>("");
  const [observacoes, setObservacoes] = useState<string>("");

  // Carregar dados existentes
  useEffect(() => {
    if (analiseExistente) {
      setRendaLiquida(analiseExistente.renda_liquida?.toString() || "");
      
      // Carregar despesas do JSON se existir
      if (analiseExistente.detalhes_despesas && Array.isArray(analiseExistente.detalhes_despesas)) {
        setDespesasEssenciais(analiseExistente.detalhes_despesas as unknown as DespesaEssencial[]);
      }
      
      setMinimoExistencial(analiseExistente.minimo_existencial?.toString() || "");
    }
  }, [analiseExistente]);

  // Calcular totais automaticamente
  const totalDespesasEssenciais = despesasEssenciais.reduce((sum, desp) => sum + desp.valor, 0);
  const minimoExistencialCalculado = parseFloat(minimoExistencial) || totalDespesasEssenciais;
  const rendaLiquidaNum = parseFloat(rendaLiquida) || 0;
  const capacidadePagamento = rendaLiquidaNum - minimoExistencialCalculado;
  const percentualComprometimento = rendaLiquidaNum > 0 
    ? ((capacidadePagamento / rendaLiquidaNum) * 100).toFixed(2) 
    : "0.00";

  // Determinar situação
  let situacao = "Normal";
  let situacaoVariant: "default" | "secondary" | "destructive" = "default";
  
  if (capacidadePagamento < 0) {
    situacao = "Comprometimento Total - Sem capacidade de pagamento";
    situacaoVariant = "destructive";
  } else if (capacidadePagamento < rendaLiquidaNum * 0.30) {
    situacao = "Capacidade Limitada (< 30% da renda)";
    situacaoVariant = "secondary";
  } else {
    situacao = "Capacidade Adequada";
    situacaoVariant = "default";
  }

  // Mutation para salvar
  const salvarMutation = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { data: escritorioData } = await supabase
        .from("usuarios_escritorio")
        .select("escritorio_id")
        .eq("user_id", userData.user?.id)
        .single();

      const analiseData = {
        escritorio_id: escritorioData?.escritorio_id,
        cliente_id: clienteId,
        renda_liquida: parseFloat(rendaLiquida) || 0,
        despesas_essenciais: totalDespesasEssenciais,
        minimo_existencial: minimoExistencialCalculado,
        capacidade_pagamento: capacidadePagamento,
        percentual_comprometimento: parseFloat(percentualComprometimento),
        detalhes_despesas: despesasEssenciais as any, // Cast to JSON type
        situacao: situacao,
      };

      if (analiseExistente) {
        // Atualizar
        const { error } = await supabase
          .from("analises_socioeconomicas")
          .update(analiseData)
          .eq("id", analiseExistente.id);

        if (error) throw error;
      } else {
        // Inserir
        const { error } = await supabase
          .from("analises_socioeconomicas")
          .insert(analiseData);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Análise Socioeconômica salva com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["analise-socioeconomica", clienteId] });
    },
    onError: (error) => {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar análise socioeconômica");
    },
  });

  const handleSalvar = () => {
    if (!rendaLiquida || parseFloat(rendaLiquida) <= 0) {
      toast.error("Informe a renda líquida do cliente");
      return;
    }

    salvarMutation.mutate();
  };

  const handleDespesaChange = (index: number, valor: string) => {
    const novasDespesas = [...despesasEssenciais];
    novasDespesas[index].valor = parseFloat(valor) || 0;
    setDespesasEssenciais(novasDespesas);
  };

  if (loadingCliente || loadingAnalise) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Cliente não encontrado</p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => navigate("/app/clientes")}>
                Voltar para Clientes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumbs */}
      <PageBreadcrumbs
        segments={[
          { label: "Clientes", path: "/app/clientes" },
          { label: cliente.nome, path: `/app/clientes/${clienteId}` },
          { label: "Análise Socioeconômica" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <LegalIcons.document className="h-8 w-8 text-primary" />
            Análise Socioeconômica
          </h1>
          <p className="text-muted-foreground mt-1">
            Demonstrativo do Mínimo Existencial - {cliente.nome}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button onClick={handleSalvar} disabled={salvarMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {salvarMutation.isPending ? "Salvando..." : "Salvar Análise"}
          </Button>
        </div>
      </div>

      {/* Informações do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LegalIcons.clients className="h-5 w-5" />
            Dados do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-muted-foreground">Nome</Label>
              <p className="font-medium">{cliente.nome}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">CPF/CNPJ</Label>
              <p className="font-medium">{cliente.cpf_cnpj || "Não informado"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Telefone</Label>
              <p className="font-medium">{cliente.telefone || "Não informado"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Renda Líquida */}
      <PremiumSection
        title="Renda Líquida Mensal"
        icon={LegalIcons.money}
        description="Informe a renda líquida mensal do cliente (já descontados IR e INSS)"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="renda_liquida">Renda Líquida (R$) *</Label>
            <Input
              id="renda_liquida"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 3500.00"
              value={rendaLiquida}
              onChange={(e) => setRendaLiquida(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </PremiumSection>

      {/* Despesas Essenciais */}
      <PremiumSection
        title="Despesas Essenciais (Mínimo Existencial)"
        icon={Calculator}
        description="Informe as despesas mensais essenciais do cliente conforme Lei 14.181/2021"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {despesasEssenciais.map((despesa, index) => (
            <div key={index}>
              <Label htmlFor={`despesa_${index}`}>{despesa.categoria}</Label>
              <Input
                id={`despesa_${index}`}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={despesa.valor || ""}
                onChange={(e) => handleDespesaChange(index, e.target.value)}
                className="mt-1"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-lg">Total de Despesas Essenciais:</span>
            <span className="text-2xl font-bold text-primary">
              R$ {totalDespesasEssenciais.toFixed(2)}
            </span>
          </div>
        </div>
      </PremiumSection>

      {/* Mínimo Existencial */}
      <PremiumSection
        title="Definição do Mínimo Existencial"
        icon={FileText}
        description="Valor mínimo que deve ser preservado para garantir a subsistência digna"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="minimo_existencial">
              Mínimo Existencial (R$)
            </Label>
            <Input
              id="minimo_existencial"
              type="number"
              step="0.01"
              min="0"
              placeholder={`Sugestão: ${totalDespesasEssenciais.toFixed(2)}`}
              value={minimoExistencial}
              onChange={(e) => setMinimoExistencial(e.target.value)}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Deixe em branco para usar o total das despesas essenciais
            </p>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações sobre a situação socioeconômica do cliente..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={4}
              className="mt-1"
            />
          </div>
        </div>
      </PremiumSection>

      {/* Resultado da Análise */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LegalIcons.reports className="h-5 w-5" />
            Resultado da Análise Socioeconômica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <Label className="text-muted-foreground text-sm">Renda Líquida</Label>
              <p className="text-2xl font-bold text-foreground">
                R$ {rendaLiquidaNum.toFixed(2)}
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground text-sm">Mínimo Existencial</Label>
              <p className="text-2xl font-bold text-orange-600">
                R$ {minimoExistencialCalculado.toFixed(2)}
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground text-sm">Capacidade de Pagamento</Label>
              <p className={`text-2xl font-bold ${capacidadePagamento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {capacidadePagamento.toFixed(2)}
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground text-sm">% Disponível para Dívidas</Label>
              <p className="text-2xl font-bold text-blue-600">
                {percentualComprometimento}%
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-background rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Situação:</span>
              <Badge variant={situacaoVariant} className="text-sm">
                {situacao}
              </Badge>
            </div>
          </div>

          {capacidadePagamento < 0 && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium">
                ⚠️ Atenção: O cliente NÃO possui capacidade de pagamento. O mínimo existencial 
                consome toda a renda disponível. Considerar plano de superendividamento com 
                repactuação integral das dívidas.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
