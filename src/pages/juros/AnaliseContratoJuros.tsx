import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calculator, TrendingUp, AlertTriangle, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useContratoJurosById } from "@/hooks/useContratosJuros";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calcularTaxaEfetiva, gerarTabelaPrice } from "@/lib/calculoTaxaEfetiva";
import { format } from "date-fns";

export default function AnaliseContratoJuros() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contrato, isLoading, error } = useContratoJurosById(id || null);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando análise do contrato...</p>
        </div>
      </div>
    );
  }

  if (error || !contrato) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Contrato não encontrado</h2>
          <p className="text-muted-foreground mb-6">
            O contrato solicitado não foi encontrado ou você não tem permissão para visualizá-lo.
          </p>
          <Button onClick={() => navigate("/juros/contratos")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Contratos
          </Button>
        </div>
      </div>
    );
  }

  // Calcular taxas se houver dados suficientes
  let resultado = null;
  let tabelaPrice = null;
  
  if (contrato.valor_financiado && contrato.valor_parcela && contrato.numero_parcelas) {
    resultado = calcularTaxaEfetiva({
      valorFinanciado: contrato.valor_financiado,
      valorParcela: contrato.valor_parcela,
      numeroParcelas: contrato.numero_parcelas,
      taxaJurosContratual: contrato.taxa_juros_contratual || undefined,
    });

    tabelaPrice = gerarTabelaPrice(
      contrato.valor_financiado,
      resultado.taxaEfetivaMensal / 100,
      contrato.numero_parcelas
    );
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadge = () => {
    if (contrato.tem_abusividade) {
      const colors: Record<string, string> = {
        "Baixa": "bg-yellow-500",
        "Média": "bg-orange-500",
        "Alta": "bg-red-500",
        "Crítica": "bg-purple-500",
      };
      return (
        <Badge className={colors[contrato.grau_abusividade || ""] || "bg-red-500"}>
          <AlertTriangle className="h-3 w-3 mr-1" />
          {contrato.grau_abusividade || "Abusivo"}
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-500">
        <CheckCircle className="h-3 w-3 mr-1" />
        Conforme
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/juros/contratos")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Análise de Contrato - Juros
            </h1>
            <p className="text-muted-foreground">
              Contrato {contrato.numero_contrato || "S/N"} • Cliente: {contrato.clientes_juros?.nome}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Informações do Contrato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Dados do Contrato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Cliente</span>
              <p className="font-medium">{contrato.clientes_juros?.nome}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Instituição Financeira</span>
              <p className="font-medium">{contrato.instituicoes_financeiras?.nome || "N/A"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Data Contratação</span>
              <p className="font-medium">
                {format(new Date(contrato.data_contratacao), "dd/MM/yyyy")}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Valor Financiado</span>
              <p className="font-medium">{formatCurrency(contrato.valor_financiado)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Valor da Parcela</span>
              <p className="font-medium">{formatCurrency(contrato.valor_parcela)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Número de Parcelas</span>
              <p className="font-medium">{contrato.numero_parcelas || "N/A"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Taxa Contratual</span>
              <p className="font-medium">
                {contrato.taxa_juros_contratual ? `${contrato.taxa_juros_contratual}%` : "N/A"}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Modalidade BACEN</span>
              <p className="font-medium">{contrato.modalidades_bacen_juros?.nome || "N/A"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Status da Análise</span>
              <p className="font-medium">{contrato.status_analise}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análise de Taxas */}
      {resultado && (
        <Tabs defaultValue="resumo" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resumo">Resumo da Análise</TabsTrigger>
            <TabsTrigger value="amortizacao">Tabela de Amortização</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Taxas Calculadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <span className="text-sm text-muted-foreground">Taxa Efetiva Mensal</span>
                      <p className="text-2xl font-bold text-primary">
                        {resultado.taxaEfetivaMensal.toFixed(4)}%
                      </p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <span className="text-sm text-muted-foreground">Taxa Efetiva Anual</span>
                      <p className="text-2xl font-bold text-primary">
                        {resultado.taxaEfetivaAnual.toFixed(2)}%
                      </p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <span className="text-sm text-muted-foreground">CET (Custo Efetivo Total)</span>
                      <p className="text-2xl font-bold text-orange-600">
                        {resultado.custoEfetivoTotal.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <span className="text-sm text-muted-foreground">Total de Juros</span>
                      <p className="text-2xl font-bold text-destructive">
                        {formatCurrency(resultado.totalJuros)}
                      </p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <span className="text-sm text-muted-foreground">Total a Pagar</span>
                      <p className="text-2xl font-bold">
                        {formatCurrency(resultado.totalPago)}
                      </p>
                    </div>

                    {contrato.taxa_bacen_referencia && (
                      <div className="p-4 bg-muted rounded-lg">
                        <span className="text-sm text-muted-foreground">
                          Diferença vs. Taxa BACEN
                        </span>
                        <p className="text-2xl font-bold text-destructive">
                          {contrato.diferenca_vs_bacen?.toFixed(2)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparação com BACEN */}
            {contrato.taxa_bacen_referencia && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Comparação com Taxa BACEN
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <span className="text-sm text-muted-foreground">Taxa BACEN Referência</span>
                      <p className="text-xl font-bold">{contrato.taxa_bacen_referencia}%</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <span className="text-sm text-muted-foreground">Taxa Efetiva do Contrato</span>
                      <p className="text-xl font-bold">{resultado.taxaEfetivaMensal.toFixed(4)}%</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <span className="text-sm text-muted-foreground">Diferença</span>
                      <p className="text-xl font-bold text-destructive">
                        +{contrato.diferenca_vs_bacen?.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="amortizacao">
            {tabelaPrice && (
              <Card>
                <CardHeader>
                  <CardTitle>Tabela Price - Amortização</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[600px] overflow-y-auto">
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
                        {tabelaPrice.map((linha) => (
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
          </TabsContent>
        </Tabs>
      )}

      {/* Observações */}
      {contrato.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {contrato.observacoes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
