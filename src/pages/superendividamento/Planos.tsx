import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Calculator, FileText } from "lucide-react";

interface Divida {
  id: string;
  credor: string;
  valor: number;
  tipo: 'inclusa' | 'excluida';
}

interface DistribuicaoFase {
  credor: string;
  valorDivida: number;
  parcelaOriginal: number;
  sobra: number;
  parcelaFinal: number;
  saldoRestante: number;
  status: 'ativo' | 'quitando' | 'quitado';
}

interface Fase {
  numero: number;
  parcelas: number;
  tipo: 'normal' | 'ajuste';
  valorMensalTotal: number;
  distribuicao: DistribuicaoFase[];
  creditoresQuitados: string[];
  parcelasAcumuladas: number;
}

export default function SuperendividamentoPlanos() {
  const [clienteId, setClienteId] = useState("");
  const [rendaLiquida, setRendaLiquida] = useState(0);
  const [percentualRenda, setPercentualRenda] = useState<30 | 35>(30);
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [novoCredor, setNovoCredor] = useState("");
  const [novoValor, setNovoValor] = useState(0);
  const [fases, setFases] = useState<Fase[]>([]);

  // Algoritmo de cálculo das fases - versão simplificada
  const calcularPlanoCompleto = (
    dividasAtivas: Divida[], 
    rendaLiq: number, 
    percentual: 30 | 35
  ): Fase[] => {
    const valorMensalTotal = rendaLiq * (percentual / 100);
    
    // Criar array de saldos das dívidas inclusas
    let saldos: { credor: string; saldo: number }[] = dividasAtivas
      .filter(d => d.tipo === 'inclusa')
      .map(d => ({ credor: d.credor, saldo: d.valor }));
    
    let fasesCalculadas: Fase[] = [];
    let parcelasAcumuladas = 0;
    
    // Loop principal - continua até quitar todas as dívidas ou atingir 60 parcelas
    while (saldos.length > 0 && parcelasAcumuladas < 60) {
      // Calcular total de dívidas restantes
      const totalSaldo = saldos.reduce((sum, s) => sum + s.saldo, 0);
      
      // Calcular parcela proporcional para cada credor
      const parcelasProporcionais = saldos.map(s => {
        const proporcao = s.saldo / totalSaldo;
        const parcelaMensal = valorMensalTotal * proporcao;
        return {
          credor: s.credor,
          saldo: s.saldo,
          parcelaMensal: parcelaMensal,
          mesesParaQuitar: s.saldo / parcelaMensal
        };
      });
      
      // Encontrar o credor que quitará primeiro
      const menorMeses = Math.min(...parcelasProporcionais.map(p => p.mesesParaQuitar));
      
      // Se o menor número de meses for >= 1, criar fase normal
      if (menorMeses >= 1) {
        // FASE NORMAL - múltiplas parcelas sem quitação
        const mesesFase = Math.floor(menorMeses);
        const parcelasRestantes = 60 - parcelasAcumuladas;
        const parcelasFase = Math.min(mesesFase, parcelasRestantes);
        
        const distribuicaoFase: DistribuicaoFase[] = parcelasProporcionais.map(p => {
          const valorPago = p.parcelaMensal * parcelasFase;
          const novoSaldo = p.saldo - valorPago;
          
          return {
            credor: p.credor,
            valorDivida: p.saldo,
            parcelaOriginal: p.parcelaMensal,
            sobra: 0,
            parcelaFinal: p.parcelaMensal,
            saldoRestante: novoSaldo,
            status: 'ativo' as const
          };
        });
        
        fasesCalculadas.push({
          numero: fasesCalculadas.length + 1,
          parcelas: parcelasFase,
          tipo: 'normal',
          valorMensalTotal: valorMensalTotal,
          distribuicao: distribuicaoFase,
          creditoresQuitados: [],
          parcelasAcumuladas: parcelasAcumuladas + parcelasFase
        });
        
        parcelasAcumuladas += parcelasFase;
        
        // Atualizar saldos
        saldos = distribuicaoFase
          .filter(d => d.saldoRestante > 0.01)
          .map(d => ({ credor: d.credor, saldo: d.saldoRestante }));
        
      } else {
        // FASE DE AJUSTE - pelo menos uma dívida será quitada
        const credoresQuitando = parcelasProporcionais.filter(p => p.mesesParaQuitar < 1);
        const credoresContinuam = parcelasProporcionais.filter(p => p.mesesParaQuitar >= 1);
        
        const distribuicaoAjuste: DistribuicaoFase[] = [];
        let sobraTotal = 0;
        
        // Credores que serão quitados
        credoresQuitando.forEach(p => {
          const sobra = p.parcelaMensal - p.saldo;
          sobraTotal += sobra;
          
          distribuicaoAjuste.push({
            credor: p.credor,
            valorDivida: p.saldo,
            parcelaOriginal: p.parcelaMensal,
            sobra: -sobra,
            parcelaFinal: p.saldo,
            saldoRestante: 0,
            status: 'quitando' as const
          });
        });
        
        // Distribuir sobra igualmente entre os que continuam
        const sobraPorCredor = credoresContinuam.length > 0 ? sobraTotal / credoresContinuam.length : 0;
        
        credoresContinuam.forEach(p => {
          const parcelaComSobra = p.parcelaMensal + sobraPorCredor;
          const novoSaldo = p.saldo - parcelaComSobra;
          
          distribuicaoAjuste.push({
            credor: p.credor,
            valorDivida: p.saldo,
            parcelaOriginal: p.parcelaMensal,
            sobra: sobraPorCredor,
            parcelaFinal: parcelaComSobra,
            saldoRestante: novoSaldo,
            status: 'ativo' as const
          });
        });
        
        fasesCalculadas.push({
          numero: fasesCalculadas.length + 1,
          parcelas: 1,
          tipo: 'ajuste',
          valorMensalTotal: valorMensalTotal,
          distribuicao: distribuicaoAjuste,
          creditoresQuitados: credoresQuitando.map(p => p.credor),
          parcelasAcumuladas: parcelasAcumuladas + 1
        });
        
        parcelasAcumuladas += 1;
        
        // Atualizar saldos
        saldos = distribuicaoAjuste
          .filter(d => d.saldoRestante > 0.01)
          .map(d => ({ credor: d.credor, saldo: d.saldoRestante }));
      }
    }
    
    return fasesCalculadas;
  };

  const adicionarDivida = () => {
    if (novoCredor && novoValor > 0) {
      const novaDivida: Divida = {
        id: Date.now().toString(),
        credor: novoCredor,
        valor: novoValor,
        tipo: 'inclusa'
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
    console.log('🚀 BOTÃO CALCULAR CLICADO!');
    console.log('Renda líquida:', rendaLiquida);
    console.log('Dívidas totais:', dividas);
    
    const dividasInclusas = dividas.filter(d => d.tipo === 'inclusa');
    console.log('Dívidas inclusas:', dividasInclusas);
    
    if (rendaLiquida <= 0) {
      console.log('❌ Renda líquida inválida');
      alert('Por favor, informe uma renda líquida válida.');
      return;
    }
    
    if (dividasInclusas.length === 0) {
      console.log('❌ Nenhuma dívida inclusa');
      alert('Por favor, adicione pelo menos uma dívida para calcular o plano.');
      return;
    }
    
    console.log('✅ Validações OK, chamando calcularPlanoCompleto...');
    const fasesCalculadas = calcularPlanoCompleto(dividas, rendaLiquida, percentualRenda);
    console.log('📊 Fases calculadas:', fasesCalculadas);
    console.log('📊 Número de fases:', fasesCalculadas.length);
    
    setFases(fasesCalculadas);
    console.log('✅ Estado atualizado com as fases');
  };

  const valorMensalTotal = rendaLiquida * (percentualRenda / 100);
  const totalDividas = dividas.filter(d => d.tipo === 'inclusa').reduce((sum, d) => sum + d.valor, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Planos de Pagamento
          </h1>
          <p className="text-muted-foreground mt-1">
            Estruture repactuações em fases conforme Lei 14.181/2021
          </p>
        </div>
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
                <Label htmlFor="cliente">Cliente</Label>
                <Select value={clienteId} onValueChange={setClienteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">João Silva</SelectItem>
                    <SelectItem value="2">Maria Santos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
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
                  R$ {valorMensalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                <Button onClick={adicionarDivida}>
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
                    <div className="flex items-center gap-2">
                      <Badge variant={divida.tipo === 'inclusa' ? 'default' : 'secondary'}>
                        {divida.tipo}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => removerDivida(divida.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Total de dívidas:</div>
                <div className="text-xl font-bold">
                  R$ {totalDividas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              
              <Button onClick={calcularPlano} className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calcular Plano de Pagamento
              </Button>
              
              {dividas.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Adicione pelo menos uma dívida para calcular
                </p>
              )}
              
              {rendaLiquida <= 0 && dividas.length > 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Informe a renda líquida mensal
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resultado do Plano */}
        <div className="space-y-6">
          {fases.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Plano</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{fases.length}</div>
                      <div className="text-sm text-muted-foreground">Total de Fases</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {fases[fases.length - 1]?.parcelasAcumuladas || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Total de Parcelas</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {fases.map((fase) => (
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
                      <div className="space-y-3">
                        {fase.distribuicao.map((dist) => (
                          <div key={dist.credor} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium">{dist.credor}</div>
                              <div className="text-sm text-muted-foreground">
                                {fase.tipo === 'ajuste' && dist.sobra !== 0 && (
                                  <>
                                    R$ {dist.parcelaOriginal.toFixed(2)}
                                    {dist.sobra > 0 && ` + R$ ${dist.sobra.toFixed(2)} (sobra)`}
                                    {dist.sobra < 0 && ` (quitação)`}
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">
                                R$ {dist.parcelaFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {dist.saldoRestante === 0 ? 'QUITADO' : `Saldo: R$ ${dist.saldoRestante.toFixed(2)}`}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {fase.creditoresQuitados.length > 0 && (
                          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                            <div className="text-sm font-medium text-green-800 dark:text-green-400">
                              ✅ Credores quitados: {fase.creditoresQuitados.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Salvar Plano de Pagamento
              </Button>
            </>
          )}
          
          {fases.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configure o plano e adicione as dívidas para calcular a repactuação em fases</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
