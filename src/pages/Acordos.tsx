import { useState } from "react";
import { Search, DollarSign, TrendingDown, Handshake, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AcordoForm } from "@/components/acordos/AcordoForm";
import { useContratos, Contrato } from "@/hooks/useContratos";
import { format } from "date-fns";

export default function Acordos() {
  const { data: contratos, isLoading } = useContratos();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredContratos = contratos?.filter(contrato => 
    contrato.clientes?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.bancos?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.numero_contrato?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedContrato(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const calcularDesconto = (valorOriginal: number, valorAcordo: number) => {
    const desconto = ((valorOriginal - valorAcordo) / valorOriginal) * 100;
    return desconto.toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Carregando contratos...</div>
      </div>
    );
  }

  const estatisticas = {
    totalContratos: contratos?.length || 0,
    comProposta: contratos?.filter(c => c.proposta_acordo).length || 0,
    acordosFinalizados: contratos?.filter(c => c.acordo_final).length || 0,
    valorTotalOriginal: contratos?.filter(c => c.acordo_final).reduce((sum, c) => sum + c.valor_divida, 0) || 0,
    valorTotalAcordos: contratos?.filter(c => c.acordo_final).reduce((sum, c) => sum + (c.acordo_final || 0), 0) || 0,
  };

  const economiaTotal = estatisticas.valorTotalOriginal - estatisticas.valorTotalAcordos;

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
          <CardContent className="flex items-center p-6">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Com Proposta</p>
              <p className="text-2xl font-bold">{estatisticas.comProposta}</p>
            </div>
          </CardContent>
        </GlassCard>
      </div>

      {/* Rest of the acordos content would continue here */}
    </ResponsiveContainer>
  );
}

const formatCurrency = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};
        <CardHeader>
          <CardTitle>Contratos para Acordo</CardTitle>
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
                  <TableHead>Ação</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Banco</TableHead>
                  <TableHead>Valor Original</TableHead>
                  <TableHead>Proposta</TableHead>
                  <TableHead>Acordo Final</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContratos?.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum contrato encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContratos?.map((contrato) => (
                    <TableRow key={contrato.id}>
                      <TableCell>
                        <Dialog open={isDialogOpen && selectedContrato?.id === contrato.id} onOpenChange={(open) => {
                          setIsDialogOpen(open);
                          if (!open) setSelectedContrato(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              className="bg-green-600 hover:bg-green-700 text-white"
                              size="sm"
                              onClick={() => {
                                setSelectedContrato(contrato);
                                setIsDialogOpen(true);
                              }}
                            >
                              {contrato.acordo_final ? "Ver Acordo" : "Negociar"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                {contrato.acordo_final ? "Acordo Finalizado" : "Negociar Acordo"}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedContrato && (
                              <AcordoForm contrato={selectedContrato} onSuccess={handleSuccess} />
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="font-medium">
                        {contrato.clientes?.nome}
                      </TableCell>
                      <TableCell>{contrato.bancos?.nome}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(contrato.valor_divida)}
                      </TableCell>
                      <TableCell>
                        {contrato.proposta_acordo ? (
                          <span className="font-medium text-blue-600">
                            {formatCurrency(contrato.proposta_acordo)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {contrato.acordo_final ? (
                          <span className="font-medium text-green-600">
                            {formatCurrency(contrato.acordo_final)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {contrato.proposta_acordo ? (
                          <Badge variant="secondary">
                            {calcularDesconto(contrato.valor_divida, contrato.proposta_acordo)}%
                          </Badge>
                        ) : contrato.acordo_final ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            {calcularDesconto(contrato.valor_divida, contrato.acordo_final)}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {contrato.acordo_final ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Finalizado
                          </Badge>
                        ) : contrato.proposta_acordo ? (
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                            Em negociação
                          </Badge>
                        ) : (
                          <Badge variant="outline">Sem proposta</Badge>
                        )}
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