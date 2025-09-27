import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { differenceInDays, parseISO, isValid } from 'date-fns';

interface AutoCalculateOptions {
  debounceDelay?: number;
}

export function useAutoCalculate(options: AutoCalculateOptions = {}) {
  const { debounceDelay = 500 } = options;

  // Calculadora de dias de atraso
  const useDaysOverdue = (dueDate: string, referenceDate?: string) => {
    const [daysOverdue, setDaysOverdue] = useState<number>(0);
    const debouncedDueDate = useDebounce(dueDate, debounceDelay);
    
    useEffect(() => {
      if (!debouncedDueDate) {
        setDaysOverdue(0);
        return;
      }

      try {
        const due = parseISO(debouncedDueDate);
        const reference = referenceDate ? parseISO(referenceDate) : new Date();
        
        if (isValid(due) && isValid(reference)) {
          const days = differenceInDays(reference, due);
          setDaysOverdue(Math.max(0, days));
        }
      } catch (error) {
        setDaysOverdue(0);
      }
    }, [debouncedDueDate, referenceDate]);

    return daysOverdue;
  };

  // Calculadora de provisão em tempo real
  const useProvisionCalculator = (
    debtValue: number,
    daysOverdue: number,
    guaranteePercentage: number = 0
  ) => {
    const [provisionData, setProvisionData] = useState({
      provisionValue: 0,
      provisionPercentage: 0,
      stage: 'A' as 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'
    });

    const debouncedDebtValue = useDebounce(debtValue, debounceDelay);
    const debouncedDaysOverdue = useDebounce(daysOverdue, debounceDelay);
    const debouncedGuaranteePercentage = useDebounce(guaranteePercentage, debounceDelay);

    useEffect(() => {
      if (!debouncedDebtValue || debouncedDebtValue <= 0) {
        setProvisionData({ provisionValue: 0, provisionPercentage: 0, stage: 'A' });
        return;
      }

      // Lógica simplificada de cálculo de provisão baseada em dias de atraso
      let percentage = 0;
      let stage: typeof provisionData.stage = 'A';

      if (debouncedDaysOverdue <= 14) {
        percentage = 0;
        stage = 'A';
      } else if (debouncedDaysOverdue <= 30) {
        percentage = 1;
        stage = 'B';
      } else if (debouncedDaysOverdue <= 60) {
        percentage = 3;
        stage = 'C';
      } else if (debouncedDaysOverdue <= 90) {
        percentage = 10;
        stage = 'D';
      } else if (debouncedDaysOverdue <= 180) {
        percentage = 30;
        stage = 'E';
      } else if (debouncedDaysOverdue <= 360) {
        percentage = 50;
        stage = 'F';
      } else if (debouncedDaysOverdue <= 1080) {
        percentage = 70;
        stage = 'G';
      } else {
        percentage = 100;
        stage = 'H';
      }

      // Aplicar desconto por garantia
      const adjustedPercentage = Math.max(0, percentage - (percentage * (debouncedGuaranteePercentage / 100)));
      const provisionValue = (debouncedDebtValue * adjustedPercentage) / 100;

      setProvisionData({
        provisionValue,
        provisionPercentage: adjustedPercentage,
        stage
      });
    }, [debouncedDebtValue, debouncedDaysOverdue, debouncedGuaranteePercentage]);

    return provisionData;
  };

  return {
    useDaysOverdue,
    useProvisionCalculator
  };
}