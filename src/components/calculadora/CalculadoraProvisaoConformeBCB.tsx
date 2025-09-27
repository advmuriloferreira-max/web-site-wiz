import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { 
  calcularProvisaoConformeBCB, 
  determinarEstagioRisco, 
  EstagioRisco,
  ResultadoCalculoBCB,
  getMarcosTemporal 
} from "@/lib/calculoProvisaoConformeBCB";
import { useTiposOperacao } from "@/hooks/useTiposOperacao";

export function CalculadoraProvisaoConformeBCB() {
  const [valorDivida, setValorDivida] = useState<string>("");
  const [dataVencimento, setDataVencimento] = useState<string>("");
  const [tipoOperacaoId, setTipoOperacaoId] = useState<string>("");
  const [isReestruturado, setIsReestruturado] = useState(false);
  const [dataReestruturacao, setDataReestruturacao] = useState<string>("");
  const [resultado, setResultado] = useState<ResultadoCalculoBCB | null>(null);

  const { data: tiposOperacao } = useTiposOperacao();

  const calcularDiasAtraso = (dataVencimento: string): number => {
    if (!dataVencimento) return 0;
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffTime = hoje.getTime() - vencimento.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleCalcular = async () => {
    if (!valorDivida || !dataVencimento) return;

    const diasAtraso = calcularDiasAtraso(dataVencimento);
    const tipoOperacao = tiposOperacao?.find(tipo => tipo.id === tipoOperacaoId);
    
    const resultadoCalculo = await calcularProvisaoConformeBCB({
      valorDivida: parseFloat(valorDivida),
      diasAtraso,
      estagio: determinarEstagioRisco(diasAtraso, isReestruturado, dataReestruturacao),
      tipoOperacao,
      isReestruturado,
      dataReestruturacao: isReestruturado ? dataReestruturacao : undefined
    });

    setResultado(resultadoCalculo);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getEstagioColor = (estagio: EstagioRisco): string => {
    switch (estagio) {
      case 1: return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case 2: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case 3: return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getEstagioLabel = (estagio: EstagioRisco): string => {
    switch (estagio) {
      case 1: return "Estágio 1 - Normal";
      case 2: return "Estágio 2 - Risco Aumentado";
      case 3: return "Estágio 3 - Problemático";
      default: return "Indefinido";
    }
  };

  const diasAtraso = dataVencimento ? calcularDiasAtraso(dataVencimento) : 0;
  const estagio = determinarEstagioRisco(diasAtraso, isReestruturado, dataReestruturacao);
  const marcos = getMarcosTemporal(diasAtraso, tiposOperacao?.find(tipo => tipo.id === tipoOperacaoId));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Calculadora de Provisão - Conforme BCB</h2>
        <Badge variant="outline" className="text-green-600 border-green-600">
          BCB 4.966/2021 e 352/2023
        </Badge>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Metodologia Conforme:</strong> Sistema de três estágios baseado em perdas esperadas (IFRS 9).
          Cálculo: PD × LGD × EAD. Sem uso de classificações C1-C5 (revogadas).
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Entrada */}
        <Card>
          <CardHeader>
            <CardTitle>Dados da Operação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="valorDivida">Valor da Dívida</Label>
              <Input
                id="valorDivida"
                type="number"
                placeholder="Ex: 100000"
                value={valorDivida}
                onChange={(e) => setValorDivida(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataVencimento">Data de Vencimento</Label>
              <Input
                id="dataVencimento"
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
              />
              {dataVencimento && (
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Badge className={getEstagioColor(estagio)}>
                      {getEstagioLabel(estagio)}
                    </Badge>
                    <span>{diasAtraso} dias de atraso</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoOperacao">Tipo de Operação</Label>
              <Select value={tipoOperacaoId} onValueChange={setTipoOperacaoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de operação" />
                </SelectTrigger>
                <SelectContent>
                  {tiposOperacao?.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {tipo.carteira}
                        </Badge>
                        {tipo.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="reestruturado"
                checked={isReestruturado}
                onChange={(e) => setIsReestruturado(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="reestruturado">Operação Reestruturada</Label>
            </div>

            {isReestruturado && (
              <div className="space-y-2">
                <Label htmlFor="dataReestruturacao">Data da Reestruturação</Label>
                <Input
                  id="dataReestruturacao"
                  type="date"
                  value={dataReestruturacao}
                  onChange={(e) => setDataReestruturacao(e.target.value)}
                />
              </div>
            )}

            <Button 
              onClick={handleCalcular} 
              className="w-full"
              disabled={!valorDivida || !dataVencimento}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calcular Provisão
            </Button>
          </CardContent>
        </Card>

        {/* Resultado */}
        {resultado && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Resultado do Cálculo</span>
                <Badge className={getEstagioColor(resultado.estagio)}>
                  {getEstagioLabel(resultado.estagio)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Resultado Principal */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-primary/5">
                  <div className="text-sm text-muted-foreground">Percentual de Provisão</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatPercentage(resultado.percentualProvisao)}
                  </div>
                </Card>
                <Card className="p-4 bg-red-50">
                  <div className="text-sm text-muted-foreground">Valor da Provisão</div>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(resultado.valorProvisao)}
                  </div>
                </Card>
              </div>

              {/* Componentes do Cálculo */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Componentes (PD × LGD × EAD):</Label>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="p-2 bg-blue-50 rounded text-center">
                    <div className="font-medium">PD</div>
                    <div>{formatPercentage(resultado.probabilidadeDefault)}</div>
                  </div>
                  <div className="p-2 bg-orange-50 rounded text-center">
                    <div className="font-medium">LGD</div>
                    <div>{formatPercentage(resultado.perdaDadoDefault)}</div>
                  </div>
                  <div className="p-2 bg-green-50 rounded text-center">
                    <div className="font-medium">EAD</div>
                    <div>{formatCurrency(resultado.exposicaoDefault)}</div>
                  </div>
                </div>
              </div>

              {/* Detalhes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Metodologia:</Label>
                <p className="text-sm text-muted-foreground">{resultado.metodologia}</p>
                <p className="text-xs text-muted-foreground">{resultado.detalhes}</p>
              </div>

              {/* Alertas de Período de Observação */}
              {resultado.emPeriodoObservacao && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Reestruturação em observação:</strong> {resultado.diasRestantesObservacao} dias restantes.
                    Estágio mínimo 2 durante este período.
                  </AlertDescription>
                </Alert>
              )}

              {/* Garantias */}
              {resultado.garantias && resultado.garantias.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Garantias Consideradas:</Label>
                  <div className="text-sm space-y-1">
                    {resultado.garantias.map((garantia, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span>{garantia.tipo_garantia}</span>
                        <span>{formatCurrency(garantia.valor_avaliacao * garantia.percentual_cobertura / 100)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-1 font-medium text-green-600">
                      Total: {formatCurrency(resultado.valorGarantiaTotal || 0)}
                    </div>
                  </div>
                </div>
              )}

              {/* Marcos Temporais */}
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>{marcos.observacoes}</span>
                </div>
                {marcos.paraBaixa && (
                  <Alert className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Atenção:</strong> Ativo elegível para baixa conforme marcos temporais.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}