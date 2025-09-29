import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { useEnterpriseNavigation } from '@/hooks/useEnterpriseNavigation';
import { 
  FileText, 
  Users, 
  Building2, 
  Search, 
  Clock, 
  X,
  Filter,
  Star,
  Bell,
  Trash2,
  Eye,
  Calendar,
  Tag
} from 'lucide-react';

interface EnhancedSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchFilter {
  id: string;
  label: string;
  value: string;
  color: string;
}

const typeConfig = {
  contrato: { icon: FileText, label: 'Contrato', color: 'blue' },
  cliente: { icon: Users, label: 'Cliente', color: 'green' },
  banco: { icon: Building2, label: 'Banco', color: 'purple' },
};

export function EnhancedSearch({ open, onOpenChange }: EnhancedSearchProps) {
  const navigate = useNavigate();
  const {
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    searchResults,
    recentSearches,
    addToRecentSearches,
    clearRecentSearches,
  } = useGlobalSearch();
  
  const { savedSearches, saveSearch, removeSavedSearch } = useEnterpriseNavigation();
  
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);
  const [searchHistory, setSearchHistory] = useState<Array<{
    query: string;
    timestamp: number;
    resultsCount: number;
  }>>([]);
  
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Load search history
  useEffect(() => {
    const stored = localStorage.getItem('search-history');
    if (stored) {
      setSearchHistory(JSON.parse(stored));
    }
  }, []);

  // Save search to history
  const saveToHistory = (query: string, resultsCount: number) => {
    const historyItem = {
      query,
      timestamp: Date.now(),
      resultsCount,
    };
    
    setSearchHistory(prev => {
      const updated = [historyItem, ...prev.filter(h => h.query !== query)].slice(0, 20);
      localStorage.setItem('search-history', JSON.stringify(updated));
      return updated;
    });
  };

  // Available filters
  const availableFilters = [
    { id: 'recent', label: 'Recente', value: 'recent', color: 'blue' },
    { id: 'important', label: 'Importante', value: 'important', color: 'red' },
    { id: 'active', label: 'Ativo', value: 'active', color: 'green' },
    { id: 'pending', label: 'Pendente', value: 'pending', color: 'yellow' },
    { id: 'this-week', label: 'Esta Semana', value: 'this-week', color: 'purple' },
    { id: 'this-month', label: 'Este Mês', value: 'this-month', color: 'orange' },
  ];

  const addFilter = (filter: SearchFilter) => {
    if (!activeFilters.find(f => f.id === filter.id)) {
      setActiveFilters(prev => [...prev, filter]);
    }
  };

  const removeFilter = (filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
  };

  const handleSelect = (result: any) => {
    if (result.url) {
      navigate(result.url);
      addToRecentSearches(searchQuery);
      saveToHistory(searchQuery, searchResults.length);
      onOpenChange(false);
      setSearchQuery('');
      setPreviewResult(null);
    }
  };

  const handlePreview = (result: any) => {
    setPreviewResult(result);
  };

  const handleSaveSearch = () => {
    if (searchQuery.trim()) {
      saveSearch(searchQuery, { type: selectedType, filters: activeFilters });
    }
  };

  const hasQuery = searchQuery.trim().length > 0;
  const hasResults = searchResults.length > 0;

  // Filter chips color mapping
  const getFilterColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300',
      green: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300',
      red: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300',
      purple: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300',
      orange: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-300',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Busca Avançada</DialogTitle>
      <DialogDescription className="sr-only">
        Busque e filtre contratos, clientes e bancos no sistema
      </DialogDescription>
      
      <div className="flex">
        {/* Main Search Panel */}
        <div className="flex-1">
          {/* Search Input */}
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Busque contratos, clientes, bancos..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0"
            />
            
            {/* Search Actions */}
            <div className="flex items-center space-x-1">
              {hasQuery && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveSearch}
                    className="h-6 px-2 text-xs"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Salvar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="h-6 w-6 p-0 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
            <Button
              variant={selectedType === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedType('all')}
              className="h-6 text-xs"
            >
              Todos
            </Button>
            {Object.entries(typeConfig).map(([type, config]) => (
              <Button
                key={type}
                variant={selectedType === type ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedType(type as any)}
                className="h-6 text-xs"
              >
                <config.icon className="mr-1 h-3 w-3" />
                {config.label}
              </Button>
            ))}
            
            {/* Advanced Filters Toggle */}
            <div className="ml-auto flex items-center space-x-1">
              <Button
                variant={showFilters ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-6 text-xs"
              >
                <Filter className="h-3 w-3 mr-1" />
                Filtros
                {activeFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 text-xs">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-1 p-2 border-b bg-background">
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.id}
                  variant="outline"
                  className={`text-xs ${getFilterColor(filter.color)} cursor-pointer hover:opacity-80`}
                  onClick={() => removeFilter(filter.id)}
                >
                  {filter.label}
                  <X className="ml-1 h-2 w-2" />
                </Badge>
              ))}
            </div>
          )}

          {/* Search Results */}
          <CommandList className="max-h-[400px]">
            {!hasQuery && (
              <>
                {/* Recent Searches */}
                {searchHistory.length > 0 && (
                  <CommandGroup heading="Histórico de Buscas">
                    {searchHistory.slice(0, 5).map((search, index) => (
                      <CommandItem
                        key={index}
                        onSelect={() => setSearchQuery(search.query)}
                        className="cursor-pointer"
                      >
                        <Clock className="mr-2 h-3 w-3 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm">{search.query}</span>
                          <div className="text-xs text-muted-foreground">
                            {search.resultsCount} resultados • {new Date(search.timestamp).toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Saved Searches */}
                {savedSearches.length > 0 && (
                  <CommandGroup heading="Buscas Salvas">
                    {savedSearches.slice(0, 5).map((saved) => (
                      <CommandItem
                        key={saved.id}
                        onSelect={() => setSearchQuery(saved.query)}
                        className="cursor-pointer"
                      >
                        <Star className="mr-2 h-3 w-3 text-yellow-500" />
                        <div className="flex-1">
                          <span className="text-sm">{saved.query}</span>
                          {saved.notificationEnabled && (
                            <Bell className="ml-2 h-3 w-3 text-blue-500" />
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSavedSearch(saved.id);
                          }}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}

            {hasQuery && !hasResults && (
              <CommandEmpty>
                <div className="text-center py-6">
                  <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum resultado encontrado para "{searchQuery}"
                  </p>
                </div>
              </CommandEmpty>
            )}

            {hasQuery && hasResults && (
              <CommandGroup heading={`${searchResults.length} resultado(s)`}>
                {searchResults.map((result) => {
                  const config = typeConfig[result.type as keyof typeof typeConfig];
                  const Icon = config.icon;
                  
                  return (
                    <CommandItem
                      key={`${result.type}-${result.id}`}
                      onSelect={() => handleSelect(result)}
                      className="cursor-pointer p-3 group"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm truncate">
                              {result.title}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getFilterColor(config.color)} flex-shrink-0`}
                            >
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {result.subtitle}
                          </p>
                        </div>
                        
                        {/* Preview Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(result);
                          }}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </div>

        {/* Sidebar for Filters and Preview */}
        {(showFilters || previewResult) && (
          <div className="w-80 border-l bg-muted/30">
            {showFilters && !previewResult && (
              <div className="p-4">
                <h3 className="font-medium text-sm mb-3">Filtros Avançados</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Status</h4>
                    <div className="flex flex-wrap gap-1">
                      {availableFilters.slice(2, 4).map((filter) => (
                        <Button
                          key={filter.id}
                          variant="outline"
                          size="sm"
                          onClick={() => addFilter(filter)}
                          className="h-6 text-xs"
                        >
                          {filter.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Período</h4>
                    <div className="flex flex-wrap gap-1">
                      {availableFilters.slice(4).map((filter) => (
                        <Button
                          key={filter.id}
                          variant="outline"
                          size="sm"
                          onClick={() => addFilter(filter)}
                          className="h-6 text-xs"
                        >
                          <Calendar className="mr-1 h-3 w-3" />
                          {filter.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {previewResult && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-sm">Preview</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewResult(null)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                
                <Card>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const config = typeConfig[previewResult.type as keyof typeof typeConfig];
                          const Icon = config.icon;
                          return <Icon className="h-4 w-4" />;
                        })()}
                        <span className="font-medium text-sm">{previewResult.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {previewResult.subtitle}
                      </p>
                      {previewResult.description && (
                        <p className="text-xs text-muted-foreground">
                          {previewResult.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t bg-muted/30 px-3 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="pointer-events-none h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-xs font-medium opacity-100 flex">
                ↵
              </kbd>
              para selecionar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="pointer-events-none h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-xs font-medium opacity-100 flex">
                Esc
              </kbd>
              para fechar
            </span>
          </div>
          <span>{hasResults ? searchResults.length : 0} resultados</span>
        </div>
      </div>
    </CommandDialog>
  );
}