import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Database, Edit, Save, Plus, Trash2 } from "lucide-react";
import { useProvisaoPerda, useProvisaoPerdaIncorrida } from "@/hooks/useProvisao";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function TabelasReferencia() {
  const { data: tabelaPerda, refetch: refetchPerda } = useProvisaoPerda();
  const { data: tabelaIncorrida, refetch: refetchIncorrida } = useProvisaoPerdaIncorrida();
  const [editandoPerda, setEditandoPerda] = useState<string | null>(null);
  const [editandoIncorrida, setEditandoIncorrida] = useState<string | null>(null);

  const atualizarTabelaPerda = async (id: string, dados: any) => {
    try {
      const { error } = await supabase
        .from('provisao_perda_esperada')
        .update(dados)
        .eq('id', id);

      if (error) throw error;

      toast.success("Tabela de Perda Esperada atualizada!");
      refetchPerda();
      setEditandoPerda(null);
    } catch (error) {
      toast.error("Erro ao atualizar tabela");
    }
  };

  const atualizarTabelaIncorrida = async (id: string, dados: any) => {
    try {
      const { error } = await supabase
        .from('provisao_perdas_incorridas')
        .update(dados)
        .eq('id', id);

      if (error) throw error;

      toast.success("Tabela de Perdas Incorridas atualizada!");
      refetchIncorrida();
      setEditandoIncorrida(null);
    } catch (error) {
      toast.error("Erro ao atualizar tabela");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Database className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Tabelas de Referência BCB</h2>
      </div>

      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          <strong>Atenção:</strong> Estas são as tabelas oficiais do Banco Central do Brasil (Resoluções BCB 352/2023 e 4966/2021). 
          Modificações devem ser feitas apenas por pessoal autorizado e com conhecimento das normas regulatórias.
        </AlertDescription>
      </Alert>

      {/* Tabela de Perda Esperada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Provisão para Perda Esperada (BCB 352/2023)</span>
            <Badge variant="outline">Ativa</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Período de Atraso</th>
                  <th className="text-center p-2">Prazo Inicial</th>
                  <th className="text-center p-2">Prazo Final</th>
                  <th className="text-center p-2">C1 (%)</th>
                  <th className="text-center p-2">C2 (%)</th>
                  <th className="text-center p-2">C3 (%)</th>
                  <th className="text-center p-2">C4 (%)</th>
                  <th className="text-center p-2">C5 (%)</th>
                  <th className="text-center p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {tabelaPerda?.map((linha) => (
                  <tr key={linha.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{linha.periodo_atraso}</td>
                    <td className="p-2 text-center">{linha.prazo_inicial} dias</td>
                    <td className="p-2 text-center">{linha.prazo_final} dias</td>
                    <td className="p-2 text-center">{linha.c1_percentual}%</td>
                    <td className="p-2 text-center">{linha.c2_percentual}%</td>
                    <td className="p-2 text-center">{linha.c3_percentual}%</td>
                    <td className="p-2 text-center">{linha.c4_percentual}%</td>
                    <td className="p-2 text-center">{linha.c5_percentual}%</td>
                    <td className="p-2 text-center">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditandoPerda(editandoPerda === linha.id ? null : linha.id)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Perdas Incorridas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Provisão para Perdas Incorridas (BCB 4966/2021)</span>
            <Badge variant="outline">Ativa</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Critério</th>
                  <th className="text-center p-2">Prazo Inicial</th>
                  <th className="text-center p-2">Prazo Final</th>
                  <th className="text-center p-2">C1 (%)</th>
                  <th className="text-center p-2">C2 (%)</th>
                  <th className="text-center p-2">C3 (%)</th>
                  <th className="text-center p-2">C4 (%)</th>
                  <th className="text-center p-2">C5 (%)</th>
                  <th className="text-center p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {tabelaIncorrida?.map((linha) => (
                  <tr key={linha.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{linha.criterio}</td>
                    <td className="p-2 text-center">{linha.prazo_inicial} dias</td>
                    <td className="p-2 text-center">{linha.prazo_final} dias</td>
                    <td className="p-2 text-center">{linha.c1_percentual}%</td>
                    <td className="p-2 text-center">{linha.c2_percentual}%</td>
                    <td className="p-2 text-center">{linha.c3_percentual}%</td>
                    <td className="p-2 text-center">{linha.c4_percentual}%</td>
                    <td className="p-2 text-center">{linha.c5_percentual}%</td>
                    <td className="p-2 text-center">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditandoIncorrida(editandoIncorrida === linha.id ? null : linha.id)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações sobre as Tabelas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="font-semibold text-primary">Resolução BCB 352/2023</Label>
              <p className="text-muted-foreground">
                Define os critérios para constituição de provisão para perda esperada associada ao risco de crédito.
              </p>
            </div>
            <div>
              <Label className="font-semibold text-primary">Resolução BCB 4966/2021</Label>
              <p className="text-muted-foreground">
                Estabelece as regras para constituição de provisão para perdas incorridas em operações de crédito.
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Última Atualização: {new Date().toLocaleDateString('pt-BR')}</span>
            <span>•</span>
            <span>Status: Conforme BCB</span>
            <span>•</span>
            <span>Versão: 2024.1</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}