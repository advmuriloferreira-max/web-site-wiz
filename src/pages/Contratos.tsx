import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ContratoWizard } from "@/components/forms/ContratoWizard";
import { useContratos, Contrato } from "@/hooks/useContratos";
import { useDeleteContrato } from "@/hooks/useDeleteContrato";
import { GarantiaIndicator } from "@/components/contratos/GarantiaIndicator";
import { TipoOperacaoDisplay } from "@/components/ui/tipo-operacao-display";
import { useAdvancedFilters } from "@/hooks/useAdvancedFilters";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { DataCards, ContratoCard } from "@/components/ui/data-cards";
import { SortableHeader } from "@/components/ui/sortable-header";
import { format } from "date-fns";

const getClassificacaoColor = (classificacao: string | null) => {
  switch (classificacao) {
    case "C1": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "C2": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "C3": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case "C4": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "C5": return "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-200";
    default: return "bg-muted text-muted-foreground";
  }
};

const getEstagioRiscoColor = (estagio: number | null) => {
  switch (estagio) {
    case 1: return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case 2: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case 3: return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default: return "bg-muted text-muted-foreground";
  }
};

const getEstagioRiscoLabel = (estagio: number | null) => {
  switch (estagio) {
    case 1: return "Estágio 1";
    case 2: return "Estágio 2";
    case 3: return "Estágio 3";
    default: return "N/A";
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

  // Configuração dos filtros avançados
  const filters = useAdvancedFilters(contratos, 'contratos');

  // Campos disponíveis para filtros
  const filterFields = [
    { key: 'clientes.nome', label: 'Cliente', type: 'text' as const },
    { key: 'bancos.nome', label: 'Banco', type: 'text' as const },
    { key: 'numero_contrato', label: 'Número do Contrato', type: 'text' as const },
    { key: 'tipo_operacao', label: 'Tipo de Operação', type: 'text' as const },
    { key: 'valor_divida', label: 'Valor da Dívida', type: 'number' as const },
    { key: 'classificacao', label: 'Classificação', type: 'select' as const, options: [
      { value: 'C1', label: 'C1' },
      { value: 'C2', label: 'C2' },
      { value: 'C3', label: 'C3' },
      { value: 'C4', label: 'C4' },
      { value: 'C5', label: 'C5' }
    ]},
    { key: 'estagio_risco', label: 'Estágio de Risco', type: 'select' as const, options: [
      { value: '1', label: 'Estágio 1' },
      { value: '2', label: 'Estágio 2' },
      { value: '3', label: 'Estágio 3' }
    ]},
    { key: 'situacao', label: 'Situação', type: 'select' as const, options: [
      { value: 'Em análise', label: 'Em análise' },
      { value: 'Acordo firmado', label: 'Acordo firmado' },
      { value: 'Em negociação', label: 'Em negociação' },
      { value: 'Sem acordo', label: 'Sem acordo' }
    ]},
    { key: 'dias_atraso', label: 'Dias de Atraso', type: 'number' as const },
  ];

  // Filtros rápidos
  const quickFilters = [
    {
      id: 'estagio-3',
      label: 'Estágio 3',
      rule: { field: 'estagio_risco', operator: 'equals' as const, value: 3, label: 'Estágio 3' }
    },
    {
      id: 'vencidos',
      label: 'Vencidos',
      rule: { field: 'dias_atraso', operator: 'gt' as const, value: 0, label: 'Com atraso' }
    },
    {
      id: 'em-negociacao',
      label: 'Em Negociação',
      rule: { field: 'situacao', operator: 'equals' as const, value: 'Em negociação', label: 'Em negociação' }
    },
    {
      id: 'c4-c5',
      label: 'C4/C5',
      rule: { field: 'classificacao', operator: 'in' as const, value: ['C4', 'C5'], label: 'Classificação C4/C5' }
    },
    {
      id: 'alto-valor',
      label: 'Alto Valor',
      rule: { field: 'valor_divida', operator: 'gte' as const, value: 100000, label: 'Valor ≥ R$ 100.000' }
    }
  ];

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setContratoParaEditar(null);
  };

  const handleNovoContrato = () => {
    navigate("/contratos/novo");
  };

  const handleEditarContrato = () => {
    setDialogTitle("Editar Contrato");
    setContratoParaEditar(null);
    setIsDialogOpen(true);
  };

  const handleEditarContratoEspecifico = (contrato: Contrato) => {
    if (!contrato.id) return;
    setDialogTitle("Editar Contrato");
    setContratoParaEditar(contrato.id); // Usar ID do contrato
    setIsDialogOpen(true);
  };

  const handleDeleteContrato = (contrato: Contrato) => {
    deleteContratoMutation.mutate(contrato.id);
  };

  const handleContratoClick = (contrato: Contrato) => {
    if (contrato.numero_contrato) {
      navigate(`/contratos/${encodeURIComponent(contrato.numero_contrato)}`);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Carregando contratos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Toolbar com filtros */}
      <DataToolbar
        title="Contratos"
        data={contratos}
        filteredData={filters.filteredData}
        filters={filters}
        fields={filterFields}
        quickFilters={quickFilters}
        view={view}
        onViewChange={setView}
        onAdd={handleNovoContrato}
        exportFileName="contratos"
      />

      {/* Dialog para edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <ContratoWizard onSuccess={handleSuccess} contratoParaEditar={contratoParaEditar} />
        </DialogContent>
      </Dialog>

      {/* Visualização de dados */}
      {view === 'cards' ? (
        <DataCards
          data={filters.filteredData}
          renderCard={(contrato, index) => (
            <ContratoCard
              key={contrato.id}
              contrato={contrato}
              onView={() => handleContratoClick(contrato)}
              onEdit={() => handleEditarContratoEspecifico(contrato)}
            />
          )}
          emptyMessage="Nenhum contrato encontrado"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <SortableHeader
                        field="clientes.nome"
                        label="Cliente"
                        sortConfigs={filters.sortConfigs}
                        onSort={filters.addSort}
                        onRemoveSort={filters.removeSort}
                      />
                    </TableHead>
                    <TableHead>
                      <SortableHeader
                        field="bancos.nome"
                        label="Banco"
                        sortConfigs={filters.sortConfigs}
                        onSort={filters.addSort}
                        onRemoveSort={filters.removeSort}
                      />
                    </TableHead>
                    <TableHead>
                      <SortableHeader
                        field="tipos_operacao_bcb.nome"
                        label="Tipo de Operação"
                        sortConfigs={filters.sortConfigs}
                        onSort={filters.addSort}
                        onRemoveSort={filters.removeSort}
                      />
                    </TableHead>
                    <TableHead>
                      <SortableHeader
                        field="saldo_contabil"
                        label="Dívida Contábil"
                        sortConfigs={filters.sortConfigs}
                        onSort={filters.addSort}
                        onRemoveSort={filters.removeSort}
                      />
                    </TableHead>
                    <TableHead>
                      <SortableHeader
                        field="classificacao"
                        label="Classificação"
                        sortConfigs={filters.sortConfigs}
                        onSort={filters.addSort}
                        onRemoveSort={filters.removeSort}
                      />
                    </TableHead>
                    <TableHead>
                      <SortableHeader
                        field="estagio_risco"
                        label="Estágio"
                        sortConfigs={filters.sortConfigs}
                        onSort={filters.addSort}
                        onRemoveSort={filters.removeSort}
                      />
                    </TableHead>
                    <TableHead>Garantia</TableHead>
                    <TableHead>
                      <SortableHeader
                        field="situacao"
                        label="Situação"
                        sortConfigs={filters.sortConfigs}
                        onSort={filters.addSort}
                        onRemoveSort={filters.removeSort}
                      />
                    </TableHead>
                    <TableHead>
                      <SortableHeader
                        field="dias_atraso"
                        label="Atraso"
                        sortConfigs={filters.sortConfigs}
                        onSort={filters.addSort}
                        onRemoveSort={filters.removeSort}
                      />
                    </TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filters.filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        Nenhum contrato encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filters.filteredData.map((contrato) => (
                      <TableRow 
                        key={contrato.id} 
                        className={`${contrato.numero_contrato ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                        onClick={() => handleContratoClick(contrato)}
                      >
                        <TableCell className="font-medium">
                          {contrato.clientes?.nome}
                        </TableCell>
                        <TableCell>{contrato.bancos?.nome}</TableCell>
                        <TableCell>
                          <TipoOperacaoDisplay 
                            tipoOperacaoId={(contrato as any).tipo_operacao_bcb}
                            fallback={contrato.tipo_operacao || "-"}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(contrato.saldo_contabil || contrato.valor_divida)}
                        </TableCell>
                        <TableCell>
                          {contrato.classificacao ? (
                            <Badge className={getClassificacaoColor(contrato.classificacao)}>
                              {contrato.classificacao}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {(contrato as any).estagio_risco ? (
                            <Badge className={getEstagioRiscoColor((contrato as any).estagio_risco)}>
                              {getEstagioRiscoLabel((contrato as any).estagio_risco)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <GarantiaIndicator contratoId={contrato.id} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{contrato.situacao}</Badge>
                        </TableCell>
                        <TableCell>
                          {contrato.dias_atraso > 0 ? (
                            <Badge variant="destructive">{contrato.dias_atraso}</Badge>
                          ) : (
                            <Badge variant="secondary">0</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1 justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleContratoClick(contrato)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditarContratoEspecifico(contrato)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o contrato de "{contrato.clientes?.nome}" do banco "{contrato.bancos?.nome}"?
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteContrato(contrato)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}