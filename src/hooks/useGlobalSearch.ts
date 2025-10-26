import { useState, useMemo, useEffect } from 'react';
import { useContratos } from './useContratos';
import { useClientes } from './useClientes';
import { useBancos } from './useBancos';
import { useDebounce } from './useDebounce';

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'contrato' | 'cliente' | 'banco';
  data: any;
  url: string;
}

export const useGlobalSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('recent-searches');
    return saved ? JSON.parse(saved) : [];
  });

  const debouncedQuery = useDebounce(searchQuery.toLowerCase(), 300);

  const { data: contratos = [] } = useContratos();
  const { data: clientes = [] } = useClientes();
  const { data: bancos = [] } = useBancos();

  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) return [];

    console.log('Searching for:', debouncedQuery);
    console.log('Available data:', { contratos: contratos.length, clientes: clientes.length, bancos: bancos.length });

    const results: SearchResult[] = [];

    // Buscar em contratos
    if (selectedType === 'all' || selectedType === 'contrato') {
      contratos.forEach(contrato => {
        const matchFields = [
          contrato.numero_contrato,
          contrato.clientes?.nome,
          contrato.situacao,
          contrato.classificacao,
          contrato.valor_divida?.toString(),
          contrato.bancos?.nome
        ].filter(Boolean).join(' ').toLowerCase();

        if (matchFields.includes(debouncedQuery)) {
          results.push({
            id: contrato.id,
            title: `Contrato ${contrato.numero_contrato || 'S/N'}`,
            subtitle: `${contrato.clientes?.nome} - R$ ${(contrato.saldo_contabil || contrato.valor_divida)?.toLocaleString('pt-BR') || '0'}`,
            type: 'contrato',
            data: contrato,
            url: `/contratos/${contrato.id}`
          });
        }
      });
    }

    // Buscar em clientes
    if (selectedType === 'all' || selectedType === 'cliente') {
      clientes.forEach(cliente => {
        const matchFields = [
          cliente.nome,
          cliente.cpf_cnpj,
          cliente.email
        ].filter(Boolean).join(' ').toLowerCase();

        if (matchFields.includes(debouncedQuery)) {
          results.push({
            id: cliente.id,
            title: cliente.nome,
            subtitle: `${cliente.cpf_cnpj || ''} - ${cliente.email || ''}`,
            type: 'cliente',
            data: cliente,
            url: `/clientes?selected=${cliente.id}`
          });
        }
      });
    }

    // Buscar em bancos
    if (selectedType === 'all' || selectedType === 'banco') {
      bancos.forEach(banco => {
        const matchFields = [
          banco.nome,
          banco.codigo_banco,
          banco.contato
        ].filter(Boolean).join(' ').toLowerCase();

        if (matchFields.includes(debouncedQuery)) {
          results.push({
            id: banco.id,
            title: banco.nome,
            subtitle: `Código: ${banco.codigo_banco || 'N/A'} - ${banco.contato || ''}`,
            type: 'banco',
            data: banco,
            url: `/configuracoes?tab=tabelas`
          });
        }
      });
    }

    console.log('Search results found:', results.length);
    return results.slice(0, 50); // Limitar resultados
  }, [debouncedQuery, selectedType, contratos, clientes, bancos]);

  const addToRecentSearches = (query: string) => {
    if (!query.trim()) return;

    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent-searches');
  };

  const popularSuggestions = useMemo(() => {
    return [
      'contratos em atraso',
      'clientes pendentes',
      'provisão alta',
      'acordos finalizados',
      'ações judiciais'
    ];
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    searchResults,
    recentSearches,
    addToRecentSearches,
    clearRecentSearches,
    popularSuggestions
  };
};