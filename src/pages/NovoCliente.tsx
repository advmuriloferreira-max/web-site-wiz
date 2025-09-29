import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { ClienteWizard } from "@/components/forms/ClienteWizard";
import { ResponsiveContainer } from "@/components/ui/layout-consistency";
import { GlassCard } from "@/components/ui/glassmorphism";
import { GradientText } from "@/components/ui/gradient-elements";
import { ColoredIcon } from "@/components/ui/color-consistency";

export default function NovoCliente() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/clientes");
  };

  return (
    <ResponsiveContainer className="py-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/clientes")}
          className="flex items-center gap-2 interactive-button"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Clientes
        </Button>
        <div>
          <GradientText variant="primary" className="text-3xl font-bold mb-2 flex items-center">
            <ColoredIcon icon={Users} className="mr-3" />
            Novo Cliente
          </GradientText>
          <p className="text-muted-foreground">
            Cadastre um novo cliente no sistema de gestão bancária
          </p>
        </div>
      </div>

      <GlassCard variant="subtle" className="animate-slide-up">
        <CardContent className="p-6">
          <ClienteWizard onSuccess={handleSuccess} />
        </CardContent>
      </GlassCard>
    </ResponsiveContainer>
  );
}