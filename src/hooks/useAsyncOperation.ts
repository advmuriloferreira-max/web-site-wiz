import { useState, useCallback } from "react";
import { enhancedToast } from "@/components/ui/enhanced-toast";

interface AsyncOperationOptions<T> {
  successMessage?: string | ((data: T) => string);
  errorMessage?: string | ((error: any) => string);
  loadingMessage?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  showProgress?: boolean;
  minDuration?: number;
}

export function useAsyncOperation<T = any>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async <R = T>(
    operation: () => Promise<R>,
    options: AsyncOperationOptions<R> = {}
  ): Promise<R | null> => {
    const {
      successMessage,
      errorMessage = "Ocorreu um erro durante a operação",
      loadingMessage,
      onSuccess,
      onError,
      minDuration = 0
    } = options;

    setIsLoading(true);
    setError(null);

    let loadingToastId: string | number | undefined;

    try {
      // Mostrar toast de loading se especificado
      if (loadingMessage) {
        loadingToastId = enhancedToast.loading(loadingMessage);
      }

      const startTime = Date.now();
      const result = await operation();

      // Garantir duração mínima se especificada
      if (minDuration > 0) {
        const elapsed = Date.now() - startTime;
        if (elapsed < minDuration) {
          await new Promise(resolve => setTimeout(resolve, minDuration - elapsed));
        }
      }

      // Dismiss loading toast
      if (loadingToastId) {
        enhancedToast.dismiss(loadingToastId);
      }

      // Mostrar toast de sucesso
      if (successMessage) {
        const message = typeof successMessage === 'function' 
          ? successMessage(result) 
          : successMessage;
        enhancedToast.success(message);
      }

      onSuccess?.(result);
      return result;

    } catch (err: any) {
      // Dismiss loading toast
      if (loadingToastId) {
        enhancedToast.dismiss(loadingToastId);
      }

      const errorMsg = typeof errorMessage === 'function' 
        ? errorMessage(err) 
        : errorMessage;

      setError(errorMsg);
      enhancedToast.error(errorMsg, {
        description: err?.message || "Tente novamente mais tarde"
      });

      onError?.(err);
      return null;

    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    execute,
    isLoading,
    error,
    clearError: () => setError(null)
  };
}

// Hook específico para operações CRUD
export function useCrudOperations() {
  const { execute, isLoading, error } = useAsyncOperation();

  const create = useCallback(async <T>(
    operation: () => Promise<T>,
    itemName = "registro"
  ) => {
    return execute(operation, {
      loadingMessage: `Criando ${itemName}...`,
      successMessage: `${itemName} criado com sucesso!`,
      errorMessage: `Erro ao criar ${itemName}`,
      minDuration: 500
    });
  }, [execute]);

  const update = useCallback(async <T>(
    operation: () => Promise<T>,
    itemName = "dados"
  ) => {
    return execute(operation, {
      loadingMessage: `Atualizando ${itemName}...`,
      successMessage: `${itemName} atualizado com sucesso!`,
      errorMessage: `Erro ao atualizar ${itemName}`,
      minDuration: 500
    });
  }, [execute]);

  const remove = useCallback(async <T>(
    operation: () => Promise<T>,
    itemName = "item"
  ) => {
    return execute(operation, {
      loadingMessage: `Excluindo ${itemName}...`,
      successMessage: `${itemName} excluído com sucesso!`,
      errorMessage: `Erro ao excluir ${itemName}`,
      minDuration: 500
    });
  }, [execute]);

  return {
    create,
    update,
    remove,
    isLoading,
    error
  };
}