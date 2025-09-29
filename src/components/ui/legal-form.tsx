import { cn } from "@/lib/utils";
import { LegalIcons } from "@/components/ui/legal-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface LegalFormProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  onSubmit?: (e: React.FormEvent) => void;
}

export function LegalForm({ title, children, className, onSubmit }: LegalFormProps) {
  return (
    <Card className={cn("executive-card", className)}>
      <CardHeader className="border-b-2 border-accent/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardTitle className="flex items-center space-x-3">
          <LegalIcons.document className="h-6 w-6 text-primary" />
          <span className="text-primary">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="padding-content">
        <form onSubmit={onSubmit} className="space-content">
          {children}
        </form>
      </CardContent>
    </Card>
  );
}

interface LegalFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  help?: string;
  className?: string;
}

export function LegalField({ label, required, children, help, className }: LegalFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-label flex items-center space-x-1">
        <span>{label}</span>
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {help && (
        <p className="text-xs text-muted-foreground flex items-start space-x-1">
          <LegalIcons.compliance className="h-3 w-3 mt-0.5 text-accent" />
          <span>{help}</span>
        </p>
      )}
    </div>
  );
}

interface LegalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  help?: string;
}

export function LegalInput({ label, required, help, className, ...props }: LegalInputProps) {
  return (
    <LegalField label={label} required={required} help={help}>
      <Input 
        className={cn("border-2 focus:border-accent", className)} 
        {...props} 
      />
    </LegalField>
  );
}

interface LegalTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  help?: string;
}

export function LegalTextarea({ label, required, help, className, ...props }: LegalTextareaProps) {
  return (
    <LegalField label={label} required={required} help={help}>
      <Textarea 
        className={cn("border-2 focus:border-accent min-h-[100px]", className)} 
        {...props} 
      />
    </LegalField>
  );
}

interface LegalFormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function LegalFormActions({ children, className }: LegalFormActionsProps) {
  return (
    <div className={cn(
      "flex items-center justify-end space-x-3 pt-6 border-t-2 border-accent/20", 
      className
    )}>
      {children}
    </div>
  );
}

interface LegalSubmitButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function LegalSubmitButton({ children, loading, className }: LegalSubmitButtonProps) {
  return (
    <Button 
      type="submit" 
      disabled={loading}
      className={cn(
        "bg-primary hover:bg-primary-hover text-white px-8 py-3 font-semibold uppercase tracking-wider border-2 border-primary",
        className
      )}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          <span>Processando...</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
}