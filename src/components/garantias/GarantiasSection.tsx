import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  useGarantiasByContrato, 
  useCreateGarantia, 
  useUpdateGarantia, 
  useDeleteGarantia,
  type CreateGarantiaInput,
  type Garantia 
} from "@/hooks/useGarantias";
import { GarantiaForm, type GarantiaFormData } from "./GarantiaForm";

interface GarantiasSectionProps {
  contratoId: string | null;
}

export function GarantiasSection({ contratoId }: GarantiasSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGarantia, setEditingGarantia] = useState<Garantia | null>(null);

  const { data: garantias, isLoading } = useGarantiasByContrato(contratoId);
  const createGarantia = useCreateGarantia();
  const updateGarantia = useUpdateGarantia();
  const deleteGarantia = useDeleteGarantia();

  const handleCreateGarantia = (data: GarantiaFormData) => {
    if (!data.tipo_garantia || !contratoId) return;

    const garantiaInput: CreateGarantiaInput = {
      contrato_id: contratoId,
      tipo_garantia: data.tipo_garantia,
      descricao: data.descricao,
      valor_avaliacao: data.valor_avaliacao,
      percentual_cobertura: data.percentual_cobertura,
    };

    createGarantia.mutate(garantiaInput, {
      onSuccess: () => {
        setDialogOpen(false);
      },
    });
  };

  const handleUpdateGarantia = (data: GarantiaFormData) => {
    if (!editingGarantia || !data.tipo_garantia || !contratoId) return;

    updateGarantia.mutate({
      id: editingGarantia.id,
      contrato_id: contratoId,
      tipo_garantia: data.tipo_garantia,
      descricao: data.descricao,
      valor_avaliacao: data.valor_avaliacao,
      percentual_cobertura: data.percentual_cobertura,
    }, {
      onSuccess: () => {
        setDialogOpen(false);
        setEditingGarantia(null);
      },
    });
  };

  const handleDeleteGarantia = (garantiaId: string) => {
    deleteGarantia.mutate(garantiaId);
  };

  const formatCurrency = (value?: number) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getTipoGarantiaBadgeVariant = (tipo: string) => {
    return tipo === "Real" ? "default" : "secondary";
  };

  const openCreateDialog = () => {
    setEditingGarantia(null);
    setDialogOpen(true);
  };

  const openEditDialog = (garantia: Garantia) => {
    setEditingGarantia(garantia);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingGarantia(null);
  };

  if (isLoading) {
    return <div>Carregando garantias...</div>;
  }

  return (
    <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Garantias</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={openCreateDialog} 
              size="sm" 
              className="flex items-center gap-2"
              disabled={!contratoId}
            >
              <Plus className="h-4 w-4" />
              Adicionar Garantia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingGarantia ? "Editar Garantia" : "Nova Garantia"}
              </DialogTitle>
            </DialogHeader>
            <GarantiaForm
              onSubmit={editingGarantia ? handleUpdateGarantia : handleCreateGarantia}
              onCancel={closeDialog}
              initialData={editingGarantia || undefined}
              isLoading={createGarantia.isPending || updateGarantia.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {garantias && garantias.length > 0 ? (
        <div className="space-y-3">
          {garantias.map((garantia) => (
            <Card key={garantia.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge variant={getTipoGarantiaBadgeVariant(garantia.tipo_garantia)}>
                      {garantia.tipo_garantia}
                    </Badge>
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(garantia)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover esta garantia? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteGarantia(garantia.id)}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {garantia.descricao && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {garantia.descricao}
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Valor da Avaliação:</span>
                    <p>{formatCurrency(garantia.valor_avaliacao)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Percentual de Cobertura:</span>
                    <p>{garantia.percentual_cobertura || 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nenhuma garantia cadastrada</p>
          {contratoId ? (
            <p className="text-sm">Clique em "Adicionar Garantia" para começar</p>
          ) : (
            <p className="text-sm">Salve o contrato primeiro para adicionar garantias</p>
          )}
        </div>
      )}
    </div>
  );
}