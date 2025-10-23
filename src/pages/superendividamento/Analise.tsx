import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface DespesasEssenciais {
  alimentacao: number;
  moradia: number;
  saude: number;
  educacao: number;
  transporte: number;
  vestuario: number;
  comunicacao: number;
  outros: number;
}

interface AnaliseEconomica {
  rendaLiquida: number;
  despesasEssenciais: number;
  minimoExistencial: number;
  capacidadePagamento: number;
  percentualComprometimento: number;
  situacao: 'controlado' | 'risco' | 'superendividado';
}

export default function SuperendividamentoAnalise() {
  const [clienteId, setClienteId] = useState("");
  const [rendaLiquida, setRendaLiquida] = useState(0);
  const [despesas, setDespesas] = useState<DespesasEssenciais>({
    alimentacao: 0,
    moradia: 0,
    saude: 0,
    educacao: 0,
    transporte: 0,
    vestuario: 0,
    comunicacao: 0,
    outros: 0
  });
  const [dividasMensais, setDividasMensais] = useState(0);
  const [analise, setAnalise] = useState<AnaliseEconomica | null>(null);

  const calcularAnalise = () => {
    const despesasTotal = Object.values(despesas).reduce((sum, valor) => sum + valor, 0);
    const minimoExistencial = despesasTotal * 1.3; // Margem de 30%
    const capacidadePagamento = Math.max(0, rendaLiquida - minimoExistencial);
    const percentualComprometimento = rendaLiquida > 0 ? (dividasMensais / rendaLiquida) * 100 : 0;
    
    let situacao: 'controlado' | 'risco' | 'superendividado';
    if (percentualComprometimento <= 30) situacao = 'controlado';
    else if (percentualComprometimento <= 50) situacao = 'risco';
    else situacao = 'superendividado';
    
    setAnalise({
      rendaLiquida,
      despesasEssenciais: despesasTotal,
      minimoExistencial,
      capacidadePagamento,
      percentualComprometimento,
      situacao
    });
  };

  const getSituacaoColor = (situacao: string) => {
    switch (situacao) {
      case 'controlado': return 'bg-green-100 text-green-800';
      case 'risco': return 'bg-yellow-100 text-yellow-800';
      case 'superendividado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSituacaoIcon = (situacao: string) => {
    switch (situacao) {
      case 'controlado': return <CheckCircle className="h-4 w-4" />;
      case 'risco': return <AlertTriangle className="h-4 w-4" />;
      case 'superendividado': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            Análise Socioeconômica
          </h1>
          <p className="text-muted-foreground mt-1">
            Calcule o mínimo existencial e determine a capacidade de pagamento
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Entrada */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Cliente</CardTitle>
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
                <Label htmlFor="dividas">Total de Dívidas Mensais</Label>
                <Input
                  id="dividas"
                  type="number"
                  placeholder="0,00"
                  value={dividasMensais || ""}
                  onChange={(e) => setDividasMensais(Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Despesas Essenciais</CardTitle>
              <p className="text-sm text-muted-foreground">
                Informe os gastos mensais com necessidades básicas
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="alimentacao">Alimentação</Label>
                  <Input
                    id="alimentacao"
                    type="number"
                    placeholder="0,00"
                    value={despesas.alimentacao || ""}
                    onChange={(e) => setDespesas(prev => ({...prev, alimentacao: Number(e.target.value)}))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="moradia">Moradia</Label>
                  <Input
                    id="moradia"
                    type="number"
                    placeholder="0,00"
                    value={despesas.moradia || ""}
                    onChange={(e) => setDespesas(prev => ({...prev, moradia: Number(e.target.value)}))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="saude">Saúde</Label>
                  <Input
                    id="saude"
                    type="number"
                    placeholder="0,00"
                    value={despesas.saude || ""}
                    onChange={(e) => setDespesas(prev => ({...prev, saude: Number(e.target.value)}))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="educacao">Educação</Label>
                  <Input
                    id="educacao"
                    type="number"
                    placeholder="0,00"
                    value={despesas.educacao || ""}
                    onChange={(e) => setDespesas(prev => ({...prev, educacao: Number(e.target.value)}))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="transporte">Transporte</Label>
                  <Input
                    id="transporte"
                    type="number"
                    placeholder="0,00"
                    value={despesas.transporte || ""}
                    onChange={(e) => setDespesas(prev => ({...prev, transporte: Number(e.target.value)}))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="vestuario">Vestuário</Label>
                  <Input
                    id="vestuario"
                    type="number"
                    placeholder="0,00"
                    value={despesas.vestuario || ""}
                    onChange={(e) => setDespesas(prev => ({...prev, vestuario: Number(e.target.value)}))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="comunicacao">Comunicação</Label>
                  <Input
                    id="comunicacao"
                    type="number"
                    placeholder="0,00"
                    value={despesas.comunicacao || ""}
                    onChange={(e) => setDespesas(prev => ({...prev, comunicacao: Number(e.target.value)}))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="outros">Outros</Label>
                  <Input
                    id="outros"
                    type="number"
                    placeholder="0,00"
                    value={despesas.outros || ""}
                    onChange={(e) => setDespesas(prev => ({...prev, outros: Number(e.target.value)}))}
                  />
                </div>
              </div>
              
              <Button onClick={calcularAnalise} className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calcular Análise
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Resultados */}
        <div className="space-y-6">
          {analise && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Situação Financeira
                    <Badge className={getSituacaoColor(analise.situacao)}>
                      {getSituacaoIcon(analise.situacao)}
                      {analise.situacao.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        R$ {analise.rendaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-muted-foreground">Renda Líquida</div>
                    </div>
                    
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        R$ {analise.minimoExistencial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-muted-foreground">Mínimo Existencial</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        R$ {analise.capacidadePagamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-muted-foreground">Capacidade de Pagamento</div>
                    </div>
                    
                    <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {analise.percentualComprometimento.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Comprometimento</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detalhamento dos Cálculos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Despesas Essenciais:</span>
                    <span className="font-semibold">R$ {analise.despesasEssenciais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Margem de Segurança (30%):</span>
                    <span className="font-semibold">R$ {(analise.minimoExistencial - analise.despesasEssenciais).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Mínimo Existencial:</span>
                    <span>R$ {analise.minimoExistencial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recomendações</CardTitle>
                </CardHeader>
                <CardContent>
                  {analise.situacao === 'controlado' && (
                    <div className="text-green-700 dark:text-green-400 space-y-2">
                      <p className="font-semibold">✅ Situação financeira controlada</p>
                      <p className="text-sm">O cliente possui capacidade de pagamento adequada.</p>
                    </div>
                  )}
                  {analise.situacao === 'risco' && (
                    <div className="text-yellow-700 dark:text-yellow-400 space-y-2">
                      <p className="font-semibold">⚠️ Situação de risco</p>
                      <p className="text-sm">Recomenda-se renegociação das dívidas para evitar superendividamento.</p>
                    </div>
                  )}
                  {analise.situacao === 'superendividado' && (
                    <div className="text-red-700 dark:text-red-400 space-y-2">
                      <p className="font-semibold">🚨 Cliente superendividado</p>
                      <p className="text-sm">Necessária intervenção imediata com plano de repactuação conforme Lei 14.181/2021.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Gerar Relatório PDF
              </Button>
            </>
          )}
          
          {!analise && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Preencha os dados e clique em "Calcular Análise" para ver os resultados</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
