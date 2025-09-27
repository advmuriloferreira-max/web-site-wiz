import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Filter, 
  Plus, 
  Save, 
  Trash2, 
  X,
  SlidersHorizontal,
  Search
} from 'lucide-react';
import { FilterRule, SavedFilter, useAdvancedFilters } from '@/hooks/useAdvancedFilters';

interface FilterPanelProps {
  filters: ReturnType<typeof useAdvancedFilters>;
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select';
    options?: Array<{ value: string; label: string }>;
  }>;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, fields }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newFilterField, setNewFilterField] = useState('');
  const [newFilterOperator, setNewFilterOperator] = useState('');
  const [newFilterValue, setNewFilterValue] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');

  const operators = [
    { value: 'equals', label: 'Igual a' },
    { value: 'contains', label: 'Contém' },
    { value: 'startsWith', label: 'Inicia com' },
    { value: 'endsWith', label: 'Termina com' },
    { value: 'gt', label: 'Maior que' },
    { value: 'lt', label: 'Menor que' },
    { value: 'gte', label: 'Maior ou igual' },
    { value: 'lte', label: 'Menor ou igual' },
  ];

  const addNewFilter = () => {
    if (!newFilterField || !newFilterOperator || !newFilterValue) return;

    const field = fields.find(f => f.key === newFilterField);
    const operator = operators.find(o => o.value === newFilterOperator);
    
    filters.addFilter({
      field: newFilterField,
      operator: newFilterOperator as any,
      value: newFilterValue,
      label: `${field?.label} ${operator?.label} ${newFilterValue}`
    });

    setNewFilterField('');
    setNewFilterOperator('');
    setNewFilterValue('');
  };

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      filters.saveCurrentFilter(filterName.trim());
      setFilterName('');
      setSaveDialogOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {filters.activeFilters.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
              {filters.activeFilters.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avançados
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Busca Textual */}
          <div className="space-y-2">
            <Label>Busca Geral</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar em todos os campos..."
                value={filters.searchQuery}
                onChange={(e) => filters.setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Separator />

          {/* Filtros Ativos */}
          {filters.activeFilters.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Filtros Ativos ({filters.activeFilters.length})</Label>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={filters.clearAllFilters}
                  className="h-6 px-2 text-xs"
                >
                  Limpar Todos
                </Button>
              </div>
              <div className="space-y-2">
                {filters.activeFilters.map((filter, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="text-sm flex-1 truncate">
                      {filter.label || `${filter.field} ${filter.operator} ${filter.value}`}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => filters.removeFilter(filter.field, filter.operator)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Adicionar Novo Filtro */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Adicionar Filtro</Label>
            
            <div className="space-y-3">
              <Select value={newFilterField} onValueChange={setNewFilterField}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar campo" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map(field => (
                    <SelectItem key={field.key} value={field.key}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={newFilterOperator} onValueChange={setNewFilterOperator}>
                <SelectTrigger>
                  <SelectValue placeholder="Operador" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map(op => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Valor"
                value={newFilterValue}
                onChange={(e) => setNewFilterValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNewFilter()}
              />

              <Button onClick={addNewFilter} className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Filtro
              </Button>
            </div>
          </div>

          <Separator />

          {/* Filtros Salvos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Filtros Salvos</Label>
              {filters.activeFilters.length > 0 && (
                <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      <Save className="h-3 w-3 mr-1" />
                      Salvar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Salvar Filtro</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Nome do filtro..."
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveFilter()}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleSaveFilter} disabled={!filterName.trim()}>
                          Salvar
                        </Button>
                        <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="space-y-2">
              {filters.savedFilters.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum filtro salvo</p>
              ) : (
                filters.savedFilters.map(savedFilter => (
                  <div key={savedFilter.id} className="flex items-center gap-2 p-2 border rounded">
                    <button
                      onClick={() => filters.loadSavedFilter(savedFilter.id)}
                      className="flex-1 text-left text-sm hover:underline"
                    >
                      {savedFilter.name}
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => filters.deleteSavedFilter(savedFilter.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Contador de Resultados */}
          <div className="pt-4 border-t">
            <div className="bg-muted p-3 rounded text-center">
              <p className="text-sm font-medium">
                {filters.filteredCount} de {filters.totalCount} resultados
              </p>
              {filters.activeFilters.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {filters.totalCount - filters.filteredCount} itens filtrados
                </p>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};