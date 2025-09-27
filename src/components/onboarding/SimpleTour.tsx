import { useState, useEffect } from "react";
import Joyride from "react-joyride";

export function SimpleTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Iniciar automaticamente após 3 segundos
    const timer = setTimeout(() => {
      console.log("Iniciando tour simples...");
      setRun(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const steps = [
    {
      target: "body",
      content: "Bem-vindo! Este é um teste do tour.",
      placement: "center" as const,
    },
    {
      target: '[data-tour="dashboard-stats"]',
      content: "Estes são os indicadores principais do dashboard.",
      placement: "bottom" as const,
    },
  ];

  const handleCallback = (data: any) => {
    console.log("Tour callback:", data);
  };

  console.log("SimpleTour rendering, run=", run);

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      callback={handleCallback}
      debug
      styles={{
        options: {
          zIndex: 10000,
        },
      }}
    />
  );
}