import { useState } from "react";
import { Plus, Search, Eye, Edit2, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useContratosJuros, useDeleteContratoJuros } from "@/hooks/useContratosJuros";
import { ContratoJurosForm } from "@/components/juros/ContratoJurosForm";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function ContratosJuros() {
  const { data: contratos, isLoading } = useContratosJuros();
  const deleteMutation = useDeleteContratoJuros();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContrato, setEditingContrato] = useState<any | null>(null);

  const filteredContratos = contratos?.filter(contrato =>
    contrato.numero_contrato?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.clientes_juros?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getAbusividadeBadge = (temAbusividade: boolean | null, grau: string | null) => {
    if (temAbusividade === null) {
      return <Badge variant="outline">Pendente</Badge>;
    }
    if (!temAbusividade) {
      return <Badge className="bg-green-500">Conforme</Badge>;
    }
    
    const colors = {
      "Baixa": "bg-yellow-500",
      "Média": "bg-orange-500",
      "Alta": "bg-red-500",
      "Crítica": "bg-purple-500"
    };
    
    return (
      <Badge className={colors[grau as keyof typeof colors] || "bg-red-500"}>
        <AlertCircle className="h-3 w-3 mr-1" />
        {grau || "Abusivo"}
      </Badge>
    );
  };

  const handleEdit = (contrato: any) => {
    setEditingContrato(contrato);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este contrato?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleView = (id: string) => {
    navigate(`/juros/contratos/${id}/analise`);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingContrato(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contratos - Análise de Juros</h1>
          <p className="text-muted-foreground">Contratos para análise de abusividade de taxa de juros</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Contrato
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Contratos</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número do contrato ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filteredContratos && filteredContratos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Instituição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContratos.map((contrato) => (
                  <TableRow key={contrato.id}>
                    <TableCell className="font-medium">
                      {contrato.numero_contrato || "S/N"}
                    </TableCell>
                    <TableCell>{contrato.clientes_juros?.nome || "N/A"}</TableCell>
                    <TableCell>{contrato.instituicoes_financeiras?.nome || "N/A"}</TableCell>
                    <TableCell>{formatCurrency(contrato.valor_financiado)}</TableCell>
                    <TableCell>
                      {format(new Date(contrato.data_contratacao), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      {getAbusividadeBadge(contrato.tem_abusividade, contrato.grau_abusividade)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(contrato.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(contrato)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(contrato.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum contrato encontrado
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContrato ? "Editar Contrato" : "Novo Contrato"}
            </DialogTitle>
          </DialogHeader>
          <ContratoJurosForm
            contrato={editingContrato}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
