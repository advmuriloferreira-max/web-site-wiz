import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Eye, Edit, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ContratoWizard } from "@/components/forms/ContratoWizard";
import { useContratos, Contrato } from "@/hooks/useContratos";
import { useDeleteContrato } from "@/hooks/useDeleteContrato";
import { GarantiaIndicator } from "@/components/contratos/GarantiaIndicator";
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
  const { data: contratos, isLoading } = useContratos();
  const deleteContratoMutation = useDeleteContrato();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("Novo Contrato");
  const [contratoParaEditar, setContratoParaEditar] = useState<string | null>(null);

  const filteredContratos = contratos?.filter(contrato => 
    contrato.clientes?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.bancos?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.numero_contrato?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.tipo_operacao.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleEditarContratoEspecifico = (numeroContrato: string | null) => {
    if (!numeroContrato) return;
    setDialogTitle("Editar Contrato");
    setContratoParaEditar(numeroContrato);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contratos</h1>
          <p className="text-muted-foreground">Gerencie os contratos e dívidas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNovoContrato}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>
            <ContratoWizard onSuccess={handleSuccess} contratoParaEditar={contratoParaEditar} />
          </DialogContent>
        </Dialog>
        
        <Button variant="outline" onClick={handleEditarContrato}>
          <Edit className="mr-2 h-4 w-4" />
          Editar Contrato
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Contratos</CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Buscar por cliente, banco, número do contrato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Clique em uma linha para ver os detalhes do contrato
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Banco</TableHead>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor Dívida</TableHead>
                  <TableHead>Classificação</TableHead>
                  <TableHead>Estágio Risco</TableHead>
                  <TableHead>Garantia</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Atraso (dias)</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContratos?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      Nenhum contrato encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContratos?.map((contrato) => (
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
                        {contrato.numero_contrato ? (
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{contrato.numero_contrato}</Badge>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{contrato.tipo_operacao}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(contrato.valor_divida)}
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
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditarContratoEspecifico(contrato.numero_contrato)}
                            disabled={!contrato.numero_contrato}
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
          
          {filteredContratos && filteredContratos.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Total: {filteredContratos.length} contrato(s)
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}