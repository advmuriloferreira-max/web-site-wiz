import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

// Validação de inputs
const fonteRendaSchema = z.object({
  nome: z.string().trim().min(1, "Nome da fonte é obrigatório").max(100),
  valor: z.number().min(0, "Valor deve ser positivo").max(9999999.99),
});

const dividaSchema = z.object({
  banco: z.string().trim().min(1, "Nome do banco é obrigatório").max(100),
  tipo: z.string().trim().min(1, "Tipo é obrigatório").max(100),
  parcelasRestantes: z.number().int().min(0).max(9999),
  valorParcela: z.number().min(0).max(9999999.99),
  saldoDevedor: z.number().min(0).max(9999999999.99),
});

interface FonteRenda {
  nome: string;
  valor: number;
}

interface Divida {
  banco: string;
  tipo: string;
  parcelasRestantes: number;
  valorParcela: number;
  saldoDevedor: number;
}

interface Despesas {
  aluguel: number;
  gastosMedicos: number;
  energiaEletrica: number;
  transporte: number;
  internet: number;
  materialEscolar: number;
  ipva: number;
  financiamentoAutomovel: number;
  mensalidadeEscolar: number;
  condominio: number;
  gas: number;
  telefone: number;
  tvAssinatura: number;
  seguroCarro: number;
  pensaoAlimenticia: number;
  lazer: number;
  planoSaude: number;
  agua: number;
  alimentacao: number;
  farmacia: number;
  dentista: number;
  iptu: number;
  financiamentoHabitacional: number;
  vestuario: number;
  impostoRenda: number;
  outrosGastos: number;
}

export default function AnaliseSocioeconomica() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Estados para Renda Mensal (DINÂMICO)
  const [fontesRenda, setFontesRenda] = useState<FonteRenda[]>([
    { nome: "", valor: 0 }
  ]);

  // Estados para Despesas Mensais (26 categorias - FIXO)
  const [despesas, setDespesas] = useState<Despesas>({
    aluguel: 0,
    gastosMedicos: 0,
    energiaEletrica: 0,
    transporte: 0,
    internet: 0,
    materialEscolar: 0,
    ipva: 0,
    financiamentoAutomovel: 0,
    mensalidadeEscolar: 0,
    condominio: 0,
    gas: 0,
    telefone: 0,
    tvAssinatura: 0,
    seguroCarro: 0,
    pensaoAlimenticia: 0,
    lazer: 0,
    planoSaude: 0,
    agua: 0,
    alimentacao: 0,
    farmacia: 0,
    dentista: 0,
    iptu: 0,
    financiamentoHabitacional: 0,
    vestuario: 0,
    impostoRenda: 0,
    outrosGastos: 0,
  });

  // Estados para Dívidas Bancárias (DINÂMICO)
  const [dividas, setDividas] = useState<Divida[]>([
    { banco: "", tipo: "", parcelasRestantes: 0, valorParcela: 0, saldoDevedor: 0 }
  ]);

  // Cálculos automáticos
  const rendaTotal = fontesRenda.reduce((acc, fonte) => acc + (fonte.valor || 0), 0);
  const despesaTotal = Object.values(despesas).reduce((acc, val) => acc + (val || 0), 0);
  const dividasTotal = dividas.reduce((acc, div) => acc + (div.valorParcela || 0), 0);
  const rendaRestante = rendaTotal - despesaTotal - dividasTotal;
  const comprometimentoMinimo = rendaTotal > 0 ? ((despesaTotal / rendaTotal) * 100).toFixed(0) : "0";

  // Buscar análise existente
  const { data: analiseExistente, isLoading } = useQuery({
    queryKey: ["analise-socioeconomica", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analises_superendividamento")
        .select("*")
        .eq("cliente_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!id,
  });

  // Preencher formulário se houver análise existente
  useEffect(() => {
    if (analiseExistente && analiseExistente.observacoes) {
      try {
        const dados = JSON.parse(analiseExistente.observacoes);
        if (dados.fontes_renda && dados.fontes_renda.length > 0) {
          setFontesRenda(dados.fontes_renda);
        }
        if (dados.despesas) {
          setDespesas(dados.despesas);
        }
        if (dados.dividas && dados.dividas.length > 0) {
          setDividas(dados.dividas);
        }
      } catch (e) {
        // Erro silencioso ao carregar dados antigos
      }
    }
  }, [analiseExistente]);

  // Validar dados antes de salvar
  const validarDados = (): boolean => {
    // Validar fontes de renda
    for (const fonte of fontesRenda) {
      if (fonte.nome || fonte.valor > 0) {
        try {
          fonteRendaSchema.parse(fonte);
        } catch (error) {
          if (error instanceof z.ZodError) {
            toast.error(`Fonte de Renda: ${error.errors[0].message}`);
            return false;
          }
        }
      }
    }

    // Validar dívidas
    for (const divida of dividas) {
      if (divida.banco || divida.tipo || divida.valorParcela > 0) {
        try {
          dividaSchema.parse(divida);
        } catch (error) {
          if (error instanceof z.ZodError) {
            toast.error(`Dívida: ${error.errors[0].message}`);
            return false;
          }
        }
      }
    }

    if (rendaTotal <= 0) {
      toast.error("Informe pelo menos uma fonte de renda válida");
      return false;
    }

    return true;
  };

  // Mutation para salvar
  const salvarMutation = useMutation({
    mutationFn: async () => {
      if (!validarDados()) {
        throw new Error("Validação falhou");
      }

      const { data: userData } = await supabase.auth.getUser();
      const { data: escritorioData } = await supabase
        .from("usuarios_escritorio")
        .select("escritorio_id")
        .eq("user_id", userData.user?.id)
        .single();

      const dadosParaSalvar = {
        escritorio_id: escritorioData?.escritorio_id,
        cliente_id: id,
        renda_liquida: rendaTotal,
        total_dividas: dividasTotal,
        encargo_mensal_atual: dividasTotal,
        percentual_comprometimento: 30.00,
        encargo_mensal_proposto: rendaTotal * 0.30,
        reducao_mensal: dividasTotal - (rendaTotal * 0.30),
        reducao_percentual: dividasTotal > 0 ? ((dividasTotal - (rendaTotal * 0.30)) / dividasTotal) * 100 : 0,
        metodologia: "Lei 14.181/2021 - Limite de 30% da renda",
        data_analise: new Date().toISOString(),
        observacoes: JSON.stringify({
          fontes_renda: fontesRenda,
          despesas: despesas,
          dividas: dividas,
        }),
      };

      if (analiseExistente) {
        const { error } = await supabase
          .from("analises_superendividamento")
          .update(dadosParaSalvar)
          .eq("id", analiseExistente.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("analises_superendividamento")
          .insert([dadosParaSalvar]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Análise Socioeconômica salva com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["analise-socioeconomica", id] });
      navigate(`/app/clientes/${id}`);
    },
    onError: (error: Error) => {
      if (error.message !== "Validação falhou") {
        toast.error("Erro ao salvar análise");
      }
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(`/app/clientes/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Demonstrativo do Mínimo Existencial</h1>
            <p className="text-muted-foreground">Análise Socioeconômica do Cliente</p>
          </div>
        </div>
        <Button onClick={() => salvarMutation.mutate()} disabled={salvarMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {salvarMutation.isPending ? "Salvando..." : "Salvar Análise"}
        </Button>
      </div>

      {/* Card de Resumo */}
      <Card className="mb-6 border-2 border-primary">
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Renda líquida mensal</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(rendaTotal)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Despesa mensal total</p>
            <p className="text-xl font-bold">{formatCurrency(despesaTotal)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Dívidas Bancárias</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(dividasTotal)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Renda restante</p>
            <p className={`text-xl font-bold ${rendaRestante < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(rendaRestante)}
            </p>
          </div>
        </CardContent>
        <CardContent>
          <div className="flex items-center gap-4">
            <p className="text-sm font-semibold">Comprometimento do Mínimo Existencial:</p>
            <p className="text-2xl font-bold text-primary">{comprometimentoMinimo}%</p>
          </div>
        </CardContent>
      </Card>

      {/* Renda Mensal - DINÂMICO */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Renda Mensal</CardTitle>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setFontesRenda([...fontesRenda, { nome: "", valor: 0 }])}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Fonte de Renda
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fontesRenda.map((fonte, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 items-end">
              <div>
                <Label>Fonte de renda {index + 1}</Label>
                <Input 
                  placeholder="Ex: Salário, Freelance, Aluguel"
                  value={fonte.nome}
                  maxLength={100}
                  onChange={(e) => {
                    const novasFontes = [...fontesRenda];
                    novasFontes[index].nome = e.target.value;
                    setFontesRenda(novasFontes);
                  }}
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label>Valor</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    min="0"
                    max="9999999.99"
                    value={fonte.valor || ""}
                    onChange={(e) => {
                      const novasFontes = [...fontesRenda];
                      novasFontes[index].valor = parseFloat(e.target.value) || 0;
                      setFontesRenda(novasFontes);
                    }}
                  />
                </div>
                {fontesRenda.length > 1 && (
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => setFontesRenda(fontesRenda.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Separator />
          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(rendaTotal)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Despesas Mensais - FIXO (26 categorias) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Despesas Mensais</CardTitle>
          <p className="text-sm text-muted-foreground">Preencha apenas as despesas que o cliente possui</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "aluguel", label: "Aluguel" },
            { key: "gastosMedicos", label: "Gastos médicos (exames e consultas)" },
            { key: "energiaEletrica", label: "Energia elétrica" },
            { key: "transporte", label: "Transporte" },
            { key: "internet", label: "Internet" },
            { key: "materialEscolar", label: "Material escolar (mensal: valor total÷12)" },
            { key: "ipva", label: "IPVA (mensal: valor total÷12)" },
            { key: "financiamentoAutomovel", label: "Financiamento automóvel" },
            { key: "mensalidadeEscolar", label: "Mensalidade escolar" },
            { key: "condominio", label: "Condomínio" },
            { key: "gas", label: "Gás" },
            { key: "telefone", label: "Telefone (fixo e celular)" },
            { key: "tvAssinatura", label: "TV por assinatura" },
            { key: "seguroCarro", label: "Seguro Carro (mensal: valor total÷12)" },
            { key: "pensaoAlimenticia", label: "Pensão alimentícia" },
            { key: "lazer", label: "Lazer" },
            { key: "planoSaude", label: "Plano de saúde" },
            { key: "agua", label: "Água" },
            { key: "alimentacao", label: "Alimentação/limpeza/higiene" },
            { key: "farmacia", label: "Farmácia" },
            { key: "dentista", label: "Dentista" },
            { key: "iptu", label: "IPTU (mensal: valor total÷12)" },
            { key: "financiamentoHabitacional", label: "Financiamento habitacional" },
            { key: "vestuario", label: "Vestuário" },
            { key: "impostoRenda", label: "Imposto de Renda IR" },
            { key: "outrosGastos", label: "Outros gastos importantes" },
          ].map((item) => (
            <div key={item.key} className="grid grid-cols-2 gap-4 items-center">
              <Label>{item.label}</Label>
              <Input 
                type="number"
                step="0.01"
                min="0"
                max="9999999.99"
                value={despesas[item.key as keyof typeof despesas] || ""}
                onChange={(e) => setDespesas({...despesas, [item.key]: parseFloat(e.target.value) || 0})}
                placeholder="R$ 0,00"
              />
            </div>
          ))}
          <Separator />
          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total de Gastos</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(despesaTotal)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dívidas Bancárias - DINÂMICO */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Dívidas Bancárias</CardTitle>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setDividas([...dividas, { banco: "", tipo: "", parcelasRestantes: 0, valorParcela: 0, saldoDevedor: 0 }])}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Dívida
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dividas.map((divida, index) => (
              <Card key={index} className="p-4 bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label>Banco</Label>
                    <Input 
                      placeholder="Ex: Banco do Brasil"
                      maxLength={100}
                      value={divida.banco}
                      onChange={(e) => {
                        const novasDividas = [...dividas];
                        novasDividas[index].banco = e.target.value;
                        setDividas(novasDividas);
                      }}
                    />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Input 
                      placeholder="Ex: Consignado, Pessoal"
                      maxLength={100}
                      value={divida.tipo}
                      onChange={(e) => {
                        const novasDividas = [...dividas];
                        novasDividas[index].tipo = e.target.value;
                        setDividas(novasDividas);
                      }}
                    />
                  </div>
                  <div>
                    <Label>Parcelas Restantes</Label>
                    <Input 
                      type="number"
                      min="0"
                      max="9999"
                      value={divida.parcelasRestantes || ""}
                      onChange={(e) => {
                        const novasDividas = [...dividas];
                        novasDividas[index].parcelasRestantes = parseInt(e.target.value) || 0;
                        setDividas(novasDividas);
                      }}
                    />
                  </div>
                  <div>
                    <Label>Valor da Parcela</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      min="0"
                      max="9999999.99"
                      value={divida.valorParcela || ""}
                      onChange={(e) => {
                        const novasDividas = [...dividas];
                        novasDividas[index].valorParcela = parseFloat(e.target.value) || 0;
                        setDividas(novasDividas);
                      }}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label>Saldo Devedor</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        min="0"
                        max="9999999999.99"
                        value={divida.saldoDevedor || ""}
                        onChange={(e) => {
                          const novasDividas = [...dividas];
                          novasDividas[index].saldoDevedor = parseFloat(e.target.value) || 0;
                          setDividas(novasDividas);
                        }}
                      />
                    </div>
                    {dividas.length > 1 && (
                      <Button 
                        variant="destructive" 
                        size="icon"
                        onClick={() => setDividas(dividas.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total (Parcelas Mensais)</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(dividasTotal)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão Final */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate(`/app/clientes/${id}`)}>
          Cancelar
        </Button>
        <Button size="lg" onClick={() => salvarMutation.mutate()} disabled={salvarMutation.isPending}>
          <Save className="h-5 w-5 mr-2" />
          {salvarMutation.isPending ? "Salvando..." : "Salvar Análise Socioeconômica"}
        </Button>
      </div>
    </div>
  );
}
