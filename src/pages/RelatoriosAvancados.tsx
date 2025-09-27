import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, TrendingUp, LineChart } from "lucide-react";
import { format, addMonths, addDays, differenceInDays, subDays } from "date-fns";
import { useContratos } from "@/hooks/useContratos";
import { useClientes } from "@/hooks/useClientes";
import { useContratosByCliente } from "@/hooks/useContratosByCliente";
import { determinarEstagio, calcularProvisao, ClassificacaoRisco } from "@/lib/calculoProvisao";
import { useProvisaoPerda, useProvisaoPerdaIncorrida } from "@/hooks/useProvisao";
import { toast } from "sonner";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from "recharts";

export default function RelatoriosAvancados() {
  // Estados para análise individual
  const [selectedClienteId, setSelectedClienteId] = useState<string>();
  const [selectedContratoId, setSelectedContratoId] = useState<string>();
  const [contractAnalysisData, setContractAnalysisData] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: contratos } = useContratos();
  const { data: clientes } = useClientes();
  const { data: clienteContratos } = useContratosByCliente(selectedClienteId || null);
  
  // Hooks para tabelas de provisão
  const tabelaPerda = useProvisaoPerda();
  const tabelaIncorrida = useProvisaoPerdaIncorrida();

  const analyzeContractEvolution = async () => {
    if (!selectedContratoId || !clienteContratos) return;
    
    setIsAnalyzing(true);
    
    try {
      const contrato = clienteContratos.find(c => c.id === selectedContratoId);
      if (!contrato) return;
      
      console.log('Analisando contrato:', contrato);
      
      // Calcular data de início do atraso baseado nos dados do contrato
      let dataInicioAtraso: Date;
      const diasAtrasoAtual = contrato.dias_atraso || 0;
      
      if (contrato.data_ultimo_pagamento) {
        // Se tem data do último pagamento, o atraso começou no dia seguinte
        dataInicioAtraso = addDays(new Date(contrato.data_ultimo_pagamento), 1);
      } else if (contrato.data_vencimento) {
        // Se não tem último pagamento, mas tem vencimento, usar vencimento + 1 dia
        dataInicioAtraso = addDays(new Date(contrato.data_vencimento), 1);
      } else if (diasAtrasoAtual > 0) {
        // Se não tem nem último pagamento nem vencimento, calcular baseado nos dias de atraso
        dataInicioAtraso = subDays(new Date(), diasAtrasoAtual);
      } else {
        toast.error("Não foi possível determinar o início do atraso para este contrato");
        return;
      }
      
      const hoje = new Date();
      
      console.log('Contrato:', contrato.numero_contrato);
      console.log('Dias atraso atual:', diasAtrasoAtual);
      console.log('Data início atraso calculada:', dataInicioAtraso);
      console.log('Data último pagamento:', contrato.data_ultimo_pagamento);
      console.log('Data vencimento:', contrato.data_vencimento);
      
      let mes100Porcento = null;
      const evolutionData: any[] = [];
      
      console.log('Data início atraso calculada:', dataInicioAtraso);
      console.log('Data último pagamento:', contrato.data_ultimo_pagamento);
      console.log('Data vencimento:', contrato.data_vencimento);
      
      // Começar do dia 0 de atraso e simular quinzenalmente até atingir 100%
      for (let diasAtraso = 0; diasAtraso <= Math.max(diasAtrasoAtual + 730, 1095); diasAtraso += 15) {
        const dataAtual = addDays(dataInicioAtraso, diasAtraso);
        const mesRelativo = Math.floor(diasAtraso / 30) + 1;
        
        // Determinar estágio
        const estagio = determinarEstagio(diasAtraso);
        
        // Calcular provisão para este momento
        const provisao = calcularProvisao({
          diasAtraso,
          valorDivida: contrato.valor_divida,
          classificacao: contrato.classificacao as ClassificacaoRisco,
          tabelaPerda: tabelaPerda?.data || [],
          tabelaIncorrida: tabelaIncorrida?.data || [],
          isReestruturado: (contrato as any).is_reestruturado || false,
          dataReestruturacao: (contrato as any).data_reestruturacao || undefined
        });

        const percentualProvisao = provisao.percentualProvisao;
        
        // Marcar quando atingir 100% pela primeira vez
        if (percentualProvisao >= 100 && !mes100Porcento) {
          mes100Porcento = mesRelativo;
        }
        
        // Verificar se é mês de fechamento trimestral
        const isClosingMonth = [3, 6, 9, 12].includes(dataAtual.getMonth() + 1);
        
        // Calcular probabilidade de acordo
        const probabilidadeAcordo = Math.min(100, Math.max(0, 
          (percentualProvisao - 30) * 2 +
          (isClosingMonth ? 20 : 0) +
          (diasAtraso > 180 ? 15 : 0)
        ));
        
        const isHistorico = dataAtual <= hoje;
        const atinge100 = mesRelativo === mes100Porcento;
        
        evolutionData.push({
          mes: mesRelativo,
          data: format(dataAtual, 'MMM/yy'),
          diasAtraso,
          estagio,
          percentualProvisao: percentualProvisao.toFixed(1),
          valorProvisao: provisao.valorProvisao,
          risco: estagio === 1 ? 'Baixo' : estagio === 2 ? 'Médio' : 'Alto',
          melhorMomentoAcordo: percentualProvisao >= 50,
          probabilidadeAcordo: probabilidadeAcordo.toFixed(1),
          isClosingMonth,
          previsao: !isHistorico,
          atinge100Porcento: atinge100,
          marco90Dias: diasAtraso === 90,
          marco180Dias: diasAtraso === 180,
          marco360Dias: diasAtraso === 360
        });
        
        // Parar após atingir 100% + alguns pontos extras
        if (percentualProvisao >= 100 && mesRelativo > (mes100Porcento || 0) + 2) {
          break;
        }
      }
      
      console.log('Evolution data:', evolutionData);
      
      setContractAnalysisData(evolutionData);
    } catch (error) {
      console.error('Erro ao analisar evolução do contrato:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios Avançados</h1>
          <p className="text-muted-foreground">
            Análise detalhada da evolução do provisionamento bancário
          </p>
        </div>
      </div>

      {/* Análise de Evolução do Provisionamento Bancário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Análise de Evolução do Provisionamento Bancário
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Selecione um cliente e contrato para análise detalhada da evolução do provisionamento e previsões futuras
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Seleção de Cliente */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <Select value={selectedClienteId} onValueChange={(value) => {
                setSelectedClienteId(value);
                setSelectedContratoId(undefined);
                setContractAnalysisData([]);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes?.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seleção de Contrato */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Contrato</label>
              <Select 
                value={selectedContratoId} 
                onValueChange={setSelectedContratoId}
                disabled={!selectedClienteId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um contrato" />
                </SelectTrigger>
                <SelectContent>
                  {clienteContratos?.map((contrato) => (
                    <SelectItem key={contrato.id} value={contrato.id}>
                      {contrato.numero_contrato || `Contrato ${contrato.id.slice(0, 8)}`} - 
                      R$ {contrato.valor_divida?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botão de Análise */}
            <Button 
              onClick={analyzeContractEvolution}
              disabled={!selectedContratoId || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analisar Evolução
                </>
              )}
            </Button>
          </div>

          {contractAnalysisData.length > 0 && (
            <div className="space-y-6 mt-6">
              {/* Gráfico de Evolução */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={contractAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border rounded-lg p-3 shadow-lg">
                              <p className="font-medium">{label}</p>
                              <p className="text-sm">Dias em Atraso: {data.diasAtraso}</p>
                              <p className="text-sm">Estágio: {data.estagio}</p>
                              <p className="text-sm">Provisão: {data.percentualProvisao}%</p>
                              <p className="text-sm">Prob. Acordo: {data.probabilidadeAcordo}%</p>
                              {data.previsao && <span className="text-xs bg-gray-100 px-2 py-1 rounded">Previsão</span>}
                              {data.atinge100Porcento && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Atinge 100%</span>}
                              {data.marco90Dias && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Marco 90 dias</span>}
                              {data.marco180Dias && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Marco 180 dias</span>}
                              {data.melhorMomentoAcordo && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Favorável Acordo</span>}
                              {data.isClosingMonth && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Fechamento Trimestral</span>}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="percentualProvisao" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary) / 0.2)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Resumo da Análise */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {(() => {
                          const contrato = clienteContratos.find(c => c.id === selectedContratoId);
                          return contrato ? determinarEstagio(contrato.dias_atraso || 0) : 1;
                        })()}
                      </div>
                      <div className="text-sm text-muted-foreground">Estágio Atual</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {(() => {
                          const data50 = contractAnalysisData.find(d => parseFloat(d.percentualProvisao) >= 50);
                          return data50 ? `${data50.diasAtraso || 'N/A'}` : 'N/A';
                        })()}
                      </div>
                      <div className="text-sm text-muted-foreground">Dias de atraso para atingir 50% de provisionamento</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {contractAnalysisData.find(d => d.atinge100Porcento)?.data || 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">Mês no qual atinge 100% de provisionamento</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {contractAnalysisData.find(d => parseFloat(d.percentualProvisao) >= 90)?.mes || '12+'}
                      </div>
                      <div className="text-sm text-muted-foreground">Meses até Provisão Máxima</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Interpretação */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-300">
                  Insights da Análise:
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• <strong>Linha evolutiva completa:</strong> Desde o início do atraso até atingir 100% de provisão</li>
                  <li>• <strong>Marco dos 100%:</strong> Indica exatamente quando o contrato atingirá provisão máxima</li>
                  <li>• <strong>Evolução histórica:</strong> Baseada nos dias reais de atraso do contrato</li>
                  <li>• <strong>Previsões futuras:</strong> Projeção mês a mês até o provisionamento completo</li>
                  <li>• <strong>Momentos ideais:</strong> A partir de 50% de provisão é favorável para acordos</li>
                  <li>• <strong>Fechamentos trimestrais:</strong> Março, junho, setembro e dezembro têm maior probabilidade de acordo</li>
                  <li>• <strong>Correlação direta:</strong> Quanto maior a provisão e atraso, maior a probabilidade de acordo</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}