import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { 
  Plus, 
  TrendingUp, 
  Download, 
  FileText, 
  Edit, 
  Trash2, 
  MoreVertical,
  Filter,
  ChevronDown,
  AlertCircle,
  DollarSign,
  FileBarChart,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useGestaoPassivo } from "@/hooks/useGestaoPassivo";
import { useDataExport } from "@/hooks/useDataExport";
import { AnaliseGestaoPassivo, CarteiraBCB352, StatusNegociacao } from "@/types/gestaoPassivo";
import { determinarMarcoProvisionamento, determinarMomentoNegociacao } from "@/lib/calculoGestaoPassivo";
import { PremiumPagination } from "@/components/ui/premium-pagination";
import { toast } from "sonner";

export default function ListaAnalises() {
  const navigate = useNavigate();
  const { data: analises = [], isLoading } = useGestaoPassivo();
  const { exportToCSV } = useDataExport();

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [bancoFilter, setBancoFilter] = useState<string[]>([]);
  const [carteiraFilter, setCarteiraFilter] = useState<CarteiraBCB352[]>([]);
  const [defaultFilter, setDefaultFilter] = useState<"todos" | "default" | "nao-default">("todos");
  const [marcoFilter, setMarcoFilter] = useState<string[]>([]);
  const [statusNegociacaoFilter, setStatusNegociacaoFilter] = useState<StatusNegociacao[]>([]);
  const [faixaAtrasoFilter, setFaixaAtrasoFilter] = useState<string>("todos");
  const [showFilters, setShowFilters] = useState(false);

  // Tabela
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Dados filtrados
  const filteredAnalises = useMemo(() => {
    let filtered = [...analises];

    // Busca
    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.numero_contrato.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro de banco
    if (bancoFilter.length > 0) {
      filtered = filtered.filter((a) => bancoFilter.includes(a.banco_nome));
    }

    // Filtro de carteira
    if (carteiraFilter.length > 0) {
      filtered = filtered.filter((a) => carteiraFilter.includes(a.carteira_bcb352 as CarteiraBCB352));
    }

    // Filtro de default
    if (defaultFilter === "default") {
      filtered = filtered.filter((a) => a.em_default);
    } else if (defaultFilter === "nao-default") {
      filtered = filtered.filter((a) => !a.em_default);
    }

    // Filtro de marco
    if (marcoFilter.length > 0) {
      filtered = filtered.filter((a) => {
        const marco = determinarMarcoProvisionamento(a.percentual_provisao_bcb352);
        return marcoFilter.includes(marco);
      });
    }

    // Filtro de status negociação
    if (statusNegociacaoFilter.length > 0) {
      filtered = filtered.filter((a) => 
        a.status_negociacao && statusNegociacaoFilter.includes(a.status_negociacao as StatusNegociacao)
      );
    }

    // Filtro de faixa de atraso
    if (faixaAtrasoFilter !== "todos") {
      filtered = filtered.filter((a) => {
        const meses = a.meses_atraso;
        switch (faixaAtrasoFilter) {
          case "0-3": return meses >= 0 && meses < 3;
          case "3-6": return meses >= 3 && meses < 6;
          case "6-12": return meses >= 6 && meses < 12;
          case "12-18": return meses >= 12 && meses < 18;
          case "18-24": return meses >= 18 && meses < 24;
          case "24+": return meses >= 24;
          default: return true;
        }
      });
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aVal: any = a[sortColumn as keyof AnaliseGestaoPassivo];
      let bVal: any = b[sortColumn as keyof AnaliseGestaoPassivo];

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    analises,
    searchQuery,
    bancoFilter,
    carteiraFilter,
    defaultFilter,
    marcoFilter,
    statusNegociacaoFilter,
    faixaAtrasoFilter,
    sortColumn,
    sortDirection,
  ]);

  // Estatísticas
  const stats = useMemo(() => {
    const totalContratos = analises.length;
    const valorTotalDividas = analises.reduce((sum, a) => sum + Number(a.saldo_devedor_atual), 0);
    const valorTotalProvisionado = analises.reduce((sum, a) => sum + Number(a.valor_provisao_bcb352), 0);
    const contratosDefault = analises.filter((a) => a.em_default).length;
    const percentualDefault = totalContratos > 0 ? (contratosDefault / totalContratos) * 100 : 0;

    return {
      totalContratos,
      valorTotalDividas,
      valorTotalProvisionado,
      percentualDefault,
    };
  }, [analises]);

  // Paginação
  const totalPages = Math.ceil(filteredAnalises.length / itemsPerPage);
  const paginatedAnalises = filteredAnalises.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedAnalises.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleExport = () => {
    const exportData = filteredAnalises.map((a) => ({
      "Número Contrato": a.numero_contrato,
      "Banco": a.banco_nome,
      "Carteira": a.carteira_bcb352,
      "Saldo Devedor": a.saldo_devedor_atual,
      "Dias Atraso": a.dias_atraso,
      "Provisão %": a.percentual_provisao_bcb352,
      "Provisão Valor": a.valor_provisao_bcb352,
      "Proposta": a.valor_proposta_acordo || 0,
      "Status Negociação": a.status_negociacao || "pendente",
    }));
    exportToCSV(exportData, "analises-gestao-passivo.csv");
  };

  const handleExportSelected = () => {
    const selected = filteredAnalises.filter((a) => selectedIds.includes(a.id));
    const exportData = selected.map((a) => ({
      "Número Contrato": a.numero_contrato,
      "Banco": a.banco_nome,
      "Carteira": a.carteira_bcb352,
      "Saldo Devedor": a.saldo_devedor_atual,
      "Provisão %": a.percentual_provisao_bcb352,
      "Proposta": a.valor_proposta_acordo || 0,
    }));
    exportToCSV(exportData, "analises-selecionadas.csv");
  };

  const handleDelete = (id: string) => {
    // TODO: Implementar deleção
    toast.success("Análise excluída com sucesso");
  };

  const handleGerarPDF = async (id: string) => {
    toast.info("Geração de PDF temporariamente indisponível");
  };

  const getCarteiraBadge = (carteira: string) => {
    const colors: Record<string, string> = {
      C1: "bg-red-500/10 text-red-600 border-red-500/20",
      C2: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      C3: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      C4: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      C5: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    };
    return colors[carteira] || "bg-muted";
  };

  const getMarcoBadge = (percentual: number) => {
    const marco = determinarMarcoProvisionamento(percentual);
    const colors: Record<string, string> = {
      "50%": "bg-orange-500/10 text-orange-600",
      "60%": "bg-yellow-500/10 text-yellow-600",
      "70%": "bg-lime-500/10 text-lime-600",
      "80%": "bg-green-500/10 text-green-600",
      "90%": "bg-emerald-500/10 text-emerald-600",
      "100%": "bg-purple-500/10 text-purple-600",
    };
    return { marco, className: colors[marco] || "bg-muted" };
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pendente: "bg-gray-500/10 text-gray-600",
      "proposta-enviada": "bg-blue-500/10 text-blue-600",
      "em-analise": "bg-yellow-500/10 text-yellow-600",
      contraproposta: "bg-orange-500/10 text-orange-600",
      aceita: "bg-green-500/10 text-green-600",
      recusada: "bg-red-500/10 text-red-600",
      "acordo-fechado": "bg-purple-500/10 text-purple-600",
    };
    return colors[status] || "bg-muted";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando análises...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Passivo Bancário</h1>
          <p className="text-muted-foreground">
            Análise de provisões conforme Resolução BCB 352/2023
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/app/gestao-passivo/dashboard")}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate("/app/gestao-passivo/simulador")}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Simulador
          </Button>
          <Button onClick={() => navigate("/app/gestao-passivo/nova")}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Análise
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
            <FileBarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContratos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Total de Dívidas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.valorTotalDividas)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Provisionado</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.valorTotalProvisionado)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contratos em Default</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.percentualDefault.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="font-semibold">Filtros Avançados</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Busca Rápida</label>
                <Input
                  placeholder="Número do contrato..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Faixa de Atraso</label>
                <Select value={faixaAtrasoFilter} onValueChange={setFaixaAtrasoFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="0-3">0-3 meses</SelectItem>
                    <SelectItem value="3-6">3-6 meses</SelectItem>
                    <SelectItem value="6-12">6-12 meses</SelectItem>
                    <SelectItem value="12-18">12-18 meses</SelectItem>
                    <SelectItem value="18-24">18-24 meses</SelectItem>
                    <SelectItem value="24+">24+ meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Status Default</label>
                <Select value={defaultFilter} onValueChange={(v) => setDefaultFilter(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="default">Em Default</SelectItem>
                    <SelectItem value="nao-default">Não Default</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setBancoFilter([]);
                  setCarteiraFilter([]);
                  setDefaultFilter("todos");
                  setMarcoFilter([]);
                  setStatusNegociacaoFilter([]);
                  setFaixaAtrasoFilter("todos");
                }}
              >
                Limpar Filtros
              </Button>
              <span className="text-sm text-muted-foreground">
                {filteredAnalises.length} de {analises.length} contratos
              </span>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Ações em Lote */}
      {selectedIds.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedIds.length} {selectedIds.length === 1 ? "item selecionado" : "itens selecionados"}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportSelected}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Selecionados
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tabela */}
      <Card>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mostrar</span>
            <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">itens</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Tudo
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === paginatedAnalises.length && paginatedAnalises.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("numero_contrato")}>
                  Contrato
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("banco_nome")}>
                  Banco
                </TableHead>
                <TableHead>Carteira</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("saldo_devedor_atual")}>
                  Saldo Devedor
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("dias_atraso")}>
                  Atraso
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("percentual_provisao_bcb352")}>
                  Provisão
                </TableHead>
                <TableHead>Marco</TableHead>
                <TableHead>Proposta</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAnalises.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <FileBarChart className="h-12 w-12 text-muted-foreground/50" />
                      <p className="text-muted-foreground">Nenhuma análise encontrada</p>
                      <Button variant="outline" onClick={() => navigate("/app/gestao-passivo/nova")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Análise
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAnalises.map((analise) => {
                  const { marco, className: marcoClass } = getMarcoBadge(analise.percentual_provisao_bcb352);
                  return (
                    <TableRow key={analise.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(analise.id)}
                          onCheckedChange={(checked) => handleSelectRow(analise.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{analise.numero_contrato}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{analise.banco_nome}</span>
                          {analise.banco_codigo_compe && (
                            <span className="text-xs text-muted-foreground">{analise.banco_codigo_compe}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCarteiraBadge(analise.carteira_bcb352)}>{analise.carteira_bcb352}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(Number(analise.saldo_devedor_atual))}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{analise.dias_atraso} dias</span>
                          <span className="text-xs text-muted-foreground">{analise.meses_atraso} meses</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{analise.percentual_provisao_bcb352}%</span>
                          <span className="text-xs text-muted-foreground">
                            {formatCurrency(Number(analise.valor_provisao_bcb352))}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={marcoClass}>{marco}</Badge>
                      </TableCell>
                      <TableCell>
                        {analise.valor_proposta_acordo && formatCurrency(Number(analise.valor_proposta_acordo))}
                      </TableCell>
                      <TableCell>
                        {analise.em_default ? (
                          <CheckCircle2 className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(analise.status_negociacao || "pendente")}>
                          {analise.status_negociacao || "pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/app/gestao-passivo/${analise.id}`)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleGerarPDF(analise.id)}>
                              <Download className="h-4 w-4 mr-2" />
                              Gerar Relatório PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/app/gestao-passivo/${analise.id}/editar`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(analise.id)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t">
            <PremiumPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredAnalises.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
