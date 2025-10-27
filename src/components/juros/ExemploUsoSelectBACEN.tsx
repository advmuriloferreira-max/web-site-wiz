import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectJurosBACEN } from "./SelectJurosBACEN";
import { useTaxaJurosBacenPorData } from "@/hooks/useTaxasJurosBacen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

/**
 * Componente de exemplo demonstrando o uso do SelectJurosBACEN
 * Remove este arquivo após integrar em suas páginas reais
 */
export function ExemploUsoSelectBACEN() {
  const [modalidadeId, setModalidadeId] = useState<string>("");
  const [dataReferencia, setDataReferencia] = useState<string>("");
  
  const { data: taxa, isLoading } = useTaxaJurosBacenPorData(
    modalidadeId || null,
    dataReferencia || null
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Exemplo de Uso - SelectJurosBACEN</CardTitle>
          <CardDescription>
            Demonstração do componente de seleção hierárquico de modalidades BACEN
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Select de Modalidade */}
          <SelectJurosBACEN
            value={modalidadeId}
            onValueChange={setModalidadeId}
            label="Selecione a Modalidade de Crédito"
            placeholder="Escolha a modalidade BACEN..."
            required
          />

          {/* Input de Data */}
          <div className="space-y-2">
            <Label htmlFor="data">
              Data de Referência
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="data"
              type="date"
              value={dataReferencia}
              onChange={(e) => setDataReferencia(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-muted-foreground">
              Selecione a data para consultar a taxa BACEN correspondente
            </p>
          </div>

          {/* Botão de Consulta */}
          <Button
            onClick={() => {
              if (modalidadeId && dataReferencia) {
                console.log("Consultando taxa:", { modalidadeId, dataReferencia });
              }
            }}
            disabled={!modalidadeId || !dataReferencia}
            className="w-full"
          >
            Consultar Taxa BACEN
          </Button>

          {/* Resultado */}
          {isLoading && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                🔍 Consultando taxa BACEN...
              </p>
            </div>
          )}

          {taxa && (
            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-300 flex items-center gap-2">
                  ✅ Taxa Encontrada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Modalidade</p>
                  <p className="font-semibold">{taxa.modalidades_bacen_juros.nome}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Categoria</p>
                    <Badge variant="outline">{taxa.modalidades_bacen_juros.categoria}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo Recurso</p>
                    <Badge variant="outline">{taxa.modalidades_bacen_juros.tipo_recurso}</Badge>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-1">Taxa Mensal</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {taxa.taxa_mensal.toFixed(2)}% a.m.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground">Código SGS</p>
                    <p className="font-mono font-semibold">{taxa.modalidades_bacen_juros.codigo_sgs}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Data Referência</p>
                    <p className="font-semibold">
                      {new Date(taxa.data_referencia).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {modalidadeId && dataReferencia && !isLoading && !taxa && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                ⚠️ Taxa não encontrada para esta data. Tente uma data mais recente ou execute a importação de dados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações adicionais */}
      <Card className="mt-6 bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">ℹ️ Como usar este componente</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            <strong>1.</strong> Importe o componente:{" "}
            <code className="bg-muted px-2 py-1 rounded">
              import {"{"} SelectJurosBACEN {"}"} from "@/components/juros/SelectJurosBACEN"
            </code>
          </p>
          <p>
            <strong>2.</strong> Use no seu formulário:{" "}
            <code className="bg-muted px-2 py-1 rounded">
              {"<SelectJurosBACEN value={value} onValueChange={setValue} />"}
            </code>
          </p>
          <p>
            <strong>3.</strong> O value retornado é o{" "}
            <code className="bg-muted px-2 py-1 rounded">codigo_serie</code> da modalidade
          </p>
          <p>
            <strong>4.</strong> Use os hooks auxiliares para buscar dados:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>
              <code className="bg-muted px-2 py-1 rounded text-xs">
                useTaxaJurosBacenPorData(codigo, data)
              </code>{" "}
              - Taxa específica
            </li>
            <li>
              <code className="bg-muted px-2 py-1 rounded text-xs">
                useHistoricoTaxasJurosBacen(codigo)
              </code>{" "}
              - Histórico de taxas
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
