import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Edit, Trash2, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContratoWizard } from "@/components/forms/ContratoWizard";
import { useContratos } from "@/hooks/useContratos";
import { useDeleteContrato } from "@/hooks/useDeleteContrato";
import { format } from "date-fns";
import { ResponsiveTableWrapper } from "@/components/ui/responsive-fixes";
import { LoadingState, TableLoading } from "@/components/ui/loading-states";
import { ErrorState } from "@/components/ui/error-boundary";
import { LegalIcons } from "@/components/ui/legal-icons";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";

const getClassificacaoColor = (classificacao: string | null) => {
  switch (classificacao) {
    case "C1": return "bg-green-100 text-green-800";
    case "C2": return "bg-yellow-100 text-yellow-800"; 
    case "C3": return "bg-orange-100 text-orange-800";
    case "C4": return "bg-red-100 text-red-800";
    case "C5": return "bg-red-200 text-red-900";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function Contratos() {
  const navigate = useNavigate();
  const { data: contratos = [], isLoading } = useContratos();
  const deleteContratoMutation = useDeleteContrato();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("Novo Contrato");
  const [contratoParaEditar, setContratoParaEditar] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency", 
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy");
  };

  const handleViewContrato = (contrato: any) => {
    navigate(`/contratos/${contrato.id}`);
  };

  const handleEditContrato = (contrato: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setContratoParaEditar(contrato.id);
    setDialogTitle("Editar Contrato");
    setIsDialogOpen(true);
  };

  const handleDeleteContrato = (contratoId: string) => {
    console.log("Excluindo contrato:", contratoId);
    deleteContratoMutation.mutate(contratoId);
  };

  const handleNovoContrato = () => {
    setContratoParaEditar(null);
    setDialogTitle("Novo Contrato");
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setContratoParaEditar(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-lg ml-4">Carregando contratos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Contratos
          </h1>
          <p className="text-muted-foreground">
            Gestão completa de contratos bancários e operações
          </p>
        </div>
        
        <Button onClick={handleNovoContrato} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Novo Contrato
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <ContratoWizard onSuccess={handleSuccess} contratoParaEditar={contratoParaEditar} />
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Banco</TableHead>  
                  <TableHead>Contrato</TableHead>
                  <TableHead>Valor da Dívida</TableHead>
                  <TableHead>Classificação</TableHead>
                  <TableHead>Provisão</TableHead>
                  <TableHead className="text-right w-32">Ações</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {contratos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center space-y-4">
                      <LegalIcons.contract className="w-12 h-12 text-muted-foreground" />
                      <div className="space-y-2 text-center">
                        <p className="font-medium text-foreground">Nenhum contrato encontrado</p>
                        <p className="text-sm text-muted-foreground">
                          Clique em "Novo Contrato" para começar
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                contratos.map((contrato) => {
                  console.log("🔍 Renderizando linha contrato:", contrato.id);
                  return (
                    <TableRow 
                      key={contrato.id} 
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                              {contrato.clientes?.nome?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                          <span>{contrato.clientes?.nome || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{contrato.bancos?.nome || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {contrato.numero_contrato || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(contrato.valor_divida)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getClassificacaoColor(contrato.classificacao)}>
                          {contrato.classificacao || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-orange-600">
                        {formatCurrency(contrato.valor_provisao)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewContrato(contrato);
                            }}
                            className="h-8 w-8 p-0 hover:bg-primary/10"
                            title="Visualizar contrato"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setContratoParaEditar(contrato.id);
                              setDialogTitle("Editar Contrato");
                              setIsDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0 hover:bg-accent/10"
                            title="Editar contrato"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DeleteConfirmation
                            itemName={contrato.numero_contrato || contrato.clientes?.nome || "contrato"}
                            itemType="contrato"
                            onConfirm={() => handleDeleteContrato(contrato.id)}
                            className="group"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
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