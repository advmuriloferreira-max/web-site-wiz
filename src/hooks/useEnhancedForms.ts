import { useState } from "react";
import { useCrudOperations } from "./useAsyncOperation";
import { enhancedToast } from "@/components/ui/enhanced-toast";

interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  isDirty: boolean;
}

export function useEnhancedForm<T extends Record<string, any>>(
  initialData: T,
  validationSchema?: (data: T) => Record<string, string>
) {
  const [formState, setFormState] = useState<FormState<T>>({
    data: initialData,
    errors: {},
    isDirty: false
  });

  const { create, update, remove, isLoading } = useCrudOperations();

  const updateField = (field: keyof T, value: any) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      isDirty: true,
      errors: { ...prev.errors, [field]: "" } // Clear field error
    }));
  };

  const validate = (): boolean => {
    if (!validationSchema) return true;
    
    const errors = validationSchema(formState.data);
    setFormState(prev => ({ ...prev, errors }));
    
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      enhancedToast.warning("Verifique os campos obrigatórios", {
        description: "Alguns campos precisam ser corrigidos"
      });
    }
    
    return !hasErrors;
  };

  const handleSubmit = async (
    operation: (data: T) => Promise<any>,
    options?: {
      successMessage?: string;
      resetOnSuccess?: boolean;
      itemName?: string;
    }
  ) => {
    if (!validate()) return false;

    const result = await create(
      () => operation(formState.data),
      options?.itemName
    );

    if (result && options?.resetOnSuccess) {
      setFormState({
        data: initialData,
        errors: {},
        isDirty: false
      });
    }

    return !!result;
  };

  const handleUpdate = async (
    operation: (data: T) => Promise<any>,
    options?: {
      successMessage?: string;
      itemName?: string;
    }
  ) => {
    if (!validate()) return false;

    const result = await update(
      () => operation(formState.data),
      options?.itemName
    );

    if (result) {
      setFormState(prev => ({ ...prev, isDirty: false }));
    }

    return !!result;
  };

  const reset = () => {
    setFormState({
      data: initialData,
      errors: {},
      isDirty: false
    });
  };

  return {
    ...formState,
    updateField,
    handleSubmit,
    handleUpdate,
    validate,
    reset,
    isLoading,
    setErrors: (errors: Record<string, string>) =>
      setFormState(prev => ({ ...prev, errors }))
  };
}