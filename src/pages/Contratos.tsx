import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Edit, Trash2, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ModernBadge } from "@/components/ui/modern-badge";
import { ContratoWizard } from "@/components/forms/ContratoWizard";
import { useContratos, Contrato } from "@/hooks/useContratos";
import { useDeleteContrato } from "@/hooks/useDeleteContrato";
import { GarantiaIndicator } from "@/components/contratos/GarantiaIndicator";
import { TipoOperacaoDisplay } from "@/components/ui/tipo-operacao-display";
import { useAdvancedFilters } from "@/hooks/useAdvancedFilters";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { DataCards, ContratoCard } from "@/components/ui/data-cards";
import { SortableHeader } from "@/components/ui/sortable-header";
import { ResponsiveContainer } from "@/components/ui/layout-consistency";
import { GlassCard } from "@/components/ui/glassmorphism";
import { GradientText } from "@/components/ui/gradient-elements";
import { ColoredIcon } from "@/components/ui/color-consistency";
import { format } from "date-fns";

const getClassificacaoColor = (classificacao: string | null) => {
  switch (classificacao) {
    case "C1": return "success";
    case "C2": return "warning"; 
    case "C3": return "info";
    case "C4": return "danger";
    case "C5": return "danger";
    default: return "default";
  }
};

export default function Contratos() {
  const navigate = useNavigate();
  const { data: contratos = [], isLoading } = useContratos();
  const deleteContratoMutation = useDeleteContrato();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("Novo Contrato");
  const [contratoParaEditar, setContratoParaEditar] = useState<string | null>(null);
  const [view, setView] = useState<'table' | 'cards'>('table');

  const filters = useAdvancedFilters(contratos, 'contratos');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency", 
      currency: "BRL",
    }).format(value);
  };

  const handleNovoContrato = () => {
    setContratoParaEditar(null);
    setDialogTitle("Novo Contrato");
    setIsDialogOpen(true);
  };

  const handleEditarContrato = (contratoId: string) => {
    setContratoParaEditar(contratoId);
    setDialogTitle("Editar Contrato");
    setIsDialogOpen(true);
  };

  const handleViewContrato = (contrato: Contrato) => {
    navigate(`/contratos/${contrato.id}`);
  };

  const handleExcluirContrato = async (contratoId: string) => {
    try {
      await deleteContratoMutation.mutateAsync(contratoId);
    } catch (error) {
      console.error("Erro ao excluir contrato:", error);
    }
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setContratoParaEditar(null);
  };

  if (isLoading) {
    return (
      <ResponsiveContainer className="py-8 animate-fade-in">
        <GradientText variant="primary" className="text-2xl font-bold mb-4">
          Carregando contratos...
        </GradientText>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer className="py-8 animate-fade-in">
      <div className="mb-8">
        <GradientText variant="primary" className="text-3xl font-bold mb-2 flex items-center">
          <ColoredIcon icon={FileText} className="mr-3" />
          Contratos
        </GradientText>
        <p className="text-muted-foreground mb-6">
          Gestão completa de contratos bancários e operações
        </p>
        
        <GlassCard variant="subtle" className="mb-6">
          <DataToolbar
            title="Contratos"
            data={contratos}
            filteredData={filters.filteredData}
            filters={filters}
            fields={[]}
            quickFilters={[]}
            view={view}
            onViewChange={setView}
            onAdd={handleNovoContrato}
            exportFileName="contratos"
          />
        </GlassCard>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto glass-modal animate-scale-in">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <ContratoWizard onSuccess={handleSuccess} contratoParaEditar={contratoParaEditar} />
        </DialogContent>
      </Dialog>

      <GlassCard variant="subtle" className="animate-slide-up">
        <div className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Banco</TableHead>  
                <TableHead>Contrato</TableHead>
                <TableHead>Valor da Dívida</TableHead>
                <TableHead>Classificação</TableHead>
                <TableHead>Provisão</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filters.filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center space-y-4 animate-fade-in">
                      <div className="glass-element p-4 rounded-full">
                        <ColoredIcon icon={FileText} size="lg" className="text-muted-foreground" />
                      </div>
                      <div className="space-y-2 text-center">
                        <p className="font-medium text-foreground">Nenhum contrato encontrado</p>
                        <p className="text-sm text-muted-foreground">
                          Tente ajustar os filtros ou adicionar novos contratos
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filters.filteredData.map((contrato, index) => (
                  <TableRow 
                    key={contrato.id} 
                    className="animate-fade-in interactive-row cursor-pointer"
                    onClick={() => handleViewContrato(contrato)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="glass-element w-8 h-8 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">
                            {contrato.clientes?.nome?.charAt(0).toUpperCase() || "?"}
                          </span>
                        </div>
                        <span>{contrato.clientes?.nome || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{contrato.bancos?.nome || "N/A"}</TableCell>
                    <TableCell>
                      <ModernBadge variant="outline" size="sm">
                        {contrato.numero_contrato || "N/A"}
                      </ModernBadge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(contrato.valor_divida)}
                    </TableCell>
                    <TableCell>
                      <ModernBadge variant={getClassificacaoColor(contrato.classificacao)} size="sm">
                        {contrato.classificacao || "N/A"}
                      </ModernBadge>
                    </TableCell>
                    <TableCell className="font-medium text-red-600">
                      {formatCurrency(contrato.valor_provisao)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewContrato(contrato);
                          }}
                          className="h-8 w-8 p-0 hover:bg-blue-500/10 interactive-button group"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditarContrato(contrato.id);
                          }}
                          className="h-8 w-8 p-0 hover:bg-amber-500/10 interactive-button group"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                              className="h-8 w-8 p-0 hover:bg-red-500/10 interactive-button group"
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-modal animate-scale-in">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o contrato "{contrato.numero_contrato}"?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="interactive-button">Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleExcluirContrato(contrato.id)}
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </GlassCard>
    </ResponsiveContainer>
  );
}