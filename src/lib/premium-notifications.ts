import { toast } from "sonner";
import { CheckCircle, AlertCircle, XCircle, Info, Zap } from "lucide-react";
import React from "react";

export interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class PremiumNotifications {
  private defaultDuration = 4000;

  success(message: string, options?: NotificationOptions) {
    return toast.success(message, {
      duration: options?.duration || this.defaultDuration,
      description: options?.description,
      icon: React.createElement(CheckCircle, { className: "h-4 w-4 text-emerald-500" }),
      className: "bg-emerald-50/90 border-emerald-200 text-emerald-800 backdrop-blur-md shadow-xl",
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  }

  error(message: string, options?: NotificationOptions) {
    return toast.error(message, {
      duration: options?.duration || this.defaultDuration,
      description: options?.description,
      icon: React.createElement(XCircle, { className: "h-4 w-4 text-red-500" }),
      className: "bg-red-50/90 border-red-200 text-red-800 backdrop-blur-md shadow-xl",
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  }

  warning(message: string, options?: NotificationOptions) {
    return toast.warning(message, {
      duration: options?.duration || this.defaultDuration,
      description: options?.description,
      icon: React.createElement(AlertCircle, { className: "h-4 w-4 text-amber-500" }),
      className: "bg-amber-50/90 border-amber-200 text-amber-800 backdrop-blur-md shadow-xl",
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  }

  info(message: string, options?: NotificationOptions) {
    return toast.info(message, {
      duration: options?.duration || this.defaultDuration,
      description: options?.description,
      icon: React.createElement(Info, { className: "h-4 w-4 text-blue-500" }),
      className: "bg-blue-50/90 border-blue-200 text-blue-800 backdrop-blur-md shadow-xl",
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  }

  loading(message: string, options?: Omit<NotificationOptions, "duration">) {
    return toast.loading(message, {
      description: options?.description,
      icon: React.createElement(Zap, { className: "h-4 w-4 text-blue-500 animate-pulse" }),
      className: "bg-slate-50/90 border-slate-200 text-slate-800 backdrop-blur-md shadow-xl",
    });
  }

  promise<T>(
    promise: Promise<T>,
    {
      loading: loadingMessage,
      success: successMessage,
      error: errorMessage,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) {
    return toast.promise(promise, {
      loading: loadingMessage,
      success: successMessage,
      error: errorMessage,
      className: "backdrop-blur-md shadow-xl",
    });
  }

  dismiss(toastId?: string | number) {
    toast.dismiss(toastId);
  }

  dismissAll() {
    toast.dismiss();
  }

  // Custom themed notifications
  branded(message: string, options?: NotificationOptions) {
    return toast(message, {
      duration: options?.duration || this.defaultDuration,
      description: options?.description,
      icon: React.createElement(Zap, { className: "h-4 w-4 text-blue-500" }),
      className: "bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border-blue-200 text-blue-800 backdrop-blur-md shadow-xl",
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  }

  // Convenience methods for common operations
  saved(entity: string = "item") {
    return this.success(`${entity} salvo com sucesso!`);
  }

  deleted(entity: string = "item") {
    return this.success(`${entity} excluído com sucesso!`);
  }

  updated(entity: string = "item") {
    return this.success(`${entity} atualizado com sucesso!`);
  }

  created(entity: string = "item") {
    return this.success(`${entity} criado com sucesso!`);
  }

  notFound(entity: string = "item") {
    return this.error(`${entity} não encontrado.`);
  }

  permissionDenied() {
    return this.error("Você não tem permissão para realizar esta ação.");
  }

  networkError() {
    return this.error("Erro de conexão. Verifique sua internet e tente novamente.");
  }

  validationError(message?: string) {
    return this.warning(message || "Verifique os campos obrigatórios.");
  }

  comingSoon(feature?: string) {
    return this.info(
      feature ? `${feature} em breve!` : "Funcionalidade em desenvolvimento.",
      {
        description: "Estamos trabalhando nisso. Fique ligado!",
      }
    );
  }
}

export const notifications = new PremiumNotifications();

// Re-export for convenience
export default notifications;