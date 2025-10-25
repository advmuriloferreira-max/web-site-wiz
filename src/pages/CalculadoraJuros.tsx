import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, User, Building2, Filter, Printer } from "lucide-react";
import { toast } from "sonner";
import { useModalidadesBacenJuros } from "@/hooks/useModalidadesBacenJuros";
import { calcularMetricasFinanceiras, compararTaxaBacen } from "@/modules/FinancialAnalysis/lib/financialCalculations";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função para calcular taxa real através de método iterativo
// Encontra a taxa i que satisfaz: PV = PMT × [(1 - (1 + i)^-n) / i]
function calcularTaxaRealIterativo(pv: number, pmt: number, n: number): number {
  const maxIteracoes = 1000;
  const precisao = 0.0000001;
  let taxaMin = 0;
  let taxaMax = 1; // 100% ao mês como máximo inicial
  let taxa = 0.05; // Chute inicial: 5% ao mês

  for (let iter = 0; iter < maxIteracoes; iter++) {
    // Calcular PV usando a taxa atual
    // PV = PMT × [(1 - (1 + i)^-n) / i]
    const fator = Math.pow(1 + taxa, -n);
    const pvCalculado = pmt * ((1 - fator) / taxa);
    
    const erro = pvCalculado - pv;
    
    // Se o erro for pequeno o suficiente, encontramos a taxa
    if (Math.abs(erro) < precisao) {
      return taxa * 100; // Retorna em percentual
    }
    
    // Ajustar os limites usando busca binária
    if (pvCalculado > pv) {
      // Taxa muito baixa, precisa aumentar
      taxaMin = taxa;
    } else {
      // Taxa muito alta, precisa diminuir
      taxaMax = taxa;
    }
    
    // Nova tentativa é a média entre min e max
    taxa = (taxaMin + taxaMax) / 2;
  }
  
  return taxa * 100;
}

// Função para gerar relatório PDF
function gerarRelatorioPDF(resultado: any, dadosFormulario: {
  valorFinanciamento: string;
  valorPrestacao: string;
  numeroParcelas: string;
  taxaJurosContratual: string;
  dataAssinatura: string;
}) {
  const doc = new jsPDF();
  
  // Cabeçalho
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INTELLBANK', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Análise de Juros Abusivos - BACEN', 105, 30, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  
  let yPos = 50;
  
  // Modalidade
  if (resultado.modalidade) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Modalidade Analisada', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(resultado.modalidade.nome, 20, yPos);
    yPos += 6;
    doc.text(`Tipo: ${resultado.modalidade.tipo_pessoa} | Categoria: ${resultado.modalidade.categoria}`, 20, yPos);
    yPos += 12;
  }
  
  // Dados do Contrato
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados do Contrato', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };
  
  const dadosContrato = [
    ['Valor Financiado:', formatCurrency(parseFloat(dadosFormulario.valorFinanciamento || '0'))],
    ['Valor da Prestação:', formatCurrency(parseFloat(dadosFormulario.valorPrestacao || '0'))],
    ['Número de Parcelas:', dadosFormulario.numeroParcelas || '-'],
    ['Taxa de Juros (a.m.):', `${parseFloat(dadosFormulario.taxaJurosContratual || '0').toFixed(4)}%`],
    ['Data de Assinatura:', format(new Date(dadosFormulario.dataAssinatura), 'dd/MM/yyyy', { locale: ptBR })],
  ];
  
  dadosContrato.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, yPos);
    yPos += 7;
  });
  
  yPos += 8;
  
  // Taxas Comparativas
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Análise Comparativa', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const taxas = [
    ['Taxa Contratual (a.m.):', `${resultado.taxaContratual.toFixed(4)}%`],
    ['Taxa Real Cobrada (a.m.):', `${resultado.taxaReal.toFixed(4)}%`],
    ['Taxa BACEN (a.m.):', `${resultado.taxaBacen.taxa_mensal.toFixed(4)}%`],
    ['Taxa Anual:', `${resultado.metricas.taxaEfetivaAnual.toFixed(2)}%`],
    ['Limite de Abusividade (1,5x BACEN):', `${resultado.limiteAbusividade.toFixed(4)}%`],
  ];
  
  taxas.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 100, yPos);
    yPos += 7;
  });
  
  yPos += 8;
  
  // Análise de Abusividade
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Análise de Abusividade', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const analise = [
    ['Diferença:', `${resultado.diferencaAbsoluta > 0 ? '+' : ''}${resultado.diferencaAbsoluta.toFixed(4)}% (${resultado.percentualAcimaBacen.toFixed(1)}%)`],
    ['Multiplicador BACEN:', `${resultado.multiplicadorBacen.toFixed(2)}x`],
    ['Status:', resultado.mensagemAbusividade],
  ];
  
  analise.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPos);
    doc.setFont('helvetica', 'normal');
    
    const lines = doc.splitTextToSize(value, 120);
    doc.text(lines, 70, yPos);
    yPos += lines.length * 7;
  });
  
  // Alerta de ação revisional
  if (resultado.passivelAcao) {
    yPos += 5;
    doc.setFillColor(220, 38, 38);
    doc.rect(20, yPos - 5, 170, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('⚠️ AÇÃO REVISIONAL RECOMENDADA', 105, yPos, { align: 'center' });
    
    yPos += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const textoAcao = `A taxa cobrada está ${resultado.multiplicadorBacen.toFixed(2)}x acima da média do BACEN, ultrapassando o limite de 1,5x estabelecido pela jurisprudência. Este contrato é passível de revisão judicial.`;
    const linhasAcao = doc.splitTextToSize(textoAcao, 160);
    doc.text(linhasAcao, 105, yPos, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    yPos += 20;
  }
  
  yPos += 10;
  
  // Rodapé
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Relatório gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
    105,
    pageHeight - 15,
    { align: 'center' }
  );
  doc.text(
    'Fonte: Sistema Gerenciador de Séries Temporais (SGS) - Banco Central do Brasil',
    105,
    pageHeight - 10,
    { align: 'center' }
  );
  
  // Salvar PDF
  const nomeArquivo = `analise-juros-${format(new Date(), 'yyyyMMdd-HHmmss')}.pdf`;
  doc.save(nomeArquivo);
  
  toast.success('Relatório PDF gerado com sucesso!');
}

const CalculadoraJuros = () => {
  const [tipoPessoaFiltro, setTipoPessoaFiltro] = useState<'PF' | 'PJ' | undefined>(undefined);
  const { data: modalidades, isLoading: loadingModalidades } = useModalidadesBacenJuros(tipoPessoaFiltro);

  // Estados do formulário - TODOS opcionais agora
  const [valorFinanciamento, setValorFinanciamento] = useState("");
  const [valorPrestacao, setValorPrestacao] = useState("");
  const [numeroParcelas, setNumeroParcelas] = useState("");
  const [taxaJurosContratual, setTaxaJurosContratual] = useState("");
  const [dataAssinatura, setDataAssinatura] = useState("");
  const [modalidadeId, setModalidadeId] = useState("");
  
  // Estado para indicar qual campo está sendo calculado
  const [campoCalculado, setCampoCalculado] = useState<'valor_financiamento' | 'valor_prestacao' | 'numero_parcelas' | 'taxa_juros' | null>(null);

  // Estados de resultado
  const [resultado, setResultado] = useState<any>(null);
  const [analisando, setAnalisando] = useState(false);

  const handleAnalisar = async () => {
    // Validar: precisa ter exatamente 3 das 4 variáveis preenchidas
    const campos = [
      { nome: 'valorFinanciamento', valor: valorFinanciamento },
      { nome: 'valorPrestacao', valor: valorPrestacao },
      { nome: 'numeroParcelas', valor: numeroParcelas },
      { nome: 'taxaJurosContratual', valor: taxaJurosContratual }
    ];
    
    const camposPreenchidos = campos.filter(c => c.valor !== '');
    const camposVazios = campos.filter(c => c.valor === '');
    
    if (camposPreenchidos.length !== 3) {
      toast.error("Preencha exatamente 3 dos 4 campos (Valor Financiado, Valor Prestação, Nº Parcelas, Taxa). O 4º será calculado automaticamente.");
      return;
    }
    
    if (!dataAssinatura || !modalidadeId) {
      toast.error("Preencha a data de assinatura e selecione a modalidade BACEN");
      return;
    }
    
    const campoVazio = camposVazios[0].nome;
    
    setAnalisando(true);
    
    try {
      // NOVO: Buscar taxa diretamente do CSV no frontend
      const { consultarTaxaBacenCSV } = await import('@/lib/consultarTaxaBacenCSV');
      
      const data = await consultarTaxaBacenCSV(modalidadeId, dataAssinatura);
      
      toast.success(`✅ Taxa BACEN encontrada: ${data.taxa_mensal.toFixed(2)}% ao mês`, {
        duration: 4000
      });
      
      // 2. Calcular o campo que está faltando (usando as outras 3 variáveis)
      let valorFin = valorFinanciamento ? parseFloat(valorFinanciamento) : 0;
      let valorPrest = valorPrestacao ? parseFloat(valorPrestacao) : 0;
      let parcelas = numeroParcelas ? parseInt(numeroParcelas) : 0;
      let taxaContratual = taxaJurosContratual ? parseFloat(taxaJurosContratual) : 0;
      let taxaRealMensal = 0;
      
      console.log('\n🔢 === CÁLCULO COM 4 VARIÁVEIS ===');
      console.log(`Campo a ser calculado: ${campoVazio}`);
      
      // Importar funções de cálculo
      const { calcularValorParcela, calcularNumeroParcelas, calcularValorFinanciado } = await import('@/lib/calculoTaxaEfetiva');
      
      // Calcular o campo faltante
      switch (campoVazio) {
        case 'valorFinanciamento':
          // PV = PMT × [(1 - (1 + i)^-n) / i]
          valorFin = calcularValorFinanciado(valorPrest, taxaContratual, parcelas);
          console.log(`✅ Valor Financiado calculado: R$ ${valorFin.toFixed(2)}`);
          taxaRealMensal = taxaContratual;
          setCampoCalculado('valor_financiamento');
          setValorFinanciamento(valorFin.toFixed(2)); // Atualizar o campo
          toast.success(`Valor Financiado calculado: R$ ${valorFin.toFixed(2)}`);
          break;
          
        case 'valorPrestacao':
          // PMT = PV × [i × (1 + i)^n] / [(1 + i)^n - 1]
          valorPrest = calcularValorParcela(valorFin, taxaContratual, parcelas);
          console.log(`✅ Valor da Prestação calculado: R$ ${valorPrest.toFixed(2)}`);
          taxaRealMensal = taxaContratual;
          setCampoCalculado('valor_prestacao');
          setValorPrestacao(valorPrest.toFixed(2)); // Atualizar o campo
          toast.success(`Valor da Prestação calculado: R$ ${valorPrest.toFixed(2)}`);
          break;
          
        case 'numeroParcelas':
          // n = log(PMT / (PMT - PV × i)) / log(1 + i)
          parcelas = calcularNumeroParcelas(valorFin, valorPrest, taxaContratual);
          console.log(`✅ Número de Parcelas calculado: ${parcelas}`);
          taxaRealMensal = taxaContratual;
          setCampoCalculado('numero_parcelas');
          setNumeroParcelas(parcelas.toString()); // Atualizar o campo
          toast.success(`Número de Parcelas calculado: ${parcelas}`);
          break;
          
        case 'taxaJurosContratual':
          // Calcular taxa real usando método iterativo
          taxaRealMensal = calcularTaxaRealIterativo(valorFin, valorPrest, parcelas);
          taxaContratual = taxaRealMensal;
          console.log(`✅ Taxa de Juros calculada: ${taxaRealMensal.toFixed(4)}% a.m.`);
          setCampoCalculado('taxa_juros');
          setTaxaJurosContratual(taxaRealMensal.toFixed(4)); // Atualizar o campo
          toast.success(`Taxa de Juros calculada: ${taxaRealMensal.toFixed(4)}% a.m.`);
          break;
      }
      
      console.log(`\n📊 Valores finais:`);
      console.log(`   Valor Financiado: R$ ${valorFin.toFixed(2)}`);
      console.log(`   Valor Prestação: R$ ${valorPrest.toFixed(2)}`);
      console.log(`   Número de Parcelas: ${parcelas}`);
      console.log(`   Taxa: ${taxaRealMensal.toFixed(4)}% a.m.`);
      
      // 3. Calcular métricas financeiras
      const metricas = calcularMetricasFinanceiras({
        valorDivida: valorFin,
        saldoContabil: valorFin,
        taxaBacen: data.taxa_mensal,
        taxaJuros: taxaRealMensal,
        prazoMeses: parcelas,
        valorParcela: valorPrest,
        valorGarantias: 0,
        diasAtraso: 0,
      });
      
      // 4. Comparar com taxa BACEN usando critério dos tribunais (1,5x)
      const taxaBacenMensal = data.taxa_mensal;
      const limiteAbusividade = taxaBacenMensal * 1.5; // Critério dos tribunais
      
      // Classificação baseada no critério judicial
      let nivelAbusividade: 'verde' | 'amarelo' | 'vermelho';
      let mensagemAbusividade: string;
      let passivelAcao: boolean;
      
      if (taxaRealMensal <= taxaBacenMensal) {
        nivelAbusividade = 'verde';
        mensagemAbusividade = 'Taxa dentro ou abaixo da média do mercado';
        passivelAcao = false;
      } else if (taxaRealMensal < limiteAbusividade) {
        nivelAbusividade = 'amarelo';
        mensagemAbusividade = 'Taxa acima da média do mercado, mas ainda não abusiva';
        passivelAcao = false;
      } else {
        nivelAbusividade = 'vermelho';
        mensagemAbusividade = 'Taxa ABUSIVA - Passível de Ação Revisional (acima de 1,5x a média BACEN)';
        passivelAcao = true;
      }
      
      const diferencaAbsoluta = taxaRealMensal - taxaBacenMensal;
      const percentualAcimaBacen = (diferencaAbsoluta / taxaBacenMensal) * 100;
      const multiplicadorBacen = taxaRealMensal / taxaBacenMensal;
      
      console.log(`\n⚖️ === ANÁLISE JUDICIAL ===`);
      console.log(`Taxa do contrato: ${taxaRealMensal.toFixed(4)}% a.m.`);
      console.log(`Taxa BACEN: ${taxaBacenMensal.toFixed(4)}% a.m.`);
      console.log(`Limite de abusividade (1,5x BACEN): ${limiteAbusividade.toFixed(4)}% a.m.`);
      console.log(`Multiplicador: ${multiplicadorBacen.toFixed(2)}x a taxa BACEN`);
      console.log(`Classificação: ${nivelAbusividade.toUpperCase()}`);
      console.log(`Passível de ação: ${passivelAcao ? 'SIM' : 'NÃO'}`);
      
      const comparacao = compararTaxaBacen(taxaRealMensal, taxaBacenMensal);
      
      // 5. Calcular diferença (se tiver taxa contratual diferente da real)
      const totalPago = valorPrest * parcelas;
      const totalJuros = totalPago - valorFin;
      const custoEfetivoTotal = (totalJuros / valorFin) * 100;
      
      const diferencaTaxas = 0; // Não há diferença pois usamos a mesma taxa
      const percentualDiferenca = 0;

      setResultado({
        metricas,
        comparacao,
        taxaBacen: data,
        modalidade: data.modalidade,
        taxaContratual: taxaRealMensal,
        taxaReal: taxaRealMensal,
        diferencaTaxas,
        percentualDiferenca,
        totalPago,
        totalJuros,
        custoEfetivoTotal,
        // Valores calculados
        valorFinanciamentoCalculado: campoVazio === 'valorFinanciamento' ? valorFin : undefined,
        valorPrestacaoCalculado: campoVazio === 'valorPrestacao' ? valorPrest : undefined,
        numeroParcelasCalculado: campoVazio === 'numeroParcelas' ? parcelas : undefined,
        // Análise de abusividade
        nivelAbusividade,
        mensagemAbusividade,
        passivelAcao,
        limiteAbusividade,
        diferencaAbsoluta,
        percentualAcimaBacen,
        multiplicadorBacen,
      });

      toast.success("Análise concluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao analisar:", error);
      toast.error("Erro ao realizar análise: " + error.message);
    } finally {
      setAnalisando(false);
    }
  };


  return (
    <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">ABUSIVIDADE DE JUROS - REVISIONAIS (BACEN)</h1>
              <p className="text-muted-foreground">
                Sistema completo com 48 modalidades do Banco Central (Séries Temporais SGS)
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-600 px-4 py-2">
            48 Modalidades BACEN
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Seção 1: Formulário de Entrada */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Calculadora de 4 Variáveis
              </CardTitle>
                  <CardDescription>
                    Sistema de cálculo com 4 variáveis - preencha 3 para calcular a 4ª automaticamente
                  </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="filtroTipoPessoa">Filtrar por Tipo de Pessoa</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant={tipoPessoaFiltro === undefined ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTipoPessoaFiltro(undefined)}
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      Todos
                    </Button>
                    <Button
                      type="button"
                      variant={tipoPessoaFiltro === 'PF' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTipoPessoaFiltro('PF')}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Pessoa Física
                    </Button>
                    <Button
                      type="button"
                      variant={tipoPessoaFiltro === 'PJ' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTipoPessoaFiltro('PJ')}
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      Pessoa Jurídica
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="modalidade">Modalidade de Crédito BACEN *</Label>
                  <Select value={modalidadeId} onValueChange={setModalidadeId} disabled={loadingModalidades}>
                    <SelectTrigger id="modalidade">
                      <SelectValue placeholder="Selecione a modalidade do BACEN" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[400px]">
                      {modalidades?.map((modalidade) => (
                        <SelectItem key={modalidade.id} value={modalidade.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant={modalidade.tipo_pessoa === 'PF' ? 'default' : 'secondary'} className="text-xs">
                              {modalidade.tipo_pessoa}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {modalidade.tipo_recurso}
                            </Badge>
                            <span>{modalidade.nome}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Selecione a modalidade exata conforme classificação do Banco Central
                  </p>
                </div>

                <div>
                  <Label htmlFor="valorFinanciamento">
                    Valor do Financiamento {campoCalculado === 'valor_financiamento' && <span className="text-green-600">✓ Calculado</span>}
                  </Label>
                  <Input
                    id="valorFinanciamento"
                    type="number"
                    placeholder="Ex: 10000 (deixe vazio para calcular)"
                    value={valorFinanciamento}
                    onChange={(e) => setValorFinanciamento(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Deixe vazio para calcular este valor
                  </p>
                </div>

                <div>
                  <Label htmlFor="valorPrestacao">
                    Valor da Prestação {campoCalculado === 'valor_prestacao' && <span className="text-green-600">✓ Calculado</span>}
                  </Label>
                  <Input
                    id="valorPrestacao"
                    type="number"
                    placeholder="Ex: 500 (deixe vazio para calcular)"
                    value={valorPrestacao}
                    onChange={(e) => setValorPrestacao(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Deixe vazio para calcular este valor
                  </p>
                </div>

                <div>
                  <Label htmlFor="numeroParcelas">
                    Número de Parcelas {campoCalculado === 'numero_parcelas' && <span className="text-green-600">✓ Calculado</span>}
                  </Label>
                  <Input
                    id="numeroParcelas"
                    type="number"
                    placeholder="Ex: 24 (deixe vazio para calcular)"
                    value={numeroParcelas}
                    onChange={(e) => setNumeroParcelas(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Deixe vazio para calcular este valor
                  </p>
                </div>

                <div>
                  <Label htmlFor="taxaJurosContratual">
                    Taxa de Juros (% a.m.) {campoCalculado === 'taxa_juros' && <span className="text-green-600">✓ Calculado</span>}
                  </Label>
                  <Input
                    id="taxaJurosContratual"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 2.5 (deixe vazio para calcular)"
                    value={taxaJurosContratual}
                    onChange={(e) => setTaxaJurosContratual(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Deixe vazio para calcular a taxa real
                  </p>
                </div>

                <div>
                  <Label htmlFor="dataAssinatura">Data de Assinatura do Contrato *</Label>
                  <Input
                    id="dataAssinatura"
                    type="date"
                    value={dataAssinatura}
                    onChange={(e) => setDataAssinatura(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Usada para buscar a taxa BACEN do período
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={handleAnalisar}
                  disabled={analisando}
                >
                  {analisando ? (
                    "Processando..."
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Analisar Juros
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Seção 2: Área de Resultados */}
          <div className="space-y-4">
            {!resultado && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Calculator className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aguardando Análise</h3>
                  <p className="text-sm text-muted-foreground">
                    Preencha os dados e clique em "Analisar Agora" para ver os resultados
                  </p>
                </CardContent>
              </Card>
            )}

            {resultado && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Resultado da Análise
                      </CardTitle>
                      <CardDescription>
                        Análise comparativa com taxas médias do BACEN
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => gerarRelatorioPDF(resultado, {
                        valorFinanciamento,
                        valorPrestacao,
                        numeroParcelas,
                        taxaJurosContratual,
                        dataAssinatura,
                      })}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimir PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resultado.modalidade && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-semibold mb-1">Modalidade Analisada:</p>
                      <p className="text-sm">{resultado.modalidade.nome}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={resultado.modalidade.tipo_pessoa === 'PF' ? 'default' : 'secondary'}>
                          {resultado.modalidade.tipo_pessoa}
                        </Badge>
                        <Badge variant="outline">{resultado.modalidade.categoria}</Badge>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-500/10 border border-blue-500 rounded-lg">
                      <p className="text-xs text-muted-foreground">Taxa Contratual (% a.m.)</p>
                      <p className="text-2xl font-bold text-blue-600">{resultado.taxaContratual.toFixed(4)}%</p>
                      <p className="text-xs text-muted-foreground mt-1">Informada no contrato</p>
                    </div>
                    <div className="p-3 bg-orange-500/10 border border-orange-500 rounded-lg">
                      <p className="text-xs text-muted-foreground">Taxa Real Cobrada (% a.m.)</p>
                      <p className="text-2xl font-bold text-orange-600">{resultado.taxaReal.toFixed(4)}%</p>
                      <p className="text-xs text-muted-foreground mt-1">Calculada pelos valores</p>
                    </div>
                    <div className={`p-3 rounded-lg border ${Math.abs(resultado.diferencaTaxas) > 0.01 ? 'bg-destructive/10 border-destructive' : 'bg-green-500/10 border-green-500'}`}>
                      <p className="text-xs text-muted-foreground">Diferença</p>
                      <p className={`text-2xl font-bold ${Math.abs(resultado.diferencaTaxas) > 0.01 ? 'text-destructive' : 'text-green-600'}`}>
                        {resultado.diferencaTaxas > 0 ? '+' : ''}{resultado.diferencaTaxas.toFixed(4)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.abs(resultado.percentualDiferenca).toFixed(1)}% de diferença
                      </p>
                    </div>
                  </div>

                  {Math.abs(resultado.diferencaTaxas) > 0.01 && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500 rounded-lg">
                      <p className="font-semibold text-amber-700 dark:text-amber-400">
                        ⚠️ Divergência entre Taxa Contratual e Taxa Real
                      </p>
                      <p className="text-sm mt-2 text-muted-foreground">
                        A taxa real cobrada ({resultado.taxaReal.toFixed(4)}% a.m.) está {resultado.diferencaTaxas > 0 ? 'MAIOR' : 'menor'} 
                        {' '}que a taxa contratual informada ({resultado.taxaContratual.toFixed(4)}% a.m.).
                        {resultado.diferencaTaxas > 0 && ' Esta divergência pode caracterizar cobrança indevida.'}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-background border rounded-lg">
                      <p className="text-xs text-muted-foreground">Taxa Real (Anual)</p>
                      <p className="text-2xl font-bold">{resultado.metricas.taxaEfetivaAnual.toFixed(2)}%</p>
                    </div>
                    <div className="p-3 bg-background border rounded-lg">
                      <p className="text-xs text-muted-foreground">CET (Custo Efetivo Total)</p>
                      <p className="text-2xl font-bold">{resultado.metricas.taxaEfetivaAnual.toFixed(2)}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Taxa BACEN (Mensal)</p>
                      <p className="text-2xl font-bold">{resultado.taxaBacen.taxa_mensal.toFixed(2)}%</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ref: {resultado.taxaBacen.periodo.mes}/{resultado.taxaBacen.periodo.ano}
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Taxa BACEN (Anual)</p>
                      <p className="text-2xl font-bold">
                        {resultado.taxaBacen.taxa_anual ? resultado.taxaBacen.taxa_anual.toFixed(2) : '-'}%
                      </p>
                    </div>
                  </div>

                  {/* Alerta de Abusividade - Critério Judicial */}
                  <div className={`p-4 rounded-lg border-2 ${
                    resultado.nivelAbusividade === 'verde' 
                      ? 'bg-green-500/10 border-green-500' 
                      : resultado.nivelAbusividade === 'amarelo'
                      ? 'bg-amber-500/10 border-amber-500'
                      : 'bg-red-500/10 border-red-500'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`text-3xl ${
                        resultado.nivelAbusividade === 'verde' 
                          ? 'text-green-600' 
                          : resultado.nivelAbusividade === 'amarelo'
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}>
                        {resultado.nivelAbusividade === 'verde' && '✓'}
                        {resultado.nivelAbusividade === 'amarelo' && '⚠️'}
                        {resultado.nivelAbusividade === 'vermelho' && '⚠️'}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold text-lg ${
                          resultado.nivelAbusividade === 'verde' 
                            ? 'text-green-700 dark:text-green-400' 
                            : resultado.nivelAbusividade === 'amarelo'
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-red-700 dark:text-red-400'
                        }`}>
                          {resultado.mensagemAbusividade}
                        </p>
                        
                        <div className="mt-3 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Taxa do Contrato:</span>
                            <span className="font-semibold">{resultado.taxaReal.toFixed(4)}% a.m.</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Taxa Média BACEN:</span>
                            <span className="font-semibold">{resultado.taxaBacen.taxa_mensal.toFixed(4)}% a.m.</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Limite de Abusividade (1,5x BACEN):</span>
                            <span className="font-semibold">{resultado.limiteAbusividade.toFixed(4)}% a.m.</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-muted-foreground">Diferença:</span>
                            <span className="font-semibold">
                              {resultado.diferencaAbsoluta > 0 ? '+' : ''}{resultado.diferencaAbsoluta.toFixed(4)}%
                              ({resultado.percentualAcimaBacen.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Multiplicador BACEN:</span>
                            <span className="font-semibold">{resultado.multiplicadorBacen.toFixed(2)}x</span>
                          </div>
                        </div>
                        
                        {resultado.passivelAcao && (
                          <div className="mt-3 p-3 bg-red-500/20 rounded border border-red-500/30">
                            <p className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                              <span className="text-xl">⚖️</span>
                              AÇÃO REVISIONAL RECOMENDADA
                            </p>
                            <p className="text-xs mt-1 text-red-600 dark:text-red-300">
                              A taxa cobrada está {resultado.multiplicadorBacen.toFixed(2)}x acima da média do BACEN, 
                              ultrapassando o limite de 1,5x estabelecido pela jurisprudência dos tribunais. 
                              Este contrato é passível de revisão judicial.
                            </p>
                          </div>
                        )}
                        
                        {resultado.nivelAbusividade === 'amarelo' && (
                          <div className="mt-3 p-3 bg-amber-500/20 rounded border border-amber-500/30">
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                              A taxa está acima da média do mercado ({resultado.multiplicadorBacen.toFixed(2)}x), 
                              mas ainda não atinge o critério judicial de abusividade (1,5x). 
                              Recomenda-se negociação com a instituição financeira.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                    <p className="font-semibold mb-1">ℹ️ Fonte dos Dados:</p>
                    <p>Taxa média do BACEN obtida do Sistema Gerenciador de Séries Temporais (SGS) - {resultado.taxaBacen.origem}</p>
                    <p className="mt-1">Critério de abusividade: Superior a 1,5 vezes a taxa média de mercado (jurisprudência consolidada)</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
  );
};

export default CalculadoraJuros;
