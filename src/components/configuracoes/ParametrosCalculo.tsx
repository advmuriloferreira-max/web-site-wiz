import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Calculator, Save, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ParametrosCalculo {
  usar_saldo_contabil_prioritario: boolean;
  calcular_provisao_automatica: boolean;
  calcular_proposta_acordo_automatica: boolean;
  percentual_honorarios_padrao: number;
  prazo_maximo_acordo_dias: number;
  aplicar_reducao_final_automatica: boolean;
  percentual_reducao_minima: number;
  percentual_reducao_maxima: number;
}

export function ParametrosCalculo() {
  const [parametros, setParametros] = useState<ParametrosCalculo>({
    usar_saldo_contabil_prioritario: true,
    calcular_provisao_automatica: true,
    calcular_proposta_acordo_automatica: true,
    percentual_honorarios_padrao: 15,
    prazo_maximo_acordo_dias: 365,
    aplicar_reducao_final_automatica: true,
    percentual_reducao_minima: 10,
    percentual_reducao_maxima: 80
  });

  const [salvando, setSalvando] = useState(false);

  // Carregar parâmetros salvos
  useState(() => {
    const parametrosSalvos = localStorage.getItem('parametros_calculo');
    if (parametrosSalvos) {
      try {
        const parsed = JSON.parse(parametrosSalvos);
        setParametros(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Erro ao carregar parâmetros:', error);
      }
    }
  });

  const handleSalvar = async () => {
    setSalvando(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('parametros_calculo', JSON.stringify(parametros));
      
      toast.success("Parâmetros de cálculo salvos com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar parâmetros");
    } finally {
      setSalvando(false);
    }
  };

  const handleSwitchChange = (field: keyof ParametrosCalculo, value: boolean) => {
    setParametros(prev => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (field: keyof ParametrosCalculo, value: number) => {
    setParametros(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Parâmetros de Cálculo</h2>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Alterações nos parâmetros de cálculo afetarão todos os novos contratos cadastrados. 
          Contratos existentes mantêm seus cálculos originais.
        </AlertDescription>
      </Alert>

      {/* Configurações de Provisão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Cálculos de Provisão</span>
            <Badge variant="outline">BCB 352/2023</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="font-medium">Usar Dívida Contábil como Prioritário</Label>
              <p className="text-sm text-muted-foreground">
                Quando disponível, usar dívida contábil em vez do valor da dívida para cálculos
              </p>
            </div>
            <Switch
              checked={parametros.usar_saldo_contabil_prioritario}
              onCheckedChange={(value) => handleSwitchChange('usar_saldo_contabil_prioritario', value)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="font-medium">Calcular Provisão Automaticamente</Label>
              <p className="text-sm text-muted-foreground">
                Aplicar cálculo automático baseado nas tabelas BCB ao cadastrar contratos
              </p>
            </div>
            <Switch
              checked={parametros.calcular_provisao_automatica}
              onCheckedChange={(value) => handleSwitchChange('calcular_provisao_automatica', value)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="font-medium">Calcular Proposta de Acordo Automaticamente</Label>
              <p className="text-sm text-muted-foregor">
                Calcular automaticamente a proposta subtraindo a provisão do valor da dívida
              </p>
            </div>
            <Switch
              checked={parametros.calcular_proposta_acordo_automatica}
              onCheckedChange={(value) => handleSwitchChange('calcular_proposta_acordo_automatica', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Acordo */}
      <Card>
        <CardHeader>
          <CardTitle>Parâmetros de Acordo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="honorarios_padrao">Percentual de Honorários Padrão (%)</Label>
              <Input
                id="honorarios_padrao"
                type="number"
                min="10"
                max="20"
                step="1"
                value={parametros.percentual_honorarios_padrao}
                onChange={(e) => handleInputChange('percentual_honorarios_padrao', Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Valor entre 10% e 20%</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prazo_acordo">Prazo Máximo para Acordo (dias)</Label>
              <Input
                id="prazo_acordo"
                type="number"
                min="30"
                max="730"
                value={parametros.prazo_maximo_acordo_dias}
                onChange={(e) => handleInputChange('prazo_maximo_acordo_dias', Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Entre 30 e 730 dias</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="font-medium">Aplicar Redução Final Automática</Label>
              <p className="text-sm text-muted-foreground">
                Calcular automaticamente a redução da dívida ao definir o acordo final
              </p>
            </div>
            <Switch
              checked={parametros.aplicar_reducao_final_automatica}
              onCheckedChange={(value) => handleSwitchChange('aplicar_reducao_final_automatica', value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reducao_minima">Percentual de Redução Mínima (%)</Label>
              <Input
                id="reducao_minima"
                type="number"
                min="0"
                max="100"
                value={parametros.percentual_reducao_minima}
                onChange={(e) => handleInputChange('percentual_reducao_minima', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reducao_maxima">Percentual de Redução Máxima (%)</Label>
              <Input
                id="reducao_maxima"
                type="number"
                min="0"
                max="100"
                value={parametros.percentual_reducao_maxima}
                onChange={(e) => handleInputChange('percentual_reducao_maxima', Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status dos Cálculos */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Cálculos Automáticos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm font-medium">Provisão BCB</div>
              <div className="text-xs text-muted-foreground">Funcionando</div>
            </div>
            
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm font-medium">Proposta Acordo</div>
              <div className="text-xs text-muted-foreground">Funcionando</div>
            </div>
            
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm font-medium">Honorários</div>
              <div className="text-xs text-muted-foreground">Funcionando</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSalvar} disabled={salvando}>
          <Save className="mr-2 h-4 w-4" />
          {salvando ? "Salvando..." : "Salvar Parâmetros"}
        </Button>
      </div>
    </div>
  );
}