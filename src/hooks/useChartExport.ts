import { useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportOptions {
  format: 'png' | 'svg' | 'pdf' | 'jpg';
  quality?: number;
  width?: number;
  height?: number;
  filename?: string;
}

export function useChartExport() {
  const exportChart = useCallback(async (
    element: HTMLElement | null,
    options: ExportOptions = { format: 'png' }
  ) => {
    if (!element) {
      throw new Error('Element not found');
    }

    const {
      format,
      quality = 1,
      width,
      height,
      filename = `chart-${Date.now()}`
    } = options;

    try {
      switch (format) {
        case 'png':
        case 'jpg': {
          const canvas = await html2canvas(element, {
            backgroundColor: null,
            scale: 2,
            width,
            height,
            useCORS: true,
            allowTaint: true,
            logging: false,
          });

          const dataURL = canvas.toDataURL(
            `image/${format}`,
            quality
          );

          downloadFile(dataURL, `${filename}.${format}`);
          break;
        }

        case 'svg': {
          const svgElement = element.querySelector('svg');
          if (!svgElement) {
            throw new Error('No SVG element found in chart');
          }

          const serializer = new XMLSerializer();
          const svgString = serializer.serializeToString(svgElement);
          const svgBlob = new Blob([svgString], {
            type: 'image/svg+xml;charset=utf-8'
          });

          const url = URL.createObjectURL(svgBlob);
          downloadFile(url, `${filename}.svg`);
          URL.revokeObjectURL(url);
          break;
        }

        case 'pdf': {
          const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
          });

          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
            unit: 'mm',
            format: 'a4'
          });

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
          
          const imgWidth = canvas.width * ratio;
          const imgHeight = canvas.height * ratio;
          const x = (pdfWidth - imgWidth) / 2;
          const y = (pdfHeight - imgHeight) / 2;

          pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
          pdf.save(`${filename}.pdf`);
          break;
        }

        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }, []);

  const generateShareableLink = useCallback(async (
    chartConfig: any,
    chartData: any
  ) => {
    try {
      // Encode chart configuration and data
      const shareData = {
        config: chartConfig,
        data: chartData,
        timestamp: Date.now(),
      };

      const encodedData = btoa(JSON.stringify(shareData));
      const shareUrl = `${window.location.origin}/shared-chart/${encodedData}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      return shareUrl;
    } catch (error) {
      console.error('Failed to generate shareable link:', error);
      throw error;
    }
  }, []);

  const copyChartData = useCallback(async (
    data: any[],
    format: 'json' | 'csv' | 'tsv' = 'json'
  ) => {
    try {
      let output: string;

      switch (format) {
        case 'json':
          output = JSON.stringify(data, null, 2);
          break;

        case 'csv':
          if (data.length === 0) break;
          const csvHeaders = Object.keys(data[0]).join(',');
          const csvRows = data.map(row => 
            Object.values(row).map(val => 
              typeof val === 'string' ? `"${val}"` : val
            ).join(',')
          );
          output = [csvHeaders, ...csvRows].join('\n');
          break;

        case 'tsv':
          if (data.length === 0) break;
          const tsvHeaders = Object.keys(data[0]).join('\t');
          const tsvRows = data.map(row => 
            Object.values(row).join('\t')
          );
          output = [tsvHeaders, ...tsvRows].join('\n');
          break;

        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      await navigator.clipboard.writeText(output);
      return output;
    } catch (error) {
      console.error('Failed to copy chart data:', error);
      throw error;
    }
  }, []);

  return {
    exportChart,
    generateShareableLink,
    copyChartData,
  };
}

// Utility function to trigger file download
function downloadFile(dataURL: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}