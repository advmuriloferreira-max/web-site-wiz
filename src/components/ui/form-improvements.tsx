import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Eye, EyeOff, Save, X } from 'lucide-react';
import { LegalIcons } from '@/components/ui/legal-icons';

// Hook para validação de formulários
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, (value: any) => string | null>>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = useCallback((field: keyof T, value: any) => {
    const rule = validationRules[field];
    if (rule) {
      const error = rule(value);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
      return error === null;
    }
    return true;
  }, [validationRules]);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  }, [validateField]);

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validateAll = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const key = field as keyof T;
      const rule = validationRules[key];
      if (rule) {
        const error = rule(values[key]);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules]);

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateAll,
    isValid: Object.keys(errors).length === 0
  };
}

// Campo de entrada melhorado
interface EnhancedInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  className?: string;
}

export function EnhancedInput({
  label,
  value,
  onChange,
  onBlur,
  error,
  touched,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  description,
  className
}: EnhancedInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const hasError = touched && error;
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={cn("space-y-2", className)}>
      <Label 
        htmlFor={label} 
        className={cn(
          "text-sm font-medium",
          required && "after:content-['*'] after:ml-0.5 after:text-destructive",
          hasError && "text-destructive"
        )}
      >
        {label}
      </Label>
      
      <div className="relative">
        <Input
          id={label}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "touch-target transition-colors",
            hasError && "border-destructive focus:border-destructive",
            type === 'password' && "pr-10"
          )}
          aria-invalid={hasError ? true : false}
          aria-describedby={
            hasError ? `${label}-error` : description ? `${label}-description` : undefined
          }
        />
        
        {type === 'password' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>
      
      {description && !hasError && (
        <p id={`${label}-description`} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      
      {hasError && (
        <p 
          id={`${label}-error`} 
          className="text-xs text-destructive flex items-center gap-1"
          role="alert"
        >
          <AlertTriangle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// Container de formulário legal
interface LegalFormContainerProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitText?: string;
  className?: string;
}

export function LegalFormContainer({
  children,
  title,
  description,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitText = "Salvar",
  className
}: LegalFormContainerProps) {
  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <LegalIcons.justice className="h-6 w-6 text-accent" />
          <div>
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {children}
          
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial touch-target"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial touch-target"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {submitText}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Indicador de progresso de formulário
interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: { title: string; description?: string }[];
  className?: string;
}

export function FormProgress({ 
  currentStep, 
  totalSteps, 
  steps,
  className 
}: FormProgressProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Barra de progresso */}
      <div className="relative">
        <div className="overflow-hidden h-2 text-xs flex rounded bg-muted">
          <div 
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="absolute -top-1 right-0 text-xs text-muted-foreground">
          {currentStep}/{totalSteps}
        </div>
      </div>
      
      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div 
              key={index}
              className={cn(
                "flex items-center gap-2 p-2 rounded text-sm",
                isCompleted && "text-success bg-success/10",
                isCurrent && "text-primary bg-primary/10 font-medium",
                !isCompleted && !isCurrent && "text-muted-foreground"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                isCompleted && "bg-success text-success-foreground",
                isCurrent && "bg-primary text-primary-foreground",
                !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
              )}>
                {isCompleted ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  stepNumber
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="truncate">{step.title}</div>
                {step.description && (
                  <div className="text-xs text-muted-foreground truncate">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Validadores comuns
export const validators = {
  required: (message = "Este campo é obrigatório") => (value: any) =>
    !value || (typeof value === 'string' && value.trim() === '') ? message : null,
  
  email: (message = "Email inválido") => (value: string) =>
    value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? message : null,
  
  cpf: (message = "CPF inválido") => (value: string) => {
    if (!value) return null;
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 11) return message;
    // Validação básica de CPF
    return null;
  },
  
  cnpj: (message = "CNPJ inválido") => (value: string) => {
    if (!value) return null;
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 14) return message;
    return null;
  },
  
  minLength: (min: number, message?: string) => (value: string) =>
    value && value.length < min ? (message || `Mínimo de ${min} caracteres`) : null,
  
  maxLength: (max: number, message?: string) => (value: string) =>
    value && value.length > max ? (message || `Máximo de ${max} caracteres`) : null,
    
  currency: (message = "Valor monetário inválido") => (value: string) => {
    if (!value) return null;
    const numericValue = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'));
    return isNaN(numericValue) || numericValue < 0 ? message : null;
  }
};