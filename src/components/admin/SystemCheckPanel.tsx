import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { runSystemCheck, SystemCheckResult } from '@/utils/systemCheck';
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, Code } from 'lucide-react';

export function SystemCheckPanel() {
  const [checks, setChecks] = useState<SystemCheckResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);

  const handleRunCheck = async () => {
    setIsLoading(true);
    try {
      const results = await runSystemCheck();
      setChecks(results);
    } catch (error) {
      console.error('Erro ao executar verificação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-success/20 text-success border-success/30">Sucesso</Badge>;
      case 'warning':
        return <Badge className="bg-warning/20 text-warning border-warning/30">Aviso</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return null;
    }
  };

  const successCount = checks.filter(c => c.status === 'success').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  const errorCount = checks.filter(c => c.status === 'error').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Code className="h-6 w-6" />
                Verificação do Sistema Multi-Tenant
              </CardTitle>
              <CardDescription>
                Diagnóstico completo da arquitetura de isolamento de dados
              </CardDescription>
            </div>
            <Button 
              onClick={handleRunCheck} 
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Executar Verificação
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {checks.length > 0 && (
          <CardContent className="space-y-6">
            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-success/50 bg-success/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-success">{successCount}</p>
                      <p className="text-sm text-muted-foreground">Sucesso</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-warning/50 bg-warning/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-warning">{warningCount}</p>
                      <p className="text-sm text-muted-foreground">Avisos</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-warning" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-destructive">{errorCount}</p>
                      <p className="text-sm text-muted-foreground">Erros</p>
                    </div>
                    <XCircle className="h-8 w-8 text-destructive" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Toggle Metadata */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMetadata(!showMetadata)}
              >
                <Code className="mr-2 h-4 w-4" />
                {showMetadata ? 'Ocultar' : 'Mostrar'} Metadados
              </Button>
            </div>

            {/* Lista de Verificações */}
            <div className="space-y-3">
              {checks.map((check, index) => (
                <Alert key={index} className="relative">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getStatusIcon(check.status)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <AlertTitle className="mb-0 flex items-center gap-2">
                          {check.name}
                          {getStatusBadge(check.status)}
                        </AlertTitle>
                      </div>
                      <AlertDescription>
                        {check.details}
                      </AlertDescription>
                      
                      {showMetadata && check.metadata && (
                        <div className="mt-2 p-3 bg-muted/50 rounded-md">
                          <p className="text-xs font-mono text-muted-foreground mb-1">Metadados:</p>
                          <pre className="text-xs font-mono overflow-x-auto">
                            {JSON.stringify(check.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>

            {/* Alertas Críticos */}
            {errorCount > 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Problemas Encontrados</AlertTitle>
                <AlertDescription>
                  {errorCount} {errorCount === 1 ? 'erro foi encontrado' : 'erros foram encontrados'} no sistema.
                  Corrija-os para garantir o funcionamento correto do multi-tenant.
                </AlertDescription>
              </Alert>
            )}

            {warningCount > 0 && errorCount === 0 && (
              <Alert className="border-warning/50 bg-warning/5">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertTitle className="text-warning">Atenção</AlertTitle>
                <AlertDescription className="text-warning/90">
                  {warningCount} {warningCount === 1 ? 'aviso foi detectado' : 'avisos foram detectados'}.
                  Revise as configurações para otimizar o sistema.
                </AlertDescription>
              </Alert>
            )}

            {successCount === checks.length && (
              <Alert className="border-success/50 bg-success/5">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertTitle className="text-success">Sistema Funcionando Perfeitamente</AlertTitle>
                <AlertDescription className="text-success/90">
                  Todas as verificações passaram com sucesso! O sistema multi-tenant está
                  configurado corretamente.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
