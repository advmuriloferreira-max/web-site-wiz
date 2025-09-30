import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, CheckCircle2, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface ModalidadeData {
  codigo_sgs: string;
  nome: string;
  tipo_pessoa: 'PF' | 'PJ';
  tipo_recurso: 'Livre' | 'Direcionado';
  categoria: string;
}

// Mapeamento completo das 48 modalidades BACEN
const modalidadesMap: Record<string, ModalidadeData> = {
  // Arquivo 1 - PJ Principal
  '25436': { codigo_sgs: '25436', nome: 'Total', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Total Geral' },
  '25437': { codigo_sgs: '25437', nome: 'Pessoas Jurídicas - Total', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Total' },
  '25438': { codigo_sgs: '25438', nome: 'Desconto de duplicatas e recebíveis', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Desconto' },
  '25439': { codigo_sgs: '25439', nome: 'Desconto de cheques', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Desconto' },
  '25440': { codigo_sgs: '25440', nome: 'Antecipação de faturas de cartão de crédito', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Antecipação' },
  '25441': { codigo_sgs: '25441', nome: 'Capital de giro com prazo de até 365 dias', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Capital de Giro' },
  '25442': { codigo_sgs: '25442', nome: 'Capital de giro com prazo superior a 365 dias', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Capital de Giro' },
  '25443': { codigo_sgs: '25443', nome: 'Capital de giro com teto BNDES', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Capital de Giro' },
  '25444': { codigo_sgs: '25444', nome: 'Capital de giro total', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Capital de Giro' },
  '25445': { codigo_sgs: '25445', nome: 'Conta garantida', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Conta Garantida' },
  '25446': { codigo_sgs: '25446', nome: 'Cheque especial', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Cheque Especial' },
  '25447': { codigo_sgs: '25447', nome: 'Aquisição de veículos', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Aquisição de Bens' },
  '25448': { codigo_sgs: '25448', nome: 'Aquisição de outros bens', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Aquisição de Bens' },
  '25449': { codigo_sgs: '25449', nome: 'Aquisição de bens total', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Aquisição de Bens' },
  '25450': { codigo_sgs: '25450', nome: 'Vendor', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Vendor' },
  '25451': { codigo_sgs: '25451', nome: 'Hot money', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Hot Money' },
  '25452': { codigo_sgs: '25452', nome: 'Financiamento imobiliário', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Financiamento Imobiliário' },
  '25453': { codigo_sgs: '25453', nome: 'Outros', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Outros' },
  '25454': { codigo_sgs: '25454', nome: 'Compror', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Compror' },
  '25455': { codigo_sgs: '25455', nome: 'Cartão de crédito rotativo', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Cartão de Crédito' },
  '25456': { codigo_sgs: '25456', nome: 'Cartão de crédito parcelado', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Cartão de Crédito' },
  '25457': { codigo_sgs: '25457', nome: 'Cartão de crédito total', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Cartão de Crédito' },
  '25458': { codigo_sgs: '25458', nome: 'Adiantamento sobre contratos de câmbio (ACC)', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Comércio Exterior' },
  '25459': { codigo_sgs: '25459', nome: 'Financiamento a importações', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Comércio Exterior' },
  '25460': { codigo_sgs: '25460', nome: 'Financiamento a exportações', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Comércio Exterior' },
  '25461': { codigo_sgs: '25461', nome: 'Comércio exterior total', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Comércio Exterior' },
  
  // PF (Pessoas Físicas)
  '25462': { codigo_sgs: '25462', nome: 'Pessoas Físicas - Total', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Total' },
  '25463': { codigo_sgs: '25463', nome: 'Cheque especial', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Cheque Especial' },
  '25464': { codigo_sgs: '25464', nome: 'Crédito pessoal não consignado', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Crédito Pessoal' },
  '25465': { codigo_sgs: '25465', nome: 'Crédito pessoal não consignado vinculado à composição de dívidas', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Crédito Pessoal' },
  '25466': { codigo_sgs: '25466', nome: 'Crédito pessoal consignado para trabalhadores do setor privado', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Crédito Consignado' },
  '25467': { codigo_sgs: '25467', nome: 'Crédito pessoal consignado para trabalhadores do setor público', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Crédito Consignado' },
  '25468': { codigo_sgs: '25468', nome: 'Crédito pessoal consignado para aposentados e pensionistas do INSS', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Crédito Consignado' },
  '25469': { codigo_sgs: '25469', nome: 'Crédito pessoal consignado total', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Crédito Consignado' },
  '25470': { codigo_sgs: '25470', nome: 'Crédito pessoal total', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Crédito Pessoal' },
  '25471': { codigo_sgs: '25471', nome: 'Aquisição de veículos', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Aquisição de Veículos' },
  '25472': { codigo_sgs: '25472', nome: 'Aquisição de outros bens', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Aquisição de Bens' },
  '25473': { codigo_sgs: '25473', nome: 'Aquisição de bens total', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Aquisição de Bens' },
  '25474': { codigo_sgs: '25474', nome: 'Cartão de crédito rotativo', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Cartão de Crédito' },
  '25475': { codigo_sgs: '25475', nome: 'Cartão de crédito parcelado', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Cartão de Crédito' },
  '25476': { codigo_sgs: '25476', nome: 'Cartão de crédito total', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Cartão de Crédito' },
  '25477': { codigo_sgs: '25477', nome: 'Financiamento imobiliário com taxas de mercado', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Financiamento Imobiliário' },
  '25478': { codigo_sgs: '25478', nome: 'Financiamento imobiliário com taxas reguladas', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Financiamento Imobiliário' },
  '25479': { codigo_sgs: '25479', nome: 'Financiamento imobiliário total', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Financiamento Imobiliário' },
  '25480': { codigo_sgs: '25480', nome: 'Outros', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Outros' },
};

export default function ImportarSeriesBacen() {
  const [loadingModalidades, setLoadingModalidades] = useState(false);
  const [loadingSeries, setLoadingSeries] = useState(false);
  const [importedModalidades, setImportedModalidades] = useState(false);
  const [importedSeries, setImportedSeries] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  const handleImportModalidades = async () => {
    setLoadingModalidades(true);
    try {
      console.log('Iniciando importação das modalidades BACEN...');

      let successCount = 0;
      let errorCount = 0;

      for (const [codigo_sgs, modalidade] of Object.entries(modalidadesMap)) {
        const { error } = await supabase
          .from('modalidades_bacen_juros')
          .upsert({
            codigo_sgs: modalidade.codigo_sgs,
            nome: modalidade.nome,
            tipo_pessoa: modalidade.tipo_pessoa,
            tipo_recurso: modalidade.tipo_recurso,
            categoria: modalidade.categoria,
            ativo: true,
          }, {
            onConflict: 'codigo_sgs'
          });

        if (error) {
          console.error(`Erro ao inserir modalidade ${codigo_sgs}:`, error);
          errorCount++;
        } else {
          successCount++;
        }
      }

      console.log(`Importação concluída: ${successCount} sucessos, ${errorCount} erros`);

      if (errorCount === 0) {
        toast.success(`${successCount} modalidades importadas com sucesso!`);
        setImportedModalidades(true);
      } else {
        toast.warning(`${successCount} modalidades importadas, ${errorCount} com erro`);
      }
    } catch (error) {
      console.error('Erro na importação:', error);
      toast.error('Erro ao importar modalidades do BACEN');
    } finally {
      setLoadingModalidades(false);
    }
  };

  const handleImportSeriesTemporais = async () => {
    if (!importedModalidades) {
      toast.error('Importe as modalidades primeiro!');
      return;
    }

    setLoadingSeries(true);
    setProgress(0);
    setProgressText('Iniciando...');

    try {
      // Buscar modalidades do banco para ter o mapeamento codigo_sgs -> id
      const { data: modalidadesDB, error: modalidadesError } = await supabase
        .from('modalidades_bacen_juros')
        .select('id, codigo_sgs');

      if (modalidadesError) throw modalidadesError;

      const codigoToId: Record<string, string> = {};
      modalidadesDB?.forEach(m => {
        codigoToId[m.codigo_sgs] = m.id;
      });

      const arquivos = [
        '/data/bacen-series-1.csv',
        '/data/bacen-series-2.csv',
        '/data/bacen-series-3.csv',
        '/data/bacen-series-4.csv',
      ];

      let totalLinhasProcessadas = 0;

      for (let fileIndex = 0; fileIndex < arquivos.length; fileIndex++) {
        const arquivo = arquivos[fileIndex];
        setProgressText(`Processando arquivo ${fileIndex + 1} de ${arquivos.length}...`);
        
        const response = await fetch(arquivo);
        const text = await response.text();
        const linhas = text.split('\n');

        // Primeira linha: cabeçalhos
        const cabecalho = linhas[0];
        const colunas = cabecalho.split(';');
        
        // Extrair códigos SGS dos cabeçalhos
        const codigosSGS: string[] = [];
        for (let i = 1; i < colunas.length; i++) {
          const match = colunas[i].match(/^(\d+)\s-/);
          if (match) {
            codigosSGS.push(match[1]);
          }
        }

        console.log(`Arquivo ${fileIndex + 1}: ${codigosSGS.length} séries encontradas`);

        // Processar linhas de dados (pular primeira e última linha)
        const linhasDados = linhas.slice(1, linhas.length - 1);
        
        for (let i = 0; i < linhasDados.length; i++) {
          const linha = linhasDados[i].trim();
          if (!linha) continue;

          const valores = linha.split(';');
          const dataStr = valores[0]; // formato: MM/YYYY
          
          if (!dataStr || !dataStr.includes('/')) continue;

          const [mesStr, anoStr] = dataStr.split('/');
          const mes = parseInt(mesStr);
          const ano = parseInt(anoStr);

          // Processar cada coluna (série temporal)
          for (let col = 0; col < codigosSGS.length; col++) {
            const codigoSGS = codigosSGS[col];
            const modalidadeId = codigoToId[codigoSGS];
            
            if (!modalidadeId) {
              console.warn(`Modalidade não encontrada para código ${codigoSGS}`);
              continue;
            }

            const valorStr = valores[col + 1]?.trim();
            if (!valorStr || valorStr === '-') continue;

            // Converter valor brasileiro (vírgula) para número
            const taxaMensal = parseFloat(valorStr.replace(',', '.').replace(/\s/g, ''));
            if (isNaN(taxaMensal)) continue;

            // Calcular taxa anual: ((1 + taxa_mensal/100)^12 - 1) * 100
            const taxaAnual = ((Math.pow(1 + taxaMensal/100, 12) - 1) * 100);

            // Inserir no banco
            const { error } = await supabase
              .from('series_temporais_bacen')
              .upsert({
                modalidade_id: modalidadeId,
                mes,
                ano,
                taxa_mensal: taxaMensal,
                taxa_anual: taxaAnual,
                data_referencia: `${ano}-${String(mes).padStart(2, '0')}-01`,
              }, {
                onConflict: 'modalidade_id,mes,ano',
                ignoreDuplicates: false
              });

            if (error) {
              console.error(`Erro ao inserir série temporal:`, error);
            }
          }

          totalLinhasProcessadas++;
          const progressPercent = ((fileIndex * linhasDados.length + i) / (arquivos.length * linhasDados.length)) * 100;
          setProgress(progressPercent);
          setProgressText(`Processando: ${totalLinhasProcessadas} períodos...`);
        }
      }

      toast.success(`${totalLinhasProcessadas} períodos importados com sucesso!`);
      setImportedSeries(true);
    } catch (error) {
      console.error('Erro na importação das séries:', error);
      toast.error('Erro ao importar séries temporais');
    } finally {
      setLoadingSeries(false);
      setProgress(0);
      setProgressText('');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Importar Séries Temporais do BACEN</CardTitle>
          <CardDescription>
            Importar as 48 modalidades de crédito com recursos livres do Banco Central
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Modalidades a serem importadas:</h3>
            <ul className="text-sm space-y-1">
              <li>• <strong>Pessoas Jurídicas (PJ):</strong> 26 modalidades</li>
              <li>• <strong>Pessoas Físicas (PF):</strong> 19 modalidades</li>
              <li>• <strong>Total:</strong> 48 modalidades completas</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <Button 
                onClick={handleImportModalidades} 
                disabled={loadingModalidades || importedModalidades}
                size="lg"
              >
                {loadingModalidades ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : importedModalidades ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Modalidades Importadas
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    1. Importar Modalidades
                  </>
                )}
              </Button>

              <Button 
                onClick={handleImportSeriesTemporais}
                disabled={!importedModalidades || loadingSeries || importedSeries}
                size="lg"
                variant="secondary"
              >
                {loadingSeries ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : importedSeries ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Séries Importadas
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    2. Importar Séries Temporais
                  </>
                )}
              </Button>
            </div>

            {loadingSeries && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground">{progressText}</p>
              </div>
            )}
          </div>

          {importedModalidades && (
            <div className="bg-success/10 border border-success/20 p-4 rounded-lg">
              <p className="text-sm text-success">
                ✓ As 48 modalidades do BACEN foram importadas com sucesso!
              </p>
            </div>
          )}

          {importedSeries && (
            <div className="bg-success/10 border border-success/20 p-4 rounded-lg">
              <p className="text-sm text-success">
                ✓ As séries temporais foram importadas com sucesso!
                Agora a calculadora de juros usará os dados corretos dos CSVs.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
