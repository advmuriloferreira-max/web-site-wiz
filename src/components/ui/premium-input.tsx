import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface PremiumInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  floatingLabel?: boolean;
}

const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ className, label, icon: Icon, error, floatingLabel = true, type, id, placeholder, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const inputId = id || React.useId();

    const handleFocus = () => setFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      setHasValue(!!e.target.value);
      props.onBlur?.(e);
    };

    const showFloatingLabel = floatingLabel && label && (focused || hasValue || !!props.value);

    return (
      <div className="relative">
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10">
              <Icon className="h-4 w-4" />
            </div>
          )}
          
          <input
            type={type}
            id={inputId}
            className={cn(
              "flex h-12 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm transition-all duration-200",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-slate-400",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500",
              "disabled:cursor-not-allowed disabled:opacity-50",
              Icon && "pl-10",
              floatingLabel && label && "pt-6 pb-2",
              error && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500",
              className
            )}
            ref={ref}
            placeholder={floatingLabel && label ? "" : placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={(e) => {
              setHasValue(!!e.target.value);
              props.onChange?.(e);
            }}
            {...props}
          />
          
          {floatingLabel && label && (
            <label
              htmlFor={inputId}
              className={cn(
                "absolute left-3 transition-all duration-200 pointer-events-none",
                Icon && "left-10",
                showFloatingLabel 
                  ? "top-2 text-xs text-blue-600 font-medium" 
                  : "top-1/2 -translate-y-1/2 text-sm text-slate-400"
              )}
            >
              {label}
            </label>
          )}
          
          {!floatingLabel && label && (
            <label 
              htmlFor={inputId}
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              {label}
            </label>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PremiumInput.displayName = "PremiumInput";

export { PremiumInput };