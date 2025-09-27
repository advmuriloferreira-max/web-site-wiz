import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePropostasAcordo, useCreateProposta, useUpdateProposta, CreatePropostaData, PropostaAcordo } from "@/hooks/usePropostasAcordo";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";

interface PropostasTimelineProps {
  contratoId: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pendente':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'aceita':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'recusada':
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pendente':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'aceita':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'recusada':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
};

const getTipoColor = (tipo: string) => {
  switch (tipo) {
    case 'enviada':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'recebida':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
};

export function PropostasTimeline({ contratoId }: PropostasTimelineProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: propostas, isLoading } = usePropostasAcordo(contratoId);
  const createProposta = useCreateProposta();
  const updateProposta = useUpdateProposta();
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CreatePropostaData>({
    defaultValues: {
      contrato_id: contratoId,
      tipo_proposta: 'enviada'
    }
  });

  const onSubmit = (data: CreatePropostaData) => {
    createProposta.mutate({
      ...data,
      contrato_id: contratoId
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        reset();
      }
    });
  };

  const handleStatusChange = (propostaId: string, newStatus: 'pendente' | 'aceita' | 'recusada') => {
    updateProposta.mutate({
      id: propostaId,
      data: { status: newStatus }
    });
  };

  if (isLoading) {
    return <div className="animate-pulse">Carregando propostas...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5" />
            Histórico de Propostas
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Proposta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Nova Proposta</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valor_proposta">Valor da Proposta</Label>
                    <Input
                      id="valor_proposta"
                      type="number"
                      step="0.01"
                      {...register("valor_proposta", { required: "Valor é obrigatório", min: 0 })}
                    />
                    {errors.valor_proposta && (
                      <span className="text-sm text-red-500">{errors.valor_proposta.message}</span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tipo_proposta">Tipo</Label>
                    <Select 
                      value={watch("tipo_proposta")} 
                      onValueChange={(value: 'enviada' | 'recebida') => 
                        register("tipo_proposta").onChange({ target: { value } })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enviada">Proposta Enviada</SelectItem>
                        <SelectItem value="recebida">Proposta Recebida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Observações sobre a proposta..."
                    {...register("observacoes")}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createProposta.isPending}>
                    {createProposta.isPending ? "Salvando..." : "Salvar Proposta"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {!propostas || propostas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ArrowUpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma proposta registrada ainda</p>
            <p className="text-sm">Clique em "Nova Proposta" para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {propostas.map((proposta) => (
              <div key={proposta.id} className="flex gap-4 p-4 border rounded-lg bg-card">
                <div className="flex flex-col items-center">
                  {proposta.tipo_proposta === 'enviada' ? (
                    <ArrowUpCircle className="h-6 w-6 text-blue-600" />
                  ) : (
                    <ArrowDownCircle className="h-6 w-6 text-purple-600" />
                  )}
                  <div className="flex-1 w-px bg-border mt-2" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getTipoColor(proposta.tipo_proposta)}>
                          {proposta.tipo_proposta === 'enviada' ? 'Proposta Enviada' : 'Proposta Recebida'}
                        </Badge>
                        <Badge className={getStatusColor(proposta.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(proposta.status)}
                            {proposta.status.charAt(0).toUpperCase() + proposta.status.slice(1)}
                          </span>
                        </Badge>
                      </div>
                      
                      <p className="font-semibold text-lg">
                        R$ {proposta.valor_proposta.toLocaleString('pt-BR', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </p>
                      
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(proposta.data_proposta), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { 
                          locale: ptBR 
                        })}
                      </p>
                      
                      {proposta.observacoes && (
                        <p className="text-sm mt-2 p-2 bg-muted rounded text-muted-foreground">
                          {proposta.observacoes}
                        </p>
                      )}
                    </div>
                    
                    {proposta.status === 'pendente' && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(proposta.id, 'aceita')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(proposta.id, 'recusada')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}