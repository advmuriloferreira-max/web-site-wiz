import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { LegalIcons } from "@/components/ui/legal-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl">
        <CardContent className="text-center p-8 space-y-6">
          <div className="flex justify-center">
            <LegalIcons.justice className="h-16 w-16 text-accent animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-primary">404</h1>
            <h2 className="text-xl font-semibold text-foreground">Página não encontrada</h2>
            <p className="text-muted-foreground">
              A página que você está procurando não existe ou foi movida.
            </p>
          </div>
          
          <div className="space-y-3 pt-4">
            <Button asChild className="w-full" size="lg">
              <Link to="/" className="flex items-center justify-center gap-2">
                <LegalIcons.dashboard className="h-4 w-4" />
                Voltar ao Painel de Controle
              </Link>
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Rota acessada: <code className="bg-muted px-2 py-1 rounded">{location.pathname}</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
