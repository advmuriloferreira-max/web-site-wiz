import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResponsiveFormProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}

export function ResponsiveForm({ 
  children, 
  title, 
  description, 
  className,
  columns = { default: 1, md: 2 }
}: ResponsiveFormProps) {
  const gridClasses = [
    columns.default && `grid-cols-${columns.default}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
  ].filter(Boolean).join(' ');

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      {(title || description) && (
        <CardHeader className="pb-6">
          {title && (
            <CardTitle className="text-xl md:text-2xl font-bold text-slate-800">
              {title}
            </CardTitle>
          )}
          {description && (
            <p className="text-sm md:text-base text-slate-600 mt-2">
              {description}
            </p>
          )}
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        <div className={cn("grid gap-4 md:gap-6", gridClasses)}>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

interface FormFieldGroupProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  fullWidth?: boolean;
}

export function FormFieldGroup({ 
  children, 
  title, 
  description, 
  className,
  fullWidth = false 
}: FormFieldGroupProps) {
  return (
    <div className={cn(
      "space-y-4",
      fullWidth && "md:col-span-full",
      className
    )}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-base md:text-lg font-semibold text-slate-800">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-slate-600">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-3 md:space-y-4">
        {children}
      </div>
    </div>
  );
}

interface MobileFormActionsProps {
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

export function MobileFormActions({ 
  children, 
  className, 
  sticky = false 
}: MobileFormActionsProps) {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row gap-3 sm:gap-2",
      "p-4 sm:p-6",
      sticky && [
        "sticky bottom-0 bg-white/95 backdrop-blur-sm",
        "border-t border-slate-200 mt-6 -mx-4 sm:-mx-6"
      ],
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  fullWidth?: boolean;
}

export function ResponsiveInput({ 
  label, 
  error, 
  helper, 
  fullWidth = false,
  className,
  ...props 
}: ResponsiveInputProps) {
  return (
    <div className={cn(
      "space-y-2",
      fullWidth && "col-span-full"
    )}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full px-3 py-3 md:py-2.5",
          "text-base md:text-sm", // Larger text on mobile prevents zoom
          "border border-slate-300 rounded-lg",
          "bg-white focus:bg-white",
          "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
          "transition-all duration-200",
          "disabled:bg-slate-50 disabled:cursor-not-allowed",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
      {(error || helper) && (
        <div className="space-y-1">
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {helper && !error && (
            <p className="text-sm text-slate-500">{helper}</p>
          )}
        </div>
      )}
    </div>
  );
}

interface ResponsiveTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  fullWidth?: boolean;
}

export function ResponsiveTextarea({ 
  label, 
  error, 
  helper, 
  fullWidth = false,
  className,
  ...props 
}: ResponsiveTextareaProps) {
  return (
    <div className={cn(
      "space-y-2",
      fullWidth && "col-span-full"
    )}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          "w-full px-3 py-3 md:py-2.5",
          "text-base md:text-sm", // Larger text on mobile
          "border border-slate-300 rounded-lg",
          "bg-white focus:bg-white",
          "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
          "transition-all duration-200",
          "disabled:bg-slate-50 disabled:cursor-not-allowed",
          "min-h-[100px] resize-y",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
      {(error || helper) && (
        <div className="space-y-1">
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {helper && !error && (
            <p className="text-sm text-slate-500">{helper}</p>
          )}
        </div>
      )}
    </div>
  );
}