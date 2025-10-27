import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Edit2, Building2, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ContratoWizard } from "@/components/forms/ContratoWizard";
import { useContratosByCliente } from "@/hooks/useContratosByCliente";
import { useDeleteContrato } from "@/hooks/useDeleteContrato";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { Cliente } from "@/hooks/useClientes";
import { format } from "date-fns";

interface ContratosClienteProps {
  cliente: Cliente;
}

export function ContratosCliente({ cliente }: ContratosClienteProps) {
  const navigate = useNavigate();
  const { data: contratos, isLoading } = useContratosByCliente(cliente.id);
  const deleteContratoMutation = useDeleteContrato();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [contratoParaEditar, setContratoParaEditar] = useState<string | null>(null);

  // DEBUG: Verificar estrutura dos contratos
  useEffect(() => {
    if (contratos && contratos.length > 0) {
      console.log('📋 Contratos carregados:', contratos);
      console.log('🔑 IDs dos contratos:', contratos.map(c => ({ 
        id: c.id, 
        numero: c.numero_contrato 
      })));
    }
  }, [contratos]);

  const getClassificacaoColor = (classificacao: string | null) => {
    if (!classificacao) return "bg-gray-500";
    
    switch (classificacao) {
      case "C1": return "bg-green-500";
      case "C2": return "bg-blue-500";
      case "C3": return "bg-yellow-500";
      case "C4": return "bg-orange-500";
      case "C5": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getSituacaoColor = (situacao: string | null) => {
    if (!situacao) return "bg-gray-500";
    
    switch (situacao.toLowerCase()) {
      case "acordado": return "bg-green-500";
      case "em análise": return "bg-blue-500";
      case "em negociação": return "bg-yellow-500";
      case "rejeitado": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const handleContratoSuccess = () => {
    setIsAddDialogOpen(false);
    setContratoParaEditar(null);
  };

  const handleDeleteContrato = (contratoId: string) => {
    deleteContratoMutation.mutate(contratoId);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Contratos de {cliente.nome}
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Novo Contrato
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Novo Contrato para {cliente.nome}
                </DialogTitle>
              </DialogHeader>
          <ContratoWizard
            onSuccess={handleContratoSuccess}
            contratoParaEditar={contratoParaEditar}
            clienteIdPredefinido={cliente.id}
          />
            </DialogContent>
          </Dialog>

          {/* Dialog para edição */}
          <Dialog open={!!contratoParaEditar} onOpenChange={() => setContratoParaEditar(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Editar Contrato
                </DialogTitle>
              </DialogHeader>
              <ContratoWizard
                onSuccess={handleContratoSuccess}
                contratoParaEditar={contratoParaEditar}
                clienteIdPredefinido={cliente.id}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Carregando contratos...</div>
        ) : contratos?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhum contrato encontrado</p>
            <p className="text-sm">Adicione o primeiro contrato para este cliente</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Contrato</TableHead>
                  <TableHead>Banco</TableHead>
                  <TableHead>Valor Dívida</TableHead>
                  <TableHead>Classificação</TableHead>
                  <TableHead>Análises</TableHead>
                  <TableHead>Data Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contratos?.map((contrato) => (
                  <TableRow key={contrato.id}>
                    <TableCell className="font-medium">
                      {contrato.numero_contrato || (
                        <span className="text-muted-foreground">Sem número</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                        {contrato.bancos?.nome || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                        {(contrato.valor_divida || 0).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {contrato.classificacao ? (
                        <Badge className={`text-white ${getClassificacaoColor(contrato.classificacao)}`}>
                          {contrato.classificacao}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Não analisado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {contrato.temAnalisePassivo && (
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-300"
                          >
                            Passivo
                          </Badge>
                        )}
                        {contrato.temAnaliseJuros && (
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300"
                          >
                            Juros
                          </Badge>
                        )}
                        {!contrato.temAnalisePassivo && !contrato.temAnaliseJuros && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        {format(new Date(contrato.created_at), "dd/MM/yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            console.log('🔍 Navegando para contrato:', contrato.id);
                            if (!contrato.id) {
                              console.error('❌ ID do contrato está vazio!', contrato);
                              return;
                            }
                            navigate(`/app/contratos/${contrato.id}`);
                          }}
                          className="h-8 w-8 p-0 touch-target hover:bg-accent/10"
                          aria-label={`Ver detalhes do contrato ${contrato.numero_contrato}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setContratoParaEditar(contrato.id)}
                          className="h-8 w-8 p-0 touch-target hover:bg-accent/10"
                          aria-label={`Editar contrato ${contrato.numero_contrato}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <DeleteConfirmation
                          itemName={contrato.numero_contrato || contrato.bancos?.nome || "contrato"}
                          itemType="contrato"
                          onConfirm={() => handleDeleteContrato(contrato.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}