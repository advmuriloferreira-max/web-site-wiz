import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  WizardStep, 
  ContratoWizardData, 
  contratoWizardSchema,
  etapa1Schema,
  etapa2Schema,
  etapa3Schema,
  etapa4Schema,
  etapa5Schema
} from "./types";
import { WizardProgressBar } from "./ProgressBar";
import { Etapa1 } from "./Etapa1";
import { Etapa2 } from "./Etapa2";
import { Etapa3 } from "./Etapa3";
import { Etapa4 } from "./Etapa4";
import { Etapa5 } from "./Etapa5";
import { useCreateContrato } from "@/hooks/useCreateContrato";
import { useUpdateContrato } from "@/hooks/useUpdateContrato";
import { useContratoById } from "@/hooks/useContratoById";
import { useAsyncOperation } from "@/hooks/useAsyncOperation";
import { enhancedToast } from "@/components/ui/enhanced-toast";
import { ChevronLeft, ChevronRight, Save, Send, AlertCircle } from "lucide-react";

interface ContratoWizardProps {
  onSuccess?: () => void;
  contratoParaEditar?: string | null; // ID do contrato para edição
  clienteIdPredefinido?: string;
}

const STEPS: WizardStep[] = [
  {
    id: 1,
    title: "Dados Básicos",
    description: "Cliente, Banco e Número do Contrato",
    schema: etapa1Schema
  },
  {
    id: 2,
    title: "Detalhes Financeiros",
    description: "Valores, Datas e Tipo de Operação",
    schema: etapa2Schema
  },
  {
    id: 3,
    title: "Cálculo de Provisão",
    description: "Classificação de Risco e Provisão",
    schema: etapa3Schema
  },
  {
    id: 4,
    title: "Informações Adicionais",
    description: "Garantias e Observações",
    schema: etapa4Schema
  },
  {
    id: 5,
    title: "Revisão e Confirmação",
    description: "Resumo e Finalização",
    schema: etapa5Schema
  }
];

const DRAFT_KEY = "contrato-wizard-draft";

export function ContratoWizard({ 
  onSuccess, 
  contratoParaEditar, 
  clienteIdPredefinido 
}: ContratoWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  const createContrato = useCreateContrato();
  const updateContrato = useUpdateContrato();
  const { execute, isLoading } = useAsyncOperation();
  const { data: contratoExistente } = useContratoById(contratoParaEditar);

  const form = useForm<ContratoWizardData>({
    resolver: zodResolver(contratoWizardSchema),
    defaultValues: {
      cliente_id: clienteIdPredefinido || "",
      banco_id: "",
      numero_contrato: "",
      tipo_operacao_bcb: "",
      valor_divida: "",
      saldo_contabil: "",
      data_ultimo_pagamento: "",
      data_entrada_escritorio: "",
      dias_atraso: "0",
      meses_atraso: "0",
      classificacao: undefined,
      percentual_provisao: "0",
      valor_provisao: "0",
      proposta_acordo: "0",
      forma_pagamento: undefined,
      numero_parcelas: "",
      valor_parcela: "0",
      escritorio_banco_acordo: "",
      contato_acordo_nome: "",
      contato_acordo_telefone: "",
      observacoes: "",
      is_reestruturado: false,
      data_reestruturacao: undefined,
      acordo_final: "0",
      reducao_divida: "0",
      percentual_honorarios: undefined,
      valor_honorarios: "0",
      situacao: "Em análise",
      tempo_escritorio: "0",
    },
    mode: "onChange"
  });

  // Carregar dados do contrato para edição ou rascunho
  useEffect(() => {
    if (contratoParaEditar && contratoExistente) {
      // Carregar dados do contrato existente para edição
      form.reset({
        cliente_id: contratoExistente.cliente_id,
        banco_id: contratoExistente.banco_id,
        numero_contrato: contratoExistente.numero_contrato || "",
        tipo_operacao_bcb: (contratoExistente as any).tipo_operacao_bcb || "",
        valor_divida: contratoExistente.valor_divida.toString(),
        saldo_contabil: contratoExistente.saldo_contabil?.toString() || "",
        data_ultimo_pagamento: contratoExistente.data_ultimo_pagamento || "",
        data_entrada_escritorio: (contratoExistente as any).data_entrada_escritorio || "",
        dias_atraso: (contratoExistente.dias_atraso || 0).toString(),
        meses_atraso: (contratoExistente.meses_atraso || 0).toString(),
        classificacao: contratoExistente.classificacao as any,
        percentual_provisao: (contratoExistente.percentual_provisao || 0).toString(),
        valor_provisao: (contratoExistente.valor_provisao || 0).toString(),
        proposta_acordo: (contratoExistente.proposta_acordo || 0).toString(),
        forma_pagamento: (contratoExistente as any).forma_pagamento,
        numero_parcelas: ((contratoExistente as any).numero_parcelas || "").toString(),
        valor_parcela: ((contratoExistente as any).valor_parcela || 0).toString(),
        escritorio_banco_acordo: (contratoExistente as any).escritorio_banco_acordo || "",
        contato_acordo_nome: (contratoExistente as any).contato_acordo_nome || "",
        contato_acordo_telefone: (contratoExistente as any).contato_acordo_telefone || "",
        observacoes: contratoExistente.observacoes || "",
        is_reestruturado: (contratoExistente as any).is_reestruturado || false,
        data_reestruturacao: (contratoExistente as any).data_reestruturacao 
          ? new Date((contratoExistente as any).data_reestruturacao) 
          : undefined,
        acordo_final: (contratoExistente.acordo_final || 0).toString(),
        reducao_divida: ((contratoExistente as any).reducao_divida || 0).toString(),
        percentual_honorarios: (contratoExistente as any).percentual_honorarios?.toString() as any,
        valor_honorarios: ((contratoExistente as any).valor_honorarios || 0).toString(),
        situacao: (contratoExistente.situacao as any) || "Em análise",
        tempo_escritorio: ((contratoExistente as any).tempo_escritorio || 0).toString(),
      });
      
      enhancedToast.info("Contrato carregado para edição", {
        description: `${contratoExistente.numero_contrato || 'Contrato'} pronto para edição`
      });
    } else if (!contratoParaEditar) {
      // Carregar rascunho apenas se não estiver editando
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        try {
          const draftData = JSON.parse(draft);
          form.reset(draftData);
          setIsDraftSaved(true);
          enhancedToast.info("Rascunho carregado", {
            description: "Seus dados foram restaurados automaticamente"
          });
        } catch (error) {
          console.error("Erro ao carregar rascunho:", error);
        }
      }
    }
  }, [form, contratoParaEditar, contratoExistente]);

  // Salvar rascunho automaticamente
  const saveDraft = useCallback(() => {
    const formData = form.getValues();
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    setIsDraftSaved(true);
  }, [form]);

  // Auto-save a cada 30 segundos e quando mudar de etapa
  useEffect(() => {
    const interval = setInterval(saveDraft, 30000);
    return () => clearInterval(interval);
  }, [saveDraft]);

  // Validar etapa atual
  const validateCurrentStep = async () => {
    const currentStepSchema = STEPS[currentStep - 1].schema;
    const formData = form.getValues();
    
    try {
      await currentStepSchema.parseAsync(formData);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Navegar para próxima etapa
  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    
    if (!isValid) {
      enhancedToast.warning("Campos obrigatórios", {
        description: "Complete os campos obrigatórios antes de prosseguir"
      });
      return;
    }

    saveDraft();
    
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  };

  // Navegar para etapa anterior
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Ir para etapa específica
  const goToStep = (step: number) => {
    if (step <= currentStep || completedSteps.includes(step - 1)) {
      setCurrentStep(step);
    }
  };

  // Submeter formulário
  const onSubmit = async (data: ContratoWizardData) => {
    const success = await execute(
      async () => {
        const contratoData = {
          cliente_id: data.cliente_id,
          banco_id: data.banco_id,
          numero_contrato: data.numero_contrato || null,
          tipo_operacao: null,
          tipo_operacao_bcb: data.tipo_operacao_bcb,
          valor_divida: parseFloat(data.valor_divida),
          saldo_contabil: data.saldo_contabil ? parseFloat(data.saldo_contabil) : null,
          data_ultimo_pagamento: data.data_ultimo_pagamento || null,
          dias_atraso: data.dias_atraso ? parseInt(data.dias_atraso) : undefined,
          meses_atraso: data.meses_atraso ? parseFloat(data.meses_atraso) : undefined,
          classificacao: data.classificacao || null,
          percentual_provisao: data.percentual_provisao ? parseFloat(data.percentual_provisao) : undefined,
          valor_provisao: data.valor_provisao ? parseFloat(data.valor_provisao) : undefined,
          proposta_acordo: data.proposta_acordo ? parseFloat(data.proposta_acordo) : undefined,
          data_entrada_escritorio: data.data_entrada_escritorio || null,
          tempo_escritorio: data.tempo_escritorio ? parseInt(data.tempo_escritorio) : undefined,
          forma_pagamento: data.forma_pagamento || null,
          numero_parcelas: data.numero_parcelas ? parseInt(data.numero_parcelas) : null,
          valor_parcela: data.valor_parcela ? parseFloat(data.valor_parcela) : undefined,
          escritorio_banco_acordo: data.escritorio_banco_acordo || null,
          contato_acordo_nome: data.contato_acordo_nome || null,
          contato_acordo_telefone: data.contato_acordo_telefone || null,
          acordo_final: data.acordo_final ? parseFloat(data.acordo_final) : undefined,
          reducao_divida: data.reducao_divida ? parseFloat(data.reducao_divida) : undefined,
          percentual_honorarios: data.percentual_honorarios ? parseFloat(data.percentual_honorarios) : undefined,
          valor_honorarios: data.valor_honorarios ? parseFloat(data.valor_honorarios) : undefined,
          situacao: data.situacao || "Em análise",
          observacoes: data.observacoes || null,
          is_reestruturado: data.is_reestruturado || false,
          data_reestruturacao: data.data_reestruturacao ? data.data_reestruturacao.toISOString() : null,
        };

        if (contratoParaEditar && contratoExistente) {
          return await updateContrato.mutateAsync({ ...contratoData, id: contratoExistente.id });
        } else {
          return await createContrato.mutateAsync(contratoData);
        }
      },
      {
        successMessage: contratoParaEditar 
          ? "Contrato atualizado com sucesso!" 
          : "Contrato criado com sucesso!",
        errorMessage: contratoParaEditar
          ? "Erro ao atualizar contrato"
          : "Erro ao criar contrato",
        loadingMessage: contratoParaEditar
          ? "Atualizando contrato..."
          : "Criando contrato..."
      }
    );

    if (success) {
      // Limpar rascunho
      localStorage.removeItem(DRAFT_KEY);
      onSuccess?.();
    }
  };

  // Renderizar etapa atual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Etapa1 form={form} />;
      case 2:
        return <Etapa2 form={form} />;
      case 3:
        return <Etapa3 form={form} />;
      case 4:
        return <Etapa4 form={form} />;
      case 5:
        return <Etapa5 form={form} />;
      default:
        return null;
    }
  };

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === STEPS.length;
  const canProceed = completedSteps.includes(currentStep) || currentStep === 1;

  return (
    <div className="space-y-6">
      {/* Barra de Progresso */}
      <WizardProgressBar 
        steps={STEPS.map(step => ({
          ...step,
          isCompleted: completedSteps.includes(step.id)
        }))}
        currentStep={currentStep}
      />

      {/* Indicador de Rascunho */}
      {isDraftSaved && (
        <Alert>
          <Save className="h-4 w-4" />
          <AlertDescription>
            Rascunho salvo automaticamente. Seus dados estão seguros.
          </AlertDescription>
        </Alert>
      )}

      {/* Conteúdo da Etapa */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardContent className="p-6">
              {renderCurrentStep()}
            </CardContent>
          </Card>

          {/* Botões de Navegação */}
          <div className="flex justify-between items-center pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={isFirstStep}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={saveDraft}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Salvar Rascunho
              </Button>

              {!isLastStep ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isLoading 
                    ? (contratoParaEditar ? "Atualizando..." : "Criando...")
                    : (contratoParaEditar ? "Atualizar Contrato" : "Criar Contrato")
                  }
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}