// EXEMPLO DE IMPLEMENTAÇÃO DAS MELHORIAS DE UX
// Esta é uma versão melhorada da página de clientes demonstrando todas as funcionalidades

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useClientes } from "@/hooks/useClientes";
import { useCrudOperations } from "@/hooks/useAsyncOperation";
import { enhancedToast } from "@/components/ui/enhanced-toast";

// Componentes de loading e animação
import { ListLoading } from "@/components/ui/loading-states";
import { ListAnimation, PageTransition } from "@/components/ui/page-transition";
import { useProgressBar } from "@/components/ui/progress-bar";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icons
import { Plus, Search, MoreHorizontal, Users, FileText, AlertCircle } from "lucide-react";

export default function ClientesEnhanced() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: clientes, isLoading, error, refetch } = useClientes();
  const { remove } = useCrudOperations();

  // Barra de progresso para operações que demoram
  const { ProgressBarComponent } = useProgressBar(isLoading, {
    label: "Carregando clientes...",
    minDuration: 1500
  });

  // Filtrar clientes baseado na pesquisa
  const filteredClientes = clientes?.filter(cliente =>
    cliente.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Função para deletar cliente com feedback visual
  const handleDelete = async (clienteId: string, clienteName: string) => {
    setDeletingId(clienteId);

    const success = await remove(
      () => {
        // Simular API call - substituir pela chamada real
        return new Promise(resolve => setTimeout(resolve, 1000));
      },
      `cliente ${clienteName}`
    );

    if (success) {
      refetch();
    }
    
    setDeletingId(null);
  };

  // Mostrar toast de boas-vindas se não houver clientes
  useEffect(() => {
    if (clientes && clientes.length === 0) {
      enhancedToast.info("Comece cadastrando seu primeiro cliente", {
        description: "Os clientes são necessários para registrar contratos",
        action: {
          label: "Cadastrar",
          onClick: () => window.location.href = "/clientes/novo"
        }
      });
    }
  }, [clientes]);

  // Tratamento de erro
  if (error) {
    return (
      <PageTransition>
        <div className="container mx-auto p-6">
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Erro ao carregar clientes
              </h3>
              <p className="text-muted-foreground mb-4">
                Não foi possível carregar a lista de clientes.
              </p>
              <Button onClick={() => refetch()} variant="outline">
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-6">
        <ProgressBarComponent />

        {/* Header */}
        <ListAnimation>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Users className="h-8 w-8" />
                Clientes
              </h1>
              <p className="text-muted-foreground mt-2">
                Gerencie seus clientes e suas informações
              </p>
            </div>
            
            <ListAnimation delay={0.1}>
              <Link to="/clientes/novo">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Cliente
                </Button>
              </Link>
            </ListAnimation>
          </div>
        </ListAnimation>

        {/* Search Bar */}
        <ListAnimation delay={0.2}>
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar clientes por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        </ListAnimation>

        {/* Lista de Clientes */}
        <ListLoading isLoading={isLoading} itemCount={6}>
          <div className="space-y-4">
            {filteredClientes.length === 0 && !isLoading ? (
              <ListAnimation delay={0.3}>
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm 
                        ? "Tente ajustar os termos de busca"
                        : "Comece cadastrando seu primeiro cliente"
                      }
                    </p>
                    {!searchTerm && (
                      <Link to="/clientes/novo">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Cadastrar Primeiro Cliente
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </ListAnimation>
            ) : (
              filteredClientes.map((cliente, index) => (
                <ListAnimation key={cliente.id} delay={index * 0.1}>
                  <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-semibold">
                                {cliente.nome?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            
                            <div>
                              <h3 className="font-semibold text-lg">{cliente.nome}</h3>
                              <p className="text-muted-foreground">{cliente.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {cliente.cpf_cnpj && (
                              <span>CPF/CNPJ: {cliente.cpf_cnpj}</span>
                            )}
                            {cliente.telefone && (
                              <span>Tel: {cliente.telefone}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Badges de status */}
                          <div className="flex flex-col gap-1">
                            <Badge variant="secondary" className="text-xs">
                              <FileText className="mr-1 h-3 w-3" />
                              Contratos
                            </Badge>
                            
                            
                            <Badge variant="default" className="text-xs">
                              Ativo
                            </Badge>
                          </div>

                          {/* Menu de ações */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                disabled={deletingId === cliente.id}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Link 
                                  to={`/clientes/${cliente.id}/editar`}
                                  className="flex items-center w-full"
                                >
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link 
                                  to={`/contratos?cliente=${cliente.id}`}
                                  className="flex items-center w-full"
                                >
                                  Ver Contratos
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDelete(cliente.id!, cliente.nome!)}
                                disabled={deletingId === cliente.id}
                              >
                                {deletingId === cliente.id ? "Excluindo..." : "Excluir"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ListAnimation>
              ))
            )}
          </div>
        </ListLoading>

        {/* Estatísticas */}
        {clientes && clientes.length > 0 && (
          <ListAnimation delay={0.4}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {clientes.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total de Clientes
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {clientes.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Clientes Ativos
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.floor(clientes.length * 2.5)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Contratos Estimados
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ListAnimation>
        )}
      </div>
    </PageTransition>
  );
}