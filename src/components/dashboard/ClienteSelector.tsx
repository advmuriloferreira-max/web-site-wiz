import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useClientes } from "@/hooks/useClientes";
import { useContratosByCliente, useContratosCountByCliente } from "@/hooks/useContratosByCliente";
import { Search, Users, X } from "lucide-react";

interface ClienteSelectorProps {
  selectedClienteId: string | null;
  onClienteSelect: (clienteId: string | null) => void;
}

export function ClienteSelector({ selectedClienteId, onClienteSelect }: ClienteSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: clientes, isLoading } = useClientes();
  const { data: contratosCount } = useContratosCountByCliente();

  const filteredClientes = clientes?.filter(cliente => 
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cpf_cnpj?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const selectedCliente = clientes?.find(c => c.id === selectedClienteId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Selecionar Cliente</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Carregando clientes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Segmentação por Cliente</span>
          </div>
          {selectedClienteId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onClienteSelect(null)}
              className="flex items-center space-x-1"
            >
              <X className="h-4 w-4" />
              <span>Limpar</span>
            </Button>
          )}
        </CardTitle>
        {selectedCliente && (
          <div className="mt-2">
            <Badge variant="secondary" className="text-sm">
              Analisando: {selectedCliente.nome}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!selectedClienteId ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredClientes.map(cliente => (
                <div
                  key={cliente.id}
                  onClick={() => onClienteSelect(cliente.id)}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground text-sm">{cliente.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {cliente.cpf_cnpj || "CPF/CNPJ não informado"}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {contratosCount?.[cliente.id] || 0} contrato{(contratosCount?.[cliente.id] || 0) !== 1 ? 's' : ''}
                  </Badge>
                </div>
              ))}
            </div>
            
            {filteredClientes.length === 0 && (
              <div className="text-center text-muted-foreground text-sm">
                {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground text-sm">
            Visualizando análise específica do cliente selecionado
          </div>
        )}
      </CardContent>
    </Card>
  );
}