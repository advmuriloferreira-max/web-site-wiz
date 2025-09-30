import { useState } from "react";
import { Plus, Search, Edit2, Eye, Scale, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProcessoForm } from "@/components/forms/ProcessoForm";
import { useProcessos, Processo } from "@/hooks/useProcessos";
import { ResponsiveContainer } from "@/components/ui/layout-consistency";
import { GlassCard } from "@/components/ui/glassmorphism";
import { GradientText } from "@/components/ui/gradient-elements";
import { ColoredIcon } from "@/components/ui/color-consistency";
import { ModernBadge } from "@/components/ui/modern-badge";
import { EnhancedSkeleton } from "@/components/ui/enhanced-skeleton";
import { format } from "date-fns";

export default function Processos() {
  const { data: processos, isLoading } = useProcessos();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProcesso, setSelectedProcesso] = useState<Processo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredProcessos = processos?.filter(processo => 
    processo.numero_processo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    processo.contratos_provisao?.clientes_provisao?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    processo.acao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    processo.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedProcesso(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
        <ResponsiveContainer className="py-8 animate-fade-in">
          <div className="text-center">
            <GradientText variant="primary" className="text-2xl font-bold mb-4">
              Carregando processos...
            </GradientText>
            <EnhancedSkeleton className="h-64 w-full rounded-xl" />
          </div>
        </ResponsiveContainer>
      </div>
    );
  }

  const estatisticas = {
    total: processos?.length || 0,
    emAndamento: processos?.filter(p => p.status === "Em andamento").length || 0,
    concluidos: processos?.filter(p => p.status === "Concluído").length || 0,
    acordos: processos?.filter(p => p.status === "Acordo").length || 0,
  };

  return (
    <ResponsiveContainer className="py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <GradientText variant="primary" className="text-3xl font-bold mb-2 flex items-center">
            <ColoredIcon icon={Scale} className="mr-3" />
            Processos Legais
          </GradientText>
          <p className="text-muted-foreground">Controle de processos judiciais e extrajudiciais</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="interactive-button">
              <Plus className="mr-2 h-4 w-4" />
              Novo Processo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-modal animate-scale-in">
            <DialogHeader>
              <DialogTitle>
                {selectedProcesso ? "Editar Processo" : "Novo Processo"}
              </DialogTitle>
            </DialogHeader>
            <ProcessoForm processo={selectedProcesso || undefined} onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-slide-up">
        <GlassCard variant="subtle" className="text-center animate-scale-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{estatisticas.total}</div>
          </CardContent>
        </GlassCard>
        <GlassCard variant="subtle" className="text-center animate-scale-in animate-delay-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{estatisticas.emAndamento}</div>
          </CardContent>
        </GlassCard>
        <GlassCard variant="subtle" className="text-center animate-scale-in animate-delay-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{estatisticas.concluidos}</div>
          </CardContent>
        </GlassCard>
        <GlassCard variant="subtle" className="text-center animate-scale-in animate-delay-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Acordos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{estatisticas.acordos}</div>
          </CardContent>
        </GlassCard>
      </div>

      <GlassCard variant="subtle" className="animate-slide-up animate-stagger-1">
        <CardHeader className="glass-header border-b border-white/10">
          <CardTitle className="flex items-center space-x-3">
            <ColoredIcon icon={Scale} className="text-primary" />
            <GradientText variant="primary">Lista de Processos</GradientText>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <ColoredIcon icon={Search} className="text-muted-foreground" />
            <Input
              placeholder="Buscar por número, cliente, ação ou status..."
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
                    <ColoredIcon icon={Scale} />
                    <span>Número do Processo</span>
                  </div>
                </TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>
                  <div className="flex items-center space-x-2">
                    <ColoredIcon icon={Clock} />
                    <span>Status</span>
                  </div>
                </TableHead>
                <TableHead>Valor do Contrato</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProcessos?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center space-y-4 animate-fade-in">
                      <div className="glass-element p-4 rounded-full">
                        <ColoredIcon icon={Scale} size="lg" className="text-muted-foreground" />
                      </div>
                      <div className="space-y-2 text-center">
                        <p className="font-medium text-foreground">Nenhum processo encontrado</p>
                        <p className="text-sm text-muted-foreground">
                          Tente ajustar o termo de busca ou adicionar novos processos
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProcessos?.map((processo, index) => (
                  <TableRow 
                    key={processo.id} 
                    className="animate-fade-in interactive-row"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-medium">
                      <ModernBadge variant="outline" size="sm">
                        {processo.numero_processo || "N/A"}
                      </ModernBadge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="glass-element w-8 h-8 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">
                            {processo.contratos_provisao?.clientes_provisao?.nome?.charAt(0).toUpperCase() || "?"}
                          </span>
                        </div>
                        <span>{processo.contratos_provisao?.clientes_provisao?.nome || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{processo.acao || "N/A"}</TableCell>
                    <TableCell>
                      <ModernBadge 
                        variant={processo.status === "Concluído" ? "success" : 
                               processo.status === "Em andamento" ? "info" : 
                               processo.status === "Acordo" ? "purple" : "default"}
                        size="sm"
                      >
                        {processo.status || "N/A"}
                      </ModernBadge>
                    </TableCell>
                    <TableCell>
                      {processo.contratos_provisao?.valor_divida ? formatCurrency(processo.contratos_provisao.valor_divida) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {processo.prazo ? format(new Date(processo.prazo), "dd/MM/yyyy") : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-500/10 interactive-button group"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProcesso(processo);
                            setIsDialogOpen(true);
                          }}
                          className="h-8 w-8 p-0 hover:bg-amber-500/10 interactive-button group"
                        >
                          <Edit2 className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
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
    </ResponsiveContainer>
  );
}