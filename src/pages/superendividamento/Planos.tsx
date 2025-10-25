import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Calculator, AlertCircle, AlertTriangle, FileText, Download } from "lucide-react";
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, HeadingLevel, WidthType, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { calcularPlanoCompleto } from "@/utils/calculoPlanosPagamento";
import type { Contrato, ResultadoPlano, FasePagamento, DividaImpagavel } from "@/types/superendividamento";

export default function PlanosPagamento() {
  const [rendaLiquida, setRendaLiquida] = useState<number>(0);
  const [percentualRenda, setPercentualRenda] = useState<number>(30);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [novoCredor, setNovoCredor] = useState<string>("");
  const [novoValorTotal, setNovoValorTotal] = useState<number>(0);
  const [novaParcelaMensal, setNovaParcelaMensal] = useState<number>(0);
  const [resultado, setResultado] = useState<ResultadoPlano | null>(null);

  const adicionarContrato = () => {
    if (novoCredor.trim() && novoValorTotal > 0 && novaParcelaMensal > 0) {
      const novoContrato: Contrato = {
        id: Date.now().toString(),
        credor: novoCredor.trim(),
        valorTotalDivida: novoValorTotal,
        parcelaMensalAtual: novaParcelaMensal
      };
      setContratos([...contratos, novoContrato]);
      setNovoCredor("");
      setNovoValorTotal(0);
      setNovaParcelaMensal(0);
    }
  };

  const removerContrato = (id: string) => {
    setContratos(contratos.filter(c => c.id !== id));
  };

  const calcularPlano = () => {
    if (rendaLiquida > 0 && contratos.length > 0) {
      const plano = calcularPlanoCompleto(contratos, rendaLiquida, percentualRenda);
      setResultado(plano);
    }
  };

  const valorMensalDisponivel = rendaLiquida * (percentualRenda / 100);
  const totalDividas = contratos.reduce((soma, c) => soma + c.valorTotalDivida, 0);
  const encargoMensalAtual = contratos.reduce((soma, c) => soma + c.parcelaMensalAtual, 0);
  const percentualAtual = rendaLiquida > 0 ? (encargoMensalAtual / rendaLiquida) * 100 : 0;

  function gerarExplicacaoRedistribuicao(fase: FasePagamento, faseAnterior?: FasePagamento): JSX.Element | null {
    // Fase de ajuste - explicar redistribuição do credor sendo quitado
    if (fase.tipoFase === 'ajuste') {
      const credorQuitado = fase.calculos.find(c => c.quitado);
      const creditoresRestantes = fase.calculos.filter(c => !c.quitado);
      const sobraTotal = credorQuitado ? credorQuitado.parcelaMensalAtual - credorQuitado.novaParcela : 0;
      const sobraPorCredor = creditoresRestantes.length > 0 ? sobraTotal / creditoresRestantes.length : 0;

      return (
        <Card className="mt-4 bg-yellow-500/10 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-yellow-600 dark:text-yellow-400 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Explicação da Redistribuição - Fase {fase.numeroFase}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              <h4 className="font-semibold mb-2">Por que esta fase de ajuste é necessária?</h4>
              <p className="mb-3">
                O credor <strong>{credorQuitado?.credor}</strong> possui saldo remanescente de 
                <strong> R$ {credorQuitado?.novaParcela.toFixed(2)}</strong>, que é menor que sua parcela 
                proporcional calculada anteriormente.
              </p>
              
              <h4 className="font-semibold mb-2">Como é feita a redistribuição?</h4>
              <div className="bg-card p-4 rounded border">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Parcela proporcional anterior:</span>
                    <span>R$ {credorQuitado?.parcelaMensalAtual.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor exato para quitação:</span>
                    <span>R$ {credorQuitado?.novaParcela.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Sobra a ser redistribuída:</span>
                    <span>R$ {sobraTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <h4 className="font-semibold mb-2 mt-4">Divisão igualitária da sobra:</h4>
              <div className="bg-card p-4 rounded border">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sobra total:</span>
                    <span>R$ {sobraTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Credores restantes:</span>
                    <span>{creditoresRestantes.length}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Sobra por credor:</span>
                    <span>R$ {sobraPorCredor.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-primary/10 rounded">
                <strong>Resultado:</strong> Cada credor restante recebe sua parcela proporcional 
                + R$ {sobraPorCredor.toFixed(2)} da redistribuição igualitária.
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // Fase normal após quitações - explicar redistribuição igualitária
    if (fase.tipoFase === 'normal' && faseAnterior && faseAnterior.creditoresQuitados.length > 0) {
      const creditoresQuitados = faseAnterior.creditoresQuitados;
      const creditoresAtuais = fase.calculos.filter(c => !c.quitado);
      
      // Calcular quanto cada credor quitado pagava na fase anterior
      const totalRedistribuido = creditoresQuitados.reduce((total, credor) => {
        const calculoAnterior = faseAnterior.calculos.find(c => c.credor === credor);
        return total + (calculoAnterior?.novaParcela || 0);
      }, 0);
      
      const redistribuidoPorCredor = creditoresAtuais.length > 0 ? totalRedistribuido / creditoresAtuais.length : 0;
      
      return (
        <Card className="mt-4 bg-green-500/10 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400 flex items-center">
              ♻️ Redistribuição Igualitária - Fase {fase.numeroFase}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              <p className="mb-3">
                Com a quitação de <strong>{creditoresQuitados.join(', ')}</strong> na fase anterior, 
                o valor que era destinado a {creditoresQuitados.length > 1 ? 'eles' : 'ele'} 
                (R$ {totalRedistribuido.toFixed(2)}) é redistribuído <strong>igualitariamente</strong> entre 
                os {creditoresAtuais.length} credores restantes.
              </p>
              
              <div className="bg-card p-4 rounded border">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Valor total redistribuído:</span>
                    <span>R$ {totalRedistribuido.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Credores restantes:</span>
                    <span>{creditoresAtuais.length}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Valor por credor:</span>
                    <span>R$ {redistribuidoPorCredor.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Novas parcelas mensais:</h4>
                <div className="bg-card p-4 rounded border space-y-1">
                  {creditoresAtuais.map(c => (
                    <div key={c.credor} className="flex justify-between text-sm">
                      <span>{c.credor}:</span>
                      <span className="font-medium">R$ {c.novaParcela.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return null;
  }

  const gerarDocumentoWord = async () => {
    if (!resultado) return;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "PLANO DE PAGAMENTO - SUPERENDIVIDAMENTO",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "Lei 14.181/2021 - Art. 104-A do Código de Defesa do Consumidor",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),
          
          // Dados do devedor
          new Paragraph({
            text: "1. DADOS DO DEVEDOR",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Renda Líquida Mensal: ", bold: true }),
              new TextRun(`R$ ${rendaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Encargo Mensal Atual: ", bold: true }),
              new TextRun(`R$ ${encargoMensalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${percentualAtual.toFixed(1)}% da renda)`),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Limitação Pretendida (", bold: true }),
              new TextRun({ text: `${percentualRenda}%`, bold: true }),
              new TextRun({ text: "): ", bold: true }),
              new TextRun(`R$ ${valorMensalDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Redução no Encargo: ", bold: true }),
              new TextRun(`${resultado.resumo.reducaoPercentual.toFixed(1)}%`),
            ],
          }),
          new Paragraph({ text: "" }),
          
          // Análise de percentuais
          new Paragraph({
            text: "2. ANÁLISE DOS PERCENTUAIS ATUAIS",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: "Conforme metodologia estabelecida pela jurisprudência, cada parcela mensal atual representa um percentual do encargo total, percentual este que será mantido na redistribuição com limitação:",
          }),
          new Paragraph({ text: "" }),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Credor", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Parcela Atual", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Percentual", bold: true })] })] }),
                ],
              }),
              ...contratos.map(contrato => {
                const percentual = (contrato.parcelaMensalAtual / encargoMensalAtual) * 100;
                return new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(contrato.credor)] }),
                    new TableCell({ children: [new Paragraph(`R$ ${contrato.parcelaMensalAtual.toFixed(2)}`)] }),
                    new TableCell({ children: [new Paragraph(`${percentual.toFixed(2)}%`)] }),
                  ],
                });
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          
          // Fases do plano
          new Paragraph({
            text: "3. FASES DO PLANO DE PAGAMENTO",
            heading: HeadingLevel.HEADING_1,
          }),
          
          ...resultado.fases.flatMap((fase) => [
            new Paragraph({ text: "" }),
            new Paragraph({
              text: `FASE ${fase.numeroFase} - ${fase.tipoFase.toUpperCase()} (${fase.duracaoMeses} ${fase.duracaoMeses > 1 ? 'meses' : 'mes'})`,
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: fase.tipoFase === 'ajuste' 
                ? "Esta fase de ajuste é necessária pois um dos credores possui saldo remanescente inferior à sua parcela proporcional, exigindo redistribuição igualitária da sobra entre os demais credores, conforme metodologia jurisprudencial consolidada."
                : fase.numeroFase > 1 && resultado.fases[fase.numeroFase - 2]?.creditoresQuitados.length > 0
                ? `Fase de pagamento normal. Com a quitação de ${resultado.fases[fase.numeroFase - 2].creditoresQuitados.join(', ')} na fase anterior, o valor que era destinado é redistribuído igualitariamente entre os credores restantes.`
                : "Fase de pagamento normal com parcelas proporcionais mantidas conforme percentual original de cada credor.",
            }),
            new Paragraph({ text: "" }),
            
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Credor", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Nova Parcela", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Valor Pago", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Saldo", bold: true })] })] }),
                  ],
                }),
                ...fase.calculos.map(calc => 
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(calc.credor)] }),
                      new TableCell({ children: [new Paragraph(`R$ ${calc.novaParcela.toFixed(2)}`)] }),
                      new TableCell({ children: [new Paragraph(`R$ ${calc.valorPago.toFixed(2)}`)] }),
                      new TableCell({ children: [new Paragraph(`R$ ${calc.saldoRemanescente.toFixed(2)}`)] }),
                    ],
                  })
                ),
              ],
            }),
          ]),
          
          new Paragraph({ text: "" }),
          
          // Dívidas impagáveis
          ...(resultado.dividasImpagaveis && resultado.dividasImpagaveis.length > 0 ? [
            new Paragraph({
              text: "4. DÍVIDAS IMPAGÁVEIS",
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              text: "O Art. 104-A do CDC estabelece limite máximo de 60 meses para planos de superendividamento. O principal das dívidas foi substancialmente quitado, e o saldo remanescente deve ser assumido pelo credor como risco da operação:",
            }),
            new Paragraph({ text: "" }),
          ] : []),
          
          // Fundamentação legal
          new Paragraph({
            text: resultado.dividasImpagaveis && resultado.dividasImpagaveis.length > 0 ? "5. FUNDAMENTAÇÃO LEGAL" : "4. FUNDAMENTAÇÃO LEGAL",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: "O presente plano de pagamento foi elaborado em estrita observância ao Art. 104-A do Código de Defesa do Consumidor, incluído pela Lei 14.181/2021, que estabelece o tratamento do superendividamento do consumidor. A metodologia de cálculo segue orientação jurisprudencial consolidada, mantendo proporcionalidade entre credores e respeitando o limite temporal de 60 meses.",
          }),
        ],
      }],
    });
    
    const buffer = await Packer.toBuffer(doc);
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    saveAs(blob, `plano-pagamento-${new Date().toISOString().split('T')[0]}.docx`);
  };

  const gerarPDF = async () => {
    const elemento = document.getElementById('plano-completo');
    if (!elemento) return;
    
    const canvas = await html2canvas(elemento, {
      scale: 2,
      useCORS: true,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(`plano-pagamento-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Planos de Pagamento</h1>
        <p className="text-muted-foreground">
          Calcule planos de repactuação conforme Lei 14.181/2021
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuração do Plano */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Plano</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="renda">Renda Líquida Mensal</Label>
                <Input
                  id="renda"
                  type="number"
                  placeholder="0,00"
                  value={rendaLiquida || ""}
                  onChange={(e) => setRendaLiquida(Number(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="percentual">Percentual da Renda para Pagamento</Label>
                <Select value={percentualRenda.toString()} onValueChange={(value) => setPercentualRenda(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30% da renda líquida</SelectItem>
                    <SelectItem value="35">35% da renda líquida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Valor mensal disponível:</div>
                <div className="text-2xl font-bold text-primary">
                  R$ {valorMensalDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {encargoMensalAtual > 0 && (
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Encargo atual:</div>
                  <div className="text-2xl font-bold text-destructive">
                    {percentualAtual.toFixed(1)}% da renda
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    R$ {encargoMensalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mes
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contratos do Cliente</CardTitle>
              <p className="text-sm text-muted-foreground">
                Adicione cada contrato com o valor total da dívida e a parcela mensal atual
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  placeholder="Nome do credor"
                  value={novoCredor}
                  onChange={(e) => setNovoCredor(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Valor total da dívida"
                  value={novoValorTotal || ""}
                  onChange={(e) => setNovoValorTotal(Number(e.target.value))}
                />
                <Input
                  type="number"
                  placeholder="Parcela mensal atual"
                  value={novaParcelaMensal || ""}
                  onChange={(e) => setNovaParcelaMensal(Number(e.target.value))}
                />
              </div>
              
              <Button onClick={adicionarContrato} className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Contrato
              </Button>
              
              <div className="space-y-2">
                {contratos.map((contrato) => (
                  <div key={contrato.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{contrato.credor}</div>
                      <div className="text-sm text-muted-foreground">
                        Dívida: R$ {contrato.valorTotalDivida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Parcela: R$ {contrato.parcelaMensalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removerContrato(contrato.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {contratos.length > 0 && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total de Dívidas:</div>
                    <div className="text-lg font-bold text-primary">
                      R$ {totalDividas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  
                  <div className="bg-destructive/10 p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Encargo Mensal Atual:</div>
                    <div className="text-lg font-bold text-destructive">
                      R$ {encargoMensalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={calcularPlano} 
                className="w-full" 
                disabled={!rendaLiquida || contratos.length === 0}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calcular Plano de Pagamento
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Resultados */}
        <div className="space-y-6">
          {resultado && (
            <div id="plano-completo" className="space-y-6">
              {/* Botões de Exportação */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Button onClick={gerarDocumentoWord} className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Exportar para Word
                    </Button>
                    
                    <Button onClick={gerarPDF} variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Exportar para PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Resumo do Plano */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Plano</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{resultado.resumo.totalFases}</div>
                      <div className="text-sm text-muted-foreground">Total de Fases</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-500/10 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{resultado.resumo.totalMeses}</div>
                      <div className="text-sm text-muted-foreground">Total de Meses</div>
                    </div>
                    
                    <div className="text-center p-4 bg-destructive/10 rounded-lg">
                      <div className="text-2xl font-bold text-destructive">
                        R$ {resultado.resumo.encargoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-muted-foreground">Encargo Atual</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {resultado.resumo.reducaoPercentual.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Redução</div>
                    </div>
                  </div>
                  
                  {resultado.resumo.totalMeses > 60 && (
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                        ⚠️ Atenção: O plano excede 60 meses (limite legal da Lei 14.181/2021)
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* QUADRO 1: ANÁLISE DOS PERCENTUAIS ATUAIS */}
            <Card>
              <CardHeader>
                <CardTitle>1. Análise dos Percentuais Atuais</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Cada parcela mensal atual representa um percentual do encargo total
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border p-3 text-left">Credor</th>
                        <th className="border p-3 text-right">Parcela Atual</th>
                        <th className="border p-3 text-right">Percentual</th>
                        <th className="border p-3 text-left">Cálculo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contratos.map((contrato) => {
                        const percentual = (contrato.parcelaMensalAtual / encargoMensalAtual) * 100;
                        return (
                          <tr key={contrato.id}>
                            <td className="border p-3 font-medium">{contrato.credor}</td>
                            <td className="border p-3 text-right">
                              R$ {contrato.parcelaMensalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="border p-3 text-right font-bold text-primary">
                              {percentual.toFixed(2)}%
                            </td>
                            <td className="border p-3 text-sm text-muted-foreground">
                              R$ {contrato.parcelaMensalAtual.toFixed(2)} ÷ R$ {encargoMensalAtual.toFixed(2)} × 100
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-muted/50 font-bold">
                        <td className="border p-3">TOTAL</td>
                        <td className="border p-3 text-right">
                          R$ {encargoMensalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="border p-3 text-right">100,00%</td>
                        <td className="border p-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* QUADRO 2: REDISTRIBUIÇÃO COM LIMITAÇÃO */}
            <Card>
              <CardHeader>
                <CardTitle>2. Redistribuição com Limitação de {percentualRenda}% da Renda</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Mantendo os mesmos percentuais, mas limitando a {percentualRenda}% da renda líquida
                </p>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-primary/10 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-muted-foreground">Renda Líquida Mensal:</div>
                      <div className="text-lg font-bold">R$ {rendaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Limitação ({percentualRenda}%):</div>
                      <div className="text-lg font-bold text-primary">R$ {valorMensalDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Redução:</div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {resultado.resumo.reducaoPercentual.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border p-3 text-left">Credor</th>
                        <th className="border p-3 text-right">Percentual Mantido</th>
                        <th className="border p-3 text-right">Nova Parcela</th>
                        <th className="border p-3 text-left">Cálculo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contratos.map((contrato) => {
                        const percentual = (contrato.parcelaMensalAtual / encargoMensalAtual) * 100;
                        const novaParcela = (percentual / 100) * valorMensalDisponivel;
                        return (
                          <tr key={contrato.id}>
                            <td className="border p-3 font-medium">{contrato.credor}</td>
                            <td className="border p-3 text-right font-bold text-primary">
                              {percentual.toFixed(2)}%
                            </td>
                            <td className="border p-3 text-right">
                              R$ {novaParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="border p-3 text-sm text-muted-foreground">
                              {percentual.toFixed(2)}% × R$ {valorMensalDisponivel.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-muted/50 font-bold">
                        <td className="border p-3">TOTAL</td>
                        <td className="border p-3 text-right">100,00%</td>
                        <td className="border p-3 text-right">
                          R$ {valorMensalDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="border p-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {resultado.fases.map((fase) => (
                <div key={fase.numeroFase}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Fase {fase.numeroFase}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={fase.tipoFase === 'normal' ? 'default' : 'secondary'}>
                            {fase.tipoFase === 'normal' ? 'Normal' : 'Ajuste'}
                          </Badge>
                          <Badge variant="outline">
                            {fase.duracaoMeses} mes{fase.duracaoMeses > 1 ? 'es' : ''}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {fase.calculos.map((calculo, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">{calculo.credor}</div>
                              {calculo.quitado && (
                                <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                                  QUITADO
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Parcela Mensal:</div>
                                <div className="font-medium">
                                  R$ {calculo.novaParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                              </div>
                              
                              <div>
                                <div className="text-muted-foreground">Valor Pago na Fase:</div>
                                <div className="font-medium">
                                  R$ {calculo.valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                              </div>
                              
                              <div>
                                <div className="text-muted-foreground">Saldo Remanescente:</div>
                                <div className="font-medium">
                                  R$ {calculo.saldoRemanescente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                              </div>
                              
                              <div>
                                <div className="text-muted-foreground">Percentual:</div>
                                <div className="font-medium">
                                  {calculo.novoPercentual.toFixed(2)}%
                                </div>
                              </div>
                              
                              {calculo.sobraRecebida && (
                                <div className="col-span-2 md:col-span-4 bg-yellow-500/10 p-2 rounded">
                                  <div className="text-xs text-yellow-600 dark:text-yellow-400">
                                    + R$ {calculo.sobraRecebida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (redistribuição)
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {fase.creditoresQuitados.length > 0 && (
                          <div className="bg-green-500/10 p-3 rounded-lg">
                            <div className="text-sm font-medium text-green-600 dark:text-green-400">
                              ✅ Credores quitados nesta fase: {fase.creditoresQuitados.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  {gerarExplicacaoRedistribuicao(fase, resultado.fases[fase.numeroFase - 2])}
                </div>
              ))}
            </div>

            {/* Dívidas Impagáveis */}
            {resultado.dividasImpagaveis && resultado.dividasImpagaveis.length > 0 && (
              <Card className="border-destructive/50 bg-destructive/10">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Dívidas Impagáveis (Limite Legal de 60 Meses Atingido)
                  </CardTitle>
                  <p className="text-sm text-destructive/80 mt-2">
                    Conforme Art. 104-A do CDC (Lei 14.181/2021), o plano de pagamento não pode exceder 60 meses. 
                    Os valores abaixo representam o principal já quitado e o saldo impagável deve ser assumido 
                    pelo credor como risco da operação.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border">
                      <thead>
                        <tr className="bg-destructive/20">
                          <th className="border p-3 text-left">Credor</th>
                          <th className="border p-3 text-right">Valor Original</th>
                          <th className="border p-3 text-right">Valor Quitado</th>
                          <th className="border p-3 text-right">% Quitado</th>
                          <th className="border p-3 text-right">Saldo Impagável</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultado.dividasImpagaveis.map((divida, index) => (
                          <tr key={index}>
                            <td className="border p-3 font-medium">{divida.credor}</td>
                            <td className="border p-3 text-right">
                              R$ {divida.valorTotalOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="border p-3 text-right">
                              R$ {(divida.valorTotalOriginal - divida.saldoImpagavel).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="border p-3 text-right font-semibold">
                              {divida.percentualQuitado.toFixed(1)}%
                            </td>
                            <td className="border p-3 text-right font-bold text-destructive">
                              R$ {divida.saldoImpagavel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 p-4 bg-card rounded border">
                    <h4 className="font-semibold text-destructive mb-2">Fundamentação Legal:</h4>
                    <p className="text-sm text-muted-foreground">
                      O Art. 104-A do Código de Defesa do Consumidor, incluído pela Lei 14.181/2021, 
                      estabelece que o plano de pagamento para superendividamento não pode exceder 60 meses. 
                      O principal das dívidas foi substancialmente quitado, e o saldo remanescente deve ser 
                      considerado como risco inerente à operação de crédito, conforme jurisprudência do STJ.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
