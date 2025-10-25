import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { Building2, AlertTriangle, CreditCard, Mail, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EscritorioSuspenso() {
  const { usuarioEscritorio, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const escritorio = usuarioEscritorio?.escritorio;
  
  const getDiasVencidos = () => {
    if (!escritorio?.data_vencimento) return 0;
    const vencimento = new Date(escritorio.data_vencimento);
    const hoje = new Date();
    return Math.ceil((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));
  };

  const diasVencidos = getDiasVencidos();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-destructive/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-destructive/30">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-16 w-16 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-destructive">
            Escritório Suspenso
          </CardTitle>
          <p className="text-muted-foreground">
            O acesso ao sistema foi temporariamente suspenso
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações do Escritório */}
          <div className="bg-muted/50 p-6 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Escritório</p>
                <p className="font-semibold">{escritorio?.nome || "Não identificado"}</p>
              </div>
            </div>
            
            {escritorio?.status === 'suspenso' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Status:</strong> Suspenso por falta de pagamento
                </AlertDescription>
              </Alert>
            )}

            {escritorio?.status === 'cancelado' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Status:</strong> Cancelado
                </AlertDescription>
              </Alert>
            )}

            {diasVencidos > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Vencimento:</strong> {diasVencidos} {diasVencidos === 1 ? 'dia' : 'dias'} em atraso
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Motivos da Suspensão */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Motivos Possíveis:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CreditCard className="h-4 w-4 mt-0.5 text-destructive" />
                <span>Plano de assinatura vencido ou pagamento pendente</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive" />
                <span>Violação dos termos de uso do sistema</span>
              </li>
              <li className="flex items-start gap-2">
                <Building2 className="h-4 w-4 mt-0.5 text-destructive" />
                <span>Conta cancelada pelo administrador do escritório</span>
              </li>
            </ul>
          </div>

          {/* Ações */}
          <div className="space-y-4 pt-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                <strong>Como resolver:</strong>
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Entre em contato com o suporte técnico</li>
                <li>• Regularize o pagamento do plano de assinatura</li>
                <li>• Fale com o administrador do escritório</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" size="lg">
                <Mail className="h-4 w-4 mr-2" />
                Contatar Suporte
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>Suporte: suporte@intellbank.com.br</p>
            <p>Telefone: (11) 3000-0000</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
