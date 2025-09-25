import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { useTiposOperacao } from "@/hooks/useTiposOperacao";
import { Calculator, TrendingUp, AlertTriangle, Target } from "lucide-react";

export function CalculadoraProvisaoCompleta() {
  // Estados para inputs
  const [valorDivida, setValorDivida] = useState<string>('');
  const [dataVencimento, setDataVencimento] = useState<string>('');
  const [diasAtrasoManual, setDiasAtrasoManual] = useState<string>('');
  const [tipoOperacaoId, setTipoOperacaoId] = useState<string>('');
  const [modoCalculo, setModoCalculo] = useState<'automatico' | 'manual'>('automatico');
  const [criterioIncorrida, setCriterioIncorrida] = useState<string>('Dias de Atraso');
  const [taxaJuros, setTaxaJuros] = useState<string>('2.5');

  // Estados para resultados
  const [resultado, setResultado] = useState<any>(null);

  // Hooks para dados
  const { data: tabelaPerda } = useProvisaoPerda();
  const { data: tabelaIncorrida } = useProvisaoPerdaIncorrida();
  const { data: tiposOperacao } = useTiposOperacao();

  const calcular = () => {
    if (!valorDivida || (!dataVencimento && !diasAtrasoManual)) return;

    const valor = parseFloat(valorDivida);
    const diasAtraso = modoCalculo === 'automatico' 
      ? calcularDiasAtraso(dataVencimento)
      : parseInt(diasAtrasoManual) || 0;

    if (!tabelaPerda || !tabelaIncorrida) return;

    // Determinar classificação baseada no tipo de operação
    let classificacao: ClassificacaoRisco = 'C5'; // Fallback conservador
    if (tipoOperacaoId && tiposOperacao) {
      const tipoSelecionado = tiposOperacao.find(t => t.id === tipoOperacaoId);
      if (tipoSelecionado) {
        classificacao = tipoSelecionado.carteira as ClassificacaoRisco;
      }
    }

    // Cálculo tradicional
    const resultadoCalculo = calcularProvisao({
      valorDivida: valor,
      diasAtraso,
      classificacao,
      tabelaPerda,
      tabelaIncorrida,
      criterioIncorrida
    });

    setResultado(resultadoCalculo);
  };

  useEffect(() => {
    if (valorDivida && (dataVencimento || diasAtrasoManual)) {
      calcular();
    }
  }, [valorDivida, dataVencimento, diasAtrasoManual, tipoOperacaoId, criterioIncorrida, taxaJuros, modoCalculo]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const diasAtraso = modoCalculo === 'automatico' && dataVencimento 
    ? calcularDiasAtraso(dataVencimento)
    : parseInt(diasAtrasoManual) || 0;

  const tipoOperacaoSelecionado = tiposOperacao?.find(t => t.id === tipoOperacaoId);
  const classificacaoAuto = tipoOperacaoSelecionado?.carteira || 'C5';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora BCB 352/2023 - Marco de 90 Dias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription>
              <strong>Marco Regulamentar:</strong> Até 90 dias usa Anexo II (Perdas Esperadas) | 
              Acima de 90 dias usa Anexo I (Perdas Incorridas) | 
              Classificação C1-C5 baseada no tipo de operação
            </AlertDescription>
          </Alert>
          
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
                  <SelectItem value="automatico">Por Data de Vencimento</SelectItem>
                  <SelectItem value="manual">Por Dias de Atraso</SelectItem>
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
              <Label>Tipo de Operação BCB 352/2023</Label>
              <Select value={tipoOperacaoId} onValueChange={setTipoOperacaoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de operação" />
                </SelectTrigger>
                <SelectContent>
                  {tiposOperacao?.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          [{tipo.carteira}] {tipo.nome}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {tipo.descricao}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {tipoOperacaoSelecionado && (
                <div className="text-xs text-blue-600">
                  Classificação automática: <Badge className="ml-1">{classificacaoAuto}</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Marco Temporal BCB 352/2023 */}
          {diasAtraso > 0 && (
            <div className="mt-6">
              <Card className={`p-4 border-2 ${
                diasAtraso > 450 && ['C3','C4','C5'].includes(classificacaoAuto) ? 'border-red-500 bg-red-50' : 
                diasAtraso > 630 && ['C1','C2'].includes(classificacaoAuto) ? 'border-red-500 bg-red-50' :
                diasAtraso > 90 ? 'border-orange-500 bg-orange-50' : 
                'border-green-500 bg-green-50'
              }`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-5 w-5 ${
                    (diasAtraso > 450 && ['C3','C4','C5'].includes(classificacaoAuto)) || 
                    (diasAtraso > 630 && ['C1','C2'].includes(classificacaoAuto)) ? 'text-red-600' :
                    diasAtraso > 90 ? 'text-orange-600' : 'text-green-600'
                  }`} />
                  <div className="flex-1">
                    <h3 className="font-semibold">Marco Regulamentar BCB 352/2023</h3>
                    <p className="text-sm">
                      {diasAtraso > 450 && ['C3','C4','C5'].includes(classificacaoAuto)
                        ? "🔴 PROVISÃO 100% - 15+ meses para C3/C4/C5"
                        : diasAtraso > 630 && ['C1','C2'].includes(classificacaoAuto)
                        ? "🔴 PROVISÃO 100% - 21+ meses para C1/C2"
                        : diasAtraso > 90
                        ? "🟠 INADIMPLIDO - Usa Anexo I (Perdas Incorridas)"
                        : "🟢 EM DIA - Usa Anexo II (Perdas Esperadas)"
                      }
                    </p>
                    <div className="mt-2 text-xs">
                      <strong>Situação atual:</strong> {(diasAtraso / 30).toFixed(1)} meses de atraso | 
                      Classificação: {classificacaoAuto} | 
                      Metodologia: {diasAtraso > 90 ? 'Anexo I' : 'Anexo II'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{diasAtraso}</div>
                    <div className="text-xs text-muted-foreground">dias</div>
                    <div className="text-sm font-semibold">{(diasAtraso / 30).toFixed(1)} meses</div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados */}
      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resultado BCB 352/2023
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-blue-50">
                <div className="text-sm text-muted-foreground">Percentual de Provisão</div>
                <div className="text-2xl font-bold text-blue-600">{formatPercentage(resultado.percentualProvisao)}</div>
                <div className="text-xs text-muted-foreground">{resultado.regra}</div>
              </Card>
              <Card className="p-4 bg-green-50">
                <div className="text-sm text-muted-foreground">Valor da Provisão</div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(resultado.valorProvisao)}</div>
                <div className="text-xs text-muted-foreground">Estágio {resultado.estagio}</div>
              </Card>
              <Card className="p-4 bg-purple-50">
                <div className="text-sm text-muted-foreground">Marco Regulamentar</div>
                <div className="text-lg font-bold text-purple-600">
                  {diasAtraso > 90 ? 'Anexo I' : 'Anexo II'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {diasAtraso > 90 ? 'Perdas Incorridas' : 'Perdas Esperadas'}
                </div>
              </Card>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-800">
                <strong>Detalhes do Cálculo:</strong><br/>
                {resultado.detalhes}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}