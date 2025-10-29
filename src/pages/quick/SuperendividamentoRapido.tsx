import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, PiggyBank, Download, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { calcularPlanoCompleto } from "@/utils/calculoPlanosPagamento";
// import { gerarRelatorioPDF } from "@/lib/gerarRelatorioPDF";
import { useAuth } from "@/hooks/useAuth";

interface Divida {
  id: string;
  credor: string;
  valor_atual: number;
  parcela_mensal_atual: number;
  tipo_divida: "inclusa" | "excluida";
}

export default function SuperendividamentoRapido() {
  const navigate = useNavigate();
  const { usuarioEscritorio } = useAuth();
  
  const [rendaLiquida, setRendaLiquida] = useState("");
  const [percentualRenda, setPercentualRenda] = useState("35");
  const [dividas, setDividas] = useState<Divida[]>([]);
  
  // Formulário de nova dívida
  const [mostrarForm, setMostrarForm] = useState(false);
  const [credor, setCreder] = useState("");
  const [valorAtual, setValorAtual] = useState("");
  const [parcelaMensal, setParcelaMensal] = useState("");
  const [tipoDivida, setTipoDivida] = useState<"inclusa" | "excluida">("inclusa");
  
  const [resultado, setResultado] = useState<any>(null);

  const adicionarDivida = () => {
    if (!credor || !valorAtual || !parcelaMensal) {
      toast.error("Preencha todos os campos da dívida");
      return;
    }

    const novaDivida: Divida = {
      id: Math.random().toString(),
      credor,
      valor_atual: parseFloat(valorAtual.replace(/\D/g, "")) / 100,
      parcela_mensal_atual: parseFloat(parcelaMensal.replace(/\D/g, "")) / 100,
      tipo_divida: tipoDivida,
    };

    setDividas([...dividas, novaDivida]);
    setCreder("");
    setValorAtual("");
    setParcelaMensal("");
    setTipoDivida("inclusa");
    setMostrarForm(false);
    toast.success("Dívida adicionada!");
  };

  const removerDivida = (id: string) => {
    setDividas(dividas.filter(d => d.id !== id));
    toast.success("Dívida removida!");
  };

  const calcular = () => {
    if (!rendaLiquida || dividas.length === 0) {
      toast.error("Informe a renda líquida e adicione pelo menos uma dívida");
      return;
    }

    try {
      const renda = parseFloat(rendaLiquida.replace(/\D/g, "")) / 100;
      const percentual = parseFloat(percentualRenda);

      const contratos = dividas.map(d => ({
        id: d.id,
        credor: d.credor,
        valorTotalDivida: d.valor_atual,
        parcelaMensalAtual: d.parcela_mensal_atual,
      }));

      const plano = calcularPlanoCompleto(contratos, renda, percentual);

      // Adaptar resultado para o formato da UI
      const totalDividas = dividas.reduce((sum, d) => sum + d.valor_atual, 0);
      const valorDisponivelMensal = renda * (percentual / 100);
      
      // Calcular plano detalhado RESPEITANDO O LIMITE DE 60 MESES
      const planoDetalhado = contratos.map(c => {
        // Buscar dados do contrato no resultado do plano
        let valorPagoTotal = 0;
        let quitado = false;
        
        // Somar o que foi pago em todas as fases
        plano.fases.forEach(fase => {
          const calculoContrato = fase.calculos.find(calc => calc.credor === c.credor);
          if (calculoContrato) {
            valorPagoTotal += calculoContrato.valorPago;
            if (calculoContrato.quitado) {
              quitado = true;
            }
          }
        });
        
        const saldoRestante = c.valorTotalDivida - valorPagoTotal;
        const primeiraFase = plano.fases[0];
        const calculoContrato = primeiraFase?.calculos.find(calc => calc.credor === c.credor);
        
        // Se quitado, calcular prazo real
        // Se não quitado, mostrar 60 meses (máximo)
        const prazoMeses = quitado 
          ? Math.ceil(valorPagoTotal / (calculoContrato?.novaParcela || 1))
          : 60;
        
        return {
          credor: c.credor,
          valorAtual: c.valorTotalDivida,
          novaParcelaMensal: calculoContrato?.novaParcela || 0,
          prazoMeses: Math.min(prazoMeses, 60), // NUNCA MAIS QUE 60
          quitado,
          valorPago: valorPagoTotal,
          saldoRestante: saldoRestante > 0 ? saldoRestante : 0
        };
      });

      setResultado({
        rendaLiquida: renda,
        valorDisponivelMensal,
        totalDividas,
        numeroFases: plano.fases.length, // ADICIONAR número de fases
        totalMeses: plano.resumo.totalMeses, // ADICIONAR total de meses
        planoDetalhado,
        dividasImpagaveis: plano.dividasImpagaveis?.map(d => ({
          credor: d.credor,
          valorImpagavel: d.saldoImpagavel,
          valorOriginal: d.valorTotalOriginal,
          percentualQuitado: d.percentualQuitado
        }))
      });
      toast.success("Plano calculado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao calcular:", error);
      toast.error("Erro ao calcular o plano");
    }
  };

  const exportarPDF = () => {
    if (!resultado) return;

    try {
      // TODO: Implementar geração de PDF para superendividamento
      // gerarRelatorioPDF({
      //   tipo: "superendividamento",
      //   cliente: {
      //     nome: "Cliente Não Cadastrado",
      //   },
      //   escritorio: {
      //     nome: usuarioEscritorio?.escritorio?.nome || "Escritório",
      //     oab: undefined,
      //   },
      //   resultado: resultado,
      //   dataAnalise: new Date(),
      // });
      
      toast.info("Funcionalidade de PDF em desenvolvimento");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar relatório PDF");
    }
  };

  const salvarEmCliente = () => {
    toast.info("Funcionalidade de salvar em cliente em desenvolvimento");
  };

  const novaAnalise = () => {
    setRendaLiquida("");
    setPercentualRenda("35");
    setDividas([]);
    setResultado(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/app")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar ao Dashboard
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <PiggyBank className="h-8 w-8 text-blue-600" />
          Plano de Superendividamento Rápido
        </h1>
        <p className="text-muted-foreground mt-2">
          Crie plano de pagamento conforme Lei 14.181/2021
        </p>
      </div>

      {!resultado ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados Socioeconômicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="renda">Renda Líquida Mensal *</Label>
                  <Input
                    id="renda"
                    type="text"
                    placeholder="R$ 0,00"
                    value={rendaLiquida}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      const formatted = new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(parseFloat(value) / 100 || 0);
                      setRendaLiquida(formatted);
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="percentual">Percentual da Renda para Pagamento</Label>
                  <Select value={percentualRenda} onValueChange={setPercentualRenda}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="35">35% (Recomendado)</SelectItem>
                      <SelectItem value="30">30%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Dívidas</CardTitle>
                  <CardDescription>
                    Adicione todas as dívidas do cliente
                  </CardDescription>
                </div>
                <Button onClick={() => setMostrarForm(!mostrarForm)} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Dívida
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mostrarForm && (
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <Label htmlFor="credor">Credor *</Label>
                      <Input
                        id="credor"
                        placeholder="Ex: Banco do Brasil"
                        value={credor}
                        onChange={(e) => setCreder(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="valorAtual">Valor Atual da Dívida *</Label>
                        <Input
                          id="valorAtual"
                          type="text"
                          placeholder="R$ 0,00"
                          value={valorAtual}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            const formatted = new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(parseFloat(value) / 100 || 0);
                            setValorAtual(formatted);
                          }}
                        />
                      </div>

                      <div>
                        <Label htmlFor="parcela">Parcela Mensal Atual *</Label>
                        <Input
                          id="parcela"
                          type="text"
                          placeholder="R$ 0,00"
                          value={parcelaMensal}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            const formatted = new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(parseFloat(value) / 100 || 0);
                            setParcelaMensal(formatted);
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="tipo">Tipo de Dívida</Label>
                      <Select value={tipoDivida} onValueChange={(v: any) => setTipoDivida(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inclusa">Inclusa no Plano</SelectItem>
                          <SelectItem value="excluida">Excluída (Essencial)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={adicionarDivida} size="sm">
                        Adicionar
                      </Button>
                      <Button onClick={() => setMostrarForm(false)} variant="outline" size="sm">
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {dividas.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Credor</TableHead>
                      <TableHead>Valor Atual</TableHead>
                      <TableHead>Parcela Mensal</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dividas.map((divida) => (
                      <TableRow key={divida.id}>
                        <TableCell className="font-medium">{divida.credor}</TableCell>
                        <TableCell>{formatCurrency(divida.valor_atual)}</TableCell>
                        <TableCell>{formatCurrency(divida.parcela_mensal_atual)}</TableCell>
                        <TableCell>
                          <Badge variant={divida.tipo_divida === "inclusa" ? "default" : "secondary"}>
                            {divida.tipo_divida === "inclusa" ? "Inclusa" : "Excluída"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removerDivida(divida.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma dívida adicionada ainda
                </div>
              )}

              {dividas.length > 0 && (
                <Button onClick={calcular} className="w-full" size="lg">
                  <PiggyBank className="mr-2 h-4 w-4" />
                  Calcular Plano de Pagamento
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="text-green-700 dark:text-green-300">
                ✅ Plano de Pagamento Calculado!
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo do Plano</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Renda Líquida</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(resultado.rendaLiquida)}
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Valor Disponível/Mês</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(resultado.valorDisponivelMensal)}
                  </p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Número de Fases</p>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {resultado.numeroFases} {resultado.numeroFases === 1 ? 'fase' : 'fases'}
                  </p>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Prazo Total</p>
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {resultado.totalMeses} meses
                  </p>
                  {resultado.totalMeses === 60 && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      (Limite legal)
                    </p>
                  )}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-lg col-span-2 md:col-span-4">
                  <p className="text-sm text-muted-foreground mb-1">Total de Dívidas</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(resultado.totalDividas)}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Plano de Pagamento Proposto</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Credor</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Nova Parcela</TableHead>
                      <TableHead>Prazo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultado.planoDetalhado.map((item: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.credor}</TableCell>
                        <TableCell>{formatCurrency(item.valorAtual)}</TableCell>
                        <TableCell className="font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(item.novaParcelaMensal)}
                        </TableCell>
                        <TableCell>
                          {item.quitado ? (
                            <span className="text-sm">
                              {item.prazoMeses} meses
                            </span>
                          ) : (
                            <span className="text-sm text-orange-600 dark:text-orange-400">
                              60 meses (máximo)
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.quitado ? (
                            <Badge variant="default" className="bg-green-600">
                              Quitável
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              Parcial
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {resultado.dividasImpagaveis && resultado.dividasImpagaveis.length > 0 && (
                <div className="p-6 bg-red-50 dark:bg-red-950 border-2 border-red-300 dark:border-red-700 rounded-lg">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl font-bold">⚠</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-red-700 dark:text-red-300 text-lg mb-1">
                        Dívidas Impagáveis (Excedente após 60 meses)
                      </h4>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Estas dívidas não podem ser quitadas dentro do prazo legal de 60 meses. 
                        O saldo excedente deve ser negociado separadamente ou considerado para remissão.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {resultado.dividasImpagaveis.map((d: any, idx: number) => (
                      <div key={idx} className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-red-700 dark:text-red-300">{d.credor}</p>
                          <Badge variant="outline" className="border-red-300 text-red-700 dark:border-red-700 dark:text-red-300">
                            {d.percentualQuitado.toFixed(1)}% quitado
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Valor Original:</p>
                            <p className="font-semibold">{formatCurrency(d.valorOriginal)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Saldo Impagável:</p>
                            <p className="font-bold text-red-600 dark:text-red-400">
                              {formatCurrency(d.valorImpagavel)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-300 dark:border-yellow-700 rounded">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      💡 <strong>Recomendação:</strong> Solicitar remissão destes valores ou negociar condições especiais 
                      com os credores, conforme art. 104-A, §3º da Lei 14.181/2021.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>O que fazer agora?</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button onClick={exportarPDF} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar Plano (PDF)
              </Button>
              <Button onClick={salvarEmCliente} variant="outline">
                <Save className="mr-2 h-4 w-4" />
                Salvar em Cliente
              </Button>
              <Button onClick={novaAnalise} variant="outline">
                <PiggyBank className="mr-2 h-4 w-4" />
                Novo Plano
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground text-center">
          ℹ️ Plano conforme Lei 14.181/2021 • Sem necessidade de cadastro
        </p>
      </div>
    </div>
  );
}
