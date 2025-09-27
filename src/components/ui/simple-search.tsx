import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, FileText, Users, Building2, Clock } from 'lucide-react';
import { useContratos } from '@/hooks/useContratos';
import { useClientes } from '@/hooks/useClientes';
import { useBancos } from '@/hooks/useBancos';
import { useDebounce } from '@/hooks/useDebounce';

interface SimpleSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeIcons = {
  contrato: FileText,
  cliente: Users,
  banco: Building2,
};

const typeColors = {
  contrato: 'bg-primary/10 text-primary border-primary/20',
  cliente: 'bg-secondary/10 text-secondary-foreground border-secondary/20',
  banco: 'bg-accent/10 text-accent-foreground border-accent/20',
};

export const SimpleSearch: React.FC<SimpleSearchProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('recent-searches');
    return saved ? JSON.parse(saved) : [];
  });
  
  const debouncedQuery = useDebounce(query.toLowerCase(), 300);
  
  const { data: contratos = [] } = useContratos();
  const { data: clientes = [] } = useClientes();
  const { data: bancos = [] } = useBancos();

  console.log('SimpleSearch - Data loaded:', {
    contratos: contratos.length,
    clientes: clientes.length, 
    bancos: bancos.length,
    query
  });

  const filteredResults = useMemo(() => {
    if (!debouncedQuery.trim()) return [];

    const results: any[] = [];

    // Buscar clientes
    if (selectedType === 'all' || selectedType === 'cliente') {
      clientes.forEach(cliente => {
        const searchText = [cliente.nome, cliente.cpf_cnpj, cliente.email].filter(Boolean).join(' ').toLowerCase();
        if (searchText.includes(debouncedQuery)) {
          results.push({
            id: cliente.id,
            type: 'cliente',
            title: cliente.nome,
            subtitle: `${cliente.cpf_cnpj || ''} - ${cliente.email || ''}`,
            url: `/clientes?selected=${cliente.id}`,
            data: cliente
          });
        }
      });
    }

    // Buscar bancos  
    if (selectedType === 'all' || selectedType === 'banco') {
      bancos.forEach(banco => {
        const searchText = [banco.nome, banco.codigo_banco].filter(Boolean).join(' ').toLowerCase();
        if (searchText.includes(debouncedQuery)) {
          results.push({
            id: banco.id,
            type: 'banco',
            title: banco.nome,
            subtitle: `Código: ${banco.codigo_banco || 'N/A'}`,
            url: '/configuracoes?tab=tabelas',
            data: banco
          });
        }
      });
    }

    // Buscar contratos
    if (selectedType === 'all' || selectedType === 'contrato') {
      contratos.forEach(contrato => {
        const searchText = [
          contrato.numero_contrato,
          contrato.clientes?.nome,
          contrato.bancos?.nome,
          contrato.situacao,
          contrato.classificacao
        ].filter(Boolean).join(' ').toLowerCase();

        if (searchText.includes(debouncedQuery)) {
          results.push({
            id: contrato.id,
            type: 'contrato',
            title: `Contrato ${contrato.numero_contrato || 'S/N'}`,
            subtitle: `${contrato.clientes?.nome} - R$ ${(contrato.saldo_contabil || contrato.valor_divida)?.toLocaleString('pt-BR') || '0'}`,
            url: `/contratos/${contrato.id}`,
            data: contrato
          });
        }
      });
    }

    return results.slice(0, 50);
  }, [debouncedQuery, selectedType, contratos, clientes, bancos]);

  const handleSelect = (result: any) => {
    if (result.url) {
      navigate(result.url);
      addToRecentSearches(query);
      onOpenChange(false);
      setQuery('');
    }
  };

  const addToRecentSearches = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));
  };

  const handleRecentSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const hasQuery = debouncedQuery.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden p-0">
        <DialogTitle className="sr-only">Busca Global</DialogTitle>
        <DialogDescription className="sr-only">
          Busque por contratos, clientes e bancos no sistema
        </DialogDescription>
        
        {/* Campo de busca */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Busque por contratos, clientes, bancos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 text-base"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
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

        <div className="overflow-y-auto max-h-[500px]">
          {!hasQuery && recentSearches.length > 0 && (
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Buscas Recentes</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRecentSearches([])}
                  className="h-6 text-xs"
                >
                  Limpar
                </Button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearch(search)}
                    className="flex items-center gap-2 w-full p-2 text-left hover:bg-muted/50 rounded text-sm"
                  >
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasQuery && (
            <div className="p-4">
              <div className="text-sm text-muted-foreground mb-3">
                {filteredResults.length} resultado(s) encontrado(s)
              </div>
              
              <div className="space-y-2">
                {filteredResults.map((result, index) => {
                  const Icon = typeIcons[result.type as keyof typeof typeIcons];
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelect(result)}
                      className="w-full p-3 text-left hover:bg-muted/50 rounded-lg border transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium truncate">{result.title}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${typeColors[result.type as keyof typeof typeColors]} flex-shrink-0`}
                            >
                              {result.type === 'contrato' ? 'Contrato' : 
                               result.type === 'cliente' ? 'Cliente' : 'Banco'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {result.subtitle}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
                
                {filteredResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>Nenhum resultado encontrado</p>
                    <p className="text-xs mt-1">Tente usar termos diferentes</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!hasQuery && recentSearches.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="mx-auto h-12 w-12 mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">Busca Global</p>
              <p className="text-sm">
                Digite para buscar contratos, clientes ou bancos
              </p>
            </div>
          )}
        </div>

        {/* Footer com atalhos */}
        <div className="border-t bg-muted/30 px-3 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};