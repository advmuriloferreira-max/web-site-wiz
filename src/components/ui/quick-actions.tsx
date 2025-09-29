import { useState } from "react";
import { Plus, Calculator, FileText, Users, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClienteWizard } from "@/components/forms/ClienteWizard";
import { ContratoWizard } from "@/components/forms/ContratoWizard";

interface AcaoRapida {
  id: string;
  titulo: string;
  descricao: string;
  icone: any;
  atalho?: string;
  cor: string;
  acao: () => void;
}

export function QuickActions() {
  const navigate = useNavigate();
  const [dialogAberto, setDialogAberto] = useState<string | null>(null);

  const acoes: AcaoRapida[] = [
    {
      id: "novo-cliente",
      titulo: "Novo Cliente",
      descricao: "Cadastro rápido",
      icone: Users,
      cor: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
      acao: () => setDialogAberto("cliente")
    },
    {
      id: "novo-contrato", 
      titulo: "Novo Contrato",
      descricao: "Cadastro bancário",
      icone: FileText,
      cor: "bg-green-500/10 text-green-600 hover:bg-green-500/20",
      acao: () => setDialogAberto("contrato")
    },
    {
      id: "calculadora",
      titulo: "Calculadora",
      descricao: "Provisão perda",
      icone: Calculator,
      cor: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20",
      acao: () => navigate("/calculos")
    },
    {
      id: "relatorios",
      titulo: "Relatórios",
      descricao: "Gerar relatórios",
      icone: TrendingUp,
      cor: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20",
      acao: () => navigate("/relatorios")
    }
  ];

  const fecharDialog = () => {
    setDialogAberto(null);
  };

  return (
    <>
      <Card className="shadow-sm border-accent/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-4 h-4 text-primary" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {acoes.map((acao) => {
            const IconeAcao = acao.icone;
            return (
              <Button
                key={acao.id}
                variant="ghost"
                onClick={acao.acao}
                className={`
                  w-full h-auto p-3 flex items-center justify-start gap-3
                  transition-all duration-200 hover:scale-[1.02]
                  ${acao.cor} rounded-lg
                `}
              >
                <div className="flex-shrink-0">
                  <IconeAcao className="w-4 h-4" />
                </div>
                
                <div className="flex flex-col items-start text-left min-w-0 flex-1">
                  <span className="font-medium text-sm truncate w-full">{acao.titulo}</span>
                  <span className="text-xs opacity-75 truncate w-full">{acao.descricao}</span>
                </div>
              </Button>
            );
          })}
          
          <div className="mt-3 pt-3 border-t border-accent/20">
            <p className="text-xs text-muted-foreground text-center">
              💡 Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘+K</kbd> busca rápida
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs para Wizards */}
      <Dialog open={dialogAberto === "cliente"} onOpenChange={(open) => !open && fecharDialog()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>
          <ClienteWizard onSuccess={fecharDialog} />
        </DialogContent>
      </Dialog>

      <Dialog open={dialogAberto === "contrato"} onOpenChange={(open) => !open && fecharDialog()}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Contrato</DialogTitle>
          </DialogHeader>
          <ContratoWizard onSuccess={fecharDialog} />
        </DialogContent>
      </Dialog>
    </>
  );
}