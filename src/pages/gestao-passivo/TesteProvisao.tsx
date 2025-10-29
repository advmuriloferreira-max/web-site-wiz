import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function TesteProvisao() {
  const navigate = useNavigate();

  const { data: anexo1 } = useQuery({
    queryKey: ["teste-anexo1"],
    queryFn: async () => {
      const { data } = await supabase
        .from("provisao_bcb352_anexo1")
        .select("*")
        .order("meses_min");
      return data;
    },
  });

  const { data: anexo2 } = useQuery({
    queryKey: ["teste-anexo2"],
    queryFn: async () => {
      const { data } = await supabase
        .from("provisao_bcb352_anexo2")
        .select("*")
        .order("dias_min");
      return data;
    },
  });

  const { data: bancos } = useQuery({
    queryKey: ["teste-bancos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("bancos_brasil")
        .select("*")
        .order("nome_curto");
      return data;
    },
  });

  const { data: tiposGarantia } = useQuery({
    queryKey: ["teste-tipos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tipos_operacao_carteira")
        .select("*")
        .order("carteira", { ascending: true });
      return data;
    },
  });

  const validarAnexo1 = () => {
    if (!anexo1 || anexo1.length !== 22) return false;
    const primeiro = anexo1[0];
    return (
      primeiro.c1_percentual === 5.50 &&
      primeiro.c2_percentual === 30.00 &&
      primeiro.c3_percentual === 45.00 &&
      primeiro.c4_percentual === 35.00 &&
      primeiro.c5_percentual === 50.00
    );
  };

  const validarAnexo2 = () => {
    if (!anexo2 || anexo2.length !== 4) return false;
    const primeiro = anexo2[0];
    return (
      primeiro.c1_percentual === 1.40 &&
      primeiro.c2_percentual === 1.40 &&
      primeiro.c3_percentual === 1.90 &&
      primeiro.c4_percentual === 1.90 &&
      primeiro.c5_percentual === 1.90
    );
  };

  const anexo1OK = validarAnexo1();
  const anexo2OK = validarAnexo2();
  const bancosOK = (bancos?.length || 0) >= 33;
  const tiposOK = (tiposGarantia?.length || 0) >= 37;
  const tudoOK = anexo1OK && anexo2OK && bancosOK && tiposOK;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teste de Conformidade BCB 352</h1>
          <p className="text-muted-foreground mt-2">
            Validação completa da estrutura de dados
          </p>
        </div>
        <Button onClick={() => navigate("/app/home")}>
          Voltar ao Dashboard
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Status Geral */}
        <Card className={tudoOK ? "border-green-500" : "border-red-500"}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Status Geral do Sistema
              {tudoOK ? (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  100% CONFORME
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-4 w-4 mr-1" />
                  COM PROBLEMAS
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tudoOK ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  🎉 SISTEMA 100% CONFORME À BCB 352/2023!
                </h2>
                <p className="text-muted-foreground mb-4">
                  Todos os dados estão corretos e prontos para uso em produção.
                </p>
                <Button
                  onClick={() => navigate("/app/gestao-passivo/nova")}
                  size="lg"
                >
                  Criar Nova Análise
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-600 mb-2">
                  ❌ SISTEMA COM PROBLEMAS
                </h2>
                <p className="text-muted-foreground">
                  Verifique os erros abaixo e aplique as correções necessárias.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Anexo I */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Anexo I - Perda Incorrida (90+ dias)
              {anexo1OK ? (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  OK
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-4 w-4 mr-1" />
                  ERRO
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              Faixas: {anexo1?.length || 0} / 22 {anexo1?.length === 22 ? "✅" : "❌"}
            </p>
            {anexo1 && anexo1.length > 0 && (
              <div className="mt-4 text-sm">
                <p className="font-semibold mb-2">
                  Primeira faixa (Menor que 1 mês):
                </p>
                <ul className="space-y-1">
                  <li>
                    C1: {anexo1[0].c1_percentual}%{" "}
                    {anexo1[0].c1_percentual === 5.50 ? "✅" : "❌ (esperado: 5.50%)"}
                  </li>
                  <li>
                    C2: {anexo1[0].c2_percentual}%{" "}
                    {anexo1[0].c2_percentual === 30.00 ? "✅" : "❌ (esperado: 30.00%)"}
                  </li>
                  <li>
                    C3: {anexo1[0].c3_percentual}%{" "}
                    {anexo1[0].c3_percentual === 45.00 ? "✅" : "❌ (esperado: 45.00%)"}
                  </li>
                  <li>
                    C4: {anexo1[0].c4_percentual}%{" "}
                    {anexo1[0].c4_percentual === 35.00 ? "✅" : "❌ (esperado: 35.00%)"}
                  </li>
                  <li>
                    C5: {anexo1[0].c5_percentual}%{" "}
                    {anexo1[0].c5_percentual === 50.00 ? "✅" : "❌ (esperado: 50.00%)"}
                  </li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Anexo II */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Anexo II - Perda Esperada (0-90 dias)
              {anexo2OK ? (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  OK
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-4 w-4 mr-1" />
                  ERRO
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              Faixas: {anexo2?.length || 0} / 4 {anexo2?.length === 4 ? "✅" : "❌"}
            </p>
            {anexo2 && anexo2.length > 0 && (
              <div className="mt-4 text-sm">
                <p className="font-semibold mb-2">Primeira faixa (0-14 dias):</p>
                <ul className="space-y-1">
                  <li>
                    C1: {anexo2[0].c1_percentual}%{" "}
                    {anexo2[0].c1_percentual === 1.40 ? "✅" : "❌ (esperado: 1.40%)"}
                  </li>
                  <li>
                    C5: {anexo2[0].c5_percentual}%{" "}
                    {anexo2[0].c5_percentual === 1.90 ? "✅" : "❌ (esperado: 1.90%)"}
                  </li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bancos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Bancos Brasileiros (S1-S4)
              {bancosOK ? (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  OK
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-4 w-4 mr-1" />
                  ERRO
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              Bancos: {bancos?.length || 0} / 33 (mínimo){" "}
              {bancosOK ? "✅" : "❌"}
            </p>
            {bancos && bancos.length > 0 && (
              <div className="mt-4 text-sm">
                <p className="font-semibold mb-2">Exemplos:</p>
                <ul className="space-y-1">
                  {bancos.slice(0, 6).map((banco) => (
                    <li key={banco.id}>
                      {banco.nome_curto} ({banco.codigo_compe}) - {banco.segmento_bcb}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tipos de Garantia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Tipos de Garantia (C1-C5)
              {tiposOK ? (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  OK
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-4 w-4 mr-1" />
                  ERRO
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              Tipos: {tiposGarantia?.length || 0} / 37 (mínimo){" "}
              {tiposOK ? "✅" : "❌"}
            </p>
            {tiposGarantia && tiposGarantia.length > 0 && (
              <div className="mt-4 text-sm">
                <p className="font-semibold mb-2">Distribuição por carteira:</p>
                <ul className="space-y-1">
                  <li>
                    C1: {tiposGarantia.filter((t) => t.carteira === "C1").length}{" "}
                    tipos {tiposGarantia.filter((t) => t.carteira === "C1").length === 7 ? "✅" : "❌"}
                  </li>
                  <li>
                    C2: {tiposGarantia.filter((t) => t.carteira === "C2").length}{" "}
                    tipos {tiposGarantia.filter((t) => t.carteira === "C2").length === 6 ? "✅" : "❌"}
                  </li>
                  <li>
                    C3: {tiposGarantia.filter((t) => t.carteira === "C3").length}{" "}
                    tipos {tiposGarantia.filter((t) => t.carteira === "C3").length === 9 ? "✅" : "❌"}
                  </li>
                  <li>
                    C4: {tiposGarantia.filter((t) => t.carteira === "C4").length}{" "}
                    tipos {tiposGarantia.filter((t) => t.carteira === "C4").length === 8 ? "✅" : "❌"}
                  </li>
                  <li>
                    C5: {tiposGarantia.filter((t) => t.carteira === "C5").length}{" "}
                    tipos {tiposGarantia.filter((t) => t.carteira === "C5").length === 7 ? "✅" : "❌"}
                  </li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
