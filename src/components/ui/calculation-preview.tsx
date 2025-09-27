import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Separator } from './separator';
import { Calculator, Calendar, TrendingUp, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalculationPreviewProps {
  debtValue?: number;
  daysOverdue?: number;
  provisionData?: {
    provisionValue: number;
    provisionPercentage: number;
    stage: string;
  };
  guaranteeValue?: number;
  className?: string;
}

export function CalculationPreview({ 
  debtValue = 0, 
  daysOverdue = 0, 
  provisionData,
  guaranteeValue = 0,
  className 
}: CalculationPreviewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStageColor = (stage: string) => {
    const colors = {
      'A': 'bg-green-100 text-green-800 border-green-200',
      'B': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'C': 'bg-orange-100 text-orange-800 border-orange-200',
      'D': 'bg-red-100 text-red-800 border-red-200',
      'E': 'bg-red-200 text-red-900 border-red-300',
      'F': 'bg-red-300 text-red-900 border-red-400',
      'G': 'bg-red-400 text-red-950 border-red-500',
      'H': 'bg-red-500 text-white border-red-600'
    };
    return colors[stage as keyof typeof colors] || colors.A;
  };

  const getRiskDescription = (stage: string) => {
    const descriptions = {
      'A': 'Risco Normal',
      'B': 'Risco Baixo',
      'C': 'Risco Médio',
      'D': 'Risco Alto',
      'E': 'Risco Crítico',
      'F': 'Risco Severo',
      'G': 'Risco Extremo',
      'H': 'Perda Total'
    };
    return descriptions[stage as keyof typeof descriptions] || 'Risco Normal';
  };

  if (!debtValue && !daysOverdue) {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Preview dos Cálculos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Preencha os campos para ver o preview dos cálculos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Preview dos Cálculos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informações básicas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Valor da Dívida</p>
            <p className="text-sm font-medium">{formatCurrency(debtValue)}</p>
          </div>
          <div className="space-y-1 flex items-center gap-2">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Dias de Atraso</p>
              <p className="text-sm font-medium">
                {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Dados da provisão */}
        {provisionData && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium">Estágio de Risco</span>
              </div>
              <Badge className={cn("text-xs", getStageColor(provisionData.stage))}>
                {provisionData.stage} - {getRiskDescription(provisionData.stage)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">% Provisão</p>
                <p className="text-sm font-medium">
                  {provisionData.provisionPercentage.toFixed(2)}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Valor Provisão</p>
                <p className="text-sm font-medium text-red-600">
                  {formatCurrency(provisionData.provisionValue)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Informações de garantia */}
        {guaranteeValue > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-600">Garantias</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Valor Garantia</p>
                  <p className="text-sm font-medium text-green-600">
                    {formatCurrency(guaranteeValue)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Cobertura</p>
                  <p className="text-sm font-medium">
                    {((guaranteeValue / debtValue) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Valor líquido */}
        {provisionData && (
          <>
            <Separator />
            <div className="bg-muted/30 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Impacto Financeiro</span>
                <span className="text-sm font-bold text-red-600">
                  -{formatCurrency(provisionData.provisionValue)}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}