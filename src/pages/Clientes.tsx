import { useState, useEffect } from "react";
import { Plus, Edit2, Search, Building2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ClienteForm } from "@/components/forms/ClienteForm";
import { ContratosCliente } from "@/components/cliente/ContratosCliente";
import { useClientes, Cliente } from "@/hooks/useClientes";
import { useContratosCountByCliente } from "@/hooks/useContratosByCliente";
import { usePWANavigation } from "@/hooks/usePWANavigation";
import { format } from "date-fns";

export default function Clientes() {
  const { data: clientes, isLoading } = useClientes();
  const { data: contratosCount } = useContratosCountByCliente();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedClientes, setExpandedClientes] = useState<Set<string>>(new Set());

  // Initialize PWA navigation
  usePWANavigation();

  const filteredClientes = clientes?.filter(cliente => 
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cpf_cnpj?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedCliente(null);
  };

  const toggleClienteExpanded = (clienteId: string) => {
    const newExpanded = new Set(expandedClientes);
    if (newExpanded.has(clienteId)) {
      newExpanded.delete(clienteId);
    } else {
      newExpanded.add(clienteId);
    }
    setExpandedClientes(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Carregando clientes...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gerencie o cadastro de clientes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedCliente ? "Editar Cliente" : "Novo Cliente"}
              </DialogTitle>
            </DialogHeader>
            <ClienteForm cliente={selectedCliente || undefined} onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Buscar por nome, CPF/CNPJ ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF/CNPJ</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contratos</TableHead>
                  <TableHead>Data Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClientes?.map((cliente) => {
                    const isExpanded = expandedClientes.has(cliente.id);
                    const contratosDoCliente = contratosCount?.[cliente.id] || 0;
                    
                    return (
                      <Collapsible key={cliente.id} open={isExpanded} onOpenChange={() => toggleClienteExpanded(cliente.id)}>
                        <TableRow>
                          <TableCell>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </TableCell>
                          <TableCell className="font-medium">{cliente.nome}</TableCell>
                          <TableCell>
                            {cliente.cpf_cnpj ? (
                              <Badge variant="outline">{cliente.cpf_cnpj}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {cliente.email || <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <Badge variant={contratosDoCliente > 0 ? "default" : "secondary"}>
                                {contratosDoCliente} contrato{contratosDoCliente !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(cliente.data_cadastro), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleClienteExpanded(cliente.id)}
                              >
                                <Building2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedCliente(cliente);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <TableRow>
                            <TableCell colSpan={7} className="p-0">
                              <div className="p-4 bg-muted/30">
                                <ContratosCliente cliente={cliente} />
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}