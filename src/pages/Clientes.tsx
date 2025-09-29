import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClienteForm } from "@/components/forms/ClienteForm";
import { ContratosCliente } from "@/components/cliente/ContratosCliente";
import { useClientes, useDeleteCliente, Cliente } from "@/hooks/useClientes";
import { useContratosCountByCliente } from "@/hooks/useContratosByCliente";
import { usePWANavigation } from "@/hooks/usePWANavigation";
import { ResponsiveContainer } from "@/components/ui/layout-consistency";

// Componentes jurídicos
import { LegalIcons } from "@/components/ui/legal-icons";
import { LegalTableHeader } from "@/components/ui/legal-header";
import { LegalTimestamp } from "@/components/ui/legal-timestamp";

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
    navigate("/clientes/novo");
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
      <div className="min-h-screen bg-background">
        <ResponsiveContainer className="space-content animate-fade-in">
          <div className="padding-content">
            <h1 className="title-main text-primary mb-6">Carregando clientes...</h1>
            <div className="executive-card bg-card border-2 border-border/20 rounded-sm shadow-premium padding-card">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-1/4"></div>
                <div className="h-10 bg-muted rounded w-1/2"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <ResponsiveContainer className="py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="title-main text-primary mb-2 flex items-center">
            <LegalIcons.clients className="mr-3 h-8 w-8" />
            Cadastro de Clientes
          </h1>
          <p className="text-body text-muted-foreground">Sistema de gestão jurídica de clientes</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNovoCliente} className="interactive-button bg-primary hover:bg-primary-hover px-6 font-semibold">
            <LegalIcons.add className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
        
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-modal animate-scale-in border-2">
            <DialogHeader>
              <DialogTitle className="title-card flex items-center space-x-2">
                <LegalIcons.edit className="h-5 w-5 text-primary" />
                Editar Cliente
              </DialogTitle>
            </DialogHeader>
            <ClienteForm cliente={selectedCliente || undefined} onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="executive-card bg-card border-2 border-border/20 rounded-sm shadow-premium animate-slide-up">
        <LegalTableHeader 
          title="Registro de Clientes" 
          count={filteredClientes?.length} 
        />
        <CardContent className="p-0">
          <div className="padding-content space-y-4">
            <div className="flex items-center space-x-2">
              <LegalIcons.search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CPF/CNPJ ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm border-2 focus:border-accent"
              />
            </div>
            
            <Table className="border-2 border-border/10">
              <TableHeader className="bg-primary/5">
                <TableRow className="border-b-2 border-accent/20">
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead className="text-label">
                    <div className="flex items-center space-x-2">
                      <LegalIcons.user className="h-4 w-4" />
                      <span>Nome Completo</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-label">CPF/CNPJ</TableHead>
                  <TableHead className="text-label">
                    <div className="flex items-center space-x-2">
                      <LegalIcons.email className="h-4 w-4" />
                      <span>Contato</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-label">
                    <div className="flex items-center space-x-2">
                      <LegalIcons.contract className="h-4 w-4" />
                      <span>Contratos</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-label">
                    <div className="flex items-center space-x-2">
                      <LegalIcons.calendar className="h-4 w-4" />
                      <span>Data Cadastro</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-right text-label">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-4 animate-fade-in padding-content">
                        <div className="w-16 h-16 bg-accent/10 rounded-sm border-2 border-accent/30 flex items-center justify-center">
                          <LegalIcons.clients className="h-8 w-8 text-accent" />
                        </div>
                        <div className="space-y-2 text-center">
                          <p className="title-card text-foreground animate-slide-up">Nenhum cliente encontrado</p>
                          <p className="text-body text-muted-foreground animate-slide-up">
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
                      <>
                        <TableRow 
                          key={cliente.id} 
                          className="animate-fade-in hover:bg-primary/5 transition-all duration-200 border-b border-border/10"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleClienteExpanded(cliente.id)}
                              className="h-8 w-8 p-0 hover:bg-accent/20 interactive-button border border-accent/20"
                            >
                              {isExpanded ? (
                                <LegalIcons.expand className="h-4 w-4 text-accent" />
                              ) : (
                                <LegalIcons.collapse className="h-4 w-4 text-accent" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-accent/20 rounded-sm border-2 border-accent/30 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">
                                  {cliente.nome.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <span className="text-body font-semibold text-foreground">{cliente.nome}</span>
                                {cliente.responsavel && (
                                  <p className="text-xs text-muted-foreground">Resp: {cliente.responsavel}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {cliente.cpf_cnpj ? (
                              <div className="legal-badge bg-accent/10 text-accent border-accent/30 px-3 py-1">
                                {cliente.cpf_cnpj}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-body">
                            {cliente.email || <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell>
                            <div className={`legal-badge px-3 py-1 ${
                              contratosDoCliente > 0 
                                ? 'bg-success/10 text-success border-success/30' 
                                : 'bg-muted text-muted-foreground border-border'
                            }`}>
                              <LegalIcons.contract className="h-3 w-3 mr-1" />
                              {contratosDoCliente} contrato{contratosDoCliente !== 1 ? 's' : ''}
                            </div>
                          </TableCell>
                          <TableCell>
                            <LegalTimestamp
                              label=""
                              timestamp={cliente.data_cadastro}
                              format="date"
                              className="border-0 bg-transparent p-0"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleClienteExpanded(cliente.id)}
                                className="h-8 w-8 p-0 hover:bg-accent/10 interactive-button group border border-accent/20"
                              >
                                <LegalIcons.view className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditarCliente(cliente)}
                                className="h-8 w-8 p-0 hover:bg-warning/10 interactive-button group border border-warning/20"
                              >
                                <LegalIcons.edit className="h-4 w-4 text-muted-foreground group-hover:text-warning transition-colors" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-destructive/10 interactive-button group border border-destructive/20"
                                  >
                                    <LegalIcons.delete className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="glass-modal animate-scale-in border-2">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="title-card flex items-center space-x-2">
                                      <LegalIcons.warning className="h-5 w-5 text-destructive" />
                                      Confirmar Exclusão
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-body">
                                      Tem certeza que deseja excluir o cliente "{cliente.nome}"?
                                      Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="interactive-button border-2">Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleExcluirCliente(cliente.id)}
                                      className="bg-destructive hover:bg-destructive/90 interactive-button border-2 border-destructive"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow key={`${cliente.id}-expanded`}>
                            <TableCell colSpan={7} className="p-0">
                              <div className="bg-primary/5 border-t-2 border-accent/20 padding-content animate-slide-down">
                                <ContratosCliente cliente={cliente} />
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </div>
    </ResponsiveContainer>
  );
}