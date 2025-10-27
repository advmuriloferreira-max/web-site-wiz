import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Database, Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ImportarSeriesBacen() {
  const navigate = useNavigate();
  const [importando, setImportando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [resultado, setResultado] = useState<any>(null);

  const iniciarImportacao = async () => {
    setImportando(true);
    setProgresso(10);
    setResultado(null);

    try {
      toast.info("Iniciando importação das séries BACEN...");
      setProgresso(30);

      const { data, error } = await supabase.functions.invoke('atualizar-taxas-juros-bacen', {
        body: {}
      });

      setProgresso(90);

      if (error) {
        throw new Error(error.message);
      }

      setProgresso(100);
      setResultado(data);
      
      toast.success(`Importação concluída! ${data.stats?.sucessos}/${data.stats?.total_series} séries importadas.`);

    } catch (error: any) {
      console.error("Erro na importação:", error);
      toast.error(`Erro ao importar: ${error.message}`);
      setResultado({ success: false, error: error.message });
    } finally {
      setImportando(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Database className="h-8 w-8 text-primary" />
          Importar Séries Temporais BACEN
        </h1>
        <p className="text-muted-foreground mt-2">
          Importe as 48 séries oficiais de taxas de juros do Banco Central
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📊 Sobre a Importação</CardTitle>
          <CardDescription>
            Esta ferramenta busca dados diretamente da API oficial do BACEN
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                📋 O que será importado:
              </p>
              <ul className="text-sm space-y-1 text-blue-600 dark:text-blue-400">
                <li>• 18 modalidades de Pessoa Física</li>
                <li>• 28 modalidades de Pessoa Jurídica</li>
                <li>• 2 séries totais consolidadas</li>
                <li>• Histórico completo desde 2011</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <p className="font-semibold text-green-700 dark:text-green-300 mb-2">
                ✅ Após a importação:
              </p>
              <ul className="text-sm space-y-1 text-green-600 dark:text-green-400">
                <li>• Análises de juros abusivos funcionais</li>
                <li>• Comparação automática com BACEN</li>
                <li>• Atualização diária às 4h AM</li>
                <li>• Dados sempre atualizados</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              ⚠️ Importante
            </p>
            <ul className="text-sm space-y-1 text-yellow-600 dark:text-yellow-400">
              <li>• A importação pode levar de 5 a 10 minutos</li>
              <li>• Cerca de 150.000+ registros serão processados</li>
              <li>• Não feche esta página durante a importação</li>
              <li>• A importação pode ser executada novamente para atualizar os dados</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {!importando && !resultado && (
        <Card>
          <CardHeader>
            <CardTitle>Iniciar Importação</CardTitle>
            <CardDescription>
              Clique no botão abaixo para iniciar a importação dos dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={iniciarImportacao} 
              size="lg" 
              className="w-full"
            >
              <Download className="mr-2 h-5 w-5" />
              Importar Séries BACEN Agora
            </Button>
          </CardContent>
        </Card>
      )}

      {importando && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Importação em Andamento...
            </CardTitle>
            <CardDescription>
              Aguarde enquanto os dados são processados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progresso} className="w-full" />
            <p className="text-center text-sm text-muted-foreground">
              {progresso}% concluído
            </p>
          </CardContent>
        </Card>
      )}

      {resultado && (
        <Card className={resultado.success ? "border-green-500" : "border-red-500"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {resultado.success ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Importação Concluída com Sucesso!
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Erro na Importação
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resultado.success && resultado.stats && (
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">
                    {resultado.stats.total_series}
                  </p>
                  <p className="text-sm text-muted-foreground">Total de Séries</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {resultado.stats.sucessos}
                  </p>
                  <p className="text-sm text-muted-foreground">Importadas</p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold">
                    {resultado.stats.total_registros?.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-muted-foreground">Registros</p>
                </div>
              </div>
            )}

            {resultado.error && (
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {resultado.error}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={() => navigate('/app/quick/juros-abusivos')} className="flex-1">
                Ir para Análise de Juros
              </Button>
              <Button 
                onClick={() => {
                  setResultado(null);
                  setProgresso(0);
                }} 
                variant="outline"
              >
                Nova Importação
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
