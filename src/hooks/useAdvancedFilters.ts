import { useState, useMemo, useCallback } from 'react';

// Helper functions - defined outside the hook to avoid hoisting issues
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const applyFilterRule = (value: any, rule: FilterRule): boolean => {
  if (value == null) return false;

  const stringValue = String(value).toLowerCase();
  const ruleValue = String(rule.value).toLowerCase();

  switch (rule.operator) {
    case 'equals':
      return stringValue === ruleValue;
    case 'contains':
      return stringValue.includes(ruleValue);
    case 'startsWith':
      return stringValue.startsWith(ruleValue);
    case 'endsWith':
      return stringValue.endsWith(ruleValue);
    case 'gt':
      return Number(value) > Number(rule.value);
    case 'lt':
      return Number(value) < Number(rule.value);
    case 'gte':
      return Number(value) >= Number(rule.value);
    case 'lte':
      return Number(value) <= Number(rule.value);
    case 'in':
      return Array.isArray(rule.value) && rule.value.includes(value);
    case 'between':
      return Array.isArray(rule.value) && 
             Number(value) >= Number(rule.value[0]) && 
             Number(value) <= Number(rule.value[1]);
    default:
      return true;
  }
};

export interface FilterRule {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte' | 'between' | 'in';
  value: any;
  label?: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  rules: FilterRule[];
  createdAt: Date;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
  priority: number;
}

export const useAdvancedFilters = <T extends Record<string, any>>(
  data: T[],
  storageKey: string
) => {
  const [activeFilters, setActiveFilters] = useState<FilterRule[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => {
    const saved = localStorage.getItem(`${storageKey}-saved-filters`);
    return saved ? JSON.parse(saved) : [];
  });
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Aplicar filtros aos dados
  const filteredData = useMemo(() => {
    let result = [...data];

    // Aplicar busca textual
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => {
        return Object.values(item).some(value => 
          String(value).toLowerCase().includes(query)
        );
      });
    }

    // Aplicar filtros
    activeFilters.forEach(filter => {
      result = result.filter(item => {
        const fieldValue = getNestedValue(item, filter.field);
        return applyFilterRule(fieldValue, filter);
      });
    });

    // Aplicar ordenação múltipla
    if (sortConfigs.length > 0) {
      result.sort((a, b) => {
        for (const config of sortConfigs.sort((x, y) => x.priority - y.priority)) {
          const aValue = getNestedValue(a, config.field);
          const bValue = getNestedValue(b, config.field);
          
          let comparison = 0;
          if (aValue < bValue) comparison = -1;
          else if (aValue > bValue) comparison = 1;
          
          if (comparison !== 0) {
            return config.direction === 'desc' ? -comparison : comparison;
          }
        }
        return 0;
      });
    }

    return result;
  }, [data, activeFilters, sortConfigs, searchQuery]);

  const addFilter = useCallback((filter: FilterRule) => {
    setActiveFilters(prev => {
      const existing = prev.findIndex(f => f.field === filter.field && f.operator === filter.operator);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = filter;
        return updated;
      }
      return [...prev, filter];
    });
  }, []);

  const removeFilter = useCallback((field: string, operator?: string) => {
    setActiveFilters(prev => prev.filter(f => 
      !(f.field === field && (operator ? f.operator === operator : true))
    ));
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters([]);
    setSortConfigs([]);
    setSearchQuery('');
  }, []);

  const saveCurrentFilter = useCallback((name: string) => {
    if (activeFilters.length === 0) return;

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name,
      rules: [...activeFilters],
      createdAt: new Date()
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem(`${storageKey}-saved-filters`, JSON.stringify(updated));
  }, [activeFilters, savedFilters, storageKey]);

  const loadSavedFilter = useCallback((filterId: string) => {
    const filter = savedFilters.find(f => f.id === filterId);
    if (filter) {
      setActiveFilters(filter.rules);
    }
  }, [savedFilters]);

  const deleteSavedFilter = useCallback((filterId: string) => {
    const updated = savedFilters.filter(f => f.id !== filterId);
    setSavedFilters(updated);
    localStorage.setItem(`${storageKey}-saved-filters`, JSON.stringify(updated));
  }, [savedFilters, storageKey]);

  const addSort = useCallback((field: string, direction: 'asc' | 'desc') => {
    setSortConfigs(prev => {
      const existing = prev.findIndex(s => s.field === field);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], direction };
        return updated;
      }
      return [...prev, { field, direction, priority: prev.length }];
    });
  }, []);

  const removeSort = useCallback((field: string) => {
    setSortConfigs(prev => prev.filter(s => s.field !== field));
  }, []);

  const clearSort = useCallback(() => {
    setSortConfigs([]);
  }, []);

  return {
    // Data
    filteredData,
    totalCount: data.length,
    filteredCount: filteredData.length,
    
    // Filters
    activeFilters,
    addFilter,
    removeFilter,
    clearAllFilters,
    
    // Saved filters
    savedFilters,
    saveCurrentFilter,
    loadSavedFilter,
    deleteSavedFilter,
    
    // Sorting
    sortConfigs,
    addSort,
    removeSort,
    clearSort,
    
    // Search
    searchQuery,
    setSearchQuery
  };
};