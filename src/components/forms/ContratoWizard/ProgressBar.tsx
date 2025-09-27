import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle } from "lucide-react";
import { WizardStep } from "./types";

interface WizardProgressBarProps {
  steps: WizardStep[];
  currentStep: number;
  className?: string;
}

export function WizardProgressBar({ steps, currentStep, className = "" }: WizardProgressBarProps) {
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;
  
  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Barra de progresso */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span>Progresso</span>
          <span>{Math.round(progress)}% completo</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Indicadores das etapas */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep || step.isCompleted;
          const isPast = stepNumber < currentStep;
          
          return (
            <div
              key={step.id}
              className={`flex flex-col items-center space-y-2 flex-1 ${
                index < steps.length - 1 ? 'relative' : ''
              }`}
            >
              {/* Linha conectora */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute top-4 left-1/2 w-full h-0.5 -z-10 ${
                    isPast ? 'bg-primary' : 'bg-muted'
                  }`}
                  style={{ transform: 'translateX(50%)' }}
                />
              )}
              
              {/* Indicador circular */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? 'bg-primary border-primary text-primary-foreground'
                    : isActive
                    ? 'bg-background border-primary text-primary'
                    : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-bold">{stepNumber}</span>
                )}
              </div>
              
              {/* Título da etapa */}
              <div className="text-center">
                <div
                  className={`text-xs font-medium ${
                    isActive || isCompleted
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </div>
                {isActive && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}