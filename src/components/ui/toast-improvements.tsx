import { toast } from "sonner";
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

// Enhanced toast functions with consistent design
export const enhancedToast = {
  success: (message: string, options?: { description?: string; duration?: number }) => {
    return toast.success(message, {
      description: options?.description,
      duration: options?.duration || 3000,
      icon: <CheckCircle className="h-4 w-4" />,
      className: "bg-success/10 border-success text-success-foreground",
    });
  },

  error: (message: string, options?: { description?: string; duration?: number }) => {
    return toast.error(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      icon: <XCircle className="h-4 w-4" />,
      className: "bg-destructive/10 border-destructive text-destructive-foreground",
    });
  },

  warning: (message: string, options?: { description?: string; duration?: number }) => {
    return toast.warning(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <AlertTriangle className="h-4 w-4" />,
      className: "bg-warning/10 border-warning text-warning-foreground",
    });
  },

  info: (message: string, options?: { description?: string; duration?: number }) => {
    return toast.info(message, {
      description: options?.description,
      duration: options?.duration || 3000,
      icon: <Info className="h-4 w-4" />,
      className: "bg-info/10 border-info text-info-foreground",
    });
  },

  // Legal-specific toasts
  legal: {
    compliance: (message: string) => {
      return toast.success(message, {
        description: "Sistema em conformidade com as normas BCB",
        icon: <CheckCircle className="h-4 w-4" />,
        className: "bg-success/10 border-success text-success-foreground",
      });
    },

    calculation: (message: string) => {
      return toast.info(message, {
        description: "Cálculo realizado conforme Resoluções BCB 352/2023 e 4966/2021",
        icon: <Info className="h-4 w-4" />,
        className: "bg-info/10 border-info text-info-foreground",
      });
    },

    validation: (message: string) => {
      return toast.warning(message, {
        description: "Verifique os dados antes de prosseguir",
        icon: <AlertTriangle className="h-4 w-4" />,
        className: "bg-warning/10 border-warning text-warning-foreground",
      });
    },

    security: (message: string) => {
      return toast.error(message, {
        description: "Ação restrita por questões de segurança",
        icon: <XCircle className="h-4 w-4" />,
        className: "bg-destructive/10 border-destructive text-destructive-foreground",
      });
    }
  }
};

// Promise-based toast for async operations
export const promiseToast = {
  async: async <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading: options.loading,
      success: typeof options.success === 'string' 
        ? options.success 
        : options.success,
      error: typeof options.error === 'string' 
        ? options.error 
        : options.error,
    });
  }
};