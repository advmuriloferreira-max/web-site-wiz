import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Mail, ArrowRight, BarChart3 } from "lucide-react";

export default function CadastroSucesso() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              INTELLBANK
            </span>
          </div>
        </div>

        {/* Success Card */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-8 md:p-12 text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Conta Criada com Sucesso! 🎉
              </h1>
              <p className="text-lg text-gray-600">
                Bem-vindo ao INTELLBANK
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Verifique seu email
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Enviamos um link de confirmação para o email cadastrado. 
                    Clique no link para ativar sua conta e fazer login.
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-3 text-left">
              <h3 className="font-semibold text-gray-900 text-center mb-4">
                Próximos Passos
              </h3>
              
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="text-gray-700">
                    <strong>Confirme seu email</strong> - Clique no link que enviamos
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="text-gray-700">
                    <strong>Faça login</strong> - Use suas credenciais para acessar
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="text-gray-700">
                    <strong>Comece a usar</strong> - Cadastre seu primeiro cliente
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Fazer Login
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                onClick={() => navigate("/")}
                size="lg"
                variant="outline"
                className="flex-1"
              >
                Voltar ao Início
              </Button>
            </div>

            {/* Help Text */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Não recebeu o email?{" "}
                <button className="text-blue-600 hover:underline font-semibold">
                  Reenviar email de confirmação
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Precisa de ajuda?{" "}
            <a href="#" className="text-blue-600 hover:underline font-semibold">
              Entre em contato com o suporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
