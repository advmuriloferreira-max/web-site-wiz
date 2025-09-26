import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useContratosByCliente } from "@/hooks/useContratosByCliente";
import { useClientes } from "@/hooks/useClientes";
import { ClassificacaoChart } from "./ClassificacaoChart";
import { StatsCard } from "./StatsCard";
import { 
  FileText, 
  DollarSign, 
  Calculator, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Gavel
} from "lucide-react";

interface ClienteAnalysisDetailsProps {
  clienteId: string;
}

export function ClienteAnalysisDetails({ clienteId }: ClienteAnalysisDetailsProps) {
  const { data: contratos, isLoading: loadingContratos } = useContratosByCliente(clienteId);
  const { data: clientes } = useClientes();
  
  const cliente = clientes?.find(c => c.id === clienteId);

  if (loadingContratos) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Carregando análise do cliente...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!contratos || contratos.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Análise do Cliente: {cliente?.nome}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">
              Este cliente não possui contratos cadastrados.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular estatísticas do cliente
  const totalContratos = contratos.length;
  const valorTotalDividas = contratos.reduce((sum, c) => sum + (Number(c.valor_divida) || 0), 0);
  const valorTotalProvisao = contratos.reduce((sum, c) => sum + (Number(c.valor_provisao) || 0), 0);
  const percentualProvisao = valorTotalDividas > 0 ? (valorTotalProvisao / valorTotalDividas) * 100 : 0;

  // Distribuição por classificação
  const porClassificacao = contratos.reduce((acc, contrato) => {
    const classificacao = contrato.classificacao || "Não classificado";
    acc[classificacao] = (acc[classificacao] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Distribuição por situação
  const porSituacao = contratos.reduce((acc, contrato) => {
    const situacao = contrato.situacao || "Não informado";
    acc[situacao] = (acc[situacao] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getSituacaoIcon = (situacao: string) => {
    switch (situacao) {
      case 'Acordo Finalizado': return CheckCircle;
      case 'Em processo judicial': return Gavel;
      case 'Em negociação': return TrendingUp;
      default: return Clock;
    }
  };

  const getSituacaoColor = (situacao: string) => {
    switch (situacao) {
      case 'Acordo Finalizado': return 'bg-green-500';
      case 'Em processo judicial': return 'bg-red-500';
      case 'Em negociação': return 'bg-blue-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Análise Detalhada: {cliente?.nome}
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            {cliente?.cpf_cnpj && (
              <Badge variant="outline">{cliente.cpf_cnpj}</Badge>
            )}
            {cliente?.email && (
              <Badge variant="outline">{cliente.email}</Badge>
            )}
            {cliente?.telefone && (
              <Badge variant="outline">{cliente.telefone}</Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* KPIs do Cliente */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Contratos"
          value={totalContratos}
          description="Total de contratos"
          icon={FileText}
        />
        <StatsCard
          title="Total de Dívidas"
          value={`R$ ${(valorTotalDividas / 1000).toFixed(0)}K`}
          description="Valor total das dívidas"
          icon={DollarSign}
        />
        <StatsCard
          title="Provisão Total"
          value={`R$ ${(valorTotalProvisao / 1000).toFixed(0)}K`}
          description="Valor provisionado"
          icon={Calculator}
        />
        <StatsCard
          title="% Provisão"
          value={`${percentualProvisao.toFixed(1)}%`}
          description="Percentual de risco"
          icon={TrendingUp}
          className={
            percentualProvisao > 50 
              ? "border-destructive/20 bg-destructive/5" 
              : "border-primary/20 bg-primary/5"
          }
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ClassificacaoChart data={porClassificacao} />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Status dos Contratos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(porSituacao).map(([situacao, quantidade]) => {
                const Icon = getSituacaoIcon(situacao);
                return (
                  <div key={situacao} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${getSituacaoColor(situacao)}`} />
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{situacao}</span>
                    </div>
                    <Badge variant="secondary">{quantidade}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Contratos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Contratos do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {contratos.map(contrato => (
              <div key={contrato.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-sm">{contrato.numero_contrato || "Contrato sem número"}</p>
                    <Badge variant="outline" className="text-xs">
                      {contrato.classificacao || "Não classificado"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>{contrato.bancos?.nome || "Banco não informado"}</span>
                    <span>{contrato.situacao || "Situação não informada"}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">R$ {Number(contrato.valor_divida || 0).toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-muted-foreground">
                    Provisão: R$ {Number(contrato.valor_provisao || 0).toLocaleString('pt-BR')} 
                    ({((Number(contrato.valor_provisao || 0) / Number(contrato.valor_divida || 1)) * 100).toFixed(1)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}