import { useState } from "react";
import { Plus, Search, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ContratoForm } from "@/components/forms/ContratoForm";
import { useContratos, Contrato } from "@/hooks/useContratos";
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

export default function Contratos() {
  const { data: contratos, isLoading } = useContratos();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("Novo Contrato");

  const filteredContratos = contratos?.filter(contrato => 
    contrato.clientes?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.bancos?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.numero_contrato?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.tipo_operacao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSuccess = () => {
    setIsDialogOpen(false);
  };

  const handleNovoContrato = () => {
    setDialogTitle("Novo Contrato");
    setIsDialogOpen(true);
  };

  const handleEditarContrato = () => {
    setDialogTitle("Editar Contrato");
    setIsDialogOpen(true);
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>
            <ContratoForm onSuccess={handleSuccess} />
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
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Buscar por cliente, banco, número do contrato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
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
                  <TableHead>Situação</TableHead>
                  <TableHead>Atraso (dias)</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContratos?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhum contrato encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContratos?.map((contrato) => (
                    <TableRow key={contrato.id}>
                      <TableCell className="font-medium">
                        {contrato.clientes?.nome}
                      </TableCell>
                      <TableCell>{contrato.bancos?.nome}</TableCell>
                      <TableCell>
                        {contrato.numero_contrato ? (
                          <Badge variant="outline">{contrato.numero_contrato}</Badge>
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
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
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