import { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useNavigate, useLocation } from "react-router-dom";

const ONBOARDING_KEY = "murilo-advocacia-onboarding-completed";

// Função para resetar o onboarding (para testes)
const resetOnboardingForTesting = () => {
  localStorage.removeItem(ONBOARDING_KEY);
  localStorage.removeItem("welcome-banner-dismissed");
};

interface OnboardingTourProps {
  startTour?: boolean;
  onTourEnd?: () => void;
}

export function OnboardingTour({ startTour = false, onTourEnd }: OnboardingTourProps) {
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar se o onboarding já foi completado
  useEffect(() => {
    console.log("OnboardingTour mounted, startTour:", startTour);
    
    // Para desenvolvimento: resetar localStorage automaticamente
    resetOnboardingForTesting();
    
    if (startTour) {
      console.log("Starting manual tour...");
      setRunTour(true);
    } else {
      // Iniciar automaticamente para novos usuários após delay
      const timer = setTimeout(() => {
        const hasCompleted = localStorage.getItem(ONBOARDING_KEY);
        if (!hasCompleted) {
          console.log("Starting automatic tour...");
          setRunTour(true);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [startTour]);

  const steps: Step[] = [
    {
      target: "body",
      content: (
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Bem-vindo ao Sistema de Provisionamento!</h2>
          <p className="text-muted-foreground">
            Vamos fazer um tour rápido pelas principais funcionalidades do sistema. 
            Este tour levará apenas alguns minutos.
          </p>
        </div>
      ),
      placement: "center",
    },
    {
      target: '[data-tour="dashboard-stats"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Dashboard - Indicadores Principais</h3>
          <p className="text-sm text-muted-foreground">
            Aqui você visualiza um resumo dos principais indicadores do seu portfólio:
            valor total das dívidas, provisão acumulada e percentual médio de risco.
          </p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: '[data-tour="sidebar-clientes"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Gestão de Clientes</h3>
          <p className="text-sm text-muted-foreground">
            Acesse esta seção para cadastrar novos clientes e gerenciar suas informações.
            Cada cliente pode ter múltiplos contratos associados.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: '[data-tour="sidebar-contratos"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Gestão de Contratos</h3>
          <p className="text-sm text-muted-foreground">
            Aqui você registra os contratos bancários e o sistema calcula automaticamente
            as provisões baseadas nas normas do Banco Central.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: '[data-tour="sidebar-calculos"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Cálculos de Provisão</h3>
          <p className="text-sm text-muted-foreground">
            Utilize esta ferramenta para fazer simulações e entender como são calculadas
            as provisões baseadas em dias de atraso, classificação de risco e garantias.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: '[data-tour="sidebar-acordos"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Acordos e Negociações</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie propostas de acordo, acompanhe negociações e registre acordos finalizados
            com visualização clara da economia obtida.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: '[data-tour="sidebar-relatorios"]',
      content: (
        <div>
          <h3 className="font-semibold mb-2">Relatórios Gerenciais</h3>
          <p className="text-sm text-muted-foreground">
            Gere relatórios detalhados para análise de risco, acompanhamento de performance
            e exportação de dados para auditoria.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: "body",
      content: (
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Tour Concluído! 🎉</h2>
          <p className="text-muted-foreground mb-4">
            Agora você conhece as principais funcionalidades do sistema. 
            Comece cadastrando seus clientes e contratos para ver o sistema em ação.
          </p>
          <p className="text-xs text-muted-foreground">
            Você pode refazer este tour a qualquer momento nas configurações.
          </p>
        </div>
      ),
      placement: "center",
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index } = data;
    console.log("Joyride callback:", { status, type, index });

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      console.log("Tour finished or skipped");
      setRunTour(false);
      localStorage.setItem(ONBOARDING_KEY, "true");
      onTourEnd?.();
    } else if (type === "step:after") {
      setStepIndex(index + 1);
    }
  };

  if (!runTour) {
    console.log("Tour not running, runTour:", runTour);
    return null;
  }

  console.log("Rendering Joyride with runTour:", runTour);

  return (
    <Joyride
      steps={steps}
      run={runTour}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      disableOverlayClose
      disableScrolling={false}
      callback={handleJoyrideCallback}
      debug
      styles={{
        options: {
          primaryColor: "hsl(var(--primary))",
          backgroundColor: "hsl(var(--background))",
          textColor: "hsl(var(--foreground))",
          overlayColor: "rgba(0, 0, 0, 0.4)",
          arrowColor: "hsl(var(--background))",
          zIndex: 10000,
        },
        tooltip: {
          fontSize: "14px",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        },
        tooltipContainer: {
          textAlign: "left",
        },
        buttonNext: {
          backgroundColor: "hsl(var(--primary))",
          fontSize: "14px",
          padding: "8px 16px",
          borderRadius: "6px",
        },
        buttonBack: {
          marginRight: "8px",
          fontSize: "14px",
          color: "hsl(var(--muted-foreground))",
        },
        buttonSkip: {
          fontSize: "14px",
          color: "hsl(var(--muted-foreground))",
        },
      }}
      locale={{
        back: "Voltar",
        close: "Fechar",
        last: "Finalizar",
        next: "Próximo",
        skip: "Pular Tour",
      }}
    />
  );
}

// Função utilitária para verificar se o onboarding foi completado
export const hasCompletedOnboarding = (): boolean => {
  return localStorage.getItem(ONBOARDING_KEY) === "true";
};

// Função para resetar o onboarding
export const resetOnboarding = (): void => {
  localStorage.removeItem(ONBOARDING_KEY);
  localStorage.removeItem("welcome-banner-dismissed");
};