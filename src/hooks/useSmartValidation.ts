import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { supabase } from '@/integrations/supabase/client';

interface ValidationResult {
  isValid: boolean;
  message?: string;
  suggestions?: string[];
}

interface SmartValidationOptions {
  debounceDelay?: number;
  enableSuggestions?: boolean;
  suggestionTable?: string;
  suggestionField?: string;
  minSuggestionLength?: number;
}

export function useSmartValidation(
  value: string,
  validationRules: ((value: string) => ValidationResult)[],
  options: SmartValidationOptions = {}
) {
  const {
    debounceDelay = 300,
    enableSuggestions = false,
    suggestionTable = '',
    suggestionField = '',
    minSuggestionLength = 2
  } = options;

  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  
  const debouncedValue = useDebounce(value, debounceDelay);

  const validateValue = useCallback(async (val: string) => {
    if (!val) {
      setValidationResult({ isValid: true });
      setSuggestions([]);
      return;
    }

    setIsValidating(true);

    // Apply validation rules
    for (const rule of validationRules) {
      const result = rule(val);
      if (!result.isValid) {
        setValidationResult(result);
        setIsValidating(false);
        return;
      }
    }

    // Get suggestions if enabled
    if (enableSuggestions && suggestionTable && suggestionField && val.length >= minSuggestionLength) {
      try {
        // Usar any para evitar problemas de tipagem do Supabase
        const query = (supabase as any)
          .from(suggestionTable)
          .select(suggestionField)
          .ilike(suggestionField, `%${val}%`)
          .limit(5);

        const { data } = await query;

        if (data && Array.isArray(data)) {
          const suggestionList = data
            .map((item: Record<string, any>) => {
              const fieldValue = item[suggestionField as string];
              return typeof fieldValue === 'string' ? fieldValue : '';
            })
            .filter((item: string) => item && item.toLowerCase() !== val.toLowerCase());
          setSuggestions(suggestionList);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    }

    setValidationResult({ isValid: true });
    setIsValidating(false);
  }, [validationRules, enableSuggestions, suggestionTable, suggestionField, minSuggestionLength]);

  useEffect(() => {
    validateValue(debouncedValue);
  }, [debouncedValue, validateValue]);

  return {
    validationResult,
    suggestions,
    isValidating,
    clearSuggestions: () => setSuggestions([])
  };
}