import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, FileText, Calculator, AlertTriangle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ContratoForm } from "@/components/forms/ContratoForm";
import { GarantiaImpactDisplay } from "@/components/garantias/GarantiaImpactDisplay";
import { useContratoByNumero } from "@/hooks/useContratoByNumero";
import { useProvisaoPerda, useProvisaoPerdaIncorrida } from "@/hooks/useProvisao";
import { 
  verificarPeriodoObservacaoReestruturacao, 
  calcularProvisaoAvancada, 
  ClassificacaoRisco,
  ResultadoCalculo 
} from "@/lib/calculoProvisao";
import { format } from "date-fns";
import { useState, useEffect } from "react";


const getClassificacaoColor = (classificacao: string | null) => {
  switch (classificacao) {
    case "C1": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "C2": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "C3": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case "C4": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "C5": return "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-200";
    default: return "bg-muted text-muted-foreground";
  }
};

const getEstagioRiscoColor = (estagio: number | null) => {
  switch (estagio) {
    case 1: return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case 2: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case 3: return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default: return "bg-muted text-muted-foreground";
  }
};

const getEstagioRiscoLabel = (estagio: number | null) => {
  switch (estagio) {
    case 1: return "Estágio 1";
    case 2: return "Estágio 2";
    case 3: return "Estágio 3";
    default: return "N/A";
  }
};

const getSituacaoColor = (situacao: string | null) => {
  switch (situacao) {
    case "Em análise": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "Em negociação": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "Em processo judicial": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "Acordo Finalizado": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    default: return "bg-muted text-muted-foreground";
  }
};

export default function ContratoDetalhes() {
  const { numeroContrato } = useParams<{ numeroContrato: string }>();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [resultadoProvisao, setResultadoProvisao] = useState<ResultadoCalculo | null>(null);
  
  const { data: contrato, isLoading, error } = useContratoByNumero(numeroContrato || null);
  const { data: tabelaPerda } = useProvisaoPerda();
  const { data: tabelaIncorrida } = useProvisaoPerdaIncorrida();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy");
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
  };

  // Calcular provisão avançada com garantias quando o contrato for carregado
  useEffect(() => {
    const calcularProvisao = async () => {
      if (!contrato || !tabelaPerda || !tabelaIncorrida) return;

      try {
        const resultado = await calcularProvisaoAvancada({
          valorDivida: contrato.valor_divida,
          diasAtraso: contrato.dias_atraso || 0,
          classificacao: (contrato.classificacao as ClassificacaoRisco) || 'C5',
          tabelaPerda,
          tabelaIncorrida,
          contratoId: contrato.id,
          isReestruturado: (contrato as any).is_reestruturado,
          dataReestruturacao: (contrato as any).data_reestruturacao,
          fatorRecuperacaoGarantia: 0.5
        });
        
        setResultadoProvisao(resultado);
      } catch (error) {
        console.error('Erro ao calcular provisão avançada:', error);
      }
    };

    calcularProvisao();
  }, [contrato, tabelaPerda, tabelaIncorrida]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Carregando detalhes do contrato...</div>
      </div>
    );
  }

  if (error || !contrato) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Contrato não encontrado</h2>
          <p className="text-muted-foreground mb-4">
            O contrato "{numeroContrato}" não pôde ser encontrado.
          </p>
          <Button onClick={() => navigate("/contratos")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Contratos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/contratos")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Contrato {contrato.numero_contrato || "Sem número"}
            </h1>
            <p className="text-muted-foreground">
              Cliente: {contrato.clientes?.nome} • Banco: {contrato.bancos?.nome}
            </p>
          </div>
        </div>
        
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Editar Contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Contrato</DialogTitle>
            </DialogHeader>
            <ContratoForm 
              onSuccess={handleEditSuccess} 
              contratoParaEditar={contrato.numero_contrato} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerta para contratos reestruturados em período de observação */}
      {(contrato as any).is_reestruturado && (contrato as any).data_reestruturacao && (() => {
        const observacao = verificarPeriodoObservacaoReestruturacao((contrato as any).data_reestruturacao);
        if (observacao.emPeriodo) {
          return (
            <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                <strong>Operação Reestruturada - Período de Observação</strong>
                <br />
                Este contrato está em período de observação regulamentar de 6 meses. 
                Mantido em Estágio de Risco mínimo 2 conforme normativas.
                <br />
                <span className="text-sm">
                  Restam {observacao.diasRestantes} dias para conclusão do período de observação.
                  Data da reestruturação: {format(new Date((contrato as any).data_reestruturacao), "dd/MM/yyyy")}
                </span>
              </AlertDescription>
            </Alert>
          );
        }
        return null;
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Básicas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações do Contrato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                <p className="text-lg font-medium">{contrato.clientes?.nome}</p>
                <p className="text-sm text-muted-foreground">{contrato.clientes?.cpf_cnpj}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Banco</label>
                <p className="text-lg font-medium">{contrato.bancos?.nome}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Número do Contrato</label>
                <p className="text-lg font-medium">{contrato.numero_contrato || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipo de Operação</label>
                <p className="text-lg font-medium">{contrato.tipo_operacao || "-"}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Situação</label>
                <div className="mt-1">
                  <Badge className={getSituacaoColor(contrato.situacao)}>
                    {contrato.situacao}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Classificação</label>
                <div className="mt-1">
                  {contrato.classificacao ? (
                    <Badge className={getClassificacaoColor(contrato.classificacao)}>
                      {contrato.classificacao}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estágio de Risco</label>
                <div className="mt-1">
                  {(contrato as any).estagio_risco ? (
                    <Badge className={getEstagioRiscoColor((contrato as any).estagio_risco)}>
                      {getEstagioRiscoLabel((contrato as any).estagio_risco)}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Dias de Atraso</label>
                <div className="mt-1">
                  {contrato.dias_atraso > 0 ? (
                    <Badge variant="destructive">{contrato.dias_atraso} dias</Badge>
                  ) : (
                    <Badge variant="secondary">Em dia</Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Entrada</label>
                <p className="text-lg">{formatDate(contrato.data_entrada)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data Último Pagamento</label>
                <p className="text-lg">{formatDate(contrato.data_ultimo_pagamento)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Vencimento</label>
                <p className="text-lg">{formatDate(contrato.data_vencimento)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Conclusão</label>
                <p className="text-lg">{formatDate(contrato.data_conclusao)}</p>
              </div>
              {(contrato as any).is_reestruturado && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data da Reestruturação</label>
                  <p className="text-lg">{formatDate((contrato as any).data_reestruturacao)}</p>
                  <Badge variant="outline" className="mt-1">
                    Operação Reestruturada
                  </Badge>
                </div>
              )}
            </div>

            {contrato.observacoes && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Observações</label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{contrato.observacoes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Informações Financeiras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Valores Financeiros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Valor da Dívida</label>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(contrato.valor_divida)}
              </p>
            </div>
            
            {contrato.saldo_contabil && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Saldo Contábil</label>
                <p className="text-xl font-semibold">
                  {formatCurrency(contrato.saldo_contabil)}
                </p>
              </div>
            )}

            <Separator />

            {contrato.valor_provisao > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Provisão</label>
                <p className="text-lg font-medium">
                  {contrato.percentual_provisao.toFixed(2)}%
                </p>
                <p className="text-xl font-semibold text-orange-600">
                  {formatCurrency(contrato.valor_provisao)}
                </p>
                {(contrato as any).is_reestruturado && (contrato as any).data_reestruturacao && (() => {
                  const observacao = verificarPeriodoObservacaoReestruturacao((contrato as any).data_reestruturacao);
                  if (observacao.emPeriodo) {
                    return (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        ⚠️ Provisão ajustada por reestruturação
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>
            )}

            {contrato.acordo_final > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Acordo Final</label>
                <p className="text-xl font-semibold text-green-700">
                  {formatCurrency(contrato.acordo_final)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações de Acordo (se houver) */}
      {((contrato as any).forma_pagamento || (contrato as any).contato_acordo_nome) && (
        <Card>
          <CardHeader>
            <CardTitle>Informações do Acordo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(contrato as any).forma_pagamento && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Forma de Pagamento</label>
                  <p className="text-lg font-medium capitalize">
                    {(contrato as any).forma_pagamento.replace("_", " ")}
                  </p>
                </div>
              )}
              
              {(contrato as any).numero_parcelas && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Número de Parcelas</label>
                  <p className="text-lg font-medium">{(contrato as any).numero_parcelas}x</p>
                </div>
              )}
              
              {(contrato as any).valor_parcela > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Valor da Parcela</label>
                  <p className="text-lg font-medium">{formatCurrency((contrato as any).valor_parcela)}</p>
                </div>
              )}

              {(contrato as any).contato_acordo_nome && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contato do Acordo</label>
                  <p className="text-lg font-medium">{(contrato as any).contato_acordo_nome}</p>
                  {(contrato as any).contato_acordo_telefone && (
                    <p className="text-sm text-muted-foreground">{(contrato as any).contato_acordo_telefone}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cálculo Avançado de Provisão com Garantias */}
      {resultadoProvisao && (resultadoProvisao.garantias?.length > 0 || resultadoProvisao.lgdBase) && (
        <GarantiaImpactDisplay resultado={resultadoProvisao} />
      )}
    </div>
  );
}