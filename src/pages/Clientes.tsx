import { useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { Trash2, Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClienteWizard } from "@/components/forms/ClienteWizard";
import { ContratosCliente } from "@/components/cliente/ContratosCliente";
import { useClientes, useDeleteCliente, Cliente } from "@/hooks/useClientes";
import { useContratosCountByCliente } from "@/hooks/useContratosByCliente";
import { usePWANavigation } from "@/hooks/usePWANavigation";
import { PageBreadcrumbs } from "@/components/ui/page-breadcrumbs";

// Componentes jurídicos
import { LegalIcons } from "@/components/ui/legal-icons";
import { LegalTableHeader } from "@/components/ui/legal-header";
import { LegalTimestamp } from "@/components/ui/legal-timestamp";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";

export default function Clientes() {
  const navigate = useNavigate();
  const { data: clientes, isLoading } = useClientes();
  const { data: contratosCount } = useContratosCountByCliente();
  const deleteClienteMutation = useDeleteCliente();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [expandedClientes, setExpandedClientes] = useState<Set<string>>(new Set());

  // Initialize PWA navigation
  usePWANavigation();

  const filteredClientes = clientes?.filter(cliente => 
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cpf_cnpj?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedCliente(null);
  };

  const handleNovoCliente = () => {
    setSelectedCliente(null);
    setIsEditDialogOpen(true);
  };

  const handleEditarCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsEditDialogOpen(true);
  };

  const handleExcluirCliente = async (clienteId: string) => {
    try {
      await deleteClienteMutation.mutateAsync(clienteId);
      toast.success("Cliente excluído com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir cliente");
    }
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
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageBreadcrumbs segments={[{ label: "Clientes" }]} />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Clientes
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes e visualize seus contratos
          </p>
        </div>
        
        <Button onClick={handleNovoCliente} size="lg" className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Cliente
        </Button>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCliente ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <ClienteWizard 
            onSuccess={handleSuccess} 
            clienteParaEditar={selectedCliente}
          />
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <LegalIcons.search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CPF/CNPJ ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Nome Completo</TableHead>
                    <TableHead>CPF/CNPJ</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Contratos</TableHead>
                    <TableHead>Data Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center space-y-4">
                          <LegalIcons.clients className="h-12 w-12 text-muted-foreground" />
                          <div className="space-y-2 text-center">
                            <p className="font-medium text-foreground">Nenhum cliente encontrado</p>
                            <p className="text-sm text-muted-foreground">
                              Tente ajustar o termo de busca ou adicionar novos clientes
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClientes?.map((cliente, index) => {
                      const isExpanded = expandedClientes.has(cliente.id);
                      const contratosDoCliente = contratosCount?.[cliente.id] || 0;
                      
                      return (
                        <Fragment key={cliente.id}>
                          <TableRow className="hover:bg-muted/50">
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleClienteExpanded(cliente.id)}
                                className="h-8 w-8 p-0"
                              >
                                {isExpanded ? (
                                  <LegalIcons.expand className="h-4 w-4" />
                                ) : (
                                  <LegalIcons.collapse className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-bold text-primary">
                                    {cliente.nome.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              <div>
                                <button 
                                  onClick={() => navigate(`/app/clientes/${cliente.id}`)}
                                  className="font-semibold hover:underline text-left"
                                >
                                  {cliente.nome}
                                </button>
                              </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {cliente.cpf_cnpj ? (
                                <span className="text-sm">{cliente.cpf_cnpj}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {cliente.email || <span className="text-muted-foreground">-</span>}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <LegalIcons.contract className="h-3 w-3" />
                                {contratosDoCliente} contrato{contratosDoCliente !== 1 ? 's' : ''}
                              </div>
                            </TableCell>
                            <TableCell>
                              <LegalTimestamp
                                label=""
                                timestamp={cliente.created_at}
                                format="date"
                                className="border-0 bg-transparent p-0"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center gap-1 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/app/clientes/${cliente.id}`)}
                                  className="h-8 w-8 p-0"
                                  title="Ver hub do cliente"
                                >
                                  <LegalIcons.view className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleClienteExpanded(cliente.id)}
                                  className="h-8 w-8 p-0"
                                  title="Visualizar contratos"
                                >
                                  <LegalIcons.contract className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditarCliente(cliente)}
                                  className="h-8 w-8 p-0"
                                  title="Editar cliente"
                                >
                                  <LegalIcons.edit className="h-4 w-4" />
                                </Button>
                                <DeleteConfirmation
                                  itemName={cliente.nome}
                                  itemType="cliente"
                                  onConfirm={() => handleExcluirCliente(cliente.id)}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow key={`${cliente.id}-expanded`}>
                              <TableCell colSpan={7} className="p-0">
                                <div className="bg-muted/30 p-4">
                                  <ContratosCliente cliente={cliente} />
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}