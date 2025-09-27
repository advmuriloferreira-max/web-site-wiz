import { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useNavigate, useLocation } from "react-router-dom";

const ONBOARDING_KEY = "murilo-advocacia-onboarding-completed";

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
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompletedOnboarding && !startTour) {
      // Aguardar um momento para a página carregar completamente
      setTimeout(() => setRunTour(true), 1000);
    } else if (startTour) {
      setRunTour(true);
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
    
    if (type === "step:after") {
      // Navegar para páginas específicas durante o tour
      if (index === 1 && location.pathname !== "/") {
        navigate("/");
      } else if (index === 2 && location.pathname !== "/clientes") {
        navigate("/clientes");
      } else if (index === 3 && location.pathname !== "/contratos") {
        navigate("/contratos");
      } else if (index === 4 && location.pathname !== "/calculos") {
        navigate("/calculos");
      } else if (index === 5 && location.pathname !== "/acordos") {
        navigate("/acordos");
      } else if (index === 6 && location.pathname !== "/relatorios") {
        navigate("/relatorios");
      }
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      localStorage.setItem(ONBOARDING_KEY, "true");
      onTourEnd?.();
      
      // Voltar para o dashboard no final
      if (location.pathname !== "/") {
        navigate("/");
      }
    }

    setStepIndex(index);
  };

  if (!runTour) return null;

  return (
    <Joyride
      steps={steps}
      run={runTour}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "hsl(var(--primary))",
          backgroundColor: "hsl(var(--background))",
          textColor: "hsl(var(--foreground))",
          overlayColor: "rgba(0, 0, 0, 0.4)",
          arrowColor: "hsl(var(--background))",
          zIndex: 1000,
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
};