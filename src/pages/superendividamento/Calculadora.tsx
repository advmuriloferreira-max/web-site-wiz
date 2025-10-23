import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Calculator, Download } from "lucide-react";

interface DividaRapida {
  credor: string;
  valor: number;
}

interface Fase {
  numero: number;
  parcelas: number;
  tipo: 'normal' | 'ajuste';
  distribuicao: {
    credor: string;
    parcelaOriginal: number;
    sobra: number;
    parcelaFinal: number;
    saldoRestante: number;
  }[];
  creditoresQuitados: string[];
}

export default function SuperendividamentoCalculadora() {
  const [rendaLiquida, setRendaLiquida] = useState(0);
  const [percentual, setPercentual] = useState<30 | 35>(30);
  const [dividas, setDividas] = useState<DividaRapida[]>([]);
  const [novoCredor, setNovoCredor] = useState("");
  const [novoValor, setNovoValor] = useState(0);

  // Algoritmo de cálculo (mesmo do Prompt 3)
  const calcularPlanoRapido = (dividasAtivas: DividaRapida[], rendaLiq: number, percentualRenda: 30 | 35): Fase[] => {
    const valorMensalTotal = rendaLiq * (percentualRenda / 100);
    let dividasProcessamento = [...dividasAtivas];
    let fases: Fase[] = [];
    let parcelasAcumuladas = 0;
    
    while (dividasProcessamento.length > 0 && parcelasAcumuladas < 60) {
      const totalDividasAtivas = dividasProcessamento.reduce((sum, d) => sum + d.valor, 0);
      
      const distribuicaoBase = dividasProcessamento.map(divida => {
        const percentualDiv = divida.valor / totalDividasAtivas;
        const parcelaOriginal = valorMensalTotal * percentualDiv;
        return {
          credor: divida.credor,
          valorDivida: divida.valor,
          parcelaOriginal: parcelaOriginal,
          parcelasNecessarias: divida.valor / parcelaOriginal
        };
      });
      
      const menorParcelas = Math.min(...distribuicaoBase.map(d => d.parcelasNecessarias));
      const parcelasCompletas = Math.floor(menorParcelas);
      
      if (parcelasCompletas > 0) {
        const parcelasRestantes = 60 - parcelasAcumuladas;
        const parcelasEfetivas = Math.min(parcelasCompletas, parcelasRestantes);
        
        const distribuicaoNormal = distribuicaoBase.map(d => ({
          credor: d.credor,
          parcelaOriginal: d.parcelaOriginal,
          sobra: 0,
          parcelaFinal: d.parcelaOriginal,
          saldoRestante: d.valorDivida - (d.parcelaOriginal * parcelasEfetivas)
        }));
        
        fases.push({
          numero: fases.length + 1,
          parcelas: parcelasEfetivas,
          tipo: 'normal',
          distribuicao: distribuicaoNormal,
          creditoresQuitados: [],
        });
        
        parcelasAcumuladas += parcelasEfetivas;
        dividasProcessamento = dividasProcessamento.map((d, i) => ({
          ...d,
          valor: distribuicaoNormal[i].saldoRestante
        })).filter(d => d.valor > 0);
      }
      
      if (dividasProcessamento.length > 0 && parcelasAcumuladas < 60) {
        const totalAtual = dividasProcessamento.reduce((sum, d) => sum + d.valor, 0);
        
        const distribuicaoAtual = dividasProcessamento.map(divida => {
          const percentualDiv = divida.valor / totalAtual;
          return {
            credor: divida.credor,
            valorDivida: divida.valor,
            parcelaOriginal: valorMensalTotal * percentualDiv
          };
        });
        
        const credoresParaQuitar = distribuicaoAtual.filter(d => d.valorDivida < d.parcelaOriginal);
        
        if (credoresParaQuitar.length > 0) {
          const creditoresRestantes = distribuicaoAtual.filter(d => !credoresParaQuitar.some(c => c.credor === d.credor));
          let sobraTotal = 0;
          
          const distribuicaoAjuste = [];
          
          credoresParaQuitar.forEach(credor => {
            const sobra = credor.parcelaOriginal - credor.valorDivida;
            sobraTotal += sobra;
            
            distribuicaoAjuste.push({
              credor: credor.credor,
              parcelaOriginal: credor.parcelaOriginal,
              sobra: -sobra,
              parcelaFinal: credor.valorDivida,
              saldoRestante: 0
            });
          });
          
          const sobraPorCredor = creditoresRestantes.length > 0 ? sobraTotal / creditoresRestantes.length : 0;
          
          creditoresRestantes.forEach(credor => {
            const parcelaFinal = credor.parcelaOriginal + sobraPorCredor;
            
            distribuicaoAjuste.push({
              credor: credor.credor,
              parcelaOriginal: credor.parcelaOriginal,
              sobra: sobraPorCredor,
              parcelaFinal: parcelaFinal,
              saldoRestante: Math.max(0, credor.valorDivida - parcelaFinal)
            });
          });
          
          fases.push({
            numero: fases.length + 1,
            parcelas: 1,
            tipo: 'ajuste',
            distribuicao: distribuicaoAjuste,
            creditoresQuitados: credoresParaQuitar.map(c => c.credor)
          });
          
          parcelasAcumuladas += 1;
          dividasProcessamento = dividasProcessamento
            .map(d => ({
              ...d,
              valor: distribuicaoAjuste.find(dist => dist.credor === d.credor)?.saldoRestante || 0
            }))
            .filter(d => d.valor > 0);
        }
      }
    }
    
    return fases;
  };

  const adicionarDivida = () => {
    if (novoCredor && novoValor > 0) {
      setDividas([...dividas, { credor: novoCredor, valor: novoValor }]);
      setNovoCredor("");
      setNovoValor(0);
    }
  };

  const removerDivida = (index: number) => {
    setDividas(dividas.filter((_, i) => i !== index));
  };

  const resultados = useMemo(() => {
    if (dividas.length === 0 || rendaLiquida === 0) return null;
    return calcularPlanoRapido(dividas, rendaLiquida, percentual);
  }, [dividas, rendaLiquida, percentual]);

  const valorMensal = rendaLiquida * (percentual / 100);
  const totalDividas = dividas.reduce((sum, d) => sum + d.valor, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            Calculadora Rápida
          </h1>
          <p className="text-muted-foreground mt-1">
            Simule planos de pagamento sem salvar no sistema
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entrada de Dados */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados Básicos</CardTitle>
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
                <Label htmlFor="percentual">Percentual para Pagamento</Label>
                <Select value={percentual.toString()} onValueChange={(value) => setPercentual(Number(value) as 30 | 35)}>
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
                  R$ {valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dívidas</CardTitle>
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
                  placeholder="Valor"
                  value={novoValor || ""}
                  onChange={(e) => setNovoValor(Number(e.target.value))}
                />
                <Button onClick={adicionarDivida}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {dividas.map((divida, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{divida.credor}</div>
                      <div className="text-sm text-muted-foreground">
                        R$ {divida.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removerDivida(index)}>
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
            </CardContent>
          </Card>
        </div>

        {/* Resultados */}
        <div className="space-y-6">
          {resultados && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Resumo da Simulação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{resultados.length}</div>
                      <div className="text-sm text-muted-foreground">Fases</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {resultados.reduce((sum, fase) => sum + fase.parcelas, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Parcelas</div>
                    </div>
                    
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        R$ {(valorMensal * resultados.reduce((sum, fase) => sum + fase.parcelas, 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Pago</div>
                    </div>
                  </div>
                  
                  {resultados.reduce((sum, fase) => sum + fase.parcelas, 0) > 60 && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="text-red-800 dark:text-red-400 font-medium">⚠️ Atenção!</div>
                      <div className="text-red-700 dark:text-red-300 text-sm">
                        O plano excede o limite legal de 60 parcelas. Algumas dívidas podem não ser quitadas completamente.
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                {resultados.map((fase) => (
                  <Card key={fase.numero}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Fase {fase.numero}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={fase.tipo === 'normal' ? 'default' : 'secondary'}>
                            {fase.tipo}
                          </Badge>
                          <Badge variant="outline">
                            {fase.parcelas} parcela{fase.parcelas > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {fase.distribuicao.map((dist, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <div className="font-medium">{dist.credor}</div>
                              {fase.tipo === 'ajuste' && dist.sobra !== 0 && (
                                <div className="text-xs text-muted-foreground">
                                  {dist.sobra > 0 && `R$ ${dist.parcelaOriginal.toFixed(2)} + R$ ${dist.sobra.toFixed(2)} (sobra)`}
                                  {dist.sobra < 0 && 'Quitação final'}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-bold">R$ {dist.parcelaFinal.toFixed(2)}</div>
                              <div className="text-xs text-muted-foreground">
                                {dist.saldoRestante === 0 ? 'QUITADO' : `Saldo: R$ ${dist.saldoRestante.toFixed(2)}`}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {fase.creditoresQuitados.length > 0 && (
                          <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded text-sm text-green-800 dark:text-green-400">
                            ✅ Quitados: {fase.creditoresQuitados.join(', ')}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Baixar Simulação em PDF
              </Button>
            </>
          )}
          
          {!resultados && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Preencha os dados e adicione as dívidas para simular o plano de pagamento</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
