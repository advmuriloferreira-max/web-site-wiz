import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfessionalModalProps {
  trigger?: React.ReactNode;
  title: string;
  description?: string;  
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md", 
  lg: "max-w-lg",
  xl: "max-w-2xl",
  full: "max-w-[95vw] w-full h-[95vh]"
};

export function ProfessionalModal({
  trigger,
  title,
  description,
  children,
  open,
  onOpenChange,
  size = "md",
  className,
  showCloseButton = true
}: ProfessionalModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent 
        className={cn(
          "glass-modal border-border shadow-premium-2xl animate-fade-in",
          sizeClasses[size],
          className
        )}
      >
        <DialogHeader className="space-y-3 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <DialogTitle className="title-main pr-8">{title}</DialogTitle>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => onOpenChange?.(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </Button>
            )}
          </div>
          {description && (
            <DialogDescription className="text-body text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="padding-content overflow-y-auto max-h-[calc(95vh-200px)]">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmationModal({
  trigger,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "destructive",
  open,
  onOpenChange
}: {
  trigger?: React.ReactNode;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange?.(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  return (
    <ProfessionalModal
      trigger={trigger}
      title={title}
      description={description}
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
    >
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={handleCancel}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={handleConfirm}>
          {confirmText}
        </Button>
      </div>
    </ProfessionalModal>
  );
}