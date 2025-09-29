import { useState, useCallback } from 'react';

export interface ChartColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  gradient: string[];
}

export interface ChartSettings {
  colors: ChartColors;
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'mixed';
  showGrid: boolean;
  showLegend: boolean;
  showTooltip: boolean;
  showAnimation: boolean;
  theme: 'light' | 'dark' | 'auto';
}

const defaultColors: ChartColors = {
  primary: '#3B82F6',
  secondary: '#64748B',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4',
  gradient: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'],
};

const defaultSettings: ChartSettings = {
  colors: defaultColors,
  chartType: 'bar',
  showGrid: true,
  showLegend: true,
  showTooltip: true,
  showAnimation: true,
  theme: 'auto',
};

export function useChartCustomization(chartId: string) {
  const [settings, setSettings] = useLocalStorage(
    `chart-settings-${chartId}`,
    defaultSettings
  );

  const updateColors = useCallback((colors: Partial<ChartColors>) => {
    setSettings(prev => ({
      ...prev,
      colors: { ...prev.colors, ...colors }
    }));
  }, [setSettings]);

  const updateChartType = useCallback((chartType: ChartSettings['chartType']) => {
    setSettings(prev => ({ ...prev, chartType }));
  }, [setSettings]);

  const updateSetting = useCallback((key: keyof ChartSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, [setSettings]);

  const resetToDefault = useCallback(() => {
    setSettings(defaultSettings);
  }, [setSettings]);

  // Generate color palette based on primary color
  const generatePalette = useCallback((baseColor: string, count: number = 8) => {
    const palette: string[] = [];
    
    // Convert hex to HSL for manipulation
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return [h * 360, s * 100, l * 100];
    };

    const hslToHex = (h: number, s: number, l: number) => {
      h /= 360; s /= 100; l /= 100;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs((h * 6) % 2 - 1));
      const m = l - c / 2;
      let r = 0, g = 0, b = 0;

      if (0 <= h && h < 1/6) { r = c; g = x; b = 0; }
      else if (1/6 <= h && h < 2/6) { r = x; g = c; b = 0; }
      else if (2/6 <= h && h < 3/6) { r = 0; g = c; b = x; }
      else if (3/6 <= h && h < 4/6) { r = 0; g = x; b = c; }
      else if (4/6 <= h && h < 5/6) { r = x; g = 0; b = c; }
      else if (5/6 <= h && h < 1) { r = c; g = 0; b = x; }

      r = Math.round((r + m) * 255);
      g = Math.round((g + m) * 255);
      b = Math.round((b + m) * 255);

      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    const [h, s, l] = hexToHsl(baseColor);

    for (let i = 0; i < count; i++) {
      const hueShift = (i * 360 / count) % 360;
      const newH = (h + hueShift) % 360;
      const newS = Math.max(30, Math.min(90, s + (i % 2 === 0 ? 10 : -10)));
      const newL = Math.max(20, Math.min(80, l + (i % 3 === 0 ? 15 : -15)));
      
      palette.push(hslToHex(newH, newS, newL));
    }

    return palette;
  }, []);

  return {
    settings,
    updateColors,
    updateChartType,
    updateSetting,
    resetToDefault,
    generatePalette,
  };
}

// Custom hook for localStorage
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}