import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Search, Building2, ChevronDown, ChevronRight, Trash2, Users, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ModernBadge } from "@/components/ui/modern-badge";
import { ClienteForm } from "@/components/forms/ClienteForm";
import { ContratosCliente } from "@/components/cliente/ContratosCliente";
import { useClientes, useDeleteCliente, Cliente } from "@/hooks/useClientes";
import { useContratosCountByCliente } from "@/hooks/useContratosByCliente";
import { usePWANavigation } from "@/hooks/usePWANavigation";
import { AnimatedList } from "@/components/ui/animated-list";
import { EnhancedSkeleton, SkeletonTable } from "@/components/ui/enhanced-skeleton";
import { GlassCard } from "@/components/ui/glassmorphism";
import { GradientText } from "@/components/ui/gradient-elements";
import { ResponsiveContainer } from "@/components/ui/layout-consistency";
import { ColoredIcon } from "@/components/ui/color-consistency";
import { format } from "date-fns";
import { toast } from "sonner";

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

  const handleDeleteCliente = (cliente: Cliente) => {
    const contratosDoCliente = contratosCount?.[cliente.id] || 0;
    if (contratosDoCliente > 0) {
      toast.error("Não é possível excluir cliente com contratos vinculados");
      return;
    }
    deleteClienteMutation.mutate(cliente.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
        <ResponsiveContainer className="space-content animate-fade-in">
          <div className="padding-content">
            <GradientText variant="primary" className="text-2xl font-bold mb-6">
              Clientes
            </GradientText>
            <GlassCard variant="subtle">
              <div className="padding-card">
                <div className="flex items-center space-x-4 mb-6">
                  <EnhancedSkeleton variant="circular" width={20} height={20} />
                  <EnhancedSkeleton className="h-6 w-32" />
                </div>
                <EnhancedSkeleton className="h-10 w-80 mb-6" />
                <SkeletonTable />
              </div>
            </GlassCard>
          </div>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <ResponsiveContainer className="py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <GradientText variant="primary" className="text-3xl font-bold mb-2">
            <ColoredIcon icon={Users} className="mr-3" />
            Clientes
          </GradientText>
          <p className="text-muted-foreground">Gerencie o cadastro de clientes</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNovoCliente} className="interactive-button">
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
        
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
            </DialogHeader>
            <ClienteForm cliente={selectedCliente || undefined} onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <GlassCard variant="subtle" className="animate-slide-up">
        <CardHeader className="glass-header border-b border-white/10">
          <CardTitle className="flex items-center space-x-3">
            <ColoredIcon icon={Users} className="text-primary" />
            <GradientText variant="primary">Lista de Clientes</GradientText>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <ColoredIcon icon={Search} className="text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF/CNPJ ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm glass-input"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>
                  <div className="flex items-center space-x-2">
                    <ColoredIcon icon={Users} />
                    <span>Nome</span>
                  </div>
                </TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>
                  <div className="flex items-center space-x-2">
                    <ColoredIcon icon={Mail} />
                    <span>Email</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center space-x-2">
                    <ColoredIcon icon={Building2} />
                    <span>Contratos</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center space-x-2">
                    <ColoredIcon icon={Calendar} />
                    <span>Data Cadastro</span>
                  </div>
                </TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center space-y-4 animate-fade-in">
                      <div className="glass-element p-4 rounded-full">
                        <ColoredIcon icon={Users} size="lg" className="text-muted-foreground" />
                      </div>
                      <div className="space-y-2 text-center">
                        <p className="font-medium text-foreground animate-slide-up">Nenhum cliente encontrado</p>
                        <p className="text-sm text-muted-foreground animate-slide-up animate-stagger-1">
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
                        className="animate-fade-in hover:bg-white/5 transition-all duration-200 interactive-row"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleClienteExpanded(cliente.id)}
                            className="h-8 w-8 p-0 hover:bg-white/10 interactive-button"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <div className="glass-element w-8 h-8 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-primary">
                                {cliente.nome.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-foreground">{cliente.nome}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {cliente.cpf_cnpj ? (
                            <ModernBadge variant="outline" size="sm">
                              {cliente.cpf_cnpj}
                            </ModernBadge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {cliente.email || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          <ModernBadge 
                            variant={contratosDoCliente > 0 ? "success" : "default"} 
                            icon={Building2}
                            size="sm"
                          >
                            {contratosDoCliente} contrato{contratosDoCliente !== 1 ? 's' : ''}
                          </ModernBadge>
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
                              className="h-8 w-8 p-0 hover:bg-blue-500/10 interactive-button group"
                            >
                              <Building2 className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditarCliente(cliente)}
                              className="h-8 w-8 p-0 hover:bg-amber-500/10 interactive-button group"
                            >
                              <Edit2 className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-red-500/10 interactive-button group"
                                >
                                  <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="glass-modal animate-scale-in">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o cliente "{cliente.nome}"?
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="interactive-button">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleExcluirCliente(cliente.id)}
                                    className="bg-red-500 hover:bg-red-600 interactive-button"
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
                            <div className="glass-section border-t border-white/10 animate-slide-down">
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
        </CardContent>
      </GlassCard>
    </ResponsiveContainer>
  );
}