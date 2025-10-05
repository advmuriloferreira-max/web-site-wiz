import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClienteSelector } from "@/components/dashboard/ClienteSelector";
import { ClienteAnalysisDetails } from "@/components/dashboard/ClienteAnalysisDetails";
import { useClientes } from "@/hooks/useClientes";
import { Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PainelCliente() {
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);
  const { data: clientes } = useClientes();
  
  const selectedCliente = clientes?.find(c => c.id === selectedClienteId);

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
              Análise estratégica completa para negociação inteligente
            </p>
          </div>
        </div>

        {/* Card de Seleção */}
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Selecione o Cliente
            </CardTitle>
            <CardDescription>
              Escolha um cliente para visualizar a análise estratégica completa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClienteSelector 
              selectedClienteId={selectedClienteId}
              onClienteSelect={setSelectedClienteId}
            />
            
            {selectedCliente && (
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  Cliente Selecionado
                </Badge>
                <span className="text-sm font-semibold">{selectedCliente.nome}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Análise Completa do Cliente */}
      {selectedClienteId ? (
        <div className="animate-fade-in">
          <ClienteAnalysisDetails clienteId={selectedClienteId} />
        </div>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-semibold text-xl mb-2">Nenhum Cliente Selecionado</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Selecione um cliente acima para visualizar a análise estratégica completa, 
              incluindo termômetro de situação, projeções futuras, calendário de negociação e muito mais.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
              {[
                { emoji: "📊", label: "Análise Presente" },
                { emoji: "📈", label: "Projeção Futura" },
                { emoji: "🎯", label: "Estratégia" },
                { emoji: "📅", label: "Calendário" }
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
