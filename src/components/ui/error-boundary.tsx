import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LegalIcons } from '@/components/ui/legal-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-2xl mx-auto shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <LegalIcons.justice className="h-16 w-16 text-accent" />
                  <div className="absolute -bottom-1 -right-1 bg-destructive rounded-full p-1">
                    <AlertTriangle className="h-4 w-4 text-destructive-foreground" />
                  </div>
                </div>
              </div>
              
              <CardTitle className="text-2xl font-bold text-destructive mb-2">
                Erro no Sistema Jurídico
              </CardTitle>
              
              <p className="text-muted-foreground">
                Ocorreu um erro inesperado no sistema. Nossa equipe técnica foi notificada.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error details for development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-muted p-4 rounded-lg border">
                  <summary className="cursor-pointer font-medium text-sm mb-2">
                    Detalhes técnicos (desenvolvimento)
                  </summary>
                  <div className="text-xs font-mono text-muted-foreground space-y-2">
                    <div>
                      <strong>Erro:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap bg-background p-2 rounded border overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}
              
              {/* User-friendly actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={this.handleReset} 
                  variant="outline" 
                  className="flex-1 flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar Novamente
                </Button>
                
                <Button 
                  onClick={this.handleReload} 
                  className="flex-1 flex items-center gap-2"
                >
                  <LegalIcons.dashboard className="h-4 w-4" />
                  Recarregar Sistema
                </Button>
              </div>
              
              <div className="text-center text-sm text-muted-foreground border-t pt-4">
                <p>Se o problema persistir, entre em contato com o suporte técnico.</p>
                <p className="mt-1">
                  <strong>Código do Erro:</strong> {Date.now()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para capturar erros assíncronos
export function useErrorHandler() {
  return (error: Error, errorInfo?: string) => {
    console.error('Erro assíncrono capturado:', error, errorInfo);
    
    // Em produção, enviar para serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      // Exemplo: Sentry.captureException(error);
    }
  };
}

// Componente para estados de erro específicos
interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export function ErrorState({ 
  title = "Algo deu errado",
  description = "Ocorreu um erro inesperado. Tente novamente.",
  action,
  icon
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="text-destructive">
        {icon || <AlertTriangle className="h-12 w-12" />}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground max-w-md">{description}</p>
      </div>
      
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}