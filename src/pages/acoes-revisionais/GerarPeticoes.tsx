import { useState, useMemo } from "react";
import NavigationBar from "@/components/NavigationBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  Filter,
  Search,
  FileCheck,
  Clock,
  CheckSquare,
  Square
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { gerarPeticaoJurosAbusivosPDF } from "@/lib/gerarPeticaoJurosAbusivosPDF";

// Dados mockados
const analisesMock = [
  {
    id: "1",
    clienteNome: "João Silva Santos",
    clienteCpf: "123.456.789-00",
    bancoNome: "Banco Itaú S.A.",
    modalidade: "Crédito Pessoal",
    dataAnalise: "2024-01-15",
    grauAbusividade: "Gravíssimo",
    valorFinanciado: 50000,
    numeroParcelas: 60,
    valorParcela: 1450,
    parcelasJaPagas: 24,
    saldoDevedor: 38500,
    taxaMensalContrato: 5.87,
    taxaAnualContrato: 99.45,
    taxaMensalBacen: 2.45,
    taxaAnualBacen: 33.52,
    diferencaTaxa: 3.42,
    percentualAbusividade: 139.59,
    valorPagoIndevido: 19680,
    parcelaCorreta: 1087,
    economiaFutura: 13068,
    devolucaoDobro: 39360,
    totalPrejuizo: 32748,
    scorePrioridade: 95,
    status: "Análise"
  },
  {
    id: "2",
    clienteNome: "Maria Oliveira Costa",
    clienteCpf: "987.654.321-00",
    bancoNome: "Banco Bradesco S.A.",
    modalidade: "Crédito Consignado",
    dataAnalise: "2024-01-18",
    grauAbusividade: "Muito Grave",
    valorFinanciado: 30000,
    numeroParcelas: 48,
    valorParcela: 920,
    parcelasJaPagas: 12,
    saldoDevedor: 25200,
    taxaMensalContrato: 4.12,
    taxaAnualContrato: 62.58,
    taxaMensalBacen: 1.87,
    taxaAnualBacen: 24.72,
    diferencaTaxa: 2.25,
    percentualAbusividade: 120.32,
    valorPagoIndevido: 3840,
    parcelaCorreta: 760,
    economiaFutura: 5760,
    devolucaoDobro: 7680,
    totalPrejuizo: 9600,
    scorePrioridade: 82,
    status: "Análise"
  },
  {
    id: "3",
    clienteNome: "Pedro Henrique Almeida",
    clienteCpf: "456.789.123-00",
    bancoNome: "Banco Santander S.A.",
    modalidade: "Empréstimo Pessoal",
    dataAnalise: "2024-01-20",
    grauAbusividade: "Grave",
    valorFinanciado: 20000,
    numeroParcelas: 36,
    valorParcela: 780,
    parcelasJaPagas: 18,
    saldoDevedor: 14800,
    taxaMensalContrato: 3.85,
    taxaAnualContrato: 57.23,
    taxaMensalBacen: 2.15,
    taxaAnualBacen: 28.98,
    diferencaTaxa: 1.70,
    percentualAbusividade: 79.07,
    valorPagoIndevido: 5040,
    parcelaCorreta: 640,
    economiaFutura: 2520,
    devolucaoDobro: 10080,
    totalPrejuizo: 7560,
    scorePrioridade: 68,
    status: "Proposta"
  },
  {
    id: "4",
    clienteNome: "Ana Paula Ferreira",
    clienteCpf: "321.654.987-00",
    bancoNome: "Caixa Econômica Federal",
    modalidade: "Crédito Pessoal",
    dataAnalise: "2024-01-22",
    grauAbusividade: "Gravíssimo",
    valorFinanciado: 80000,
    numeroParcelas: 72,
    valorParcela: 2100,
    parcelasJaPagas: 30,
    saldoDevedor: 62400,
    taxaMensalContrato: 6.12,
    taxaAnualContrato: 107.89,
    taxaMensalBacen: 2.32,
    taxaAnualBacen: 31.54,
    diferencaTaxa: 3.80,
    percentualAbusividade: 163.79,
    valorPagoIndevido: 27600,
    parcelaCorreta: 1320,
    economiaFutura: 32760,
    devolucaoDobro: 55200,
    totalPrejuizo: 60360,
    scorePrioridade: 98,
    status: "Análise"
  },
  {
    id: "5",
    clienteNome: "Carlos Eduardo Souza",
    clienteCpf: "789.123.456-00",
    bancoNome: "Banco do Brasil S.A.",
    modalidade: "CDC - Veículo",
    dataAnalise: "2024-01-25",
    grauAbusividade: "Moderado",
    valorFinanciado: 45000,
    numeroParcelas: 48,
    valorParcela: 1350,
    parcelasJaPagas: 20,
    saldoDevedor: 32400,
    taxaMensalContrato: 2.98,
    taxaAnualContrato: 42.15,
    taxaMensalBacen: 1.95,
    taxaAnualBacen: 25.87,
    diferencaTaxa: 1.03,
    percentualAbusividade: 52.82,
    valorPagoIndevido: 4800,
    parcelaCorreta: 1170,
    economiaFutura: 5040,
    devolucaoDobro: 9600,
    totalPrejuizo: 9840,
    scorePrioridade: 51,
    status: "Proposta"
  }
];

const grausAbusividade = [
  "Dentro do Mercado",
  "Leve", 
  "Moderado",
  "Grave",
  "Muito Grave",
  "Gravíssimo"
];

const statusOptions = ["Análise", "Proposta"];

export default function GerarPeticoes() {
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroGrau, setFiltroGrau] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroScoreMin, setFiltroScoreMin] = useState([0]);
  const [gerando, setGerando] = useState(false);
  const [progresso, setProgresso] = useState(0);

  // Filtrar análises
  const analisesFiltradas = useMemo(() => {
    return analisesMock.filter(analise => {
      const matchBusca = busca === "" || 
        analise.clienteNome.toLowerCase().includes(busca.toLowerCase()) ||
        analise.bancoNome.toLowerCase().includes(busca.toLowerCase());
      
      const matchGrau = filtroGrau === "todos" || analise.grauAbusividade === filtroGrau;
      const matchStatus = filtroStatus === "todos" || analise.status === filtroStatus;
      const matchScore = analise.scorePrioridade >= filtroScoreMin[0];

      return matchBusca && matchGrau && matchStatus && matchScore;
    });
  }, [busca, filtroGrau, filtroStatus, filtroScoreMin]);

  const toggleSelecionado = (id: string) => {
    setSelecionados(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleTodos = () => {
    if (selecionados.length === analisesFiltradas.length) {
      setSelecionados([]);
    } else {
      setSelecionados(analisesFiltradas.map(a => a.id));
    }
  };

  const gerarPeticoes = async () => {
    if (selecionados.length === 0) {
      toast.error("Selecione ao menos uma análise");
      return;
    }

    setGerando(true);
    setProgresso(0);

    const analisesParaGerar = analisesMock.filter(a => selecionados.includes(a.id));
    const total = analisesParaGerar.length;

    for (let i = 0; i < total; i++) {
      const analise = analisesParaGerar[i];
      
      try {
        // Preparar dados para a função de geração de PDF
        const dadosPeticao = {
          cliente: {
            nome: analise.clienteNome,
            cpf: analise.clienteCpf,
            endereco: "Rua Exemplo, 123",
            cidade: "São Paulo",
            estado: "SP"
          },
          banco: {
            nome: analise.bancoNome,
            cnpj: "00.000.000/0001-00"
          },
          contrato: {
            numero: `CONT-${analise.id.padStart(6, '0')}`,
            dataAssinatura: analise.dataAnalise,
            modalidade: analise.modalidade,
            valorFinanciado: analise.valorFinanciado,
            numeroParcelas: analise.numeroParcelas,
            valorParcela: analise.valorParcela,
            parcelasJaPagas: analise.parcelasJaPagas,
            saldoDevedor: analise.saldoDevedor
          },
          analise: {
            taxaMensalContrato: analise.taxaMensalContrato,
            taxaAnualContrato: analise.taxaAnualContrato,
            taxaMensalBacen: analise.taxaMensalBacen,
            taxaAnualBacen: analise.taxaAnualBacen,
            diferencaTaxa: analise.diferencaTaxa,
            percentualAbusividade: analise.percentualAbusividade,
            grauAbusividade: analise.grauAbusividade,
            temDiscrepancia: false
          },
          prejuizo: {
            valorPagoIndevido: analise.valorPagoIndevido,
            parcelaCorreta: analise.parcelaCorreta,
            economiaFutura: analise.economiaFutura,
            devolucaoDobro: analise.devolucaoDobro,
            totalPrejuizo: analise.totalPrejuizo
          },
          tabelaAbusiva: [],
          tabelaCorreta: [],
          advogado: {
            nome: "Dr. Advogado Exemplo",
            oab: "123456",
            estadoOab: "SP"
          },
          escritorio: {
            nome: "Escritório Exemplo",
            endereco: "Av. Paulista, 1000",
            cidade: "São Paulo",
            estado: "SP"
          }
        };

        await gerarPeticaoJurosAbusivosPDF(dadosPeticao);
        
        // Pequeno delay para não travar o navegador
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setProgresso(((i + 1) / total) * 100);
      } catch (error) {
        console.error(`Erro ao gerar petição para ${analise.clienteNome}:`, error);
        toast.error(`Erro ao gerar petição para ${analise.clienteNome}`);
      }
    }

    setGerando(false);
    setProgresso(0);
    toast.success(`${total} petição(ões) gerada(s) com sucesso!`);
    setSelecionados([]);
  };

  const getBadgeColor = (grau: string) => {
    switch (grau) {
      case "Dentro do Mercado": return "bg-green-500";
      case "Leve": return "bg-yellow-500";
      case "Moderado": return "bg-orange-500";
      case "Grave": return "bg-red-500";
      case "Muito Grave": return "bg-red-600";
      case "Gravíssimo": return "bg-purple-600";
      default: return "bg-gray-500";
    }
  };

  return (
    <>
      <NavigationBar />
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gerar Petições em Lote</h1>
            <p className="text-muted-foreground mt-1">
              Selecione as análises para gerar petições iniciais profissionais em PDF
            </p>
          </div>
          <FileText className="h-12 w-12 text-primary" />
        </div>

        {/* Card Informativo */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              Sobre as Petições Geradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Conteúdo Incluído:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Capa profissional com dados das partes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Sumário executivo do caso</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Dados completos do contrato</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Análise técnica detalhada com cálculos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Demonstrativo de prejuízo completo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Fundamentação legal extensa (CDC, STJ)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Pedidos detalhados (tutela + mérito)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Lista de anexos necessários</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Características:</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span><strong>15-25 páginas</strong> por petição</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span><strong>~2 segundos</strong> de geração por PDF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-primary" />
                    <span>Formatação profissional pronta para protocolo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-primary" />
                    <span>Download automático ao finalizar</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtros e Busca */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente ou banco..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={filtroGrau} onValueChange={setFiltroGrau}>
                <SelectTrigger>
                  <SelectValue placeholder="Grau de Abusividade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Graus</SelectItem>
                  {grausAbusividade.map(grau => (
                    <SelectItem key={grau} value={grau}>{grau}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Score Mínimo: {filtroScoreMin[0]}
                </label>
                <Slider
                  value={filtroScoreMin}
                  onValueChange={setFiltroScoreMin}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações em Lote */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Análises Disponíveis ({analisesFiltradas.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTodos}
                >
                  {selecionados.length === analisesFiltradas.length ? (
                    <>
                      <Square className="h-4 w-4 mr-2" />
                      Desmarcar Todos
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Selecionar Todos
                    </>
                  )}
                </Button>
                <Button
                  onClick={gerarPeticoes}
                  disabled={gerando || selecionados.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Gerar {selecionados.length > 0 && `${selecionados.length} `}
                  Petição{selecionados.length !== 1 && 'ões'}
                </Button>
              </div>
            </div>
            {gerando && (
              <div className="mt-4">
                <Progress value={progresso} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  Gerando petições... {Math.round(progresso)}%
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Banco</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Abusividade</TableHead>
                    <TableHead className="text-right">Prejuízo</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analisesFiltradas.map((analise) => (
                    <TableRow key={analise.id}>
                      <TableCell>
                        <Checkbox
                          checked={selecionados.includes(analise.id)}
                          onCheckedChange={() => toggleSelecionado(analise.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {analise.clienteNome}
                      </TableCell>
                      <TableCell>{analise.bancoNome}</TableCell>
                      <TableCell>
                        {new Date(analise.dataAnalise).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge className={getBadgeColor(analise.grauAbusividade)}>
                          {analise.grauAbusividade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(analise.totalPrejuizo)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={analise.scorePrioridade} className="h-2 flex-1" />
                          <span className="text-sm font-medium w-8">
                            {analise.scorePrioridade}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{analise.status}</Badge>
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
