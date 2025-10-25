import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, ArrowLeft, Mail, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function SemPermissao() {
  const navigate = useNavigate();
  const { usuarioEscritorio } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-orange/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-orange-200 dark:border-orange-900">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="p-4 bg-orange-100 dark:bg-orange-950/30 rounded-full">
              <Shield className="h-16 w-16 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            Acesso Restrito
          </CardTitle>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta funcionalidade
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações do Usuário */}
          <div className="bg-muted/50 p-6 rounded-lg space-y-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Usuário</p>
                <p className="font-semibold">{usuarioEscritorio?.nome}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Cargo</p>
                <p className="font-semibold">{usuarioEscritorio?.cargo || "Não definido"}</p>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Suas permissões atuais:
                <ul className="mt-2 space-y-1 text-sm">
                  {usuarioEscritorio?.permissoes.read && <li>✓ Visualizar dados</li>}
                  {usuarioEscritorio?.permissoes.write && <li>✓ Editar dados</li>}
                  {usuarioEscritorio?.permissoes.admin && <li>✓ Administração</li>}
                  {!usuarioEscritorio?.permissoes.admin && (
                    <li className="text-orange-600">✗ Sem permissão de administrador</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          {/* Explicação */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Por que estou vendo isso?</h3>
            <p className="text-sm text-muted-foreground">
              Esta funcionalidade requer permissões especiais que você não possui. 
              Algumas áreas do sistema são restritas a administradores ou usuários 
              com permissões específicas.
            </p>
          </div>

          {/* Ações */}
          <div className="space-y-4 pt-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                <strong>Como obter acesso:</strong>
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Solicite permissões ao administrador do escritório</li>
                <li>• Verifique se seu cargo permite este tipo de operação</li>
                <li>• Entre em contato com o suporte se acredita ser um erro</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="default" 
                size="lg"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Button>
              <Button 
                variant="outline" 
                size="lg"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contatar Admin
              </Button>
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>Para solicitar novas permissões, fale com o administrador do escritório</p>
            <p className="font-semibold mt-1">{usuarioEscritorio?.escritorio?.nome}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
