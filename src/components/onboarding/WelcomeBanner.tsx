import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Play, Lightbulb } from "lucide-react";
import { hasCompletedOnboarding } from "./OnboardingTour";

interface WelcomeBannerProps {
  onStartTour: () => void;
}

export function WelcomeBanner({ onStartTour }: WelcomeBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    const hasCompleted = hasCompletedOnboarding();
    const bannerDismissed = localStorage.getItem("welcome-banner-dismissed");
    
    if (!hasCompleted && !bannerDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("welcome-banner-dismissed", "true");
  };

  const handleStartTour = () => {
    onStartTour();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Card className="mb-6 border-l-4 border-l-primary bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-primary">Bem-vindo ao Sistema!</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Parece que é sua primeira vez aqui. Que tal fazer um tour rápido para conhecer 
              as principais funcionalidades do sistema de provisionamento?
            </p>
            <div className="flex gap-2">
              <Button onClick={handleStartTour} size="sm">
                <Play className="mr-2 h-4 w-4" />
                Fazer Tour Guiado
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowTips(!showTips)}
              >
                {showTips ? "Ocultar Dicas" : "Ver Dicas"}
              </Button>
            </div>
            
            {showTips && (
              <div className="mt-4 p-3 bg-background rounded-lg border">
                <h4 className="font-medium mb-2">Dicas para começar:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Dashboard:</strong> Monitore indicadores em tempo real</li>
                  <li>• <strong>Clientes:</strong> Cadastre primeiro seus clientes</li>
                  <li>• <strong>Contratos:</strong> Registre contratos e calcule provisões automaticamente</li>
                  <li>• <strong>Relatórios:</strong> Exporte dados para análise e auditoria</li>
                </ul>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="ml-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}