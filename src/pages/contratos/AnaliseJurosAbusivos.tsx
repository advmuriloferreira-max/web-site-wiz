import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, FileText, Save, Calculator, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useContratoById } from "@/hooks/useContratoById";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { SelectJurosBACEN } from "@/components/juros/SelectJurosBACEN";
import { useTaxaJurosBacenPorData } from "@/hooks/useTaxasJurosBacen";

export default function AnaliseJurosAbusivos() {
  const { id: contratoId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contrato, isLoading } = useContratoById(contratoId!);

  const [taxaContratoMensal, setTaxaContratoMensal] = useState("");
  const [modalidadeId, setModalidadeId] = useState("");
  const [dataAssinatura, setDataAssinatura] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [resultado, setResultado] = useState<any>(null);
  const [salvando, setSalvando] = useState(false);

  const { data: taxaBacenData } = useTaxaJurosBacenPorData(
    modalidadeId ? parseInt(modalidadeId) : null,
    dataAssinatura || null
  );

  useEffect(() => {
    if (contrato) {
      if (contrato.taxa_juros_contratual) setTaxaContratoMensal(contrato.taxa_juros_contratual.toString());
      if (contrato.modalidade_bacen_id) setModalidadeId(contrato.modalidade_bacen_id);
      if (contrato.data_assinatura) setDataAssinatura(contrato.data_assinatura);
    }
  }, [contrato]);

  const calcularAnalise = () => {
    if (!taxaContratoMensal || !modalidadeId || !dataAssinatura || !taxaBacenData) {
      toast.error("Preencha todos os campos e aguarde carregar a taxa BACEN");
      return;
    }

    try {
      const taxaContrato = parseFloat(taxaContratoMensal);
      const taxaBacen = taxaBacenData.taxa_mensal;
      const diferencaAbsoluta = taxaContrato - taxaBacen;
      const percentualAbusividade = ((taxaContrato / taxaBacen - 1) * 100);
      const abusividadeDetectada = percentualAbusividade > 20;
      
      let grauAbusividade = "Dentro do Mercado";
      if (percentualAbusividade > 50) grauAbusividade = "Muito Grave";
      else if (percentualAbusividade > 35) grauAbusividade = "Grave";
      else if (percentualAbusividade > 20) grauAbusividade = "Moderado";
      else if (percentualAbusividade > 0) grauAbusividade = "Leve";

      setResultado({
        taxaContrato,
        taxaBacen,
        diferencaAbsoluta,
        percentualAbusividade,
        abusividadeDetectada,
        grauAbusividade,
      });

      toast.success("Análise concluída!");
    } catch (error) {
      toast.error("Erro ao realizar análise");
    }
  };

  const salvarAnalise = async () => {
    if (!resultado || !contratoId) return;
    setSalvando(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: escritorioData } = await supabase
        .from("usuarios_escritorio")
        .select("escritorio_id")
        .eq("user_id", userData.user?.id)
        .single();

      await supabase.from("analises_juros_abusivos").insert({
        contrato_id: contratoId,
        modalidade_bacen_id: modalidadeId ? parseInt(modalidadeId) : null,
        taxa_contratual: parseFloat(taxaContratoMensal),
        data_referencia: dataAssinatura,
        taxa_real_aplicada: resultado.taxaContrato,
        taxa_media_bacen: resultado.taxaBacen,
        diferenca_absoluta: resultado.diferencaAbsoluta,
        diferenca_percentual: resultado.percentualAbusividade,
        abusividade_detectada: resultado.abusividadeDetectada,
        usuario_id: userData.user?.id,
        observacoes,
      });

      toast.success("Análise salva!");
      navigate(-1);
    } catch (error) {
      toast.error("Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!contrato) return <div className="container mx-auto py-8"><Card><CardContent className="py-8"><p className="text-center text-muted-foreground">Contrato não encontrado</p></CardContent></Card></div>;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-3xl font-bold">Análise de Juros Abusivos</h1>
          <p className="text-muted-foreground">Comparação com taxas médias do BACEN</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Dados do Contrato</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div><Label className="text-muted-foreground">Cliente</Label><p className="font-medium">{contrato.clientes?.nome}</p></div>
          <div><Label className="text-muted-foreground">Banco</Label><p className="font-medium">{contrato.bancos?.nome || "-"}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Dados para Análise</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <SelectJurosBACEN value={modalidadeId} onValueChange={setModalidadeId} required />
          
          {taxaBacenData && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border">
              <p className="text-sm font-semibold mb-1">📊 Taxa BACEN: {taxaBacenData.taxa_mensal.toFixed(2)}% a.m.</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Taxa do Contrato (% a.m.) *</Label><Input type="number" step="0.01" value={taxaContratoMensal} onChange={(e) => setTaxaContratoMensal(e.target.value)} /></div>
            <div><Label>Data de Assinatura *</Label><Input type="date" value={dataAssinatura} onChange={(e) => setDataAssinatura(e.target.value)} /></div>
          </div>

          <div><Label>Observações</Label><Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} /></div>

          <Button onClick={calcularAnalise} disabled={!taxaContratoMensal || !modalidadeId || !dataAssinatura} className="gap-2">
            <Calculator className="h-4 w-4" />Realizar Análise
          </Button>
        </CardContent>
      </Card>

      {resultado && (
        <Card>
          <CardHeader><CardTitle>Resultado</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg"><p className="text-sm text-muted-foreground">Taxa Contrato</p><p className="text-3xl font-bold text-red-600">{resultado.taxaContrato.toFixed(2)}%</p></div>
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg"><p className="text-sm text-muted-foreground">Taxa BACEN</p><p className="text-3xl font-bold text-green-600">{resultado.taxaBacen.toFixed(2)}%</p></div>
            </div>
            <Separator />
            <div className="grid md:grid-cols-2 gap-4">
              <div><p className="text-sm text-muted-foreground">Diferença</p><p className="text-xl font-bold">{resultado.diferencaAbsoluta.toFixed(2)} p.p.</p></div>
              <div><p className="text-sm text-muted-foreground">Abusividade</p><p className="text-xl font-bold text-red-600">{resultado.percentualAbusividade.toFixed(2)}%</p></div>
            </div>
            <Button onClick={salvarAnalise} disabled={salvando}><Save className="mr-2 h-4 w-4" />Salvar Análise</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
