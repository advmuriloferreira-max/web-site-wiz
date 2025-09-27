import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { FilterRule, useAdvancedFilters } from '@/hooks/useAdvancedFilters';

interface QuickFilter {
  id: string;
  label: string;
  rule: FilterRule;
  color?: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface QuickFiltersProps {
  filters: ReturnType<typeof useAdvancedFilters>;
  quickFilters: QuickFilter[];
  className?: string;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  filters,
  quickFilters,
  className = ''
}) => {
  const isFilterActive = (rule: FilterRule) => {
    return filters.activeFilters.some(f => {
      if (f.field !== rule.field || f.operator !== rule.operator) return false;
      
      // Para operador 'in' comparar arrays
      if (rule.operator === 'in' && Array.isArray(rule.value) && Array.isArray(f.value)) {
        return rule.value.length === f.value.length && 
               rule.value.every(val => f.value.includes(val));
      }
      
      // Para outros operadores comparar valores diretamente
      return f.value === rule.value;
    });
  };

  const toggleQuickFilter = (rule: FilterRule) => {
    if (isFilterActive(rule)) {
      filters.removeFilter(rule.field, rule.operator);
    } else {
      filters.addFilter(rule);
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground">Filtros rápidos:</span>
      
      {quickFilters.map(quickFilter => {
        const isActive = isFilterActive(quickFilter.rule);
        
        return (
          <Badge
            key={quickFilter.id}
            variant={isActive ? 'default' : 'outline'}
            className={`cursor-pointer hover:opacity-80 transition-opacity ${
              isActive ? 'bg-primary text-primary-foreground' : ''
            }`}
            onClick={() => toggleQuickFilter(quickFilter.rule)}
          >
            {quickFilter.label}
            {isActive && (
              <X 
                className="ml-1 h-3 w-3" 
                onClick={(e) => {
                  e.stopPropagation();
                  filters.removeFilter(quickFilter.rule.field, quickFilter.rule.operator);
                }}
              />
            )}
          </Badge>
        );
      })}
      
      {filters.activeFilters.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={filters.clearAllFilters}
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Limpar todos
        </Button>
      )}
    </div>
  );
};