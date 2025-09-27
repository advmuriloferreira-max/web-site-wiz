import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, XCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 pr-8 shadow-2xl transition-all duration-300 backdrop-blur-md",
  {
    variants: {
      variant: {
        default: "bg-white/90 border-slate-200 text-slate-800",
        success: "bg-emerald-50/90 border-emerald-200 text-emerald-800",
        warning: "bg-amber-50/90 border-amber-200 text-amber-800", 
        error: "bg-red-50/90 border-red-200 text-red-800",
        info: "bg-blue-50/90 border-blue-200 text-blue-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const iconMap = {
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
  info: Info,
  default: Info,
};

const colorMap = {
  success: "text-emerald-500",
  warning: "text-amber-500",
  error: "text-red-500", 
  info: "text-blue-500",
  default: "text-slate-500",
};

export interface PremiumToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  onClose?: () => void;
  showProgress?: boolean;
  duration?: number;
}

const PremiumToast = React.forwardRef<HTMLDivElement, PremiumToastProps>(
  ({ 
    className, 
    variant, 
    title, 
    description, 
    action, 
    onClose, 
    showProgress = false,
    duration = 4000,
    ...props 
  }, ref) => {
    const [progress, setProgress] = React.useState(100);
    const Icon = iconMap[variant || "default"];
    const iconColor = colorMap[variant || "default"];

    React.useEffect(() => {
      if (showProgress && duration > 0) {
        const interval = setInterval(() => {
          setProgress((prev) => {
            const newProgress = prev - (100 / (duration / 100));
            if (newProgress <= 0) {
              clearInterval(interval);
              onClose?.();
              return 0;
            }
            return newProgress;
          });
        }, 100);

        return () => clearInterval(interval);
      }
    }, [showProgress, duration, onClose]);

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        {/* Progress bar */}
        {showProgress && (
          <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        )}
        
        <div className="flex items-start space-x-3 flex-1">
          <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", iconColor)} />
          <div className="flex-1 space-y-1">
            {title && (
              <div className="text-sm font-semibold leading-none tracking-tight">
                {title}
              </div>
            )}
            {description && (
              <div className="text-sm opacity-90 leading-relaxed">
                {description}
              </div>
            )}
            {action && (
              <div className="mt-3">
                {action}
              </div>
            )}
          </div>
        </div>

        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-black/10 rounded-full"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }
);

PremiumToast.displayName = "PremiumToast";

export { PremiumToast, toastVariants };