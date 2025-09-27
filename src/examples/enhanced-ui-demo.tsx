// Este arquivo demonstra como usar os novos componentes de UI aprimorados
// NÃO INCLUIR EM PRODUÇÃO - apenas para referência

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Skeleton Screens
import { 
  DashboardCardSkeleton, 
  ListItemSkeleton, 
  TableSkeleton,
  FormSkeleton,
  ChartSkeleton 
} from "@/components/ui/skeleton-screens";

// Loading States
import { 
  LoadingState,
  DashboardLoading,
  ListLoading,
  TableLoading,
  FormLoading,
  ChartLoading
} from "@/components/ui/loading-states";

// Progress Bar
import { ProgressBar, useProgressBar } from "@/components/ui/progress-bar";

// Enhanced Toast
import { enhancedToast, useCrudToasts } from "@/components/ui/enhanced-toast";

// Animations
import { 
  PageTransition,
  ListAnimation,
  FadeInOut,
  ScaleAnimation
} from "@/components/ui/page-transition";

// Hooks
import { useAsyncOperation, useCrudOperations } from "@/hooks/useAsyncOperation";
import { useEnhancedForm } from "@/hooks/useEnhancedForms";

export function EnhancedUIDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(true);
  
  const { execute } = useAsyncOperation();
  const { create, update, remove } = useCrudOperations();
  const crudToasts = useCrudToasts();
  
  const { ProgressBarComponent } = useProgressBar(isLoading, {
    label: "Processando operação...",
    minDuration: 2000
  });

  // Exemplo de formulário aprimorado
  const form = useEnhancedForm(
    { name: "", email: "", description: "" },
    (data) => {
      const errors: Record<string, string> = {};
      if (!data.name) errors.name = "Nome é obrigatório";
      if (!data.email) errors.email = "Email é obrigatório";
      return errors;
    }
  );

  // Simular operação assíncrona
  const simulateAsyncOperation = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsLoading(false);
  };

  // Demonstrações dos toasts
  const showToastExamples = () => {
    enhancedToast.success("Operação realizada com sucesso!");
    
    setTimeout(() => {
      enhancedToast.info("Informação importante", {
        description: "Esta é uma mensagem informativa"
      });
    }, 1000);

    setTimeout(() => {
      enhancedToast.warning("Atenção necessária", {
        description: "Verifique os dados antes de continuar"
      });
    }, 2000);

    setTimeout(() => {
      enhancedToast.error("Erro encontrado", {
        description: "Algo deu errado na operação"
      });
    }, 3000);
  };

  // Exemplo de operação CRUD
  const handleCrudOperation = async () => {
    const toastId = crudToasts.create.loading();
    
    try {
      // Simular operação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      enhancedToast.dismiss(toastId);
      crudToasts.create.success("Cliente");
    } catch (error) {
      enhancedToast.dismiss(toastId);
      crudToasts.create.error();
    }
  };

  return (
    <PageTransition className="p-6 space-y-8">
      <ProgressBarComponent />
      
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <ListAnimation>
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Sistema de UI Aprimorado</h1>
            <p className="text-xl text-muted-foreground">
              Demonstração das melhorias de UX implementadas
            </p>
          </div>
        </ListAnimation>

        {/* Controles de Demonstração */}
        <ScaleAnimation delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle>Controles de Demonstração</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button onClick={simulateAsyncOperation} disabled={isLoading}>
                {isLoading ? "Carregando..." : "Simular Loading"}
              </Button>
              
              <Button onClick={showToastExamples} variant="secondary">
                Mostrar Toasts
              </Button>
              
              <Button onClick={handleCrudOperation} variant="outline">
                Operação CRUD
              </Button>
              
              <Button 
                onClick={() => setShowContent(!showContent)}
                variant="ghost"
              >
                Toggle Animação
              </Button>
            </CardContent>
          </Card>
        </ScaleAnimation>

        {/* Skeleton Screens */}
        <ListAnimation delay={0.3}>
          <Card>
            <CardHeader>
              <CardTitle>Skeleton Screens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Dashboard Cards</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <DashboardCardSkeleton />
                  <DashboardCardSkeleton />
                  <DashboardCardSkeleton />
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Lista de Items</h3>
                <div className="space-y-3">
                  <ListItemSkeleton />
                  <ListItemSkeleton />
                  <ListItemSkeleton />
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Tabela</h3>
                <TableSkeleton rows={3} columns={4} />
              </div>
            </CardContent>
          </Card>
        </ListAnimation>

        {/* Loading States em Ação */}
        <ListAnimation delay={0.4}>
          <Card>
            <CardHeader>
              <CardTitle>Estados de Loading</CardTitle>
            </CardHeader>
            <CardContent>
              <DashboardLoading isLoading={isLoading}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium">Dados Carregados</h3>
                      <p className="text-sm text-muted-foreground">
                        Este conteúdo só aparece quando não está carregando
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium">Outro Card</h3>
                      <p className="text-sm text-muted-foreground">
                        Conteúdo do segundo card
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium">Terceiro Card</h3>
                      <p className="text-sm text-muted-foreground">
                        Mais conteúdo aqui
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </DashboardLoading>
            </CardContent>
          </Card>
        </ListAnimation>

        {/* Animações */}
        <ListAnimation delay={0.5}>
          <Card>
            <CardHeader>
              <CardTitle>Animações Suaves</CardTitle>
            </CardHeader>
            <CardContent>
              <FadeInOut show={showContent}>
                <div className="p-4 bg-muted rounded-lg">
                  <p>Este conteúdo aparece/desaparece com animação suave</p>
                </div>
              </FadeInOut>
            </CardContent>
          </Card>
        </ListAnimation>
      </div>
    </PageTransition>
  );
}

// Exemplo de uso dos hooks

/*

// 1. Hook de operação assíncrona básica
const { execute, isLoading, error } = useAsyncOperation();

const handleSave = async () => {
  const result = await execute(
    () => api.saveData(formData),
    {
      successMessage: "Dados salvos com sucesso!",
      errorMessage: "Erro ao salvar dados",
      loadingMessage: "Salvando...",
      minDuration: 1000
    }
  );
};

// 2. Hook CRUD
const { create, update, remove, isLoading } = useCrudOperations();

const handleCreate = () => create(() => api.create(data), "cliente");
const handleUpdate = () => update(() => api.update(id, data), "cliente");
const handleDelete = () => remove(() => api.delete(id), "cliente");

// 3. Formulário aprimorado
const form = useEnhancedForm(
  { name: "", email: "" },
  (data) => {
    const errors = {};
    if (!data.name) errors.name = "Nome obrigatório";
    return errors;
  }
);

const handleSubmit = () => {
  form.handleSubmit(
    (data) => api.create(data),
    { resetOnSuccess: true, itemName: "cliente" }
  );
};

// 4. Barra de progresso
const { ProgressBarComponent } = useProgressBar(isLoading, {
  label: "Processando...",
  minDuration: 2000
});

// 5. Estados de loading
<DashboardLoading isLoading={isLoading}>
  <YourContent />
</DashboardLoading>

// 6. Toasts aprimorados
enhancedToast.success("Sucesso!");
enhancedToast.error("Erro!", { description: "Detalhes do erro" });
enhancedToast.promise(
  api.call(),
  {
    loading: "Carregando...",
    success: "Sucesso!",
    error: "Erro!"
  }
);

*/