import { useCallback } from 'react';
import { toast } from 'sonner';

export const useDataExport = () => {
  const exportToCSV = useCallback((data: any[], filename: string, headers?: string[]) => {
    if (!data.length) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    try {
      const csvHeaders = headers || Object.keys(data[0]);
      const csvContent = [
        csvHeaders.join(','),
        ...data.map(row => 
          csvHeaders.map(header => {
            const value = row[header] || '';
            // Escape commas and quotes in CSV
            const escapedValue = String(value).replace(/"/g, '""');
            return `"${escapedValue}"`;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Dados exportados com sucesso');
    } catch (error) {
      toast.error('Erro ao exportar dados');
      console.error('Export error:', error);
    }
  }, []);

  const exportToJSON = useCallback((data: any[], filename: string) => {
    if (!data.length) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    try {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.json`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Dados exportados com sucesso');
    } catch (error) {
      toast.error('Erro ao exportar dados');
      console.error('Export error:', error);
    }
  }, []);

  return {
    exportToCSV,
    exportToJSON
  };
};