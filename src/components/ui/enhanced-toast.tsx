import { toast as sonnerToast } from "sonner";
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Info, 
  Loader2,
  Upload,
  Download,
  Save,
  Trash2
} from "lucide-react";

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  loading: Loader2,
  upload: Upload,
  download: Download,
  save: Save,
  delete: Trash2,
};

export const enhancedToast = {
  success: (message: string, options?: ToastOptions) => {
    const Icon = toastIcons.success;
    return sonnerToast(message, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      icon: <Icon className="h-4 w-4 text-green-600" />,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    const Icon = toastIcons.error;
    return sonnerToast(message, {
      description: options?.description,
      duration: options?.duration ?? 6000,
      icon: <Icon className="h-4 w-4 text-red-600" />,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    const Icon = toastIcons.warning;
    return sonnerToast(message, {
      description: options?.description,
      duration: options?.duration ?? 5000,
      icon: <Icon className="h-4 w-4 text-yellow-600" />,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    const Icon = toastIcons.info;
    return sonnerToast(message, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      icon: <Icon className="h-4 w-4 text-blue-600" />,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  },

  loading: (message: string, options?: Omit<ToastOptions, 'duration'>) => {
    const Icon = toastIcons.loading;
    return sonnerToast(message, {
      description: options?.description,
      duration: Infinity,
      icon: <Icon className="h-4 w-4 animate-spin text-primary" />,
    });
  },

  // Toasts específicos para ações
  save: {
    loading: () => enhancedToast.loading("Salvando dados...", {
      description: "Aguarde enquanto salvamos suas informações"
    }),
    success: () => enhancedToast.success("Dados salvos com sucesso!", {
      description: "Suas informações foram salvas com segurança"
    }),
    error: () => enhancedToast.error("Erro ao salvar dados", {
      description: "Tente novamente ou entre em contato com o suporte"
    })
  },

  upload: {
    loading: () => enhancedToast.loading("Enviando arquivo...", {
      description: "Upload em progresso, não feche a página"
    }),
    success: (fileName?: string) => enhancedToast.success("Arquivo enviado!", {
      description: fileName ? `${fileName} foi enviado com sucesso` : "Upload concluído"
    }),
    error: () => enhancedToast.error("Erro no upload", {
      description: "Verifique o arquivo e tente novamente"
    })
  },

  delete: {
    loading: () => enhancedToast.loading("Excluindo...", {
      description: "Removendo item selecionado"
    }),
    success: () => enhancedToast.success("Item excluído!", {
      description: "O item foi removido permanentemente"
    }),
    error: () => enhancedToast.error("Erro ao excluir", {
      description: "Não foi possível remover o item"
    })
  },

  // Dismiss toast
  dismiss: (toastId: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  // Promise toast for async operations
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    });
  }
};

// Hook para toasts de operações CRUD
export function useCrudToasts() {
  return {
    create: {
      loading: () => enhancedToast.loading("Criando registro..."),
      success: (item?: string) => 
        enhancedToast.success(`${item || "Registro"} criado com sucesso!`),
      error: () => enhancedToast.error("Erro ao criar registro")
    },
    
    update: {
      loading: () => enhancedToast.loading("Atualizando dados..."),
      success: (item?: string) => 
        enhancedToast.success(`${item || "Dados"} atualizado com sucesso!`),
      error: () => enhancedToast.error("Erro ao atualizar dados")
    },
    
    delete: {
      loading: () => enhancedToast.loading("Excluindo..."),
      success: (item?: string) => 
        enhancedToast.success(`${item || "Item"} excluído com sucesso!`),
      error: () => enhancedToast.error("Erro ao excluir item")
    }
  };
}