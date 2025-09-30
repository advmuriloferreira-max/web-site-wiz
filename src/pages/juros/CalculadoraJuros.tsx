import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { 
  calcularTaxaEfetiva, 
  calcularValorParcela, 
  calcularNumeroParcelas, 
  calcularValorFinanciado,
  gerarTabelaPrice 
} from "@/lib/calculoTaxaEfetiva";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CalculadoraJuros() {
  const [valorFinanciado, setValorFinanciado] = useState("");
  const [valorParcela, setValorParcela] = useState("");
  const [numeroParcelas, setNumeroParcelas] = useState("");
  const [taxaMensal, setTaxaMensal] = useState("");
  const [resultado, setResultado] = useState<any>(null);
  const [tabela, setTabela] = useState<any[] | null>(null);

  const handleCalcularTaxa = () => {
    if (!valorFinanciado || !valorParcela || !numeroParcelas) {
      alert("Preencha valor financiado, valor da parcela e número de parcelas");
      return;
    }

    const taxa = calcularTaxaEfetiva({
      valorFinanciado: parseFloat(valorFinanciado),
      valorParcela: parseFloat(valorParcela),
      numeroParcelas: parseInt(numeroParcelas),
      taxaJurosContratual: taxaMensal ? parseFloat(taxaMensal) : undefined,
    });

    const tabelaPrice = gerarTabelaPrice(
      parseFloat(valorFinanciado),
      taxa.taxaEfetivaMensal / 100,
      parseInt(numeroParcelas)
    );

    setResultado(taxa);
    setTabela(tabelaPrice);
  };

  const handleCalcularParcela = () => {
    if (!valorFinanciado || !taxaMensal || !numeroParcelas) {
      alert("Preencha valor financiado, taxa mensal e número de parcelas");
      return;
    }

    const parcela = calcularValorParcela(
      parseFloat(valorFinanciado),
      parseFloat(taxaMensal) / 100,
      parseInt(numeroParcelas)
    );

    const tabelaPrice = gerarTabelaPrice(
      parseFloat(valorFinanciado),
      parseFloat(taxaMensal) / 100,
      parseInt(numeroParcelas)
    );

    setValorParcela(parcela.toFixed(2));
    setTabela(tabelaPrice);
  };

  const handleCalcularNumParcelas = () => {
    if (!valorFinanciado || !valorParcela || !taxaMensal) {
      alert("Preencha valor financiado, valor da parcela e taxa mensal");
      return;
    }

    const numParcelas = calcularNumeroParcelas(
      parseFloat(valorFinanciado),
      parseFloat(valorParcela),
      parseFloat(taxaMensal) / 100
    );

    setNumeroParcelas(numParcelas.toString());
  };

  const handleCalcularValorFinanciado = () => {
    if (!valorParcela || !taxaMensal || !numeroParcelas) {
      alert("Preencha valor da parcela, taxa mensal e número de parcelas");
      return;
    }

    const valor = calcularValorFinanciado(
      parseFloat(valorParcela),
      parseFloat(taxaMensal) / 100,
      parseInt(numeroParcelas)
    );

    setValorFinanciado(valor.toFixed(2));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Calculadora de Juros</h1>
        <p className="text-muted-foreground">
          Calcule taxas efetivas usando a regra de 3 financeira
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Dados do Contrato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Valor Financiado (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={valorFinanciado}
                onChange={(e) => setValorFinanciado(e.target.value)}
                placeholder="Ex: 10000.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Valor da Parcela (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={valorParcela}
                onChange={(e) => setValorParcela(e.target.value)}
                placeholder="Ex: 500.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Número de Parcelas</Label>
              <Input
                type="number"
                value={numeroParcelas}
                onChange={(e) => setNumeroParcelas(e.target.value)}
                placeholder="Ex: 24"
              />
            </div>

            <div className="space-y-2">
              <Label>Taxa Mensal (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={taxaMensal}
                onChange={(e) => setTaxaMensal(e.target.value)}
                placeholder="Ex: 2.50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-4">
              <Button onClick={handleCalcularTaxa} className="w-full">
                Calcular Taxa
              </Button>
              <Button onClick={handleCalcularParcela} variant="outline" className="w-full">
                Calcular Parcela
              </Button>
              <Button onClick={handleCalcularNumParcelas} variant="outline" className="w-full">
                Calcular Prazo
              </Button>
              <Button onClick={handleCalcularValorFinanciado} variant="outline" className="w-full">
                Calcular Valor
              </Button>
            </div>
          </CardContent>
        </Card>

        {resultado && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Resultados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Taxa Efetiva Mensal:</span>
                  <Badge className="text-lg">
                    {resultado.taxaEfetivaMensal.toFixed(4)}%
                  </Badge>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Taxa Efetiva Anual:</span>
                  <Badge className="text-lg">
                    {resultado.taxaEfetivaAnual.toFixed(2)}%
                  </Badge>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">CET (Custo Efetivo Total):</span>
                  <Badge className="text-lg">
                    {resultado.custoEfetivoTotal.toFixed(2)}%
                  </Badge>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Total de Juros:</span>
                  <Badge className="text-lg" variant="destructive">
                    {formatCurrency(resultado.totalJuros)}
                  </Badge>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Total a Pagar:</span>
                  <Badge className="text-lg" variant="outline">
                    {formatCurrency(resultado.totalPago)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {tabela && tabela.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tabela Price - Amortização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parcela</TableHead>
                    <TableHead>Saldo Inicial</TableHead>
                    <TableHead>Juros</TableHead>
                    <TableHead>Amortização</TableHead>
                    <TableHead>Valor Parcela</TableHead>
                    <TableHead>Saldo Final</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tabela.map((linha) => (
                    <TableRow key={linha.parcela}>
                      <TableCell className="font-medium">{linha.parcela}</TableCell>
                      <TableCell>{formatCurrency(linha.saldoInicial)}</TableCell>
                      <TableCell className="text-orange-600">
                        {formatCurrency(linha.juros)}
                      </TableCell>
                      <TableCell className="text-green-600">
                        {formatCurrency(linha.amortizacao)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(linha.valorParcela)}
                      </TableCell>
                      <TableCell>{formatCurrency(linha.saldoFinal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
