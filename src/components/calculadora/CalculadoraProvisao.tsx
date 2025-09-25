import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, Info, AlertCircle } from "lucide-react";
import { useProvisaoPerda, useProvisaoPerdaIncorrida } from "@/hooks/useProvisao";
import { 
  calcularProvisao, 
  classificarRisco, 
  calcularDiasAtraso,
  diasParaMeses,
  ClassificacaoRisco,
  ResultadoCalculo 
} from "@/lib/calculoProvisao";

export function CalculadoraProvisao() {
  const [valorDivida, setValorDivida] = useState<string>("");
  const [dataVencimento, setDataVencimento] = useState<string>("");
  const [diasAtrasoManual, setDiasAtrasoManual] = useState<string>("");
  const [classificacaoManual, setClassificacaoManual] = useState<ClassificacaoRisco | "">("");
  const [criterioIncorrida, setCriterioIncorrida] = useState<string>("Dias de Atraso");
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const [usarCalculoAutomatico, setUsarCalculoAutomatico] = useState(true);

  const { data: tabelaPerda } = useProvisaoPerda();
  const { data: tabelaIncorrida } = useProvisaoPerdaIncorrida();

  const calcular = () => {
    if (!valorDivida || !tabelaPerda || !tabelaIncorrida) return;

    const valor = parseFloat(valorDivida);
    let diasAtraso = 0;
    let classificacao: ClassificacaoRisco;

    if (usarCalculoAutomatico && dataVencimento) {
      diasAtraso = calcularDiasAtraso(dataVencimento);
      classificacao = classificarRisco(diasAtraso);
    } else {
      diasAtraso = parseInt(diasAtrasoManual) || 0;
      classificacao = classificacaoManual as ClassificacaoRisco || 'C1';
    }

    const resultadoCalculo = calcularProvisao({
      valorDivida: valor,
      diasAtraso,
      classificacao,
      tabelaPerda,
      tabelaIncorrida,
      criterioIncorrida,
    });

    setResultado(resultadoCalculo);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const getClassificacaoColor = (classificacao: string) => {
    switch (classificacao) {
      case "C1": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "C2": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "C3": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "C4": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "C5": return "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  useEffect(() => {
    if (valorDivida && ((usarCalculoAutomatico && dataVencimento) || (!usarCalculoAutomatico && diasAtrasoManual && classificacaoManual))) {
      calcular();
    }
  }, [valorDivida, dataVencimento, diasAtrasoManual, classificacaoManual, criterioIncorrida, usarCalculoAutomatico, tabelaPerda, tabelaIncorrida]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora de Provisão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Valor da Dívida */}
          <div className="space-y-2">
            <Label htmlFor="valor-divida">Valor da Dívida *</Label>
            <Input
              id="valor-divida"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={valorDivida}
              onChange={(e) => setValorDivida(e.target.value)}
            />
          </div>

          {/* Método de Cálculo */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button
                variant={usarCalculoAutomatico ? "default" : "outline"}
                size="sm"
                onClick={() => setUsarCalculoAutomatico(true)}
              >
                Cálculo Automático
              </Button>
              <Button
                variant={!usarCalculoAutomatico ? "default" : "outline"}
                size="sm"
                onClick={() => setUsarCalculoAutomatico(false)}
              >
                Cálculo Manual
              </Button>
            </div>

            {usarCalculoAutomatico ? (
              <div className="space-y-2">
                <Label htmlFor="data-vencimento">Data de Vencimento</Label>
                <Input
                  id="data-vencimento"
                  type="date"
                  value={dataVencimento}
                  onChange={(e) => setDataVencimento(e.target.value)}
                />
                {dataVencimento && (
                  <div className="text-sm text-muted-foreground">
                    Dias em atraso: {calcularDiasAtraso(dataVencimento)} • 
                    Classificação: <Badge className={getClassificacaoColor(classificarRisco(calcularDiasAtraso(dataVencimento)))}>
                      {classificarRisco(calcularDiasAtraso(dataVencimento))}
                    </Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dias-atraso">Dias em Atraso</Label>
                  <Input
                    id="dias-atraso"
                    type="number"
                    placeholder="0"
                    value={diasAtrasoManual}
                    onChange={(e) => setDiasAtrasoManual(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classificacao">Classificação de Risco</Label>
                  <Select value={classificacaoManual} onValueChange={(value) => setClassificacaoManual(value as ClassificacaoRisco | "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="C1">C1</SelectItem>
                      <SelectItem value="C2">C2</SelectItem>
                      <SelectItem value="C3">C3</SelectItem>
                      <SelectItem value="C4">C4</SelectItem>
                      <SelectItem value="C5">C5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Critério Perdas Incorridas */}
          <div className="space-y-2">
            <Label htmlFor="criterio">Critério Perdas Incorridas</Label>
            <Select value={criterioIncorrida} onValueChange={setCriterioIncorrida}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dias de Atraso">Dias de Atraso</SelectItem>
                <SelectItem value="Histórico de Perdas">Histórico de Perdas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={calcular} className="w-full">
            Calcular Provisão
          </Button>
        </CardContent>
      </Card>

      {/* Resultado */}
      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Resultado do Cálculo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Perda Esperada */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Perda Esperada
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Percentual:</span>
                    <Badge variant="outline">{formatPercentage(resultado.percentualPerda)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor:</span>
                    <span className="font-medium">{formatCurrency(resultado.valorProvisaoPerda)}</span>
                  </div>
                  {resultado.regraAplicadaPerda && (
                    <div className="text-xs text-muted-foreground">
                      Regra: {resultado.regraAplicadaPerda.periodo_atraso} 
                      ({resultado.regraAplicadaPerda.prazo_inicial}-{resultado.regraAplicadaPerda.prazo_final} dias)
                    </div>
                  )}
                </div>
              </div>

              {/* Perdas Incorridas */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Perdas Incorridas
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Percentual:</span>
                    <Badge variant="outline">{formatPercentage(resultado.percentualIncorrida)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor:</span>
                    <span className="font-medium">{formatCurrency(resultado.valorProvisaoIncorrida)}</span>
                  </div>
                  {resultado.regraAplicadaIncorrida && (
                    <div className="text-xs text-muted-foreground">
                      Regra: {resultado.regraAplicadaIncorrida.criterio} 
                      ({resultado.regraAplicadaIncorrida.prazo_inicial}-{resultado.regraAplicadaIncorrida.prazo_final} dias)
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                <span className="font-semibold">Provisão Total (Maior Valor):</span>
              </div>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(resultado.valorProvisaoTotal)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}