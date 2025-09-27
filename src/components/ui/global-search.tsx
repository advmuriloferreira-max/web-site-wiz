import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { 
  FileText, 
  Users, 
  Building2, 
  Search, 
  Clock, 
  X,
  Filter 
} from 'lucide-react';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeIcons = {
  contrato: FileText,
  cliente: Users,
  banco: Building2,
};

const typeLabels = {
  contrato: 'Contrato',
  cliente: 'Cliente',
  banco: 'Banco',
};

const typeColors = {
  contrato: 'bg-primary/10 text-primary border-primary/20',
  cliente: 'bg-secondary/10 text-secondary-foreground border-secondary/20',
  banco: 'bg-accent/10 text-accent-foreground border-accent/20',
};

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onOpenChange }) => {
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
    popularSuggestions
  } = useGlobalSearch();

  console.log('GlobalSearch component - open:', open, 'searchQuery:', searchQuery, 'results:', searchResults.length);

  const handleSelect = (result: any) => {
    console.log('Selecting result:', result);
    if (result.url) {
      navigate(result.url);
      addToRecentSearches(searchQuery);
      onOpenChange(false);
      setSearchQuery('');
    }
  };

  const handleRecentSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
  };

  const hasQuery = searchQuery.trim().length > 0;
  const hasResults = searchResults.length > 0;

  console.log('Dialog state:', { open, hasQuery, hasResults, searchResultsLength: searchResults.length });

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Busca Global</DialogTitle>
      <DialogDescription className="sr-only">
        Busque por contratos, clientes e bancos no sistema
      </DialogDescription>
      <div className="flex items-center border-b px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <CommandInput
          placeholder="Busque por contratos, clientes, bancos..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0"
        />
        {hasQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="h-6 w-6 p-0 hover:bg-muted"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filtros por tipo */}
      <div className="flex gap-1 p-2 border-b bg-muted/30">
        <Button
          variant={selectedType === 'all' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setSelectedType('all')}
          className="h-6 text-xs"
        >
          Todos
        </Button>
        <Button
          variant={selectedType === 'contrato' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setSelectedType('contrato')}
          className="h-6 text-xs"
        >
          <FileText className="mr-1 h-3 w-3" />
          Contratos
        </Button>
        <Button
          variant={selectedType === 'cliente' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setSelectedType('cliente')}
          className="h-6 text-xs"
        >
          <Users className="mr-1 h-3 w-3" />
          Clientes
        </Button>
        <Button
          variant={selectedType === 'banco' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setSelectedType('banco')}
          className="h-6 text-xs"
        >
          <Building2 className="mr-1 h-3 w-3" />
          Bancos
        </Button>
      </div>

      <CommandList className="max-h-[400px]">
        {!hasQuery && (
          <>
            {recentSearches.length > 0 && (
              <CommandGroup heading="Buscas Recentes">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-xs text-muted-foreground">Histórico</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="h-4 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Limpar
                  </Button>
                </div>
                {recentSearches.map((search, index) => (
                  <CommandItem
                    key={index}
                    onSelect={() => handleRecentSearch(search)}
                    className="cursor-pointer"
                  >
                    <Clock className="mr-2 h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{search}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandGroup heading="Sugestões Populares">
              {popularSuggestions.map((suggestion, index) => (
                <CommandItem
                  key={index}
                  onSelect={() => handleSuggestion(suggestion)}
                  className="cursor-pointer"
                >
                  <Search className="mr-2 h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{suggestion}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {hasQuery && !hasResults && (
          <CommandEmpty>
            <div className="text-center py-6">
              <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhum resultado encontrado para "{searchQuery}"
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tente usar termos diferentes ou verifique a ortografia
              </p>
            </div>
          </CommandEmpty>
        )}

        {hasQuery && hasResults && (
          <CommandGroup heading={`${searchResults.length} resultado(s) encontrado(s)`}>
            {searchResults.map((result) => {
              const Icon = typeIcons[result.type];
              return (
                <CommandItem
                  key={`${result.type}-${result.id}`}
                  onSelect={() => handleSelect(result)}
                  className="cursor-pointer p-3"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {result.title}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${typeColors[result.type]} flex-shrink-0`}
                        >
                          {typeLabels[result.type]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {result.subtitle}
                      </p>
                    </div>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>

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
          <span>{searchResults.length} resultados</span>
        </div>
      </div>
    </CommandDialog>
  );
};