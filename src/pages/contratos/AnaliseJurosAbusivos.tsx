import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, FileText, Save, Calculator, Loader2, AlertTriangle, TrendingUp, DollarSign, Download, BarChart } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
import { useCreateAnaliseJuros } from "@/hooks/useAnaliseJuros";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  completarDadosContrato,
  calcularTaxaAnual,
  analisarAbusividade,
  calcularPrejuizo,
  gerarTabelaPrice,
  analisarDiscrepanciaTaxas,
  calcularProjecoesBacen,
  calcularPrejuizoDetalhado,
  analisarSaldoDevedor,
  type DadosContratoJuros,
  type ResultadoCalculo,
  type AnaliseAbusividade,
  type CalculoPrejuizo,
  type AnaliseDiscrepancia,
  type ProjecoesTaxaBacen,
  type PrejuizoDetalhado,
  type AnaliseSaldoDevedor,
} from "@/lib/calculosJurosAbusivos";

export default function AnaliseJurosAbusivos() {
  const { id: contratoId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contrato, isLoading } = useContratoById(contratoId!);
  const createAnalise = useCreateAnaliseJuros();

  // Identificação do contrato
  const [modalidadeId, setModalidadeId] = useState("");
  const [dataAssinatura, setDataAssinatura] = useState("");
  
  // Regra de 3 - preencher 3 dos 4 campos
  const [valorFinanciado, setValorFinanciado] = useState("");
  const [taxaMensal, setTaxaMensal] = useState("");
  const [valorParcela, setValorParcela] = useState("");
  const [numeroParcelas, setNumeroParcelas] = useState("");
  
  // Dados adicionais opcionais
  const [parcelasJaPagas, setParcelasJaPagas] = useState("");
  const [saldoDevedorAtual, setSaldoDevedorAtual] = useState("");
  const [taxaPrevistaContrato, setTaxaPrevistaContrato] = useState("");
  const [valorEntrada, setValorEntrada] = useState("");
  const [iofCobrado, setIofCobrado] = useState("");
  
  const [observacoes, setObservacoes] = useState("");
  
  // Resultados
  const [dadosCompletos, setDadosCompletos] = useState<ResultadoCalculo | null>(null);
  const [analiseAbusividade, setAnaliseAbusividade] = useState<AnaliseAbusividade | null>(null);
  const [analisePrejuizo, setAnalisePrejuizo] = useState<CalculoPrejuizo | null>(null);
  const [analiseDiscrepancia, setAnaliseDiscrepancia] = useState<AnaliseDiscrepancia | null>(null);
  const [projecoesBacen, setProjecoesBacen] = useState<ProjecoesTaxaBacen | null>(null);
  const [prejuizoDetalhado, setPrejuizoDetalhado] = useState<PrejuizoDetalhado | null>(null);
  const [analiseSaldo, setAnaliseSaldo] = useState<AnaliseSaldoDevedor | null>(null);
  const [tabelaPrice, setTabelaPrice] = useState<any[]>([]);

  const { data: taxaBacenData } = useTaxaJurosBacenPorData(
    modalidadeId || null,
    dataAssinatura || null
  );

  useEffect(() => {
    if (contrato) {
      if (contrato.taxa_juros_contratual) setTaxaMensal(contrato.taxa_juros_contratual.toString());
      if (contrato.modalidade_bacen_id) setModalidadeId(contrato.modalidade_bacen_id);
      if (contrato.data_assinatura) setDataAssinatura(contrato.data_assinatura);
      if (contrato.valor_financiado) setValorFinanciado(contrato.valor_financiado.toString());
      if (contrato.valor_parcela) setValorParcela(contrato.valor_parcela.toString());
      if (contrato.numero_parcelas) setNumeroParcelas(contrato.numero_parcelas.toString());
    }
  }, [contrato]);
  
  // Validação: contar quantos campos estão preenchidos
  const camposPreenchidos = [valorFinanciado, taxaMensal, valorParcela, numeroParcelas]
    .filter((v) => v && parseFloat(v) > 0).length;

  const calcularAnalise = () => {
    if (!modalidadeId || !dataAssinatura || !taxaBacenData) {
      toast.error("Preencha a modalidade e data de assinatura");
      return;
    }

    if (camposPreenchidos !== 3) {
      toast.error("Preencha exatamente 3 dos 4 campos da Regra de 3");
      return;
    }

    try {
      // 1. Completar dados do contrato (calcular campo faltante)
      const dados: DadosContratoJuros = {
        valorFinanciado: valorFinanciado ? parseFloat(valorFinanciado) : undefined,
        taxaMensal: taxaMensal ? parseFloat(taxaMensal) : undefined,
        valorParcela: valorParcela ? parseFloat(valorParcela) : undefined,
        numeroParcelas: numeroParcelas ? parseFloat(numeroParcelas) : undefined,
      };

      const resultado = completarDadosContrato(dados);
      if (!resultado) {
        toast.error("Erro ao calcular dados do contrato");
        return;
      }
      setDadosCompletos(resultado);

      // Atualizar campos calculados
      if (!valorFinanciado) setValorFinanciado(resultado.valorFinanciado.toFixed(2));
      if (!taxaMensal) setTaxaMensal(resultado.taxaMensal.toFixed(2));
      if (!valorParcela) setValorParcela(resultado.valorParcela.toFixed(2));
      if (!numeroParcelas) setNumeroParcelas(Math.round(resultado.numeroParcelas).toString());

      // 2. Análise de abusividade
      const taxaBacen = taxaBacenData.taxa_mensal;
      const analise = analisarAbusividade(resultado.taxaMensal, taxaBacen);
      setAnaliseAbusividade(analise);

      // 3. Análise de discrepância (taxa real vs contratual)
      if (taxaPrevistaContrato && parseFloat(taxaPrevistaContrato) > 0) {
        const discrepancia = analisarDiscrepanciaTaxas(
          resultado.taxaMensal,
          parseFloat(taxaPrevistaContrato)
        );
        setAnaliseDiscrepancia(discrepancia);
      }

      // 4. Projeções com taxa BACEN
      const projecoes = calcularProjecoesBacen(
        resultado.valorFinanciado,
        resultado.valorParcela,
        resultado.numeroParcelas,
        resultado.taxaMensal,
        taxaBacen
      );
      setProjecoesBacen(projecoes);

      // 5. Cálculo de prejuízo detalhado (se tiver parcelas pagas)
      if (parcelasJaPagas && parseFloat(parcelasJaPagas) > 0) {
        const parcelasPagasNum = parseFloat(parcelasJaPagas);
        const parcelasRestantes = resultado.numeroParcelas - parcelasPagasNum;
        
        const prejuizoCompleto = calcularPrejuizoDetalhado(
          projecoes.diferencaParcela,
          parcelasPagasNum,
          parcelasRestantes,
          resultado.valorParcela * resultado.numeroParcelas
        );
        setPrejuizoDetalhado(prejuizoCompleto);

        // Cálculo antigo para manter compatibilidade
        const prejuizo = calcularPrejuizo(
          resultado.valorFinanciado,
          resultado.numeroParcelas,
          parcelasPagasNum,
          resultado.taxaMensal,
          taxaBacen
        );
        setAnalisePrejuizo(prejuizo);
      }

      // 6. Análise de saldo devedor (se informado)
      if (saldoDevedorAtual && parseFloat(saldoDevedorAtual) > 0 && parcelasJaPagas) {
        const saldo = analisarSaldoDevedor(
          resultado.valorFinanciado,
          resultado.taxaMensal,
          taxaBacen,
          resultado.numeroParcelas,
          parseFloat(parcelasJaPagas),
          parseFloat(saldoDevedorAtual)
        );
        setAnaliseSaldo(saldo);
      }

      // 7. Gerar tabela Price
      const tabela = gerarTabelaPrice(
        resultado.valorFinanciado,
        resultado.taxaMensal,
        resultado.numeroParcelas
      );
      setTabelaPrice(tabela.slice(0, 12)); // Primeiras 12 parcelas

      toast.success("Análise completa realizada!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao realizar análise");
    }
  };

  const salvarAnalise = async () => {
    if (!dadosCompletos || !analiseAbusividade || !contratoId) {
      toast.error("Realize a análise antes de salvar");
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();

      await createAnalise.mutateAsync({
        contrato_id: contratoId,
        modalidade_bacen_id: modalidadeId || null,
        valor_financiado: dadosCompletos.valorFinanciado,
        valor_parcela: dadosCompletos.valorParcela,
        numero_parcelas: Math.round(dadosCompletos.numeroParcelas),
        taxa_contratual: dadosCompletos.taxaMensal,
        data_referencia: dataAssinatura,
        taxa_real_aplicada: dadosCompletos.taxaMensal,
        taxa_media_bacen: taxaBacenData?.taxa_mensal || 0,
        diferenca_absoluta: analiseAbusividade.diferencaAbsoluta,
        diferenca_percentual: analiseAbusividade.percentualAbusividade,
        abusividade_detectada: analiseAbusividade.abusividadeDetectada,
        usuario_id: userData.user?.id,
        observacoes,
        metodologia: 'Análise Completa com Regra de 3 e Tabela Price',
        fonte_taxa_bacen: 'SGS - Sistema Gerenciador de Séries Temporais',
        data_analise: new Date().toISOString(),
      } as any);

      toast.success("Análise salva com sucesso!");
      navigate(-1);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar análise");
    }
  };

  // ===== FUNÇÕES DE GERAÇÃO DE RELATÓRIOS =====
  
  const gerarRelatorioAbusividade = () => {
    if (!dadosCompletos || !analiseAbusividade || !taxaBacenData) return;
    
    const pdf = new jsPDF();
    
    // Cabeçalho
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("RELATÓRIO DE ANÁLISE DE ABUSIVIDADE DE JUROS", 105, 20, { align: "center" });
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 28, { align: "center" });
    
    let y = 40;
    
    // 1. DADOS DO CONTRATO
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("1. DADOS DO CONTRATO", 20, y);
    y += 10;
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Cliente: ${contrato?.clientes?.nome || "N/A"}`, 20, y);
    y += 6;
    pdf.text(`Instituição: ${contrato?.bancos?.nome || "N/A"}`, 20, y);
    y += 6;
    pdf.text(`Nº Contrato: ${contrato?.numero_contrato || "N/A"}`, 20, y);
    y += 6;
    pdf.text(`Data Assinatura: ${new Date(dataAssinatura).toLocaleDateString('pt-BR')}`, 20, y);
    y += 15;
    
    // 2. ANÁLISE DE TAXAS
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("2. ANÁLISE DE TAXAS", 20, y);
    y += 10;
    
    autoTable(pdf, {
      startY: y,
      head: [['Taxa', 'Mensal', 'Anual', 'Status']],
      body: [
        ['Taxa Real Aplicada', `${dadosCompletos.taxaMensal.toFixed(2)}%`, `${dadosCompletos.taxaAnual.toFixed(2)}%`, '-'],
        ['Taxa BACEN (Mercado)', `${taxaBacenData.taxa_mensal.toFixed(2)}%`, `${calcularTaxaAnual(taxaBacenData.taxa_mensal).toFixed(2)}%`, '-'],
        ['Limite Aceitável (1,5x)', `${analiseAbusividade.taxaLimiteAceitavel.toFixed(2)}%`, `${calcularTaxaAnual(analiseAbusividade.taxaLimiteAceitavel).toFixed(2)}%`, analiseAbusividade.excedeLimite ? 'EXCEDIDO' : 'Dentro'],
      ],
    });
    
    y = (pdf as any).lastAutoTable.finalY + 15;
    
    // 3. VEREDITO
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("3. VEREDITO", 20, y);
    y += 10;
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Status: ${analiseAbusividade.abusividadeDetectada ? "ABUSIVIDADE DETECTADA" : "SEM ABUSIVIDADE"}`, 20, y);
    y += 6;
    pdf.text(`Grau: ${analiseAbusividade.grauAbusividade}`, 20, y);
    y += 6;
    pdf.text(`Percentual de Abusividade: ${analiseAbusividade.percentualAbusividade.toFixed(2)}%`, 20, y);
    y += 6;
    pdf.text(`Diferença Absoluta: ${analiseAbusividade.diferencaAbsoluta.toFixed(2)} pontos percentuais`, 20, y);
    
    pdf.save(`analise_abusividade_${contrato?.numero_contrato || 'contrato'}.pdf`);
    toast.success("Relatório gerado com sucesso!");
  };

  const gerarRelatorioDiscrepancia = () => {
    if (!analiseDiscrepancia || !dadosCompletos) {
      toast.error("Não há discrepância detectada para gerar relatório");
      return;
    }
    
    const pdf = new jsPDF();
    
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("RELATÓRIO DE DISCREPÂNCIA CONTRATUAL", 105, 20, { align: "center" });
    
    let y = 40;
    
    pdf.setFontSize(12);
    pdf.text("COMPARAÇÃO TAXA PREVISTA vs TAXA APLICADA", 20, y);
    y += 15;
    
    autoTable(pdf, {
      startY: y,
      head: [['Item', 'Valor']],
      body: [
        ['Taxa Contratual Prevista', `${analiseDiscrepancia.taxaContratual.toFixed(2)}% a.m.`],
        ['Taxa Real Aplicada', `${analiseDiscrepancia.taxaReal.toFixed(2)}% a.m.`],
        ['Diferença', `${analiseDiscrepancia.diferencaTaxas.toFixed(2)} p.p.`],
        ['Percentual de Diferença', `${analiseDiscrepancia.percentualDiferenca.toFixed(2)}%`],
      ],
    });
    
    y = (pdf as any).lastAutoTable.finalY + 15;
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("FUNDAMENTAÇÃO LEGAL", 20, y);
    y += 10;
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const texto = pdf.splitTextToSize(
      "A aplicação de taxa de juros diferente da prevista no contrato caracteriza descumprimento " +
      "contratual e cobrança indevida, conforme art. 422 do Código Civil (princípio da boa-fé objetiva) " +
      "e art. 51, IV do CDC (cláusulas abusivas).",
      170
    );
    pdf.text(texto, 20, y);
    
    pdf.save(`discrepancia_contratual_${contrato?.numero_contrato || 'contrato'}.pdf`);
    toast.success("Relatório de discrepância gerado!");
  };

  const gerarRelatorioImpactoFinanceiro = () => {
    if (!projecoesBacen || !dadosCompletos) return;
    
    const pdf = new jsPDF();
    
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("RELATÓRIO DE IMPACTO FINANCEIRO", 105, 20, { align: "center" });
    
    let y = 40;
    
    pdf.setFontSize(12);
    pdf.text("COMPARAÇÃO DETALHADA", 20, y);
    y += 15;
    
    autoTable(pdf, {
      startY: y,
      head: [['Item', 'Contratual', 'Correto (BACEN)', 'Diferença', '%']],
      body: [
        [
          'Valor Financiado',
          `R$ ${dadosCompletos.valorFinanciado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `R$ ${projecoesBacen.valorFinanciadoCorreto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `R$ ${projecoesBacen.diferencaValorFinanciado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `${projecoesBacen.percentualDiferencaFinanciado.toFixed(2)}%`
        ],
        [
          'Parcela Mensal',
          `R$ ${dadosCompletos.valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `R$ ${projecoesBacen.parcelaCorreta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `R$ ${projecoesBacen.diferencaParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `${projecoesBacen.percentualDiferencaParcela.toFixed(2)}%`
        ],
        [
          'Total Financiamento',
          `R$ ${dadosCompletos.totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `R$ ${projecoesBacen.totalCorreto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `R$ ${projecoesBacen.diferencaTotalFinanciamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `${((projecoesBacen.diferencaTotalFinanciamento / projecoesBacen.totalCorreto) * 100).toFixed(2)}%`
        ],
      ],
    });
    
    pdf.save(`impacto_financeiro_${contrato?.numero_contrato || 'contrato'}.pdf`);
    toast.success("Relatório de impacto financeiro gerado!");
  };

  const gerarRelatorioPrejuizo = () => {
    if (!prejuizoDetalhado) {
      toast.error("Preencha o número de parcelas pagas para gerar este relatório");
      return;
    }
    
    const pdf = new jsPDF();
    
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("DEMONSTRATIVO DE PREJUÍZO DO CLIENTE", 105, 20, { align: "center" });
    
    let y = 40;
    
    autoTable(pdf, {
      startY: y,
      head: [['Descrição', 'Valor']],
      body: [
        ['Valor Já Pago Indevidamente', `R$ ${prejuizoDetalhado.totalPagoIndevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Economia Futura (se revisar agora)', `R$ ${prejuizoDetalhado.economiaFutura.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['ECONOMIA TOTAL', `R$ ${prejuizoDetalhado.economiaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Devolução em Dobro (CDC Art. 42)', `R$ ${prejuizoDetalhado.devolucaoDobro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ],
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] },
    });
    
    y = (pdf as any).lastAutoTable.finalY + 15;
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("FUNDAMENTAÇÃO LEGAL - CDC Art. 42, Parágrafo Único:", 20, y);
    y += 8;
    pdf.setFont("helvetica", "normal");
    const texto = pdf.splitTextToSize(
      "O consumidor cobrado em quantia indevida tem direito à repetição do indébito, " +
      "por valor igual ao dobro do que pagou em excesso, acrescido de correção monetária e juros legais.",
      170
    );
    pdf.text(texto, 20, y);
    
    pdf.save(`demonstrativo_prejuizo_${contrato?.numero_contrato || 'contrato'}.pdf`);
    toast.success("Demonstrativo de prejuízo gerado!");
  };

  const gerarPlanilhaAmortizacao = () => {
    if (!tabelaPrice.length || !dadosCompletos || !taxaBacenData) return;
    
    const pdf = new jsPDF('l', 'mm', 'a4'); // landscape
    
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("PLANILHA DE AMORTIZAÇÃO COMPARATIVA", 148, 15, { align: "center" });
    
    // Gerar tabela correta com taxa BACEN
    const tabelaCorreta = gerarTabelaPrice(
      dadosCompletos.valorFinanciado,
      taxaBacenData.taxa_mensal,
      dadosCompletos.numeroParcelas
    ).slice(0, 12);
    
    const dados = tabelaPrice.map((p, i) => {
      const correta = tabelaCorreta[i];
      return [
        p.numero,
        `R$ ${p.valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${correta.valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${(p.valorParcela - correta.valorParcela).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${p.saldoDevedor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${correta.saldoDevedor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      ];
    });
    
    autoTable(pdf, {
      startY: 25,
      head: [['#', 'Parcela Original', 'Parcela Correta', 'Diferença', 'Saldo Original', 'Saldo Correto']],
      body: dados,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
    });
    
    pdf.save(`planilha_amortizacao_${contrato?.numero_contrato || 'contrato'}.pdf`);
    toast.success("Planilha de amortização gerada!");
  };

  const gerarRelatorioSaldoDevedor = () => {
    if (!analiseSaldo) {
      toast.error("Preencha o saldo devedor atual para gerar este relatório");
      return;
    }
    
    const pdf = new jsPDF();
    
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("ANÁLISE DE SALDO DEVEDOR", 105, 20, { align: "center" });
    
    let y = 40;
    
    autoTable(pdf, {
      startY: y,
      body: [
        ['Saldo Devedor Atual (informado)', `R$ ${analiseSaldo.saldoDevedorAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Saldo Devedor Correto (Taxa BACEN)', `R$ ${analiseSaldo.saldoDevedorCorreto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Diferença (valor indevido)', `R$ ${analiseSaldo.diferencaSaldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
        ['Percentual de Diferença', `${analiseSaldo.percentualDiferencaSaldo.toFixed(2)}%`],
      ],
      theme: 'grid',
      styles: { fontSize: 11 },
    });
    
    pdf.save(`analise_saldo_devedor_${contrato?.numero_contrato || 'contrato'}.pdf`);
    toast.success("Análise de saldo devedor gerada!");
  };

  const gerarResumoExecutivo = () => {
    if (!dadosCompletos || !analiseAbusividade) return;
    
    const pdf = new jsPDF();
    
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("RESUMO EXECUTIVO PARA PETIÇÃO", 105, 20, { align: "center" });
    
    let y = 40;
    
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    
    const paragrafo1 = pdf.splitTextToSize(
      `Conforme análise técnica realizada, o contrato nº ${contrato?.numero_contrato || "N/A"} ` +
      `firmado com ${contrato?.bancos?.nome || "instituição financeira"} em ${new Date(dataAssinatura).toLocaleDateString('pt-BR')} ` +
      `apresenta as seguintes irregularidades:`,
      170
    );
    pdf.text(paragrafo1, 20, y);
    y += paragrafo1.length * 7 + 10;
    
    if (analiseDiscrepancia?.temDiscrepancia) {
      pdf.setFont("helvetica", "bold");
      pdf.text("1. DISCREPÂNCIA CONTRATUAL", 20, y);
      y += 8;
      pdf.setFont("helvetica", "normal");
      const texto1 = pdf.splitTextToSize(
        `A taxa de juros real aplicada (${dadosCompletos.taxaMensal.toFixed(2)}% a.m.) diverge da taxa ` +
        `contratual prevista (${analiseDiscrepancia.taxaContratual.toFixed(2)}% a.m.), caracterizando ` +
        `descumprimento contratual e cobrança indevida.`,
        170
      );
      pdf.text(texto1, 20, y);
      y += texto1.length * 7 + 10;
    }
    
    if (analiseAbusividade.abusividadeDetectada) {
      pdf.setFont("helvetica", "bold");
      pdf.text("2. ABUSIVIDADE DE JUROS", 20, y);
      y += 8;
      pdf.setFont("helvetica", "normal");
      const texto2 = pdf.splitTextToSize(
        `A taxa de juros aplicada (${dadosCompletos.taxaMensal.toFixed(2)}% a.m.) supera em ` +
        `${analiseAbusividade.percentualAbusividade.toFixed(2)}% a taxa média de mercado divulgada pelo ` +
        `Banco Central (${taxaBacenData?.taxa_mensal.toFixed(2)}% a.m.), ultrapassando o limite de 1,5 vezes ` +
        `estabelecido pela jurisprudência do STJ, caracterizando abusividade ${analiseAbusividade.grauAbusividade.toLowerCase()}.`,
        170
      );
      pdf.text(texto2, 20, y);
      y += texto2.length * 7 + 10;
    }
    
    if (prejuizoDetalhado) {
      pdf.setFont("helvetica", "bold");
      pdf.text("3. PREJUÍZO FINANCEIRO", 20, y);
      y += 8;
      pdf.setFont("helvetica", "normal");
      const texto3 = pdf.splitTextToSize(
        `O cliente já pagou R$ ${prejuizoDetalhado.totalPagoIndevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ` +
        `a mais do que deveria, e caso não haja revisão, pagará mais ` +
        `R$ ${prejuizoDetalhado.economiaFutura.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} indevidamente, ` +
        `totalizando um prejuízo de R$ ${prejuizoDetalhado.economiaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
        170
      );
      pdf.text(texto3, 20, y);
      y += texto3.length * 7 + 10;
    }
    
    // Nova página para pedidos
    pdf.addPage();
    y = 20;
    
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("PEDIDOS", 20, y);
    y += 15;
    
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text("Diante do exposto, requer-se:", 20, y);
    y += 10;
    
    pdf.text("a) A revisão da taxa de juros aplicada;", 25, y);
    y += 7;
    pdf.text("b) A repetição do indébito, em dobro, conforme CDC Art. 42;", 25, y);
    y += 7;
    pdf.text("c) A redução do saldo devedor;", 25, y);
    y += 7;
    pdf.text("d) A recalculação das parcelas vincendas.", 25, y);
    
    pdf.save(`resumo_executivo_${contrato?.numero_contrato || 'contrato'}.pdf`);
    toast.success("Resumo executivo gerado!");
  };

  const gerarRelatorioConsolidado = () => {
    if (!dadosCompletos || !analiseAbusividade) return;
    
    const pdf = new jsPDF();
    
    // Capa
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("RELATÓRIO CONSOLIDADO", 105, 100, { align: "center" });
    pdf.text("ANÁLISE DE JUROS ABUSIVOS", 105, 115, { align: "center" });
    
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Contrato: ${contrato?.numero_contrato || "N/A"}`, 105, 140, { align: "center" });
    pdf.text(`Cliente: ${contrato?.clientes?.nome || "N/A"}`, 105, 150, { align: "center" });
    pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 105, 160, { align: "center" });
    
    // Sumário executivo
    pdf.addPage();
    let y = 20;
    
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("SUMÁRIO EXECUTIVO", 20, y);
    y += 15;
    
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Status: ${analiseAbusividade.abusividadeDetectada ? "ABUSIVIDADE DETECTADA" : "SEM ABUSIVIDADE"}`, 20, y);
    y += 8;
    pdf.text(`Grau: ${analiseAbusividade.grauAbusividade}`, 20, y);
    y += 8;
    pdf.text(`Percentual de Abusividade: ${analiseAbusividade.percentualAbusividade.toFixed(2)}%`, 20, y);
    
    if (prejuizoDetalhado) {
      y += 15;
      pdf.setFont("helvetica", "bold");
      pdf.text("PREJUÍZO TOTAL:", 20, y);
      pdf.setFont("helvetica", "normal");
      pdf.text(`R$ ${prejuizoDetalhado.economiaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 70, y);
    }
    
    toast.success("Relatório consolidado gerado! (Páginas 1-2)");
    pdf.save(`relatorio_consolidado_${contrato?.numero_contrato || 'contrato'}.pdf`);
  };

  if (isLoading) return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!contrato) return <div className="container mx-auto py-8"><Card><CardContent className="py-8"><p className="text-center text-muted-foreground">Contrato não encontrado</p></CardContent></Card></div>;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-3xl font-bold">Análise Completa de Juros Abusivos</h1>
          <p className="text-muted-foreground">Análise avançada com Regra de 3 e Tabela Price</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Informações do Contrato</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div><Label className="text-muted-foreground">Cliente</Label><p className="font-medium">{contrato.clientes?.nome}</p></div>
          <div><Label className="text-muted-foreground">Banco</Label><p className="font-medium">{contrato.bancos?.nome || "-"}</p></div>
          <div><Label className="text-muted-foreground">Número do Contrato</Label><p className="font-medium">{contrato.numero_contrato || "-"}</p></div>
        </CardContent>
      </Card>

      {/* SEÇÃO 1: Identificação do Contrato */}
      <Card>
        <CardHeader>
          <CardTitle>1. Identificação do Contrato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Data de Assinatura *</Label>
              <Input
                type="date"
                value={dataAssinatura}
                onChange={(e) => setDataAssinatura(e.target.value)}
                required
              />
            </div>
            <div>
              <SelectJurosBACEN value={modalidadeId} onValueChange={setModalidadeId} required />
            </div>
          </div>

          {taxaBacenData && (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-semibold">Taxa Média BACEN: {taxaBacenData.taxa_mensal.toFixed(2)}% a.m. / {calcularTaxaAnual(taxaBacenData.taxa_mensal).toFixed(2)}% a.a.</p>
                  <p className="text-sm">Taxa Limite Aceitável (1,5x): {(taxaBacenData.taxa_mensal * 1.5).toFixed(2)}% a.m. / {(calcularTaxaAnual(taxaBacenData.taxa_mensal) * 1.5).toFixed(2)}% a.a.</p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* SEÇÃO 2: Dados do Contrato (Regra de 3) */}
      <Card>
        <CardHeader>
          <CardTitle>2. Dados do Contrato (Regra de 3)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Preencha exatamente 3 dos 4 campos abaixo. O sistema calculará automaticamente o campo vazio.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {camposPreenchidos !== 3 && camposPreenchidos > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Você preencheu {camposPreenchidos} campo(s). Preencha exatamente 3 campos para continuar.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Valor Financiado (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={valorFinanciado}
                onChange={(e) => setValorFinanciado(e.target.value)}
                placeholder="R$ 0,00"
              />
            </div>
            <div>
              <Label>Taxa de Juros (% a.m.)</Label>
              <Input
                type="number"
                step="0.01"
                value={taxaMensal}
                onChange={(e) => setTaxaMensal(e.target.value)}
                placeholder="0,00%"
              />
            </div>
            <div>
              <Label>Valor da Parcela (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={valorParcela}
                onChange={(e) => setValorParcela(e.target.value)}
                placeholder="R$ 0,00"
              />
            </div>
            <div>
              <Label>Número de Parcelas</Label>
              <Input
                type="number"
                value={numeroParcelas}
                onChange={(e) => setNumeroParcelas(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO 3: Dados Adicionais (Opcional) */}
      <Card>
        <CardHeader>
          <CardTitle>3. Dados Adicionais (Opcional)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Para cálculos avançados de prejuízo e análises complementares
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Parcelas Já Pagas</Label>
              <Input
                type="number"
                value={parcelasJaPagas}
                onChange={(e) => setParcelasJaPagas(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Saldo Devedor Atual (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={saldoDevedorAtual}
                onChange={(e) => setSaldoDevedorAtual(e.target.value)}
                placeholder="R$ 0,00"
              />
            </div>
            <div>
              <Label>Taxa Prevista no Contrato (% a.m.)</Label>
              <Input
                type="number"
                step="0.01"
                value={taxaPrevistaContrato}
                onChange={(e) => setTaxaPrevistaContrato(e.target.value)}
                placeholder="0,00%"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Valor de Entrada/Sinal (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={valorEntrada}
                onChange={(e) => setValorEntrada(e.target.value)}
                placeholder="R$ 0,00"
              />
            </div>
            <div>
              <Label>IOF Cobrado (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={iofCobrado}
                onChange={(e) => setIofCobrado(e.target.value)}
                placeholder="R$ 0,00"
              />
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              placeholder="Observações adicionais sobre o contrato..."
            />
          </div>

          <Button
            onClick={calcularAnalise}
            disabled={camposPreenchidos !== 3 || !modalidadeId || !dataAssinatura}
            className="w-full gap-2"
            size="lg"
          >
            <Calculator className="h-5 w-5" />
            Realizar Análise Completa
          </Button>
        </CardContent>
      </Card>

      {/* RESULTADOS */}
      {dadosCompletos && analiseAbusividade && (
        <>
          {/* ===== DASHBOARD DE RESULTADOS - 6 CARDS ===== */}
          
          {/* CARD 1: VEREDITO GERAL */}
          <Card className={analiseAbusividade.abusividadeDetectada ? "border-2 border-red-500" : "border-2 border-green-500"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {analiseAbusividade.abusividadeDetectada ? <AlertTriangle className="h-5 w-5 text-red-600" /> : <TrendingUp className="h-5 w-5 text-green-600" />}
                Veredito da Análise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge 
                  variant={analiseAbusividade.abusividadeDetectada ? "destructive" : "default"}
                  className={analiseAbusividade.abusividadeDetectada ? "text-lg px-4 py-2" : "bg-green-600 text-lg px-4 py-2"}
                >
                  {analiseAbusividade.abusividadeDetectada ? "⚠️ ABUSIVIDADE DETECTADA" : "✅ SEM ABUSIVIDADE"}
                </Badge>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Grau de Abusividade</p>
                  <p className="text-xl font-bold">{analiseAbusividade.grauAbusividade}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Percentual de Abusividade</p>
                  <p className="text-xl font-bold text-red-600">{analiseAbusividade.percentualAbusividade.toFixed(2)}%</p>
                </div>
              </div>

              {analiseDiscrepancia?.temDiscrepancia && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Discrepância Detectada</AlertTitle>
                  <AlertDescription>
                    A taxa real aplicada ({analiseDiscrepancia.taxaReal.toFixed(2)}% a.m.) é DIFERENTE da taxa contratual prevista ({analiseDiscrepancia.taxaContratual.toFixed(2)}% a.m.).
                    Diferença de {analiseDiscrepancia.percentualDiferenca.toFixed(2)}%.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* CARD 2: COMPARAÇÃO DE TAXAS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Comparação de Taxas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Taxa</TableHead>
                    <TableHead className="text-right">Mensal</TableHead>
                    <TableHead className="text-right">Anual</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Taxa Real Aplicada</TableCell>
                    <TableCell className="text-right font-semibold">{dadosCompletos.taxaMensal.toFixed(2)}%</TableCell>
                    <TableCell className="text-right font-semibold">{dadosCompletos.taxaAnual.toFixed(2)}%</TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                  {analiseDiscrepancia && (
                    <TableRow className={analiseDiscrepancia.temDiscrepancia ? "bg-yellow-50 dark:bg-yellow-950" : ""}>
                      <TableCell className="font-medium">Taxa Contratual Prevista</TableCell>
                      <TableCell className="text-right">{analiseDiscrepancia.taxaContratual.toFixed(2)}%</TableCell>
                      <TableCell className="text-right">{calcularTaxaAnual(analiseDiscrepancia.taxaContratual).toFixed(2)}%</TableCell>
                      <TableCell className="text-right">
                        {analiseDiscrepancia.temDiscrepancia ? "⚠️ Divergente" : "✅ Conforme"}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow className="bg-green-50 dark:bg-green-950">
                    <TableCell className="font-medium">Taxa Média BACEN</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">{taxaBacenData?.taxa_mensal.toFixed(2)}%</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">{calcularTaxaAnual(taxaBacenData?.taxa_mensal || 0).toFixed(2)}%</TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                  <TableRow className="bg-blue-50 dark:bg-blue-950">
                    <TableCell className="font-medium">Limite Aceitável (1,5x)</TableCell>
                    <TableCell className="text-right font-semibold">{analiseAbusividade.taxaLimiteAceitavel.toFixed(2)}%</TableCell>
                    <TableCell className="text-right font-semibold">{calcularTaxaAnual(analiseAbusividade.taxaLimiteAceitavel).toFixed(2)}%</TableCell>
                    <TableCell className="text-right">
                      {analiseAbusividade.excedeLimite ? "❌ Excedido" : "✅ Dentro"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* CARD 3: IMPACTO FINANCEIRO */}
          {projecoesBacen && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Impacto Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Contratual</TableHead>
                      <TableHead className="text-right">Correto (BACEN)</TableHead>
                      <TableHead className="text-right">Diferença</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Valor Financiado</TableCell>
                      <TableCell className="text-right">R$ {dadosCompletos.valorFinanciado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">R$ {projecoesBacen.valorFinanciadoCorreto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right text-red-600 font-semibold">R$ {projecoesBacen.diferencaValorFinanciado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">{projecoesBacen.percentualDiferencaFinanciado.toFixed(2)}%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Parcela Mensal</TableCell>
                      <TableCell className="text-right">R$ {dadosCompletos.valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">R$ {projecoesBacen.parcelaCorreta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right text-red-600 font-semibold">R$ {projecoesBacen.diferencaParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">{projecoesBacen.percentualDiferencaParcela.toFixed(2)}%</TableCell>
                    </TableRow>
                    <TableRow className="font-bold bg-muted">
                      <TableCell>Total do Financiamento</TableCell>
                      <TableCell className="text-right">R$ {dadosCompletos.totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">R$ {projecoesBacen.totalCorreto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right text-red-600">R$ {projecoesBacen.diferencaTotalFinanciamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">{((projecoesBacen.diferencaTotalFinanciamento / projecoesBacen.totalCorreto) * 100).toFixed(2)}%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* CARD 4: PREJUÍZO DO CLIENTE */}
          {prejuizoDetalhado && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Prejuízo do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <span className="font-medium">Total já pago indevidamente:</span>
                    <span className="font-bold text-red-600 text-xl">R$ {prejuizoDetalhado.totalPagoIndevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <span className="font-medium">Economia futura (se revisar agora):</span>
                    <span className="font-bold text-green-600 text-xl">R$ {prejuizoDetalhado.economiaFutura.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                    <span className="font-bold text-lg">Economia total na revisão:</span>
                    <span className="font-bold text-blue-600 text-2xl">R$ {prejuizoDetalhado.economiaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border-2 border-purple-300 dark:border-purple-700">
                    <span className="font-bold">Devolução em dobro (CDC Art. 42):</span>
                    <span className="font-bold text-purple-600 text-2xl">R$ {prejuizoDetalhado.devolucaoDobro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CARD 5: ANÁLISE DE SALDO DEVEDOR */}
          {analiseSaldo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Análise de Saldo Devedor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Saldo Devedor Atual (informado)</TableCell>
                      <TableCell className="text-right font-semibold">R$ {analiseSaldo.saldoDevedorAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Saldo Devedor Correto (com taxa BACEN)</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">R$ {analiseSaldo.saldoDevedorCorreto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                    <TableRow className="font-bold bg-red-50 dark:bg-red-950">
                      <TableCell>Diferença (valor indevido no saldo)</TableCell>
                      <TableCell className="text-right text-red-600 text-lg">R$ {analiseSaldo.diferencaSaldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Percentual de diferença</TableCell>
                      <TableCell className="text-right font-semibold">{analiseSaldo.percentualDiferencaSaldo.toFixed(2)}%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* CARD 6: RESUMO EXECUTIVO */}
          <Card className="border-2 border-primary">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resumo Executivo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-base">
                  Conforme análise técnica realizada, o contrato nº <strong>{contrato.numero_contrato || "N/A"}</strong> 
                  {" "}firmado com <strong>{contrato.bancos?.nome || "instituição financeira"}</strong> em <strong>{new Date(dataAssinatura).toLocaleDateString('pt-BR')}</strong> 
                  {" "}apresenta as seguintes irregularidades:
                </p>
                
                {analiseDiscrepancia?.temDiscrepancia && (
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg my-4 border-l-4 border-yellow-400">
                    <h4 className="font-bold text-base mb-2">1. Discrepância Contratual</h4>
                    <p className="text-sm">
                      A taxa de juros real aplicada (<strong>{dadosCompletos.taxaMensal.toFixed(2)}% a.m.</strong>) 
                      {" "}diverge da taxa contratual prevista (<strong>{analiseDiscrepancia.taxaContratual.toFixed(2)}% a.m.</strong>), 
                      {" "}caracterizando descumprimento contratual e cobrança indevida.
                    </p>
                  </div>
                )}
                
                {analiseAbusividade.abusividadeDetectada && (
                  <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg my-4 border-l-4 border-red-500">
                    <h4 className="font-bold text-base mb-2">2. Abusividade de Juros</h4>
                    <p className="text-sm">
                      A taxa de juros aplicada (<strong>{dadosCompletos.taxaMensal.toFixed(2)}% a.m.</strong>) 
                      {" "}supera em <strong>{analiseAbusividade.percentualAbusividade.toFixed(2)}%</strong> a taxa média de mercado 
                      {" "}divulgada pelo Banco Central (<strong>{taxaBacenData?.taxa_mensal.toFixed(2)}% a.m.</strong>), 
                      {" "}ultrapassando o limite de 1,5 vezes estabelecido pela jurisprudência do STJ, 
                      {" "}caracterizando <strong>abusividade {analiseAbusividade.grauAbusividade.toLowerCase()}</strong>.
                    </p>
                  </div>
                )}
                
                {prejuizoDetalhado && (
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg my-4 border-l-4 border-blue-500">
                    <h4 className="font-bold text-base mb-2">3. Prejuízo Financeiro</h4>
                    <p className="text-sm">
                      O cliente já pagou <strong>R$ {prejuizoDetalhado.totalPagoIndevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> a mais 
                      {" "}do que deveria, e caso não haja revisão, pagará mais 
                      {" "}<strong>R$ {prejuizoDetalhado.economiaFutura.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> indevidamente, 
                      {" "}totalizando um prejuízo de <strong className="text-lg">R$ {prejuizoDetalhado.economiaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>.
                    </p>
                  </div>
                )}

                {!analiseAbusividade.abusividadeDetectada && (
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg my-4 border-l-4 border-green-500">
                    <h4 className="font-bold text-base mb-2">✅ Conclusão Favorável</h4>
                    <p className="text-sm">
                      A taxa aplicada encontra-se dentro dos parâmetros de mercado estabelecidos pelo BACEN, 
                      não caracterizando abusividade nos termos da jurisprudência do STJ.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ===== FIM DO DASHBOARD - INÍCIO DOS CARDS DETALHADOS ===== */}
          <Separator className="my-8" />
          <h2 className="text-2xl font-bold mb-4">Análises Detalhadas</h2>

          {/* Resultado: Dados Completos do Contrato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dados Completos do Contrato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Valor Financiado</p>
                  <p className="text-2xl font-bold">R$ {dadosCompletos.valorFinanciado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Taxa Mensal / Anual</p>
                  <p className="text-2xl font-bold">{dadosCompletos.taxaMensal.toFixed(2)}%</p>
                  <p className="text-sm text-muted-foreground">{dadosCompletos.taxaAnual.toFixed(2)}% a.a.</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Valor da Parcela</p>
                  <p className="text-2xl font-bold">R$ {dadosCompletos.valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Número de Parcelas</p>
                  <p className="text-2xl font-bold">{Math.round(dadosCompletos.numeroParcelas)}</p>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total a Pagar</p>
                  <p className="text-xl font-bold text-blue-600">R$ {dadosCompletos.totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total de Juros</p>
                  <p className="text-xl font-bold text-orange-600">R$ {dadosCompletos.totalJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <p className="text-sm text-muted-foreground">CET (Custo Efetivo Total)</p>
                  <p className="text-xl font-bold text-purple-600">{dadosCompletos.custoEfetivoTotal.toFixed(2)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resultado: Análise de Abusividade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Análise de Abusividade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border-2 border-red-300 dark:border-red-700">
                  <p className="text-sm text-muted-foreground">Taxa do Contrato</p>
                  <p className="text-3xl font-bold text-red-600">{dadosCompletos.taxaMensal.toFixed(2)}% a.m.</p>
                  <p className="text-sm text-muted-foreground mt-1">{dadosCompletos.taxaAnual.toFixed(2)}% a.a.</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border-2 border-green-300 dark:border-green-700">
                  <p className="text-sm text-muted-foreground">Taxa BACEN (Mercado)</p>
                  <p className="text-3xl font-bold text-green-600">{taxaBacenData?.taxa_mensal.toFixed(2)}% a.m.</p>
                  <p className="text-sm text-muted-foreground mt-1">{calcularTaxaAnual(taxaBacenData?.taxa_mensal || 0).toFixed(2)}% a.a.</p>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Diferença Absoluta</p>
                  <p className="text-xl font-bold">{analiseAbusividade.diferencaAbsoluta.toFixed(2)} p.p.</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Percentual de Abusividade</p>
                  <p className="text-xl font-bold text-red-600">{analiseAbusividade.percentualAbusividade.toFixed(2)}%</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Grau de Abusividade</p>
                  <Badge
                    variant={analiseAbusividade.abusividadeDetectada ? "destructive" : "default"}
                    className="text-lg px-3 py-1"
                  >
                    {analiseAbusividade.grauAbusividade}
                  </Badge>
                </div>
              </div>

              {analiseAbusividade.excedeLimite && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold">⚠️ ABUSIVIDADE GRAVE DETECTADA</p>
                    <p className="text-sm mt-1">
                      A taxa contratada ({dadosCompletos.taxaMensal.toFixed(2)}% a.m.) excede o limite aceitável de 1,5x a taxa BACEN 
                      ({analiseAbusividade.taxaLimiteAceitavel.toFixed(2)}% a.m.)
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Resultado: Cálculo de Prejuízo */}
          {analisePrejuizo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Cálculo de Prejuízo do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Valor Pago Indevidamente</p>
                    <p className="text-2xl font-bold text-red-600">
                      R$ {analisePrejuizo.valorPagoIndevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Diferença entre parcelas com taxa abusiva vs. correta
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Diferença no Saldo Devedor</p>
                    <p className="text-2xl font-bold text-orange-600">
                      R$ {analisePrejuizo.diferencaSaldoDevedor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Saldo a maior devido à taxa abusiva
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-950 dark:to-orange-950 rounded-lg border-2 border-red-300 dark:border-red-700">
                  <p className="text-sm text-muted-foreground mb-2">💰 PREJUÍZO TOTAL DO CLIENTE</p>
                  <p className="text-4xl font-bold text-red-600">
                    R$ {analisePrejuizo.valorTotalPrejuizo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <Separator />

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Parcela com Taxa Correta</p>
                    <p className="text-lg font-semibold">
                      R$ {analisePrejuizo.parcelasComTaxaCorreta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Diferença Mensal</p>
                    <p className="text-lg font-semibold text-red-600">
                      R$ {analisePrejuizo.diferencaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Discrepância Taxa Real vs Contratual */}
          {analiseDiscrepancia && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Discrepância: Taxa Real vs Taxa Contratual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Taxa Real Aplicada</p>
                    <p className="text-2xl font-bold">{analiseDiscrepancia.taxaReal.toFixed(2)}% a.m.</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Taxa Prevista no Contrato</p>
                    <p className="text-2xl font-bold">{analiseDiscrepancia.taxaContratual.toFixed(2)}% a.m.</p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Diferença</p>
                    <p className="text-2xl font-bold text-red-600">{analiseDiscrepancia.diferencaTaxas.toFixed(2)} p.p.</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {analiseDiscrepancia.percentualDiferenca.toFixed(2)}% acima do previsto
                    </p>
                  </div>
                </div>

                {analiseDiscrepancia.temDiscrepancia && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold">⚠️ DISCREPÂNCIA DETECTADA</p>
                      <p className="text-sm mt-1">
                        A taxa real aplicada difere da taxa prevista no contrato em mais de 0,1 pontos percentuais.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Projeções com Taxa BACEN */}
          {projecoesBacen && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Projeções com Taxa BACEN (Correta)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Parcela Correta (Taxa BACEN)</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {projecoesBacen.parcelaCorreta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Diferença: R$ {projecoesBacen.diferencaParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 
                      ({projecoesBacen.percentualDiferencaParcela.toFixed(2)}%)
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Correto do Financiamento</p>
                    <p className="text-2xl font-bold text-blue-600">
                      R$ {projecoesBacen.totalCorreto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Economia: R$ {projecoesBacen.diferencaTotalFinanciamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold">💡 Análise Comparativa</p>
                    <p className="text-sm mt-1">
                      Com a taxa BACEN, o cliente pagaria <span className="font-bold">R$ {projecoesBacen.diferencaTotalFinanciamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} a menos</span> no total do financiamento.
                    </p>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Prejuízo Detalhado com CDC */}
          {prejuizoDetalhado && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Análise Detalhada de Prejuízo + CDC
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Valor Já Pago Indevidamente</p>
                    <p className="text-2xl font-bold text-red-600">
                      R$ {prejuizoDetalhado.totalPagoIndevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {parcelasJaPagas} parcelas já pagas
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Economia Futura (Revisando Agora)</p>
                    <p className="text-2xl font-bold text-orange-600">
                      R$ {prejuizoDetalhado.economiaFutura.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Nas {dadosCompletos!.numeroParcelas - parseFloat(parcelasJaPagas)} parcelas restantes
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Economia Total</p>
                    <p className="text-2xl font-bold text-purple-600">
                      R$ {prejuizoDetalhado.economiaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {prejuizoDetalhado.percentualPrejuizo.toFixed(2)}% do total
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="p-6 bg-gradient-to-r from-yellow-100 to-green-100 dark:from-yellow-950 dark:to-green-950 rounded-lg border-2 border-yellow-400 dark:border-yellow-600">
                  <p className="text-sm text-muted-foreground mb-2">⚖️ DEVOLUÇÃO EM DOBRO (CDC Art. 42)</p>
                  <p className="text-4xl font-bold text-yellow-700 dark:text-yellow-400">
                    R$ {prejuizoDetalhado.devolucaoDobro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Valor a ser pleiteado judicialmente (dobro do pago indevidamente)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Análise de Saldo Devedor */}
          {analiseSaldo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Análise de Saldo Devedor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Saldo Devedor Atual (Informado)</p>
                    <p className="text-2xl font-bold text-red-600">
                      R$ {analiseSaldo.saldoDevedorAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Saldo Correto (Taxa BACEN)</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {analiseSaldo.saldoDevedorCorreto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <p className="text-sm text-muted-foreground">Diferença no Saldo</p>
                    <p className="text-2xl font-bold text-orange-600">
                      R$ {analiseSaldo.diferencaSaldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {analiseSaldo.percentualDiferencaSaldo.toFixed(2)}% a mais
                    </p>
                  </div>
                </div>

                {analiseSaldo.economiaPotencial > 0 && (
                  <Alert>
                    <DollarSign className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold">💰 Economia Potencial no Saldo</p>
                      <p className="text-sm mt-1">
                        O cliente poderia economizar <span className="font-bold">R$ {analiseSaldo.economiaPotencial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> no saldo devedor atual se a taxa fosse ajustada à taxa BACEN.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Resultado: Tabela Price (primeiras parcelas) */}
          {tabelaPrice.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tabela Price (Primeiras 12 Parcelas)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">#</th>
                        <th className="text-right p-2">Parcela</th>
                        <th className="text-right p-2">Juros</th>
                        <th className="text-right p-2">Amortização</th>
                        <th className="text-right p-2">Saldo Devedor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tabelaPrice.map((parcela) => (
                        <tr key={parcela.numero} className="border-b">
                          <td className="p-2">{parcela.numero}</td>
                          <td className="text-right p-2">
                            R$ {parcela.valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="text-right p-2 text-red-600">
                            R$ {parcela.juros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="text-right p-2 text-green-600">
                            R$ {parcela.amortizacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="text-right p-2 font-semibold">
                            R$ {parcela.saldoDevedor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ===== FUNCIONALIDADES ADICIONAIS ===== */}
          <Separator className="my-8" />
          <h2 className="text-2xl font-bold mb-4">Funcionalidades Adicionais</h2>

          {/* Simulador de Cenários */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Simulador de Cenários
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Simule diferentes taxas e prazos para comparação
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <Label className="text-sm font-semibold mb-2 block">Simular com outra taxa</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 2.50"
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm">
                      Simular
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Insira uma taxa alternativa (% a.m.) para recalcular tudo
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <Label className="text-sm font-semibold mb-2 block">Simular com outro prazo</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Ex: 48"
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm">
                      Simular
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Insira um prazo alternativo (meses) para recalcular tudo
                  </p>
                </div>
              </div>

              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  <p className="text-sm font-semibold">💡 Dica</p>
                  <p className="text-xs mt-1">
                    Use o simulador para explorar diferentes cenários e comparar o impacto de mudanças na taxa ou prazo.
                  </p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Comparação com Outras Modalidades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Comparação com Outras Modalidades
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Veja se o cliente poderia ter contratado modalidade mais vantajosa
              </p>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="text-sm font-semibold">⚠️ Funcionalidade em Desenvolvimento</p>
                  <p className="text-xs mt-1">
                    Em breve você poderá comparar automaticamente com todas as 48 modalidades BACEN disponíveis 
                    para identificar se o cliente poderia ter obtido condições melhores.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-semibold mb-2">Análise Manual Sugerida:</p>
                <p className="text-xs text-muted-foreground">
                  Compare a modalidade selecionada ({taxaBacenData ? "Taxa BACEN disponível" : "Aguardando seleção"}) 
                  com modalidades similares na data de assinatura para verificar se havia opções mais vantajosas no mercado.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Taxas BACEN */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Histórico de Taxas BACEN
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Evolução da taxa de mercado nos últimos meses
              </p>
            </CardHeader>
            <CardContent>
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  <p className="text-sm font-semibold">📊 Análise Histórica</p>
                  <p className="text-xs mt-1">
                    O sistema utiliza as taxas médias mensais divulgadas pelo BACEN através do SGS 
                    (Sistema Gerenciador de Séries Temporais) para garantir comparações precisas e atualizadas.
                  </p>
                </AlertDescription>
              </Alert>

              {taxaBacenData && dataAssinatura && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Taxa na Data de Assinatura:</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {taxaBacenData.taxa_mensal.toFixed(2)}% a.m.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Referência: {new Date(dataAssinatura).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Nota:</strong> Gráficos de evolução histórica estarão disponíveis em breve, 
                  permitindo visualizar tendências de mercado e identificar se a taxa contratada 
                  estava acima da média mesmo para aquele período.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Calculadora de Capitalização */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Análise de Capitalização de Juros
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Detectar e calcular impacto da capitalização
              </p>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="text-sm font-semibold">⚖️ Capitalização de Juros</p>
                  <p className="text-xs mt-1">
                    A capitalização mensal de juros (juros sobre juros) só é permitida em operações específicas 
                    regulamentadas pelo Banco Central. Sua aplicação indevida configura anatocismo, 
                    prática vedada pelo art. 4º do Decreto 22.626/33 (Lei da Usura).
                  </p>
                </AlertDescription>
              </Alert>

              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold mb-2">Sistema de Amortização Detectado:</p>
                  <Badge>Tabela Price (SAC)</Badge>
                  <p className="text-xs text-muted-foreground mt-2">
                    A Tabela Price utiliza capitalização composta na formação das parcelas, 
                    o que é permitido desde que previsto em contrato e regulamentado.
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold mb-2">Análise Complementar:</p>
                  <p className="text-xs text-muted-foreground">
                    Verifique se o contrato prevê expressamente a capitalização de juros e 
                    se a operação se enquadra nas exceções legais permitidas pela legislação vigente.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Ver Fundamentação Legal
                  </Button>
                </div>
              </div>

              {dadosCompletos && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border-l-4 border-yellow-400">
                  <p className="text-sm font-semibold mb-2">📌 Informações do Cálculo Atual:</p>
                  <div className="text-xs space-y-1">
                    <p>• Taxa Mensal: {dadosCompletos.taxaMensal.toFixed(2)}%</p>
                    <p>• Taxa Anual Equivalente: {dadosCompletos.taxaAnual.toFixed(2)}%</p>
                    <p>• Total de Juros: R$ {dadosCompletos.totalJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p>• CET (Custo Efetivo Total): {dadosCompletos.custoEfetivoTotal.toFixed(2)}%</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ===== GERAÇÃO DE RELATÓRIOS (8 TIPOS) ===== */}
          <Separator className="my-8" />
          <Card className="border-2 border-primary">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Geração de Relatórios Profissionais
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Gere relatórios em PDF para diferentes finalidades
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={gerarRelatorioAbusividade}
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4"
                >
                  <FileText className="h-6 w-6" />
                  <span className="text-sm font-semibold">1. Análise de Abusividade</span>
                  <span className="text-xs text-muted-foreground">Relatório completo com veredito</span>
                </Button>

                <Button
                  onClick={gerarRelatorioDiscrepancia}
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4"
                  disabled={!analiseDiscrepancia?.temDiscrepancia}
                >
                  <AlertTriangle className="h-6 w-6" />
                  <span className="text-sm font-semibold">2. Discrepância Contratual</span>
                  <span className="text-xs text-muted-foreground">Se taxa aplicada ≠ prevista</span>
                </Button>

                <Button
                  onClick={gerarRelatorioImpactoFinanceiro}
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4"
                  disabled={!projecoesBacen}
                >
                  <DollarSign className="h-6 w-6" />
                  <span className="text-sm font-semibold">3. Impacto Financeiro</span>
                  <span className="text-xs text-muted-foreground">Tabela comparativa detalhada</span>
                </Button>

                <Button
                  onClick={gerarRelatorioPrejuizo}
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4"
                  disabled={!prejuizoDetalhado}
                >
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-sm font-semibold">4. Prejuízo do Cliente</span>
                  <span className="text-xs text-muted-foreground">Com devolução em dobro</span>
                </Button>

                <Button
                  onClick={gerarPlanilhaAmortizacao}
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4"
                >
                  <BarChart className="h-6 w-6" />
                  <span className="text-sm font-semibold">5. Planilha Amortização</span>
                  <span className="text-xs text-muted-foreground">Comparativa lado a lado</span>
                </Button>

                <Button
                  onClick={gerarRelatorioSaldoDevedor}
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4"
                  disabled={!analiseSaldo}
                >
                  <FileText className="h-6 w-6" />
                  <span className="text-sm font-semibold">6. Saldo Devedor</span>
                  <span className="text-xs text-muted-foreground">Análise de diferenças</span>
                </Button>

                <Button
                  onClick={gerarResumoExecutivo}
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4"
                >
                  <FileText className="h-6 w-6" />
                  <span className="text-sm font-semibold">7. Resumo Executivo</span>
                  <span className="text-xs text-muted-foreground">Pronto para petição</span>
                </Button>

                <Button
                  onClick={gerarRelatorioConsolidado}
                  variant="default"
                  className="h-auto flex-col gap-2 p-4"
                >
                  <Download className="h-6 w-6" />
                  <span className="text-sm font-semibold">8. Consolidado</span>
                  <span className="text-xs text-muted-foreground">Todos em um PDF</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Botão Salvar */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={salvarAnalise}
                disabled={createAnalise.isPending}
                className="w-full gap-2"
                size="lg"
              >
                <Save className="h-5 w-5" />
                {createAnalise.isPending ? "Salvando..." : "Salvar Análise Completa"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
