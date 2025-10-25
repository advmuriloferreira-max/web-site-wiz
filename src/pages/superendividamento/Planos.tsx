import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Calculator } from "lucide-react";
import { calcularPlanoCompleto } from "@/utils/calculoPlanosPagamento";
import type { Contrato, ResultadoPlano } from "@/types/superendividamento";

export default function PlanosPagamento() {
  const [rendaLiquida, setRendaLiquida] = useState<number>(0);
  const [percentualRenda, setPercentualRenda] = useState<number>(30);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [novoCredor, setNovoCredor] = useState<string>("");
  const [novoValorTotal, setNovoValorTotal] = useState<number>(0);
  const [novaParcelaMensal, setNovaParcelaMensal] = useState<number>(0);
  const [resultado, setResultado] = useState<ResultadoPlano | null>(null);

  const adicionarContrato = () => {
    if (novoCredor.trim() && novoValorTotal > 0 && novaParcelaMensal > 0) {
      const novoContrato: Contrato = {
        id: Date.now().toString(),
        credor: novoCredor.trim(),
        valorTotalDivida: novoValorTotal,
        parcelaMensalAtual: novaParcelaMensal
      };
      setContratos([...contratos, novoContrato]);
      setNovoCredor("");
      setNovoValorTotal(0);
      setNovaParcelaMensal(0);
    }
  };

  const removerContrato = (id: string) => {
    setContratos(contratos.filter(c => c.id !== id));
  };

  const calcularPlano = () => {
    if (rendaLiquida > 0 && contratos.length > 0) {
      const plano = calcularPlanoCompleto(contratos, rendaLiquida, percentualRenda);
      setResultado(plano);
    }
  };

  const valorMensalDisponivel = rendaLiquida * (percentualRenda / 100);
  const totalDividas = contratos.reduce((soma, c) => soma + c.valorTotalDivida, 0);
  const encargoMensalAtual = contratos.reduce((soma, c) => soma + c.parcelaMensalAtual, 0);
  const percentualAtual = rendaLiquida > 0 ? (encargoMensalAtual / rendaLiquida) * 100 : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Planos de Pagamento</h1>
        <p className="text-muted-foreground">
          Calcule planos de repactuação conforme Lei 14.181/2021
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuração do Plano */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Plano</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="renda">Renda Líquida Mensal</Label>
                <Input
                  id="renda"
                  type="number"
                  placeholder="0,00"
                  value={rendaLiquida || ""}
                  onChange={(e) => setRendaLiquida(Number(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="percentual">Percentual da Renda para Pagamento</Label>
                <Select value={percentualRenda.toString()} onValueChange={(value) => setPercentualRenda(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30% da renda líquida</SelectItem>
                    <SelectItem value="35">35% da renda líquida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Valor mensal disponível:</div>
                <div className="text-2xl font-bold text-primary">
                  R$ {valorMensalDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {encargoMensalAtual > 0 && (
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Encargo atual:</div>
                  <div className="text-2xl font-bold text-destructive">
                    {percentualAtual.toFixed(1)}% da renda
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    R$ {encargoMensalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contratos do Cliente</CardTitle>
              <p className="text-sm text-muted-foreground">
                Adicione cada contrato com o valor total da dívida e a parcela mensal atual
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  placeholder="Nome do credor"
                  value={novoCredor}
                  onChange={(e) => setNovoCredor(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Valor total da dívida"
                  value={novoValorTotal || ""}
                  onChange={(e) => setNovoValorTotal(Number(e.target.value))}
                />
                <Input
                  type="number"
                  placeholder="Parcela mensal atual"
                  value={novaParcelaMensal || ""}
                  onChange={(e) => setNovaParcelaMensal(Number(e.target.value))}
                />
              </div>
              
              <Button onClick={adicionarContrato} className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Contrato
              </Button>
              
              <div className="space-y-2">
                {contratos.map((contrato) => (
                  <div key={contrato.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{contrato.credor}</div>
                      <div className="text-sm text-muted-foreground">
                        Dívida: R$ {contrato.valorTotalDivida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Parcela: R$ {contrato.parcelaMensalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removerContrato(contrato.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {contratos.length > 0 && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total de Dívidas:</div>
                    <div className="text-lg font-bold text-primary">
                      R$ {totalDividas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  
                  <div className="bg-destructive/10 p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Encargo Mensal Atual:</div>
                    <div className="text-lg font-bold text-destructive">
                      R$ {encargoMensalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={calcularPlano} 
                className="w-full" 
                disabled={!rendaLiquida || contratos.length === 0}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calcular Plano de Pagamento
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Resultados */}
        <div className="space-y-6">
          {resultado && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Plano</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{resultado.resumo.totalFases}</div>
                      <div className="text-sm text-muted-foreground">Total de Fases</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-500/10 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{resultado.resumo.totalMeses}</div>
                      <div className="text-sm text-muted-foreground">Total de Meses</div>
                    </div>
                    
                    <div className="text-center p-4 bg-destructive/10 rounded-lg">
                      <div className="text-2xl font-bold text-destructive">
                        R$ {resultado.resumo.encargoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-muted-foreground">Encargo Atual</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {resultado.resumo.reducaoPercentual.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Redução</div>
                    </div>
                  </div>
                  
                  {resultado.resumo.totalMeses > 60 && (
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                        ⚠️ Atenção: O plano excede 60 meses (limite legal da Lei 14.181/2021)
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* QUADRO 1: ANÁLISE DOS PERCENTUAIS ATUAIS */}
            <Card>
              <CardHeader>
                <CardTitle>1. Análise dos Percentuais Atuais</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Cada parcela mensal atual representa um percentual do encargo total
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border p-3 text-left">Credor</th>
                        <th className="border p-3 text-right">Parcela Atual</th>
                        <th className="border p-3 text-right">Percentual</th>
                        <th className="border p-3 text-left">Cálculo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contratos.map((contrato) => {
                        const percentual = (contrato.parcelaMensalAtual / encargoMensalAtual) * 100;
                        return (
                          <tr key={contrato.id}>
                            <td className="border p-3 font-medium">{contrato.credor}</td>
                            <td className="border p-3 text-right">
                              R$ {contrato.parcelaMensalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="border p-3 text-right font-bold text-primary">
                              {percentual.toFixed(2)}%
                            </td>
                            <td className="border p-3 text-sm text-muted-foreground">
                              R$ {contrato.parcelaMensalAtual.toFixed(2)} ÷ R$ {encargoMensalAtual.toFixed(2)} × 100
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-muted/50 font-bold">
                        <td className="border p-3">TOTAL</td>
                        <td className="border p-3 text-right">
                          R$ {encargoMensalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="border p-3 text-right">100,00%</td>
                        <td className="border p-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* QUADRO 2: REDISTRIBUIÇÃO COM LIMITAÇÃO */}
            <Card>
              <CardHeader>
                <CardTitle>2. Redistribuição com Limitação de {percentualRenda}% da Renda</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Mantendo os mesmos percentuais, mas limitando a {percentualRenda}% da renda líquida
                </p>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-primary/10 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-muted-foreground">Renda Líquida Mensal:</div>
                      <div className="text-lg font-bold">R$ {rendaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Limitação ({percentualRenda}%):</div>
                      <div className="text-lg font-bold text-primary">R$ {valorMensalDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Redução:</div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {resultado.resumo.reducaoPercentual.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border p-3 text-left">Credor</th>
                        <th className="border p-3 text-right">Percentual Mantido</th>
                        <th className="border p-3 text-right">Nova Parcela</th>
                        <th className="border p-3 text-left">Cálculo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contratos.map((contrato) => {
                        const percentual = (contrato.parcelaMensalAtual / encargoMensalAtual) * 100;
                        const novaParcela = (percentual / 100) * valorMensalDisponivel;
                        return (
                          <tr key={contrato.id}>
                            <td className="border p-3 font-medium">{contrato.credor}</td>
                            <td className="border p-3 text-right font-bold text-primary">
                              {percentual.toFixed(2)}%
                            </td>
                            <td className="border p-3 text-right">
                              R$ {novaParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="border p-3 text-sm text-muted-foreground">
                              {percentual.toFixed(2)}% × R$ {valorMensalDisponivel.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-muted/50 font-bold">
                        <td className="border p-3">TOTAL</td>
                        <td className="border p-3 text-right">100,00%</td>
                        <td className="border p-3 text-right">
                          R$ {valorMensalDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="border p-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {resultado.fases.map((fase) => (
                  <Card key={fase.numeroFase}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Fase {fase.numeroFase}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={fase.tipoFase === 'normal' ? 'default' : 'secondary'}>
                            {fase.tipoFase === 'normal' ? 'Normal' : 'Ajuste'}
                          </Badge>
                          <Badge variant="outline">
                            {fase.duracaoMeses} mês{fase.duracaoMeses > 1 ? 'es' : ''}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {fase.calculos.map((calculo, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">{calculo.credor}</div>
                              {calculo.quitado && (
                                <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                                  QUITADO
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Parcela Anterior:</div>
                                <div className="font-medium">
                                  R$ {calculo.parcelaMensalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ({calculo.percentualAtual.toFixed(2)}%)
                                </div>
                              </div>
                              
                              <div>
                                <div className="text-muted-foreground">Nova Parcela:</div>
                                <div className="font-medium text-primary">
                                  R$ {calculo.novaParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                                {calculo.sobraRecebida && (
                                  <div className="text-xs text-green-600 dark:text-green-400">
                                    +R$ {calculo.sobraRecebida.toFixed(2)} (sobra)
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <div className="text-muted-foreground">Valor Pago:</div>
                                <div className="font-medium">
                                  R$ {calculo.valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                              </div>
                              
                              <div>
                                <div className="text-muted-foreground">Saldo Restante:</div>
                                <div className="font-medium">
                                  R$ {calculo.saldoRemanescente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {fase.creditoresQuitados.length > 0 && (
                          <div className="bg-green-500/10 p-3 rounded-lg">
                            <div className="text-sm font-medium text-green-600 dark:text-green-400">
                              ✅ Credores quitados nesta fase: {fase.creditoresQuitados.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
