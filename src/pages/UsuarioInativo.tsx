import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserX, AlertTriangle, LogOut, Mail, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function UsuarioInativo() {
  const navigate = useNavigate();
  const { signOut, usuarioEscritorio } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-orange/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-orange-200 dark:border-orange-900">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="p-4 bg-orange-100 dark:bg-orange-950/30 rounded-full">
              <UserX className="h-16 w-16 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            Usuário Inativo
          </CardTitle>
          <p className="text-muted-foreground">
            Seu acesso ao sistema foi desativado
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações do Usuário */}
          <div className="bg-muted/50 p-6 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Escritório</p>
                <p className="font-semibold">{usuarioEscritorio?.escritorio?.nome || "Não identificado"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">{usuarioEscritorio?.email}</p>
              </div>
            </div>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Status:</strong> Inativo - Acesso ao sistema bloqueado
              </AlertDescription>
            </Alert>
          </div>

          {/* Motivos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Motivos Possíveis:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 text-orange-600" />
                <span>Desativação temporária pelo administrador do escritório</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 text-orange-600" />
                <span>Desligamento ou mudança de função</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 text-orange-600" />
                <span>Violação das políticas de uso do sistema</span>
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
                <li>• Entre em contato com o administrador do escritório</li>
                <li>• Verifique se há alguma pendência administrativa</li>
                <li>• Solicite a reativação do seu acesso</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button 
                className="flex-1" 
                size="lg"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contatar Administrador
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
            <p>Para reativar seu acesso, fale com o administrador do escritório:</p>
            <p className="font-semibold mt-1">{usuarioEscritorio?.escritorio?.nome}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
