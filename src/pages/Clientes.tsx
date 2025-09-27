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
      <GradientBackground variant="subtle" className="min-h-screen">
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
      </GradientBackground>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gerencie o cadastro de clientes</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNovoCliente}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
        
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
            </DialogHeader>
            <ClienteForm cliente={selectedCliente || undefined} onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <CardTitle className="text-slate-900 flex items-center space-x-2">
            <Users className="h-5 w-5 text-slate-600" />
            <span>Lista de Clientes</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-slate-500" />
            <Input
              placeholder="Buscar por nome, CPF/CNPJ ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm border-slate-200 focus:border-blue-500"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead><Users className="h-4 w-4 inline mr-1" />Nome</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead><Mail className="h-4 w-4 inline mr-1" />Email</TableHead>
                <TableHead><Building2 className="h-4 w-4 inline mr-1" />Contratos</TableHead>
                <TableHead><Calendar className="h-4 w-4 inline mr-1" />Data Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center space-y-3 animate-fade-in">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center animate-scale-in">
                        <Users className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="font-medium animate-slide-up animate-stagger-1">Nenhum cliente encontrado</p>
                      <p className="text-sm animate-slide-up animate-stagger-2">Tente ajustar o termo de busca ou adicionar novos clientes</p>
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
                        className="animate-fade-in hover:bg-slate-50/50 transition-colors duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-0 h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 interactive-button transition-all duration-200"
                            onClick={() => toggleClienteExpanded(cliente.id)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                            ) : (
                              <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900">{cliente.nome}</TableCell>
                        <TableCell>
                          {cliente.cpf_cnpj ? (
                            <ModernBadge variant="outline" size="sm">{cliente.cpf_cnpj}</ModernBadge>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {cliente.email || <span className="text-slate-400">-</span>}
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
                        <TableCell className="text-slate-600">
                          {format(new Date(cliente.data_cadastro), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleClienteExpanded(cliente.id)}
                              className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 interactive-button"
                            >
                              <Building2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditarCliente(cliente)}
                              className="h-8 w-8 p-0 text-slate-500 hover:text-amber-600 hover:bg-amber-50 interactive-button"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50 interactive-button"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-xl border-slate-200 animate-scale-in">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-slate-900">Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription className="text-slate-600">
                                    Tem certeza que deseja excluir o cliente "{cliente.nome}"?
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-slate-200 hover:bg-slate-50 interactive-button">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteCliente(cliente)}
                                    className="bg-red-500 text-white hover:bg-red-600 interactive-button"
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
                            <div className="p-6 bg-slate-50/50 border-t border-slate-100 animate-slide-up">
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