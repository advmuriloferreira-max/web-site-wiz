import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { SortConfig } from '@/hooks/useAdvancedFilters';

interface SortableHeaderProps {
  field: string;
  label: string;
  sortConfigs: SortConfig[];
  onSort: (field: string, direction: 'asc' | 'desc') => void;
  onRemoveSort: (field: string) => void;
  className?: string;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
  field,
  label,
  sortConfigs,
  onSort,
  onRemoveSort,
  className = ''
}) => {
  const currentSort = sortConfigs.find(s => s.field === field);
  const sortPriority = currentSort ? sortConfigs.findIndex(s => s.field === field) + 1 : null;

  const handleSort = () => {
    if (!currentSort) {
      onSort(field, 'asc');
    } else if (currentSort.direction === 'asc') {
      onSort(field, 'desc');
    } else {
      onRemoveSort(field);
    }
  };

  const getSortIcon = () => {
    if (!currentSort) return <ArrowUpDown className="h-4 w-4" />;
    return currentSort.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSort}
        className="h-auto p-1 font-medium justify-start"
      >
        <span>{label}</span>
        {getSortIcon()}
      </Button>
      
      {sortPriority && (
        <Badge variant="secondary" className="h-5 w-5 p-0 text-xs">
          {sortPriority}
        </Badge>
      )}
    </div>
  );
};