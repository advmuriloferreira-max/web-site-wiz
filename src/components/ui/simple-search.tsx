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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden p-0 bg-slate-900/95 backdrop-blur-xl border-slate-700/50 shadow-2xl">
        <DialogTitle className="sr-only">Busca Global</DialogTitle>
        <DialogDescription className="sr-only">
          Busque por contratos, clientes e bancos no sistema
        </DialogDescription>
        
        {/* Campo de busca */}
        <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-blue-400 animate-pulse" />
            <Input
              placeholder="Busque por contratos, clientes, bancos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-2 focus-visible:ring-blue-500/50 text-base bg-transparent text-white placeholder:text-slate-400"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuery('')}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filtros por tipo */}
        <div className="flex gap-2 p-3 border-b border-slate-700/50 bg-slate-800/30">
          <Button
            variant={selectedType === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedType('all')}
            className={`h-7 text-xs transition-all duration-200 ${
              selectedType === 'all' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Todos
          </Button>
          <Button
            variant={selectedType === 'contrato' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedType('contrato')}
            className={`h-7 text-xs transition-all duration-200 ${
              selectedType === 'contrato' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <FileText className="mr-1 h-3 w-3" />
            Contratos
          </Button>
          <Button
            variant={selectedType === 'cliente' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedType('cliente')}
            className={`h-7 text-xs transition-all duration-200 ${
              selectedType === 'cliente' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Users className="mr-1 h-3 w-3" />
            Clientes
          </Button>
          <Button
            variant={selectedType === 'banco' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedType('banco')}
            className={`h-7 text-xs transition-all duration-200 ${
              selectedType === 'banco' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Building2 className="mr-1 h-3 w-3" />
            Bancos
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[500px] bg-slate-900/50">
          {!hasQuery && recentSearches.length > 0 && (
            <div className="p-4 border-b border-slate-700/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white">Buscas Recentes</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRecentSearches([])}
                  className="h-6 text-xs text-slate-400 hover:text-white hover:bg-slate-700/50"
                >
                  Limpar
                </Button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearch(search)}
                    className="flex items-center gap-2 w-full p-2 text-left hover:bg-slate-700/30 rounded-lg text-sm text-slate-300 hover:text-white transition-all duration-200"
                  >
                    <Clock className="h-3 w-3 text-slate-500" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasQuery && (
            <div className="p-4">
              <div className="text-sm text-slate-400 mb-3">
                {filteredResults.length} resultado(s) encontrado(s)
              </div>
              
              <div className="space-y-2">
                {filteredResults.map((result, index) => {
                  const Icon = typeIcons[result.type as keyof typeof typeIcons];
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelect(result)}
                      className="w-full p-3 text-left hover:bg-slate-700/30 rounded-lg border border-slate-700/30 transition-all duration-200 hover:border-slate-600/50 hover:scale-[1.02] bg-slate-800/20"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium truncate text-white">{result.title}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs border-blue-500/30 bg-blue-500/10 text-blue-300 flex-shrink-0`}
                            >
                              {result.type === 'contrato' ? 'Contrato' : 
                               result.type === 'cliente' ? 'Cliente' : 'Banco'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400 truncate">
                            {result.subtitle}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
                
                {filteredResults.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p className="text-white">Nenhum resultado encontrado</p>
                    <p className="text-xs mt-1">Tente usar termos diferentes</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!hasQuery && recentSearches.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              <Search className="mx-auto h-12 w-12 mb-4 opacity-30 text-blue-400" />
              <p className="text-lg font-medium mb-2 text-white">Busca Global</p>
              <p className="text-sm">
                Digite para buscar contratos, clientes ou bancos
              </p>
            </div>
          )}
        </div>

        {/* Footer com atalhos */}
        <div className="border-t border-slate-700/50 bg-slate-800/30 px-3 py-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <kbd className="pointer-events-none h-4 select-none items-center gap-1 rounded border border-slate-600 bg-slate-700 px-1 font-mono text-xs font-medium opacity-100 flex text-slate-300">
                ↵
              </kbd>
              para selecionar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="pointer-events-none h-4 select-none items-center gap-1 rounded border border-slate-600 bg-slate-700 px-1 font-mono text-xs font-medium opacity-100 flex text-slate-300">
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