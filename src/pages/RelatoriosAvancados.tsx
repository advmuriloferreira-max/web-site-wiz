import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Download, RefreshCw, TrendingUp, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useContratos } from "@/hooks/useContratos";
import { determinarEstagio } from "@/lib/calculoProvisao";

interface MigrationData {
  fromStage: number;
  toStage: number;
  count: number;
  contracts: any[];
}

interface MigrationMatrix {
  [key: string]: MigrationData;
}

// Página de Relatórios Avançados com Matriz de Migração de Risco
export default function RelatoriosAvancados() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isCalculating, setIsCalculating] = useState(false);
  const [migrationMatrix, setMigrationMatrix] = useState<MigrationMatrix>({});

  const { data: contratos } = useContratos();

  const formatDate = (date: Date | undefined) => {
    return date ? format(date, "dd/MM/yyyy") : "Selecione a data";
  };

  const calculateMigrationMatrix = async () => {
    if (!startDate || !endDate || !contratos) {
      return;
    }

    setIsCalculating(true);

    try {
      // Simular cálculo da matriz (em um cenário real, seria necessário dados históricos)
      const matrix: MigrationMatrix = {};
      
      // Inicializar matriz com zeros
      for (let from = 1; from <= 3; from++) {
        for (let to = 1; to <= 3; to++) {
          const key = `${from}-${to}`;
          matrix[key] = {
            fromStage: from,
            toStage: to,
            count: 0,
            contracts: []
          };
        }
      }

      // Para demonstração, vamos simular algumas transições baseadas nos contratos atuais
      contratos.forEach((contrato) => {
        const currentStage = determinarEstagio(contrato.dias_atraso || 0);
        
        // Simular estágio anterior (para demonstração)
        let previousStage = currentStage;
        if (contrato.dias_atraso > 30 && contrato.dias_atraso <= 90) {
          previousStage = Math.random() > 0.7 ? 1 : 2; // 30% chance de ter vindo do estágio 1
        } else if (contrato.dias_atraso > 90) {
          previousStage = Math.random() > 0.5 ? 2 : 3; // 50% chance de ter vindo do estágio 2
        }

        const key = `${previousStage}-${currentStage}`;
        if (matrix[key]) {
          matrix[key].count++;
          matrix[key].contracts.push(contrato);
        }
      });

      setMigrationMatrix(matrix);
    } catch (error) {
      console.error('Erro ao calcular matriz de migração:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const getTotalContracts = () => {
    return Object.values(migrationMatrix).reduce((sum, data) => sum + data.count, 0);
  };

  const getStageLabel = (stage: number) => {
    switch (stage) {
      case 1: return "Estágio 1";
      case 2: return "Estágio 2";
      case 3: return "Estágio 3";
      default: return `Estágio ${stage}`;
    }
  };

  const getStageColor = (stage: number) => {
    switch (stage) {
      case 1: return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 2: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case 3: return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getCellIntensity = (count: number, maxCount: number) => {
    if (count === 0) return "bg-muted/20";
    const intensity = count / maxCount;
    if (intensity > 0.7) return "bg-red-200 dark:bg-red-900/50";
    if (intensity > 0.4) return "bg-yellow-200 dark:bg-yellow-900/50";
    return "bg-green-200 dark:bg-green-900/50";
  };

  const maxCount = Math.max(...Object.values(migrationMatrix).map(data => data.count));

  const exportMatrix = () => {
    // Implementar exportação para Excel/PDF
    console.log("Exportando matriz de migração...");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios Avançados</h1>
          <p className="text-muted-foreground">
            Análises detalhadas e matrizes de migração de risco
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportMatrix} disabled={!Object.keys(migrationMatrix).length}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Seleção de Período */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Matriz de Migração de Risco
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Selecione o período para análise das transições entre estágios de risco
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Data Inicial */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Período Inicial</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(startDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Data Final */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Período Final</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(endDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Botão de Calcular */}
            <Button 
              onClick={calculateMigrationMatrix}
              disabled={!startDate || !endDate || isCalculating}
              className="w-full"
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Gerar Matriz
                </>
              )}
            </Button>
          </div>

          {startDate && endDate && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-800 dark:text-blue-300">
                Analisando transições entre {formatDate(startDate)} e {formatDate(endDate)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Matriz de Migração */}
      {Object.keys(migrationMatrix).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Matriz de Migração de Estágios</CardTitle>
            <p className="text-sm text-muted-foreground">
              Linhas: Estágio no período inicial | Colunas: Estágio no período final
            </p>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {/* Legenda */}
              <div className="flex items-center gap-4 text-sm">
                <span className="font-medium">Estágios:</span>
                <Badge className={getStageColor(1)}>Estágio 1 (≤30 dias)</Badge>
                <Badge className={getStageColor(2)}>Estágio 2 (31-90 dias)</Badge>
                <Badge className={getStageColor(3)}>Estágio 3 (&gt;90 dias)</Badge>
              </div>

              <Separator />

              {/* Tabela da Matriz */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-border p-3 bg-muted font-medium text-left">
                        De / Para
                      </th>
                      {[1, 2, 3].map(toStage => (
                        <th key={toStage} className="border border-border p-3 bg-muted font-medium text-center">
                          <div className="space-y-1">
                            <div>{getStageLabel(toStage)}</div>
                            <Badge className={getStageColor(toStage)} variant="outline">
                              {toStage === 1 ? "≤30d" : toStage === 2 ? "31-90d" : "&gt;90d"}
                            </Badge>
                          </div>
                        </th>
                      ))}
                      <th className="border border-border p-3 bg-muted font-medium text-center">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map(fromStage => {
                      const rowTotal = [1, 2, 3].reduce((sum, toStage) => {
                        return sum + (migrationMatrix[`${fromStage}-${toStage}`]?.count || 0);
                      }, 0);

                      return (
                        <tr key={fromStage}>
                          <td className="border border-border p-3 bg-muted font-medium">
                            <div className="space-y-1">
                              <div>{getStageLabel(fromStage)}</div>
                              <Badge className={getStageColor(fromStage)} variant="outline">
                                {fromStage === 1 ? "≤30d" : fromStage === 2 ? "31-90d" : "&gt;90d"}
                              </Badge>
                            </div>
                          </td>
                          {[1, 2, 3].map(toStage => {
                            const data = migrationMatrix[`${fromStage}-${toStage}`];
                            const count = data?.count || 0;
                            const percentage = rowTotal > 0 ? (count / rowTotal) * 100 : 0;
                            
                            return (
                              <td 
                                key={toStage} 
                                className={cn(
                                  "border border-border p-3 text-center",
                                  getCellIntensity(count, maxCount)
                                )}
                              >
                                <div className="space-y-1">
                                  <div className="text-2xl font-bold">{count}</div>
                                  {count > 0 && (
                                    <div className="text-xs text-muted-foreground">
                                      {percentage.toFixed(1)}%
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                          <td className="border border-border p-3 text-center bg-muted font-bold">
                            {rowTotal}
                          </td>
                        </tr>
                      );
                    })}
                    
                    {/* Linha de totais */}
                    <tr className="bg-muted">
                      <td className="border border-border p-3 font-bold">Total</td>
                      {[1, 2, 3].map(toStage => {
                        const colTotal = [1, 2, 3].reduce((sum, fromStage) => {
                          return sum + (migrationMatrix[`${fromStage}-${toStage}`]?.count || 0);
                        }, 0);
                        
                        return (
                          <td key={toStage} className="border border-border p-3 text-center font-bold">
                            {colTotal}
                          </td>
                        );
                      })}
                      <td className="border border-border p-3 text-center font-bold text-primary">
                        {getTotalContracts()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{getTotalContracts()}</div>
                      <div className="text-sm text-muted-foreground">Total de Contratos</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {Object.values(migrationMatrix).filter(data => data.fromStage !== data.toStage && data.count > 0).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Transições Detectadas</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {migrationMatrix["1-3"]?.count || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Saltos 1→3 (Críticos)</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Interpretação */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-300">
                  Como Interpretar a Matriz:
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• <strong>Diagonal principal:</strong> Contratos que permaneceram no mesmo estágio</li>
                  <li>• <strong>Acima da diagonal:</strong> Deterioração do risco (movimento para estágios superiores)</li>
                  <li>• <strong>Abaixo da diagonal:</strong> Melhoria do risco (movimento para estágios inferiores)</li>
                  <li>• <strong>Células mais escuras:</strong> Maior concentração de transições</li>
                  <li>• <strong>Saltos 1→3:</strong> Transições críticas que requerem atenção especial</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}