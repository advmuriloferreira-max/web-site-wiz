import { useState, useEffect } from "react";
import { Handshake, DollarSign, TrendingDown, FileText, Eye, Edit, Search, AlertTriangle, Plus, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AcordoForm } from "@/components/acordos/AcordoForm";
import { useContratos } from "@/hooks/useContratos";
import { usePropostasAcordo, useCreateProposta, useUpdateProposta } from "@/hooks/usePropostasAcordo";
import { ResponsiveContainer } from "@/components/ui/layout-consistency";
import { GlassCard } from "@/components/ui/glassmorphism";
import { GradientText } from "@/components/ui/gradient-elements";
import { ColoredIcon } from "@/components/ui/color-consistency";
import { ModernBadge } from "@/components/ui/modern-badge";
import { format } from "date-fns";
import { toast } from "sonner";

const formatCurrency = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export default function Acordos() {
  const { data: contratos, isLoading } = useContratos();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContrato, setSelectedContrato] = useState<any>(null);
  const [showPropostaDialog, setShowPropostaDialog] = useState(false);
  const [showAcordoDialog, setShowAcordoDialog] = useState(false);
  const [propostaForm, setPropostaForm] = useState({
    valor_proposta: "",
    tipo_proposta: "enviada" as "enviada" | "recebida",
    observacoes: ""
  });

  const createProposta = useCreateProposta();
  const updateProposta = useUpdateProposta();

  // Filtrar contratos que podem ter acordo (com algum atraso ou problema)
  const contratosParaAcordo = contratos?.filter(contrato => 
    contrato.dias_atraso > 0 || 
    contrato.proposta_acordo || 
    contrato.acordo_final ||
    contrato.situacao === 'Em negociação'
  ) || [];

  const filteredContratos = contratosParaAcordo.filter(contrato =>
    contrato.clientes?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.bancos?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.numero_contrato?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const estatisticas = {
    totalContratos: contratos?.length || 0,
    comProposta: contratos?.filter(c => c.proposta_acordo).length || 0,
    acordosFinalizados: contratos?.filter(c => c.acordo_final).length || 0,
    valorTotalOriginal: contratos?.filter(c => c.acordo_final).reduce((sum, c) => sum + c.valor_divida, 0) || 0,
    valorTotalAcordos: contratos?.filter(c => c.acordo_final).reduce((sum, c) => sum + (c.acordo_final || 0), 0) || 0,
  };

  const handleCreateProposta = async () => {
    if (!selectedContrato || !propostaForm.valor_proposta) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await createProposta.mutateAsync({
        contrato_id: selectedContrato.id,
        valor_proposta: parseFloat(propostaForm.valor_proposta),
        tipo_proposta: propostaForm.tipo_proposta,
        observacoes: propostaForm.observacoes
      });
      
      setShowPropostaDialog(false);
      setPropostaForm({ valor_proposta: "", tipo_proposta: "enviada", observacoes: "" });
      setSelectedContrato(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleOpenProposta = (contrato: any) => {
    setSelectedContrato(contrato);
    setShowPropostaDialog(true);
  };

  const handleOpenAcordo = (contrato: any) => {
    setSelectedContrato(contrato);
    setShowAcordoDialog(true);
  };

  const economiaTotal = estatisticas.valorTotalOriginal - estatisticas.valorTotalAcordos;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ResponsiveContainer className="py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <GradientText variant="primary" className="text-3xl font-bold mb-2 flex items-center">
            <ColoredIcon icon={Handshake} className="mr-3" />
            Acordos e Negociações
          </GradientText>
          <p className="text-muted-foreground">Gestão de propostas de acordo e negociações</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowPropostaDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Proposta
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-slide-up">
        <GlassCard variant="subtle" className="animate-scale-in">
          <CardContent className="flex items-center p-6">
            <ColoredIcon icon={DollarSign} className="text-blue-600 mr-4" size="lg" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valor Original</p>
              <p className="text-xl font-bold">{formatCurrency(estatisticas.valorTotalOriginal)}</p>
            </div>
          </CardContent>
        </GlassCard>
        <GlassCard variant="subtle" className="animate-scale-in animate-delay-1">
          <CardContent className="flex items-center p-6">
            <ColoredIcon icon={TrendingDown} className="text-green-600 mr-4" size="lg" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Economia Real</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(economiaTotal)}</p>
            </div>
          </CardContent>
        </GlassCard>
        <GlassCard variant="subtle" className="animate-scale-in animate-delay-2">
          <CardContent className="flex items-center p-6">
            <ColoredIcon icon={Handshake} className="text-purple-600 mr-4" size="lg" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Acordos Finalizados</p>
              <p className="text-2xl font-bold">{estatisticas.acordosFinalizados}</p>
            </div>
          </CardContent>
        </GlassCard>
        <GlassCard variant="subtle" className="animate-scale-in animate-delay-3">
          <CardContent className="flex items-center p-6">
            <ColoredIcon icon={FileText} className="text-orange-600 mr-4" size="lg" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Com Proposta</p>
              <p className="text-2xl font-bold">{estatisticas.comProposta}</p>
            </div>
          </CardContent>
        </GlassCard>
      </div>

      {/* Tabela de Contratos */}
      <GlassCard variant="subtle" className="animate-slide-up animate-stagger-1">
        <CardHeader className="glass-header border-b border-white/10">
          <CardTitle className="flex items-center space-x-3">
            <ColoredIcon icon={Handshake} className="text-primary" />
            <GradientText variant="primary">Contratos para Acordo</GradientText>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <ColoredIcon icon={Search} className="text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, banco, número do contrato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm glass-input"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead>
                  <div className="flex items-center space-x-2">
                    <ColoredIcon icon={FileText} />
                    <span>Contrato</span>
                  </div>
                </TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Banco</TableHead>
                <TableHead>Valor Original</TableHead>
                <TableHead>Proposta</TableHead>
                <TableHead>Acordo Final</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContratos?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center space-y-4 animate-fade-in">
                      <div className="glass-element p-4 rounded-full">
                        <ColoredIcon icon={Handshake} size="lg" className="text-muted-foreground" />
                      </div>
                      <div className="space-y-2 text-center">
                        <p className="font-medium text-foreground">Nenhum acordo encontrado</p>
                        <p className="text-sm text-muted-foreground">
                          Tente ajustar o termo de busca ou aguarde novos contratos
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredContratos?.map((contrato, index) => (
                  <TableRow 
                    key={contrato.id} 
                    className="animate-fade-in interactive-row"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-medium">
                      <ModernBadge variant="outline" size="sm">
                        {contrato.numero_contrato || "N/A"}
                      </ModernBadge>
                    </TableCell>
                    <TableCell>
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
                    <TableCell className="font-medium">
                      {formatCurrency(contrato.valor_divida)}
                    </TableCell>
                    <TableCell>
                      {contrato.proposta_acordo ? (
                        <span className="text-blue-600 font-medium">
                          {formatCurrency(contrato.proposta_acordo)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {contrato.acordo_final ? (
                        <span className="text-green-600 font-medium">
                          {formatCurrency(contrato.acordo_final)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <ModernBadge 
                        variant={
                          contrato.acordo_final ? "success" :
                          contrato.proposta_acordo ? "info" :
                          contrato.situacao === "Em negociação" ? "warning" : "default"
                        }
                        size="sm"
                      >
                        {contrato.acordo_final ? "Finalizado" :
                         contrato.proposta_acordo ? "Com Proposta" :
                         contrato.situacao === "Em negociação" ? "Negociando" : "Pendente"}
                      </ModernBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenAcordo(contrato)}
                          className="h-8 w-8 p-0 hover:bg-blue-500/10 interactive-button group"
                          title="Ver detalhes do acordo"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenProposta(contrato)}
                          className="h-8 w-8 p-0 hover:bg-green-500/10 interactive-button group"
                          title="Nova proposta"
                        >
                          <Plus className="h-4 w-4 text-muted-foreground group-hover:text-green-500 transition-colors" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenAcordo(contrato)}
                          className="h-8 w-8 p-0 hover:bg-amber-500/10 interactive-button group"
                          title="Finalizar acordo"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </GlassCard>

      {/* Modal para Nova Proposta */}
      <Dialog open={showPropostaDialog} onOpenChange={setShowPropostaDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nova Proposta de Acordo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedContrato && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="font-medium">{selectedContrato.clientes?.nome}</p>
                <p className="text-sm text-muted-foreground">
                  Valor Original: {formatCurrency(selectedContrato.valor_divida)}
                </p>
              </div>
            )}
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="valor_proposta">Valor da Proposta *</Label>
                <Input
                  id="valor_proposta"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={propostaForm.valor_proposta}
                  onChange={(e) => setPropostaForm({...propostaForm, valor_proposta: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="tipo_proposta">Tipo da Proposta</Label>
                <Select 
                  value={propostaForm.tipo_proposta} 
                  onValueChange={(value: "enviada" | "recebida") => 
                    setPropostaForm({...propostaForm, tipo_proposta: value})
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
              
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Observações sobre a proposta..."
                  value={propostaForm.observacoes}
                  onChange={(e) => setPropostaForm({...propostaForm, observacoes: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPropostaDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateProposta} disabled={createProposta.isPending}>
                {createProposta.isPending ? "Criando..." : "Criar Proposta"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para Finalizar Acordo */}
      <Dialog open={showAcordoDialog} onOpenChange={setShowAcordoDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5" />
              Gerenciar Acordo - {selectedContrato?.clientes?.nome}
            </DialogTitle>
          </DialogHeader>
          {selectedContrato && (
            <AcordoForm 
              contrato={selectedContrato} 
              onSuccess={() => {
                setShowAcordoDialog(false);
                setSelectedContrato(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </ResponsiveContainer>
  );
}