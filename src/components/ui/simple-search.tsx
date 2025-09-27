import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useContratos } from '@/hooks/useContratos';
import { useClientes } from '@/hooks/useClientes';
import { useBancos } from '@/hooks/useBancos';

interface SimpleSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SimpleSearch: React.FC<SimpleSearchProps> = ({ open, onOpenChange }) => {
  const [query, setQuery] = useState('');
  
  const { data: contratos = [] } = useContratos();
  const { data: clientes = [] } = useClientes();
  const { data: bancos = [] } = useBancos();

  console.log('SimpleSearch - Data loaded:', {
    contratos: contratos.length,
    clientes: clientes.length, 
    bancos: bancos.length,
    query
  });

  const filteredResults = React.useMemo(() => {
    if (!query.trim()) return [];

    const results: any[] = [];

    // Buscar clientes
    clientes.forEach(cliente => {
      if (cliente.nome.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          type: 'cliente',
          title: cliente.nome,
          subtitle: cliente.cpf_cnpj || '',
          data: cliente
        });
      }
    });

    // Buscar bancos
    bancos.forEach(banco => {
      if (banco.nome.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          type: 'banco',
          title: banco.nome,
          subtitle: 'Banco',
          data: banco
        });
      }
    });

    // Buscar contratos
    contratos.forEach(contrato => {
      const searchText = [
        contrato.numero_contrato,
        contrato.clientes?.nome,
        contrato.bancos?.nome
      ].filter(Boolean).join(' ').toLowerCase();

      if (searchText.includes(query.toLowerCase())) {
        results.push({
          type: 'contrato',
          title: `Contrato ${contrato.numero_contrato || 'S/N'}`,
          subtitle: `${contrato.clientes?.nome} - ${contrato.bancos?.nome}`,
          data: contrato
        });
      }
    });

    console.log('Filtered results:', results);
    return results;
  }, [query, contratos, clientes, bancos]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden p-0">
        <DialogTitle className="sr-only">Busca Simples</DialogTitle>
        <DialogDescription className="sr-only">
          Teste da busca simples no sistema
        </DialogDescription>
        
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Digite para buscar..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 text-base"
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

        <div className="p-4">
          <div className="text-sm text-muted-foreground mb-3">
            Dados carregados: {contratos.length} contratos, {clientes.length} clientes, {bancos.length} bancos
          </div>
          
          {query && (
            <div className="text-sm text-muted-foreground mb-3">
              Buscando por: "{query}" - {filteredResults.length} resultado(s)
            </div>
          )}

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredResults.map((result, index) => (
              <div key={index} className="p-3 border rounded-lg hover:bg-muted/50">
                <div className="font-medium">{result.title}</div>
                <div className="text-sm text-muted-foreground">{result.subtitle}</div>
                <div className="text-xs text-muted-foreground">{result.type}</div>
              </div>
            ))}
            
            {query && filteredResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum resultado encontrado para "{query}"
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};