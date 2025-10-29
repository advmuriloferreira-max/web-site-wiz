import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, CheckCircle2, Info } from 'lucide-react';
import { gerarRelatorioPDFPassivoBancario } from '@/lib/gerarRelatorioPDF';
import { toast } from 'sonner';
import NavigationBar from '@/components/NavigationBar';

// ==============================================================================
// DADOS MOCKADOS (SUBSTITUIR PELA CHAMADA À API/BANCO DE DADOS)
// ==============================================================================

const mockAnalises = [
  { 
    id: 1, 
    numeroContrato: 'CTR-001', 
    cliente: 'Empresa A', 
    banco: 'Itaú Unibanco S.A.', 
    saldoDevedor: 150000, 
    provisaoPercentual: 90,
    provisaoValor: 135000,
    propostaValor: 15000,
    diasAtraso: 550,
    marco: '90%+',
    modalidade: 'Capital de giro',
    carteira: 'C4',
    dataVencimento: '2024-01-15',
    dataPrimeiroAtraso: '2024-03-20'
  },
  { 
    id: 2, 
    numeroContrato: 'CTR-002', 
    cliente: 'Empresa B', 
    banco: 'Bradesco S.A.', 
    saldoDevedor: 80000, 
    provisaoPercentual: 80,
    provisaoValor: 64000,
    propostaValor: 16000,
    diasAtraso: 450,
    marco: '80-89%',
    modalidade: 'Alienação de veículos',
    carteira: 'C2',
    dataVencimento: '2024-02-10',
    dataPrimeiroAtraso: '2024-04-15'
  },
  { 
    id: 3, 
    numeroContrato: 'CTR-003', 
    cliente: 'Pessoa Física C', 
    banco: 'Santander Brasil S.A.', 
    saldoDevedor: 200000, 
    provisaoPercentual: 70,
    provisaoValor: 140000,
    propostaValor: 60000,
    diasAtraso: 360,
    marco: '70-79%',
    modalidade: 'Crédito pessoal',
    carteira: 'C5',
    dataVencimento: '2024-03-05',
    dataPrimeiroAtraso: '2024-05-10'
  },
  { 
    id: 4, 
    numeroContrato: 'CTR-004', 
    cliente: 'Empresa D', 
    banco: 'Banco do Brasil S.A.', 
    saldoDevedor: 50000, 
    provisaoPercentual: 95,
    provisaoValor: 47500,
    propostaValor: 5000,
    diasAtraso: 730,
    marco: '90%+',
    modalidade: 'ACC',
    carteira: 'C4',
    dataVencimento: '2023-12-20',
    dataPrimeiroAtraso: '2024-02-25'
  },
  { 
    id: 5, 
    numeroContrato: 'CTR-005', 
    cliente: 'Pessoa Física E', 
    banco: 'Caixa Econômica Federal', 
    saldoDevedor: 120000, 
    provisaoPercentual: 60,
    provisaoValor: 72000,
    propostaValor: 48000,
    diasAtraso: 300,
    marco: '60-69%',
    modalidade: 'Crédito consignado',
    carteira: 'C5',
    dataVencimento: '2024-04-01',
    dataPrimeiroAtraso: '2024-06-05'
  },
];

// ==============================================================================
// COMPONENTE PRINCIPAL
// ==============================================================================

export default function RelatoriosPage() {
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [gerando, setGerando] = useState(false);

  const toggleSelecao = (id: number) => {
    setSelecionados(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const selecionarTodos = () => {
    if (selecionados.length === mockAnalises.length) {
      setSelecionados([]);
    } else {
      setSelecionados(mockAnalises.map(a => a.id));
    }
  };

  const gerarRelatorios = async () => {
    if (selecionados.length === 0) {
      toast.error('Selecione pelo menos uma análise para gerar o relatório.');
      return;
    }

    setGerando(true);

    try {
      // Simula um pequeno delay para dar feedback visual
      await new Promise(resolve => setTimeout(resolve, 500));

      // Gera um PDF para cada análise selecionada
      const analisesParaGerar = mockAnalises.filter(a => selecionados.includes(a.id));
      
      for (const analise of analisesParaGerar) {
        gerarRelatorioPDFPassivoBancario(analise);
        // Pequeno delay entre cada geração para não travar o navegador
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      toast.success(`${analisesParaGerar.length} relatório(s) gerado(s) com sucesso!`);
      setSelecionados([]);
    } catch (error) {
      toast.error('Erro ao gerar relatórios. Tente novamente.');
      console.error('Erro ao gerar relatórios:', error);
    } finally {
      setGerando(false);
    }
  };

  return (
    <>
      <NavigationBar />
      <div className="container mx-auto p-4 md:p-8 space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerar Relatórios</h1>
          <p className="text-muted-foreground mt-2">
            Selecione as análises para gerar relatórios profissionais em PDF
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            onClick={selecionarTodos}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {selecionados.length === mockAnalises.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
          </Button>
          <Button 
            onClick={gerarRelatorios}
            disabled={selecionados.length === 0 || gerando}
            className="gap-2 bg-success hover:bg-success-dark text-success-foreground shadow-md"
          >
            <Download className="h-4 w-4" />
            {gerando ? 'Gerando...' : `Gerar ${selecionados.length} Relatório(s)`}
          </Button>
        </div>
      </div>

      {/* Card de Informações */}
      <Card className="bg-info-subtle border-info/30">
        <CardHeader>
          <CardTitle className="text-info-dark flex items-center gap-2">
            <Info className="h-5 w-5" />
            Sobre os Relatórios
          </CardTitle>
          <CardDescription className="text-info-dark/80">
            Os relatórios gerados incluem:
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-info-dark/90 space-y-1">
          <p>✓ Sumário executivo com dados da operação</p>
          <p>✓ Análise técnica da provisão conforme BCB 352/2023</p>
          <p>✓ Fundamentação legal com citação das resoluções</p>
          <p>✓ Proposta formal de acordo para quitação</p>
          <p>✓ Formatação profissional com cabeçalho e rodapé</p>
        </CardContent>
      </Card>

      {/* Tabela de Seleção */}
      <Card>
        <CardHeader>
          <CardTitle>Análises Disponíveis</CardTitle>
          <CardDescription>
            {selecionados.length} de {mockAnalises.length} análise(s) selecionada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selecionados.length === mockAnalises.length && mockAnalises.length > 0}
                      onCheckedChange={selecionarTodos}
                      aria-label="Selecionar todos"
                    />
                  </TableHead>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Banco</TableHead>
                  <TableHead className="text-right">Saldo Devedor</TableHead>
                  <TableHead className="text-center">Provisão</TableHead>
                  <TableHead className="text-center">Marco</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAnalises.map((analise) => (
                  <TableRow 
                    key={analise.id}
                    className={selecionados.includes(analise.id) ? 'bg-success-subtle' : ''}
                  >
                    <TableCell>
                      <Checkbox 
                        checked={selecionados.includes(analise.id)}
                        onCheckedChange={() => toggleSelecao(analise.id)}
                        aria-label={`Selecionar análise ${analise.numeroContrato}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{analise.numeroContrato}</TableCell>
                    <TableCell>{analise.cliente}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{analise.banco}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {analise.saldoDevedor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell className="text-center">{analise.provisaoPercentual}%</TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-warning">{analise.marco}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
