import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LegalIcons } from '@/components/ui/legal-icons';
import { Loader2, Save, Send, Check, X, Calculator, Eye, Edit, Trash2, Download, Share, MoreHorizontal } from 'lucide-react';

// Botão com indicador de loading
interface LoadingButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  loadingText?: string;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function LoadingButton({
  loading = false,
  children,
  loadingText = "Carregando...",
  onClick,
  variant = 'default',
  size = 'default',
  className,
  disabled = false,
  type = 'button'
}: LoadingButtonProps) {
  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={loading || disabled}
      className={cn('touch-target', className)}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

// Botão jurídico especializado
interface LegalButtonProps {
  action: 'save' | 'submit' | 'approve' | 'reject' | 'calculate' | 'generate';
  children?: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function LegalButton({
  action,
  children,
  loading = false,
  onClick,
  className,
  size = 'md',
  disabled = false
}: LegalButtonProps) {
  const getActionConfig = (action: string) => {
    switch (action) {
      case 'save':
        return {
          variant: 'default' as const,
          icon: <Save className="h-4 w-4" />,
          text: 'Salvar',
          loadingText: 'Salvando...'
        };
      case 'submit':
        return {
          variant: 'default' as const,
          icon: <Send className="h-4 w-4" />,
          text: 'Enviar',
          loadingText: 'Enviando...'
        };
      case 'approve':
        return {
          variant: 'default' as const,
          icon: <Check className="h-4 w-4" />,
          text: 'Aprovar',
          loadingText: 'Aprovando...'
        };
      case 'reject':
        return {
          variant: 'destructive' as const,
          icon: <X className="h-4 w-4" />,
          text: 'Rejeitar',
          loadingText: 'Rejeitando...'
        };
      case 'calculate':
        return {
          variant: 'outline' as const,
          icon: <Calculator className="h-4 w-4" />,
          text: 'Calcular',
          loadingText: 'Calculando...'
        };
      case 'generate':
        return {
          variant: 'outline' as const,
          icon: <LegalIcons.document className="h-4 w-4" />,
          text: 'Gerar',
          loadingText: 'Gerando...'
        };
      default:
        return {
          variant: 'default' as const,
          icon: null,
          text: 'Ação',
          loadingText: 'Processando...'
        };
    }
  };

  const config = getActionConfig(action);
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <Button
      variant={config.variant}
      onClick={onClick}
      disabled={loading || disabled}
      className={cn(
        'touch-target transition-all duration-200',
        sizeClasses[size],
        className
      )}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {config.loadingText}
        </>
      ) : (
        <>
          {config.icon && (
            <span className="mr-2">{config.icon}</span>
          )}
          {children || config.text}
        </>
      )}
    </Button>
  );
}

// Botões de ação rápida para tabelas
interface QuickActionButtonProps {
  action: 'view' | 'edit' | 'delete' | 'download' | 'share';
  onClick: () => void;
  tooltip?: string;
  className?: string;
  disabled?: boolean;
}

export function QuickActionButton({
  action,
  onClick,
  tooltip,
  className,
  disabled = false
}: QuickActionButtonProps) {
  const getActionConfig = (action: string) => {
    switch (action) {
      case 'view':
        return {
          icon: <Eye className="h-4 w-4" />,
          variant: 'ghost' as const,
          hoverColor: 'hover:bg-primary/10'
        };
      case 'edit':
        return {
          icon: <Edit className="h-4 w-4" />,
          variant: 'ghost' as const,
          hoverColor: 'hover:bg-accent/10'
        };
      case 'delete':
        return {
          icon: <Trash2 className="h-4 w-4" />,
          variant: 'ghost' as const,
          hoverColor: 'hover:bg-destructive/10 text-destructive'
        };
      case 'download':
        return {
          icon: <Download className="h-4 w-4" />,
          variant: 'ghost' as const,
          hoverColor: 'hover:bg-success/10'
        };
      case 'share':
        return {
          icon: <Share className="h-4 w-4" />,
          variant: 'ghost' as const,
          hoverColor: 'hover:bg-info/10'
        };
      default:
        return {
          icon: <MoreHorizontal className="h-4 w-4" />,
          variant: 'ghost' as const,
          hoverColor: 'hover:bg-muted'
        };
    }
  };

  const config = getActionConfig(action);

  return (
    <Button
      variant={config.variant}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-8 w-8 p-0 touch-target transition-all duration-200',
        config.hoverColor,
        className
      )}
      title={tooltip}
      aria-label={tooltip || `Ação ${action}`}
    >
      {config.icon}
    </Button>
  );
}

// Grupo de botões com espaçamento adequado
interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'tight' | 'normal' | 'loose';
  className?: string;
}

export function ButtonGroup({
  children,
  orientation = 'horizontal',
  spacing = 'normal',
  className
}: ButtonGroupProps) {
  const spacingClasses = {
    tight: orientation === 'horizontal' ? 'space-x-1' : 'space-y-1',
    normal: orientation === 'horizontal' ? 'space-x-3' : 'space-y-3',
    loose: orientation === 'horizontal' ? 'space-x-6' : 'space-y-6'
  };

  return (
    <div className={cn(
      'flex',
      orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col',
      spacingClasses[spacing],
      className
    )}>
      {children}
    </div>
  );
}