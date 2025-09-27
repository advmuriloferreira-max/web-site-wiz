import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-slate-50 text-slate-800 border-slate-200",
        success: "bg-emerald-50 text-emerald-800 border-emerald-200",
        warning: "bg-amber-50 text-amber-800 border-amber-200",
        error: "bg-red-50 text-red-800 border-red-200",
        info: "bg-blue-50 text-blue-800 border-blue-200",
      },
      size: {
        default: "px-4 py-3",
        sm: "px-3 py-2 text-xs",
        lg: "px-6 py-4 text-base",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const iconMap = {
  default: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const iconColorMap = {
  default: "text-slate-500",
  success: "text-emerald-500",
  warning: "text-amber-500", 
  error: "text-red-500",
  info: "text-blue-500",
};

export interface PremiumAlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: boolean;
}

const PremiumAlert = React.forwardRef<HTMLDivElement, PremiumAlertProps>(
  ({ 
    className, 
    variant, 
    size,
    title, 
    children, 
    dismissible = false, 
    onDismiss, 
    icon = true,
    ...props 
  }, ref) => {
    const Icon = iconMap[variant || "default"];
    const iconColor = iconColorMap[variant || "default"];

    return (
      <div
        ref={ref}
        className={cn(alertVariants({ variant, size }), className)}
        {...props}
      >
        <div className="flex items-start space-x-3">
          {icon && (
            <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", iconColor)} />
          )}
          
          <div className="flex-1 space-y-1">
            {title && (
              <div className="font-medium leading-none tracking-tight">
                {title}
              </div>
            )}
            {children && (
              <div className="leading-relaxed [&_p]:leading-relaxed">
                {children}
              </div>
            )}
          </div>

          {dismissible && onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-black/10 rounded-full flex-shrink-0"
              onClick={onDismiss}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }
);

PremiumAlert.displayName = "PremiumAlert";

// Specialized alert components
export function SuccessAlert({ children, ...props }: Omit<PremiumAlertProps, "variant">) {
  return (
    <PremiumAlert variant="success" {...props}>
      {children}
    </PremiumAlert>
  );
}

export function WarningAlert({ children, ...props }: Omit<PremiumAlertProps, "variant">) {
  return (
    <PremiumAlert variant="warning" {...props}>
      {children}
    </PremiumAlert>
  );
}

export function ErrorAlert({ children, ...props }: Omit<PremiumAlertProps, "variant">) {
  return (
    <PremiumAlert variant="error" {...props}>
      {children}
    </PremiumAlert>
  );
}

export function InfoAlert({ children, ...props }: Omit<PremiumAlertProps, "variant">) {
  return (
    <PremiumAlert variant="info" {...props}>
      {children}
    </PremiumAlert>
  );
}

// Banner alert for important system-wide messages
interface BannerAlertProps extends PremiumAlertProps {
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function BannerAlert({ 
  action, 
  children, 
  className,
  ...props 
}: BannerAlertProps) {
  return (
    <PremiumAlert 
      className={cn(
        "rounded-none border-x-0 border-t-0 bg-gradient-to-r shadow-sm",
        className
      )} 
      {...props}
    >
      <div className="flex items-center justify-between">
        <div>{children}</div>
        {action && (
          <Button
            variant="outline"
            size="sm"
            onClick={action.onClick}
            className="ml-4 flex-shrink-0"
          >
            {action.label}
          </Button>
        )}
      </div>
    </PremiumAlert>
  );
}

export { PremiumAlert, alertVariants };