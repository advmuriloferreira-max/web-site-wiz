import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Mail, 
  Clock, 
  ArrowRight, 
  Users, 
  BookOpen, 
  Headphones,
  Sparkles
} from "lucide-react";

export default function CadastroSucesso() {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/auth");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-8">
          
          {/* Success Icon */}
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              Bem-vindo ao INTELLBANK! 🎉
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Sua conta foi criada com sucesso. Você já pode começar a revolucionar 
              sua advocacia bancária com nossa plataforma.
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-green-900 mb-2">Conta Criada</h3>
                <p className="text-sm text-green-700">
                  Seu escritório foi cadastrado com sucesso
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Email Enviado</h3>
                <p className="text-sm text-blue-700">
                  Verifique sua caixa de entrada para confirmar
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-purple-900 mb-2">Trial Ativo</h3>
                <p className="text-sm text-purple-700">
                  7 dias grátis para testar tudo
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          <Card className="max-w-2xl mx-auto text-left">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                Próximos Passos
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Confirme seu email</h3>
                    <p className="text-muted-foreground text-sm">
                      Clique no link que enviamos para ativar sua conta
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Faça seu primeiro login</h3>
                    <p className="text-muted-foreground text-sm">
                      Acesse a plataforma e conheça todas as funcionalidades
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Cadastre seu primeiro cliente</h3>
                    <p className="text-muted-foreground text-sm">
                      Comece a usar o sistema com um caso real
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Guia de Início</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tutorial completo para começar a usar a plataforma
                </p>
                <Button variant="outline" size="sm">
                  Acessar Guia
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Comunidade</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Conecte-se com outros advogados bancários
                </p>
                <Button variant="outline" size="sm">
                  Participar
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Headphones className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Suporte</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Nossa equipe está pronta para ajudar
                </p>
                <Button variant="outline" size="sm">
                  Falar Conosco
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-4"
            >
              Acessar Plataforma Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Redirecionando automaticamente em {countdown} segundos...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
