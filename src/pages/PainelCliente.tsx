import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClienteSelector } from "@/components/dashboard/ClienteSelector";
import { ClienteAnalysisDetails } from "@/components/dashboard/ClienteAnalysisDetails";
import { useClientes } from "@/hooks/useClientes";
import { useContratosByCliente } from "@/hooks/useContratosByCliente";
import { Users, TrendingUp, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PainelCliente() {
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);
  const [selectedContratoId, setSelectedContratoId] = useState<string | null>(null);
  
  const { data: clientes } = useClientes();
  const { data: contratos } = useContratosByCliente(selectedClienteId || "");
  
  const selectedCliente = clientes?.find(c => c.id === selectedClienteId);
  const selectedContrato = contratos?.find(c => c.id === selectedContratoId);

  // Reset contrato quando mudar cliente
  const handleClienteChange = (clienteId: string | null) => {
    setSelectedClienteId(clienteId);
    setSelectedContratoId(null);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Painel do Cliente</h1>
            <p className="text-muted-foreground">
              Análise estratégica individualizada por contrato
            </p>
          </div>
        </div>

        {/* Card de Seleção */}
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Selecione Cliente e Contrato
            </CardTitle>
            <CardDescription>
              Cada contrato tem sua análise individualizada baseada em seus próprios dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Seletor de Cliente */}
            <div>
              <label className="text-sm font-medium mb-2 block">1. Cliente</label>
              <ClienteSelector 
                selectedClienteId={selectedClienteId}
                onClienteSelect={handleClienteChange}
              />
            </div>
            
            {/* Seletor de Contrato */}
            {selectedClienteId && contratos && contratos.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">2. Contrato</label>
                <Select value={selectedContratoId || ""} onValueChange={setSelectedContratoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um contrato">
                      {selectedContrato && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{selectedContrato.numero_contrato || `Contrato ${selectedContrato.id.slice(0, 8)}`}</span>
                          <Badge variant="outline" className="ml-auto">
                            {selectedContrato.classificacao || "N/A"}
                          </Badge>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {contratos.map((contrato) => (
                      <SelectItem key={contrato.id} value={contrato.id}>
                        <div className="flex items-center justify-between w-full gap-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{contrato.numero_contrato || `Contrato ${contrato.id.slice(0, 8)}`}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {contrato.classificacao || "N/A"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              R$ {Number(contrato.valor_divida || 0).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <p className="text-xs text-muted-foreground mt-2">
                  {contratos.length} contrato{contratos.length !== 1 ? 's' : ''} disponível{contratos.length !== 1 ? 'is' : ''} para {selectedCliente?.nome}
                </p>
              </div>
            )}
            
            {selectedCliente && selectedContrato && (
              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                <Badge variant="outline" className="text-sm">
                  Análise Individual
                </Badge>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{selectedCliente.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedContrato.numero_contrato || "Sem número"} • 
                    {selectedContrato.bancos?.nome || "Banco não informado"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Análise Completa do Contrato */}
      {selectedContratoId ? (
        <div className="animate-fade-in">
          <ClienteAnalysisDetails contratoId={selectedContratoId} />
        </div>
      ) : selectedClienteId && contratos && contratos.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-10 h-10 text-orange-600" />
            </div>
            <h3 className="font-semibold text-xl mb-2">Nenhum Contrato Encontrado</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Este cliente não possui contratos cadastrados no sistema.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-semibold text-xl mb-2">
              {selectedClienteId ? "Selecione um Contrato" : "Nenhum Cliente Selecionado"}
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              {selectedClienteId 
                ? "Escolha um contrato específico para visualizar sua análise estratégica completa e individualizada."
                : "Selecione um cliente e depois um de seus contratos para visualizar a análise estratégica completa."
              }
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
              {[
                { emoji: "📊", label: "Análise Individual" },
                { emoji: "📈", label: "Projeção por Contrato" },
                { emoji: "🎯", label: "Estratégia Específica" },
                { emoji: "📅", label: "Calendário Preciso" }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg text-center"
                >
                  <div className="text-3xl mb-2">{item.emoji}</div>
                  <div className="text-xs font-medium text-slate-700">{item.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
