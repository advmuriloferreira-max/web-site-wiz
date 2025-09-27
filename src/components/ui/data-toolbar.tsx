import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  RefreshCw, 
  Plus,
  FileText,
  Database
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useDataExport } from '@/hooks/useDataExport';
import { FilterPanel } from './filter-panel';
import { QuickFilters } from './quick-filters';
import { ViewToggle } from './view-toggle';
import { useAdvancedFilters } from '@/hooks/useAdvancedFilters';

interface DataToolbarProps {
  title: string;
  data: any[];
  filteredData: any[];
  filters: ReturnType<typeof useAdvancedFilters>;
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select';
    options?: Array<{ value: string; label: string }>;
  }>;
  quickFilters: Array<{
    id: string;
    label: string;
    rule: any;
  }>;
  view: 'table' | 'cards';
  onViewChange: (view: 'table' | 'cards') => void;
  onAdd?: () => void;
  onRefresh?: () => void;
  exportFileName?: string;
  className?: string;
}

export const DataToolbar: React.FC<DataToolbarProps> = ({
  title,
  data,
  filteredData,
  filters,
  fields,
  quickFilters,
  view,
  onViewChange,
  onAdd,
  onRefresh,
  exportFileName = 'dados',
  className = ''
}) => {
  const { exportToCSV, exportToJSON } = useDataExport();

  const handleExportCSV = () => {
    const headers = fields.map(field => field.label);
    const exportData = filteredData.map(item => {
      const row: any = {};
      fields.forEach(field => {
        row[field.label] = item[field.key] || '';
      });
      return row;
    });
    exportToCSV(exportData, `${exportFileName}-${new Date().toISOString().split('T')[0]}`, headers);
  };

  const handleExportJSON = () => {
    exportToJSON(filteredData, `${exportFileName}-${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header com título e ações principais */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">{title}</h1>
          <Badge variant="secondary" className="text-sm">
            {filters.filteredCount} de {filters.totalCount}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          
          {/* Exportação */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileText className="h-4 w-4 mr-2" />
                Excel/CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON}>
                <Database className="h-4 w-4 mr-2" />
                JSON
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <span className="text-xs text-muted-foreground">
                  {filteredData.length} registros
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ViewToggle 
            view={view} 
            onViewChange={onViewChange}
          />

          <FilterPanel 
            filters={filters}
            fields={fields}
          />
          
          {onAdd && (
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Novo
            </Button>
          )}
        </div>
      </div>

      {/* Filtros rápidos */}
      <QuickFilters 
        filters={filters}
        quickFilters={quickFilters}
      />

      {/* Indicadores de filtros ativos */}
      {(filters.activeFilters.length > 0 || filters.searchQuery) && (
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Filtros aplicados:</span>
              {filters.searchQuery && (
                <Badge variant="outline">
                  Busca: "{filters.searchQuery}"
                </Badge>
              )}
              {filters.activeFilters.map((filter, index) => (
                <Badge key={index} variant="outline">
                  {filter.label || `${filter.field}: ${filter.value}`}
                </Badge>
              ))}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={filters.clearAllFilters}
              className="h-6 text-xs"
            >
              Limpar filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};