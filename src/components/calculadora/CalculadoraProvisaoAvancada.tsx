import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  calcularProvisaoAvancada, 
  calcularProvisao,
  ClassificacaoRisco, 
  EstagioRisco,
  calcularDiasAtraso,
  determinarEstagio,
  calcularProbabilidadeDefault,
  calcularTaxaRecuperacao 
} from "@/lib/calculoProvisao";
import { useProvisaoPerda, useProvisaoPerdaIncorrida } from "@/hooks/useProvisao";
import { Calculator, TrendingUp, AlertTriangle } from "lucide-react";

export function CalculadoraProvisaoAvancada() {
  // Estados para inputs
  const [valorDivida, setValorDivida] = useState<string>('');
  const [dataVencimento, setDataVencimento] = useState<string>('');
  const [diasAtrasoManual, setDiasAtrasoManual] = useState<string>('');
  const [classificacaoManual, setClassificacaoManual] = useState<ClassificacaoRisco>('C1');
  const [modoCalculo, setModoCalculo] = useState<'automatico' | 'manual'>('automatico');
  const [criterioIncorrida, setCriterioIncorrida] = useState<string>('Dias de Atraso');
  const [temGarantiaReal, setTemGarantiaReal] = useState<boolean>(false);
  const [valorGarantia, setValorGarantia] = useState<string>('');
  const [taxaJuros, setTaxaJuros] = useState<string>('2.5');

  // Estados para resultados
  const [resultado, setResultado] = useState<any>(null);
  const [resultadoAvancado, setResultadoAvancado] = useState<any>(null);

  // Hooks para dados
  const { data: tabelaPerda } = useProvisaoPerda();
  const { data: tabelaIncorrida } = useProvisaoPerdaIncorrida();

  const calcular = () => {
    if (!valorDivida || (!dataVencimento && !diasAtrasoManual)) return;

    const valor = parseFloat(valorDivida);
    const diasAtraso = modoCalculo === 'automatico' 
      ? calcularDiasAtraso(dataVencimento)
      : parseInt(diasAtrasoManual) || 0;

    if (!tabelaPerda || !tabelaIncorrida) return;

    // Cálculo tradicional
    const resultadoTradicional = calcularProvisao({
      valorDivida: valor,
      diasAtraso,
      classificacao: classificacaoManual,
      tabelaPerda,
      tabelaIncorrida,
      criterioIncorrida
    });

    // Cálculo avançado
    const resultadoCompleto = calcularProvisaoAvancada({
      valorDivida: valor,
      diasAtraso,
      classificacao: classificacaoManual,
      tabelaPerda,
      tabelaIncorrida,
      criterioIncorrida,
      taxaJurosEfetiva: parseFloat(taxaJuros) || 2.5
    });

    setResultado(resultadoTradicional);
    setResultadoAvancado(resultadoCompleto);
  };

  useEffect(() => {
    if (valorDivida && (dataVencimento || diasAtrasoManual)) {
      calcular();
    }
  }, [valorDivida, dataVencimento, diasAtrasoManual, classificacaoManual, criterioIncorrida, temGarantiaReal, valorGarantia, taxaJuros, modoCalculo]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const getEstagioColor = (estagio: EstagioRisco): string => {
    switch (estagio) {
      case 1: return "bg-green-100 text-green-800 border-green-300";
      case 2: return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 3: return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getClassificacaoColor = (classificacao: string): string => {
    switch (classificacao) {
      case 'C1': return "bg-green-100 text-green-800";
      case 'C2': return "bg-blue-100 text-blue-800";
      case 'C3': return "bg-yellow-100 text-yellow-800";
      case 'C4': return "bg-orange-100 text-orange-800";
      case 'C5': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const diasAtraso = modoCalculo === 'automatico' && dataVencimento 
    ? calcularDiasAtraso(dataVencimento)
    : parseInt(diasAtrasoManual) || 0;

  const estagio = determinarEstagio(diasAtraso);
  const probabilidadeDefault = calcularProbabilidadeDefault(estagio, classificacaoManual, diasAtraso);
  const taxaRecuperacao = calcularTaxaRecuperacao(
    classificacaoManual, 
    temGarantiaReal, 
    parseFloat(valorGarantia) || 0, 
    parseFloat(valorDivida) || 1
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora de Provisão Avançada - BCB Res. 4966/2021
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor-divida">Valor da Dívida (R$)</Label>
              <Input
                id="valor-divida"
                type="number"
                placeholder="100000.00"
                value={valorDivida}
                onChange={(e) => setValorDivida(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Modo de Cálculo</Label>
              <Select value={modoCalculo} onValueChange={(value: 'automatico' | 'manual') => setModoCalculo(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatico">Automático (Data de Vencimento)</SelectItem>
                  <SelectItem value="manual">Manual (Dias de Atraso)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {modoCalculo === 'automatico' ? (
              <div className="space-y-2">
                <Label htmlFor="data-vencimento">Data de Vencimento</Label>
                <Input
                  id="data-vencimento"
                  type="date"
                  value={dataVencimento}
                  onChange={(e) => setDataVencimento(e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="dias-atraso">Dias de Atraso</Label>
                <Input
                  id="dias-atraso"
                  type="number"
                  placeholder="60"
                  value={diasAtrasoManual}
                  onChange={(e) => setDiasAtrasoManual(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Classificação de Risco</Label>
              <Select value={classificacaoManual} onValueChange={(value: ClassificacaoRisco) => setClassificacaoManual(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C1">C1 - Risco Mínimo</SelectItem>
                  <SelectItem value="C2">C2 - Risco Baixo</SelectItem>
                  <SelectItem value="C3">C3 - Risco Moderado</SelectItem>
                  <SelectItem value="C4">C4 - Risco Alto</SelectItem>
                  <SelectItem value="C5">C5 - Risco Máximo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxa-juros">Taxa de Juros Efetiva (% a.a.)</Label>
              <Input
                id="taxa-juros"
                type="number"
                step="0.1"
                placeholder="2.5"
                value={taxaJuros}
                onChange={(e) => setTaxaJuros(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Critério para Perdas Incorridas</Label>
              <Select value={criterioIncorrida} onValueChange={setCriterioIncorrida}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dias de Atraso">Dias de Atraso</SelectItem>
                  <SelectItem value="Meses de Atraso">Meses de Atraso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Marco Temporal - Regra da 4966/2021 */}
          <div className="mt-6">
            <Card className={`p-4 border-2 ${diasAtraso >= 630 ? 'border-red-500 bg-red-50' : diasAtraso >= 450 && (classificacaoManual === 'C3' || classificacaoManual === 'C4' || classificacaoManual === 'C5') ? 'border-red-400 bg-red-25' : diasAtraso >= 420 ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'}`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-5 w-5 ${diasAtraso >= 630 ? 'text-red-600' : diasAtraso >= 450 ? 'text-red-500' : diasAtraso >= 420 ? 'text-yellow-600' : 'text-green-600'}`} />
                <div className="flex-1">
                  <h3 className="font-semibold">Marco Regulamentar 4966/2021</h3>
                  <p className="text-sm">
                    {diasAtraso >= 630 
                      ? "🔴 CRÍTICO: 21+ meses = 100% PROVISÃO (todas classificações) - Art. 49 Res. 4966"
                      : diasAtraso >= 450 && (classificacaoManual === 'C3' || classificacaoManual === 'C4' || classificacaoManual === 'C5')
                      ? "🔴 CRÍTICO: 15+ meses = 100% PROVISÃO (C3/C4/C5) - Anexo I BCB 352/2023"
                      : diasAtraso >= 420 
                      ? "⚠️ ATENÇÃO: Aproximando dos marcos críticos (15-21 meses dependendo da classificação)"
                      : "✅ Provisão gradual conforme Anexo I da BCB 352/2023"
                    }
                  </p>
                  <div className="mt-2 text-xs">
                    <strong>Marcos por classificação:</strong>
                    <br />• C3/C4/C5: 100% aos 15 meses (~450 dias)
                    <br />• C1/C2: 100% aos 21 meses (~630 dias)
                    <br />• Meses atuais: <span className="font-bold">{(diasAtraso / 30).toFixed(1)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{diasAtraso}</div>
                  <div className="text-xs text-muted-foreground">dias atraso</div>
                  <div className="text-sm font-semibold">{(diasAtraso / 30).toFixed(1)} meses</div>
                </div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {resultado && resultadoAvancado && (
        <Tabs defaultValue="comparativo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
            <TabsTrigger value="tradicional">Método Tradicional</TabsTrigger>
            <TabsTrigger value="avancado">Método Avançado BCB</TabsTrigger>
          </TabsList>

          <TabsContent value="comparativo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Comparação de Metodologias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Método Tradicional</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Perda Esperada:</span>
                        <span className="font-mono">{formatPercentage(resultado.percentualPerda)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Perdas Incorridas:</span>
                        <span className="font-mono">{formatPercentage(resultado.percentualIncorrida)}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2">
                        <span>Provisão Total:</span>
                        <span className="font-mono">{formatCurrency(resultado.valorProvisaoTotal)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Método Avançado BCB</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Perda Esperada:</span>
                        <span className="font-mono">{formatPercentage(resultadoAvancado.percentualPerda)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Perdas Incorridas:</span>
                        <span className="font-mono">{formatPercentage(resultadoAvancado.percentualIncorrida)}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2">
                        <span>Provisão Total:</span>
                        <span className="font-mono">{formatCurrency(resultadoAvancado.valorProvisaoTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-800">Análise Regulamentar</span>
                  </div>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>Diferença de provisão:</strong> {formatCurrency(Math.abs(resultadoAvancado.valorProvisaoTotal - resultado.valorProvisaoTotal))}</p>
                    <p>{resultadoAvancado.valorProvisaoTotal > resultado.valorProvisaoTotal ? '📈 Método BCB mais conservador' : '📉 Método tradicional mais conservador'}</p>
                    {diasAtraso > 180 && (
                      <p className="text-red-700"><strong>⚠️ CRÍTICO:</strong> Mais de 180 dias = Provisão 100% obrigatória</p>
                    )}
                    {diasAtraso > 150 && diasAtraso <= 180 && (
                      <p className="text-yellow-700"><strong>⚠️ ATENÇÃO:</strong> Aproximando dos 180 dias críticos</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tradicional">
            <Card>
              <CardHeader>
                <CardTitle>Resultado - Método Tradicional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-blue-50">
                    <div className="text-sm text-muted-foreground">Perda Esperada</div>
                    <div className="text-2xl font-bold text-blue-600">{formatPercentage(resultado.percentualPerda)}</div>
                    <div className="text-sm font-mono">{formatCurrency(resultado.valorProvisaoPerda)}</div>
                  </Card>
                  <Card className="p-4 bg-orange-50">
                    <div className="text-sm text-muted-foreground">Perdas Incorridas</div>
                    <div className="text-2xl font-bold text-orange-600">{formatPercentage(resultado.percentualIncorrida)}</div>
                    <div className="text-sm font-mono">{formatCurrency(resultado.valorProvisaoIncorrida)}</div>
                  </Card>
                  <Card className="p-4 bg-red-50">
                    <div className="text-sm text-muted-foreground">Provisão Total</div>
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(resultado.valorProvisaoTotal)}</div>
                    <Badge className={getClassificacaoColor(classificacaoManual)}>{classificacaoManual}</Badge>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="avancado">
            <Card>
              <CardHeader>
                <CardTitle>Resultado - Método Avançado BCB</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-blue-50">
                    <div className="text-sm text-muted-foreground">Perda Esperada</div>
                    <div className="text-2xl font-bold text-blue-600">{formatPercentage(resultadoAvancado.percentualPerda)}</div>
                    <div className="text-sm font-mono">{formatCurrency(resultadoAvancado.valorProvisaoPerda)}</div>
                  </Card>
                  <Card className="p-4 bg-orange-50">
                    <div className="text-sm text-muted-foreground">Perdas Incorridas</div>
                    <div className="text-2xl font-bold text-orange-600">{formatPercentage(resultadoAvancado.percentualIncorrida)}</div>
                    <div className="text-sm font-mono">{formatCurrency(resultadoAvancado.valorProvisaoIncorrida)}</div>
                  </Card>
                  <Card className="p-4 bg-red-50">
                    <div className="text-sm text-muted-foreground">Provisão Total</div>
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(resultadoAvancado.valorProvisaoTotal)}</div>
                    <Badge className={getEstagioColor(resultadoAvancado.estagioRisco)}>Estágio {resultadoAvancado.estagioRisco}</Badge>
                  </Card>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Parâmetros Calculados (Metodologia BCB)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Probabilidade Default:</span>
                      <div className="font-mono">{formatPercentage(probabilidadeDefault)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Taxa Recuperação:</span>
                      <div className="font-mono">{formatPercentage(taxaRecuperacao)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">LGD:</span>
                      <div className="font-mono">{formatPercentage(100 - taxaRecuperacao)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Estágio:</span>
                      <Badge className={getEstagioColor(resultadoAvancado.estagioRisco)} variant="outline">
                        {resultadoAvancado.estagioRisco}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}