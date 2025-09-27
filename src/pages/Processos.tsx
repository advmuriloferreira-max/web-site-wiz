import { useState } from "react";
import { Plus, Search, Edit2, Eye, Scale, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProcessoForm } from "@/components/forms/ProcessoForm";
import { useProcessos, Processo } from "@/hooks/useProcessos";
import { ResponsiveContainer } from "@/components/ui/layout-consistency";
import { GlassCard } from "@/components/ui/glassmorphism";
import { GradientText } from "@/components/ui/gradient-elements";
import { ColoredIcon } from "@/components/ui/color-consistency";
import { ModernBadge } from "@/components/ui/modern-badge";
import { EnhancedSkeleton } from "@/components/ui/enhanced-skeleton";
import { format } from "date-fns";

const getStatusColor = (status: string | null) => {
  switch (status) {
    case "Em andamento": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "Concluído": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "Suspenso": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "Arquivado": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    case "Acordo": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    default: return "bg-muted text-muted-foreground";
  }
};

export default function Processos() {
  const { data: processos, isLoading } = useProcessos();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProcesso, setSelectedProcesso] = useState<Processo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredProcessos = processos?.filter(processo => 
    processo.numero_processo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    processo.contratos?.clientes?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Processos Legais</h1>
          <p className="text-muted-foreground">Controle de processos judiciais e extrajudiciais</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Processo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Scale className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{estatisticas.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
              <p className="text-2xl font-bold">{estatisticas.emAndamento}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
              <p className="text-2xl font-bold">{estatisticas.concluidos}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">$</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Acordos</p>
              <p className="text-2xl font-bold">{estatisticas.acordos}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Processos</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Buscar por número, cliente, ação ou status..."
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
                  <TableHead>Número Processo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Liminar</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProcessos?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum processo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProcessos?.map((processo) => (
                    <TableRow key={processo.id}>
                      <TableCell className="font-medium">
                        {processo.numero_processo ? (
                          <Badge variant="outline">{processo.numero_processo}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{processo.contratos?.clientes?.nome}</TableCell>
                      <TableCell>{processo.acao || <span className="text-muted-foreground">-</span>}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(processo.status)}>
                          {processo.status || "Sem status"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {processo.contratos?.valor_divida ? 
                          formatCurrency(processo.contratos.valor_divida) : 
                          <span className="text-muted-foreground">-</span>
                        }
                      </TableCell>
                      <TableCell>
                        {processo.prazo ? (
                          <Badge variant={new Date(processo.prazo) < new Date() ? "destructive" : "secondary"}>
                            {format(new Date(processo.prazo), "dd/MM/yyyy")}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {processo.liminar ? (
                          <Badge variant="destructive">Sim</Badge>
                        ) : (
                          <Badge variant="secondary">Não</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProcesso(processo);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
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
    </div>
  );
}