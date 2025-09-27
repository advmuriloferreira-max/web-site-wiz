import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PremiumToast } from "@/components/ui/premium-toast";
import { 
  PremiumModal, 
  PremiumModalContent, 
  PremiumModalHeader, 
  PremiumModalTitle, 
  PremiumModalDescription,
  PremiumModalBody,
  PremiumModalFooter,
  PremiumModalTrigger
} from "@/components/ui/premium-modal";
import { 
  LoadingState, 
  PremiumProgressBar, 
  BrandLoader,
  SkeletonLoader 
} from "@/components/ui/premium-loading";
import { 
  PremiumEmptyState, 
  EmptyData, 
  EmptySearch 
} from "@/components/ui/premium-empty-state";
import { 
  PremiumAlert, 
  SuccessAlert, 
  WarningAlert, 
  ErrorAlert, 
  InfoAlert 
} from "@/components/ui/premium-alert";
import { notifications } from "@/lib/premium-notifications";
import { FileText, Trash2, Plus, AlertTriangle } from "lucide-react";

export function PremiumComponentsDemo() {
  const [progress, setProgress] = useState(65);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const demoToasts = () => {
    notifications.success("Operação realizada com sucesso!", {
      description: "Todos os dados foram processados corretamente.",
      action: {
        label: "Desfazer",
        onClick: () => console.log("Undo clicked")
      }
    });

    setTimeout(() => {
      notifications.warning("Atenção necessária", {
        description: "Alguns itens precisam de revisão."
      });
    }, 1500);

    setTimeout(() => {
      notifications.info("Nova funcionalidade disponível", {
        description: "Confira as novidades na seção de relatórios."
      });
    }, 3000);
  };

  const demoProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          notifications.success("Processo concluído!");
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const demoLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      notifications.success("Carregamento concluído!");
    }, 3000);
  };

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-800">
          Demonstração dos Componentes Premium
        </h1>
        <p className="text-slate-600">
          Exemplos dos novos componentes de feedback visual e notificações
        </p>
      </div>

      {/* Toasts Demo */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Notificações Premium</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={demoToasts}>
            Demonstrar Toasts
          </Button>
          <Button 
            variant="outline" 
            onClick={() => notifications.branded("Toast personalizado", {
              description: "Com visual da marca INTELBANK"
            })}
          >
            Toast Branded
          </Button>
        </div>
      </section>

      {/* Modals Demo */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Modais Elegantes</h2>
        <div className="flex flex-wrap gap-2">
          <PremiumModal>
            <PremiumModalTrigger asChild>
              <Button>Modal Padrão</Button>
            </PremiumModalTrigger>
            <PremiumModalContent>
              <PremiumModalHeader gradient>
                <PremiumModalTitle>Confirmar Ação</PremiumModalTitle>
                <PremiumModalDescription>
                  Esta ação não pode ser desfeita. Tem certeza de que deseja continuar?
                </PremiumModalDescription>
              </PremiumModalHeader>
              <PremiumModalBody>
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Ao confirmar, o contrato será marcado como finalizado e não poderá 
                    mais ser editado. Todos os dados serão preservados para consulta.
                  </p>
                  <WarningAlert title="Atenção" dismissible>
                    Esta operação é irreversível e afetará os relatórios futuros.
                  </WarningAlert>
                </div>
              </PremiumModalBody>
              <PremiumModalFooter>
                <Button variant="outline">Cancelar</Button>
                <Button>Confirmar</Button>
              </PremiumModalFooter>
            </PremiumModalContent>
          </PremiumModal>

          <PremiumModal>
            <PremiumModalTrigger asChild>
              <Button variant="outline">Modal Grande</Button>
            </PremiumModalTrigger>
            <PremiumModalContent size="lg">
              <PremiumModalHeader>
                <PremiumModalTitle>Detalhes do Contrato</PremiumModalTitle>
                <PremiumModalDescription>
                  Informações completas sobre o contrato selecionado
                </PremiumModalDescription>
              </PremiumModalHeader>
              <PremiumModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Cliente</label>
                    <p className="text-sm text-slate-600">João da Silva Santos</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Valor</label>
                    <p className="text-sm text-slate-600">R$ 150.000,00</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Status</label>
                    <p className="text-sm text-slate-600">Em negociação</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Data de Vencimento</label>
                    <p className="text-sm text-slate-600">15/12/2024</p>
                  </div>
                </div>
              </PremiumModalBody>
              <PremiumModalFooter>
                <Button variant="outline">Fechar</Button>
                <Button>Editar Contrato</Button>
              </PremiumModalFooter>
            </PremiumModalContent>
          </PremiumModal>
        </div>
      </section>

      {/* Loading States Demo */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Estados de Carregamento</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={demoLoading}>
              Demonstrar Loading
            </Button>
            <Button onClick={demoProgress} variant="outline">
              Demonstrar Progresso
            </Button>
          </div>

          {isLoading && (
            <div className="border border-slate-200 rounded-lg p-6">
              <BrandLoader message="Processando dados do contrato..." />
            </div>
          )}

          <div className="space-y-3">
            <PremiumProgressBar 
              progress={progress} 
              label="Processamento de contratos"
              showPercentage
              variant="default"
            />
          </div>

          <div className="border border-slate-200 rounded-lg p-4">
            <SkeletonLoader lines={4} avatar />
          </div>
        </div>
      </section>

      {/* Empty States Demo */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Estados Vazios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-slate-200 rounded-lg">
            <EmptyData 
              entityName="Contrato"
              createAction={{
                label: "Criar primeiro contrato",
                onClick: () => notifications.info("Navegando para criação...")
              }}
            />
          </div>
          <div className="border border-slate-200 rounded-lg">
            <EmptySearch 
              searchTerm="contrato xyz"
              onClear={() => notifications.info("Busca limpa!")}
            />
          </div>
        </div>
      </section>

      {/* Alerts Demo */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Alertas e Avisos</h2>
        <div className="space-y-3">
          <SuccessAlert title="Sucesso" dismissible>
            Contrato criado com sucesso! Todas as informações foram salvas.
          </SuccessAlert>

          <InfoAlert title="Informação" icon>
            Nova funcionalidade de cálculo automático de provisão disponível.
          </InfoAlert>

          <WarningAlert title="Atenção" dismissible>
            Alguns contratos estão próximos do vencimento e precisam de atenção.
          </WarningAlert>

          <ErrorAlert title="Erro" dismissible>
            Não foi possível conectar com o servidor. Tente novamente em alguns minutos.
          </ErrorAlert>
        </div>
      </section>
    </div>
  );
}