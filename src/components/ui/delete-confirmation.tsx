import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { LegalIcons } from '@/components/ui/legal-icons';

interface DeleteConfirmationProps {
  itemName: string;
  itemType: 'cliente' | 'contrato' | 'processo' | 'acordo';
  onConfirm: () => void;
  disabled?: boolean;
  buttonVariant?: 'ghost' | 'outline';
  buttonSize?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function DeleteConfirmation({
  itemName,
  itemType,
  onConfirm,
  disabled = false,
  buttonVariant = 'ghost',
  buttonSize = 'sm',
  className
}: DeleteConfirmationProps) {
  const typeLabels = {
    cliente: 'cliente',
    contrato: 'contrato', 
    processo: 'processo',
    acordo: 'acordo'
  };

  const typeArticles = {
    cliente: 'o',
    contrato: 'o',
    processo: 'o', 
    acordo: 'o'
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={buttonVariant}
          size={buttonSize}
          disabled={disabled}
          className={`
            h-8 w-8 p-0 touch-target transition-all duration-200
            text-muted-foreground hover:text-destructive 
            hover:bg-destructive/10 border border-destructive/20
            ${className}
          `}
          aria-label={`Excluir ${typeLabels[itemType]} ${itemName}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Exclusão
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Tem certeza que deseja excluir {typeArticles[itemType]} {typeLabels[itemType]}{' '}
            <strong>"{itemName}"</strong>?
            <br />
            <br />
            <span className="text-destructive font-medium">
              Esta ação não pode ser desfeita.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="touch-target">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="
              bg-destructive hover:bg-destructive/90 
              text-destructive-foreground touch-target
              focus:ring-destructive
            "
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Componente específico para exclusão jurídica
interface LegalDeleteConfirmationProps extends Omit<DeleteConfirmationProps, 'itemType'> {
  legalImplications?: string;
  complianceNote?: boolean;
}

export function LegalDeleteConfirmation({
  itemName,
  onConfirm,
  disabled = false,
  legalImplications,
  complianceNote = true,
  className
}: LegalDeleteConfirmationProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={`
            h-8 w-8 p-0 touch-target transition-all duration-200
            text-muted-foreground hover:text-destructive 
            hover:bg-destructive/10 border border-destructive/20
            group
            ${className}
          `}
          aria-label={`Excluir ${itemName}`}
        >
          <Trash2 className="h-4 w-4 group-hover:animate-pulse" />
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <LegalIcons.warning className="h-6 w-6" />
            Exclusão de Registro Jurídico
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left space-y-3">
            <div>
              Confirma a exclusão do registro:{' '}
              <strong className="text-foreground">"{itemName}"</strong>?
            </div>
            
            {legalImplications && (
              <div className="p-3 bg-warning/10 border border-warning/30 rounded-md">
                <strong className="text-warning">Implicações Legais:</strong>
                <p className="text-sm mt-1 text-muted-foreground">
                  {legalImplications}
                </p>
              </div>
            )}
            
            {complianceNote && (
              <div className="p-3 bg-info/10 border border-info/30 rounded-md">
                <div className="flex items-center gap-2 text-info">
                  <LegalIcons.compliance className="h-4 w-4" />
                  <strong className="text-sm">Conformidade BCB</strong>
                </div>
                <p className="text-xs mt-1 text-muted-foreground">
                  Esta operação será registrada para auditoria conforme normativas do Banco Central.
                </p>
              </div>
            )}
            
            <div className="text-destructive font-medium text-sm border-t pt-3">
              ⚠️ Esta ação é irreversível
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="touch-target flex-1">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="
              bg-destructive hover:bg-destructive/90 
              text-destructive-foreground touch-target
              focus:ring-destructive flex-1
            "
          >
            <LegalIcons.justice className="h-4 w-4 mr-2" />
            Confirmar Exclusão
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}