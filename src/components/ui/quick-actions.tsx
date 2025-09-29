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
      descricao: "Cadastro rápido de cliente",
      icone: Users,
      atalho: "⌘+N",
      cor: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
      acao: () => setDialogAberto("cliente")
    },
    {
      id: "novo-contrato", 
      titulo: "Novo Contrato",
      descricao: "Cadastro de contrato bancário",
      icone: FileText,
      atalho: "⌘+⇧+N",
      cor: "bg-green-500/10 text-green-600 hover:bg-green-500/20",
      acao: () => setDialogAberto("contrato")
    },
    {
      id: "calculadora",
      titulo: "Calculadora",
      descricao: "Calcular provisão de perda",
      icone: Calculator,
      atalho: "⌘+C",
      cor: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20",
      acao: () => navigate("/calculos")
    },
    {
      id: "relatorios",
      titulo: "Relatórios",
      descricao: "Gerar relatórios rápidos",
      icone: TrendingUp,
      atalho: "⌘+R",
      cor: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20",
      acao: () => navigate("/relatorios")
    }
  ];

  const fecharDialog = () => {
    setDialogAberto(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-primary" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {acoes.map((acao) => {
              const IconeAcao = acao.icone;
              return (
                <Button
                  key={acao.id}
                  variant="ghost"
                  onClick={acao.acao}
                  className={`
                    h-auto p-4 flex flex-col items-center gap-2 text-center
                    transition-all duration-200 hover:scale-105
                    ${acao.cor}
                  `}
                >
                  <div className="flex items-center justify-between w-full">
                    <IconeAcao className="w-5 h-5" />
                    {acao.atalho && (
                      <Badge variant="outline" className="text-xs opacity-70">
                        {acao.atalho}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{acao.titulo}</span>
                    <span className="text-xs opacity-75">{acao.descricao}</span>
                  </div>
                </Button>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              💡 Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘+K</kbd> para busca rápida
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