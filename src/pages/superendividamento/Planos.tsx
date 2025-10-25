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
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Plano</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{resultado.resumo.totalFases}</div>
                      <div className="text-sm text-muted-foreground">Total de Fases</div>
                    </div>
                    
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{resultado.resumo.totalMeses}</div>
                      <div className="text-sm text-muted-foreground">Total de Meses</div>
                    </div>

                    <div className="text-center p-4 bg-destructive/10 rounded-lg">
                      <div className="text-2xl font-bold text-destructive">{resultado.resumo.encargoAtual.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Encargo Atual</div>
                    </div>

                    <div className="text-center p-4 bg-green-500/10 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{resultado.resumo.novoEncargo.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Novo Encargo</div>
                    </div>
                  </div>
                  
                  {resultado.resumo.totalMeses > 60 && (
                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="text-destructive text-sm font-medium">
                        ⚠️ Plano excede 60 meses (limite legal)
                      </div>
                    </div>
                  )}

                  {resultado.resumo.reducaoPercentual > 0 && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="text-green-600 dark:text-green-400 text-sm font-medium">
                        ✅ Redução de {resultado.resumo.reducaoPercentual.toFixed(1)}% do encargo mensal
                      </div>
                    </div>
                  )}
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
                            {fase.tipoFase}
                          </Badge>
                          <Badge variant="outline">
                            {fase.duracaoMeses} {fase.duracaoMeses > 1 ? 'meses' : 'mês'}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {fase.calculos.map((calculo, index) => (
                          <div key={index} className="p-3 border rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{calculo.credor}</div>
                              {calculo.quitado && (
                                <Badge variant="default" className="bg-green-500">QUITADO</Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <div className="text-muted-foreground">Parcela atual:</div>
                                <div className="font-medium">
                                  R$ {calculo.parcelaMensalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  <span className="text-muted-foreground ml-1">
                                    ({calculo.percentualAtual.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                              
                              <div>
                                <div className="text-muted-foreground">Nova parcela:</div>
                                <div className="font-medium text-primary">
                                  R$ {calculo.novaParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  <span className="text-muted-foreground ml-1">
                                    ({calculo.novoPercentual.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                            </div>

                            {calculo.sobraRecebida && calculo.sobraRecebida > 0 && (
                              <div className="text-sm bg-primary/10 p-2 rounded">
                                <span className="text-muted-foreground">Sobra recebida: </span>
                                <span className="font-medium text-primary">
                                  R$ {calculo.sobraRecebida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            )}

                            <div className="text-sm">
                              <span className="text-muted-foreground">Saldo remanescente: </span>
                              <span className="font-medium">
                                R$ {calculo.saldoRemanescente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
