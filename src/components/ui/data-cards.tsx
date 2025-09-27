import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

interface DataCardsProps<T> {
  data: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

export function DataCards<T>({ 
  data, 
  renderCard, 
  emptyMessage = "Nenhum item encontrado",
  className = "" 
}: DataCardsProps<T>) {
  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">{emptyMessage}</p>
          <p className="text-sm mt-1">Tente ajustar os filtros ou adicionar novos itens</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
      {data.map((item, index) => renderCard(item, index))}
    </div>
  );
}

// Componente específico para contratos
interface ContratoCardProps {
  contrato: any;
  onEdit?: (contrato: any) => void;
  onView?: (contrato: any) => void;
  className?: string;
}

export const ContratoCard: React.FC<ContratoCardProps> = ({
  contrato,
  onEdit,
  onView,
  className = ''
}) => {
  const getClassificacaoColor = (classificacao: string) => {
    const colors = {
      'C1': 'bg-green-100 text-green-800 border-green-200',
      'C2': 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      'C3': 'bg-orange-100 text-orange-800 border-orange-200',
      'C4': 'bg-red-100 text-red-800 border-red-200',
      'C5': 'bg-red-200 text-red-900 border-red-300'
    };
    return colors[classificacao as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSituacaoColor = (situacao: string) => {
    const colors = {
      'Em análise': 'bg-blue-100 text-blue-800',
      'Acordo firmado': 'bg-green-100 text-green-800',
      'Em negociação': 'bg-yellow-100 text-yellow-800',
      'Sem acordo': 'bg-red-100 text-red-800'
    };
    return colors[situacao as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className={`hover:shadow-md transition-shadow cursor-pointer ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium truncate">
              {contrato.numero_contrato || 'Sem número'}
            </CardTitle>
            <p className="text-xs text-muted-foreground truncate mt-1">
              {contrato.clientes?.nome}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Valor e Banco */}
        <div>
          <p className="text-lg font-semibold">
            R$ {contrato.valor_divida?.toLocaleString('pt-BR') || '0'}
          </p>
          <p className="text-xs text-muted-foreground">
            {contrato.bancos?.nome}
          </p>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-1">
          <Badge 
            variant="outline" 
            className={`text-xs ${getClassificacaoColor(contrato.classificacao)}`}
          >
            {contrato.classificacao}
          </Badge>
          <Badge 
            variant="outline" 
            className={`text-xs ${getSituacaoColor(contrato.situacao)}`}
          >
            {contrato.situacao}
          </Badge>
        </div>

        {/* Provisão */}
        {contrato.valor_provisao > 0 && (
          <div className="bg-muted p-2 rounded text-xs">
            <div className="flex justify-between">
              <span>Provisão:</span>
              <span className="font-medium">
                R$ {contrato.valor_provisao?.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Percentual:</span>
              <span className="font-medium">
                {contrato.percentual_provisao}%
              </span>
            </div>
          </div>
        )}

        {/* Atraso */}
        {contrato.dias_atraso > 0 && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-red-600">
              {contrato.dias_atraso} dias em atraso
            </span>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-xs"
            onClick={() => onView?.(contrato)}
          >
            Ver Detalhes
          </Button>
          <Button 
            size="sm" 
            className="flex-1 text-xs"
            onClick={() => onEdit?.(contrato)}
          >
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};