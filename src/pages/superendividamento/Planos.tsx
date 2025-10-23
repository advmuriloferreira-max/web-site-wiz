import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Calculator } from "lucide-react";
import { calcularPlanoCompleto } from "@/utils/calculoPlanosPagamento";
import type { Divida, FasePagamento } from "@/types/superendividamento";

export default function PlanosPagamento() {
  const [rendaLiquida, setRendaLiquida] = useState<number>(0);
  const [percentualRenda, setPercentualRenda] = useState<number>(30);
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [novoCredor, setNovoCredor] = useState<string>("");
  const [novoValor, setNovoValor] = useState<number>(0);
  const [resultadoFases, setResultadoFases] = useState<FasePagamento[]>([]);

  const adicionarDivida = () => {
    if (novoCredor.trim() && novoValor > 0) {
      const novaDivida: Divida = {
        id: Date.now().toString(),
        credor: novoCredor.trim(),
        valor: novoValor
      };
      setDividas([...dividas, novaDivida]);
      setNovoCredor("");
      setNovoValor(0);
    }
  };

  const removerDivida = (id: string) => {
    setDividas(dividas.filter(d => d.id !== id));
  };

  const calcularPlano = () => {
    if (rendaLiquida > 0 && dividas.length > 0) {
      const fases = calcularPlanoCompleto(dividas, rendaLiquida, percentualRenda);
      setResultadoFases(fases);
    }
  };

  const valorMensalDisponivel = rendaLiquida * (percentualRenda / 100);
  const totalDividas = dividas.reduce((soma, d) => soma + d.valor, 0);
  const totalParcelas = resultadoFases.reduce((soma, fase) => soma + fase.quantidadeParcelas, 0);

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
                <Select value={percentualRenda.toString()} onValueChange={(value) => setPercentualRenda(Number(value) as 30 | 35)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30% da renda líquida</SelectItem>
                    <SelectItem value="35">35% da renda líquida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Valor mensal disponível:</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  R$ {valorMensalDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dívidas do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nome do credor"
                  value={novoCredor}
                  onChange={(e) => setNovoCredor(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Valor da dívida"
                  value={novoValor || ""}
                  onChange={(e) => setNovoValor(Number(e.target.value))}
                />
                <Button onClick={adicionarDivida} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {dividas.map((divida) => (
                  <div key={divida.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{divida.credor}</div>
                      <div className="text-sm text-muted-foreground">
                        R$ {divida.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removerDivida(divida.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {totalDividas > 0 && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Total de dívidas:</div>
                  <div className="text-xl font-bold">
                    R$ {totalDividas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              )}
              
              <Button 
                onClick={calcularPlano} 
                className="w-full" 
                disabled={!rendaLiquida || dividas.length === 0}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calcular Plano de Pagamento
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Resultados */}
        <div className="space-y-6">
          {resultadoFases.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Plano</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{resultadoFases.length}</div>
                      <div className="text-sm text-muted-foreground">Total de Fases</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalParcelas}</div>
                      <div className="text-sm text-muted-foreground">Total de Parcelas</div>
                    </div>
                  </div>
                  
                  {totalParcelas > 60 && (
                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="text-destructive text-sm font-medium">
                        ⚠️ Plano excede 60 parcelas (limite legal)
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                {resultadoFases.map((fase) => (
                  <Card key={fase.numeroFase}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Fase {fase.numeroFase}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={fase.tipoFase === 'normal' ? 'default' : 'secondary'}>
                            {fase.tipoFase}
                          </Badge>
                          <Badge variant="outline">
                            {fase.quantidadeParcelas} parcela{fase.quantidadeParcelas > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {fase.distribuicoes.map((dist, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">{dist.credor}</div>
                              {fase.tipoFase === 'ajuste' && dist.sobraRecebida > 0 && (
                                <div className="text-sm text-muted-foreground">
                                  R$ {dist.parcelaBase.toFixed(2)} + R$ {dist.sobraRecebida.toFixed(2)} (sobra)
                                </div>
                              )}
                              {fase.tipoFase === 'ajuste' && dist.quitado && (
                                <div className="text-sm text-green-600 dark:text-green-400">Quitação final</div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-bold">
                                R$ {dist.parcelaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {dist.quitado ? 'QUITADO' : `Saldo: R$ ${dist.saldoRestante.toFixed(2)}`}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {fase.creditoresQuitados.length > 0 && (
                          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                            <div className="text-sm font-medium text-green-800 dark:text-green-400">
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
