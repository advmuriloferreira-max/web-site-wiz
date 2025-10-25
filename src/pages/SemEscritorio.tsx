import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, AlertTriangle, UserPlus, LogOut, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function SemEscritorio() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Building2 className="h-16 w-16 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            Nenhum Escritório Vinculado
          </CardTitle>
          <p className="text-muted-foreground">
            Sua conta não está vinculada a nenhum escritório
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações do Usuário */}
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              <strong>Email:</strong> {user?.email}
            </AlertDescription>
          </Alert>

          {/* Explicação */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">O que aconteceu?</h3>
            <p className="text-sm text-muted-foreground">
              Para usar o INTELLBANK, você precisa estar associado a um escritório. 
              Isso pode acontecer de duas formas:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Building2 className="h-4 w-4 mt-0.5 text-primary" />
                <span>Cadastrando um novo escritório (você será o administrador)</span>
              </li>
              <li className="flex items-start gap-2">
                <UserPlus className="h-4 w-4 mt-0.5 text-primary" />
                <span>Sendo convidado por um escritório existente</span>
              </li>
            </ul>
          </div>

          {/* Ações */}
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-2 border-primary/30 hover:border-primary transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Novo Escritório</h4>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Cadastre seu escritório e comece a usar o sistema
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/cadastro/escritorio')}
                  >
                    Cadastrar Escritório
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-muted hover:border-primary/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Tenho um Convite</h4>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Use o link de convite enviado pelo escritório
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/convite')}
                  >
                    Usar Convite
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Dica:</strong> Se você foi convidado para um escritório, 
                verifique seu email para o link de convite ou solicite ao administrador 
                que reenvie o convite.
              </p>
            </div>

            <div className="flex justify-center">
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-muted-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair da Conta
              </Button>
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>Precisa de ajuda? Entre em contato</p>
            <p className="font-semibold">suporte@intellbank.com.br</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
