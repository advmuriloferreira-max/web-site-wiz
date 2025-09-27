import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Edit, Trash2, Clock, Shield, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { PremiumComponentsDemo } from "@/components/ui/premium-components-demo";
import { notifications } from "@/lib/premium-notifications";
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

const getEstagioRiscoColor = (estagio: number | null) => {
  switch (estagio) {
    case 1: return "success";
    case 2: return "warning";
    case 3: return "danger";
    default: return "default";
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
    // Usar o ID do contrato para navegação
    navigate(`/contratos/${contrato.id}`);
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
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-0">
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
                  <TableHead><Shield className="h-4 w-4 inline mr-1" />Garantia</TableHead>
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
                    <TableCell colSpan={10} className="text-center py-12 text-slate-500">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="font-medium">Nenhum contrato encontrado</p>
                        <p className="text-sm">Tente ajustar os filtros ou adicionar novos contratos</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filters.filteredData.map((contrato) => (
                    <TableRow 
                      key={contrato.id} 
                      className="cursor-pointer"
                      onClick={() => handleContratoClick(contrato)}
                    >
                      <TableCell className="font-semibold text-slate-900">
                        {contrato.clientes?.nome}
                      </TableCell>
                      <TableCell className="text-slate-700">{contrato.bancos?.nome}</TableCell>
                      <TableCell>
                        <TipoOperacaoDisplay 
                          tipoOperacaoId={(contrato as any).tipo_operacao_bcb}
                          fallback={contrato.tipo_operacao || "-"}
                        />
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900">
                        {formatCurrency(contrato.saldo_contabil || contrato.valor_divida)}
                      </TableCell>
                      <TableCell>
                        {contrato.classificacao ? (
                          <ModernBadge variant={getClassificacaoColor(contrato.classificacao)}>
                            {contrato.classificacao}
                          </ModernBadge>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {(contrato as any).estagio_risco ? (
                          <ModernBadge variant={getEstagioRiscoColor((contrato as any).estagio_risco)}>
                            {getEstagioRiscoLabel((contrato as any).estagio_risco)}
                          </ModernBadge>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <GarantiaIndicator contratoId={contrato.id} />
                      </TableCell>
                      <TableCell>
                        <ModernBadge variant="info" size="sm">
                          {contrato.situacao}
                        </ModernBadge>
                      </TableCell>
                      <TableCell>
                        {contrato.dias_atraso > 0 ? (
                          <ModernBadge variant="danger" icon={Clock} size="sm">
                            {contrato.dias_atraso}d
                          </ModernBadge>
                        ) : (
                          <ModernBadge variant="success" size="sm">
                            0d
                          </ModernBadge>
                        )}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1 justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleContratoClick(contrato)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditarContratoEspecifico(contrato)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-xl border-slate-200">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-slate-900">Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-600">
                                  Tem certeza que deseja excluir o contrato de "{contrato.clientes?.nome}" do banco "{contrato.bancos?.nome}"?
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-slate-200 hover:bg-slate-50">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteContrato(contrato)}
                                  className="bg-red-500 text-white hover:bg-red-600"
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}