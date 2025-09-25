import { useState } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function InstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);
  const { toast } = useToast();

  if (!isInstallable || isInstalled || !isVisible) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    
    try {
      const success = await installApp();
      
      if (success) {
        toast({
          title: "App instalado com sucesso!",
          description: "O sistema agora está disponível na sua área de trabalho."
        });
        setIsVisible(false);
      } else {
        toast({
          title: "Instalação cancelada",
          description: "Você pode instalar o app a qualquer momento."
        });
      }
    } catch (error) {
      toast({
        title: "Erro na instalação",
        description: "Não foi possível instalar o app. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    toast({
      title: "Prompt de instalação oculto",
      description: "Você pode instalar o app através do menu do navegador."
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm">Instalar App</CardTitle>
                <CardDescription className="text-xs">
                  Murilo Ferreira Advocacia
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4">
            Instale o sistema para acesso rápido e uso offline.
          </p>
          
          <div className="flex items-center space-x-2 mb-4 text-xs text-muted-foreground">
            <Monitor className="h-4 w-4" />
            <span>Funciona como programa nativo</span>
          </div>
          
          <div className="flex items-center space-x-2 mb-4 text-xs text-muted-foreground">
            <Smartphone className="h-4 w-4" />
            <span>Acesso offline aos dados</span>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1"
              size="sm"
            >
              {isInstalling ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Instalando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Instalar
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              size="sm"
            >
              Depois
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}