import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "@/components/NavigationBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, MoreVertical, Eye, Edit, FileText, Shuffle, Trash2, Download, CheckSquare } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

// Função de cálculo de score de prioridade
function calcularScorePrioridade(analise: any): number {
  const grauScore: Record<string, number> = {
    "Dentro do Mercado": 0,
    "Leve": 20,
    "Moderado": 40,
    "Grave": 60,
    "Muito Grave": 80,
    "Gravíssimo": 100
  };

  const maxPrejuizo = 100000;
  const prejuizoScore = Math.min((analise.prejuizoTotal / maxPrejuizo) * 100, 100);
  const facilidadeScore = analise.temDiscrepancia ? 100 : 50;
  const jurisprudenciaScore = 80;

  const score = (
    (grauScore[analise.grauAbusividade] || 0) * 0.4 +
    prejuizoScore * 0.3 +
    facilidadeScore * 0.2 +
    jurisprudenciaScore * 0.1
  );

  return Math.round(score);
}

export default function ListaAnalisesCompleta() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filtroGrau, setFiltroGrau] = useState<string[]>([]);
  const [filtroPrejuizoMin, setFiltroPrejuizoMin] = useState([0]);
  const [filtroScoreMin, setFiltroScoreMin] = useState([0]);
  const [ordenacao, setOrdenacao] = useState("score-desc");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // DADOS MOCKADOS - Substituir por chamada ao Supabase
  const analisesMock = [
    {
      id: 1,
      cliente: "João Silva",
      banco: "Banco A",
      modalidade: "Crédito Pessoal",
      taxaContratual: 6.5,
      taxaBacen: 3.2,
      diferenca: 3.3,
      grauAbusividade: "Gravíssimo",
      prejuizoTotal: 125000,
      devolucaoDobro: 250000,
      temDiscrepancia: true,
      status: "Análise",
      dataAnalise: "2025-10-15"
    },
    {
      id: 2,
      cliente: "Maria Santos",
      banco: "Banco B",
      modalidade: "Cheque Especial",
      taxaContratual: 8.2,
      taxaBacen: 4.5,
      diferenca: 3.7,
      grauAbusividade: "Muito Grave",
      prejuizoTotal: 98000,
      devolucaoDobro: 196000,
      temDiscrepancia: false,
      status: "Proposta",
      dataAnalise: "2025-10-20"
    },
    {
      id: 3,
      cliente: "Pedro Costa",
      banco: "Banco C",
      modalidade: "Financiamento Veículo",
      taxaContratual: 5.8,
      taxaBacen: 2.1,
      diferenca: 3.7,
      grauAbusividade: "Gravíssimo",
      prejuizoTotal: 112000,
      devolucaoDobro: 224000,
      temDiscrepancia: true,
      status: "Ajuizada",
      dataAnalise: "2025-10-12"
    },
    {
      id: 4,
      cliente: "Ana Oliveira",
      banco: "Banco D",
      modalidade: "Crédito Consignado",
      taxaContratual: 4.2,
      taxaBacen: 1.8,
      diferenca: 2.4,
      grauAbusividade: "Muito Grave",
      prejuizoTotal: 87000,
      devolucaoDobro: 174000,
      temDiscrepancia: false,
      status: "Sentença",
      dataAnalise: "2025-09-28"
    },
    {
      id: 5,
      cliente: "Carlos Souza",
      banco: "Banco E",
      modalidade: "Crédito Pessoal",
      taxaContratual: 5.1,
      taxaBacen: 3.2,
      diferenca: 1.9,
      grauAbusividade: "Grave",
      prejuizoTotal: 76000,
      devolucaoDobro: 152000,
      temDiscrepancia: false,
      status: "Análise",
      dataAnalise: "2025-10-25"
    },
    {
      id: 6,
      cliente: "Juliana Lima",
      banco: "Banco F",
      modalidade: "Cartão de Crédito",
      taxaContratual: 12.5,
      taxaBacen: 8.0,
      diferenca: 4.5,
      grauAbusividade: "Grave",
      prejuizoTotal: 69000,
      devolucaoDobro: 138000,
      temDiscrepancia: true,
      status: "Proposta",
      dataAnalise: "2025-10-18"
    },
    {
      id: 7,
      cliente: "Roberto Alves",
      banco: "Banco G",
      modalidade: "Crédito Pessoal",
      taxaContratual: 4.5,
      taxaBacen: 3.2,
      diferenca: 1.3,
      grauAbusividade: "Moderado",
      prejuizoTotal: 54000,
      devolucaoDobro: 108000,
      temDiscrepancia: false,
      status: "Análise",
      dataAnalise: "2025-10-22"
    },
    {
      id: 8,
      cliente: "Fernanda Dias",
      banco: "Banco H",
      modalidade: "Financiamento Imóvel",
      taxaContratual: 3.8,
      taxaBacen: 2.5,
      diferenca: 1.3,
      grauAbusividade: "Moderado",
      prejuizoTotal: 48000,
      devolucaoDobro: 96000,
      temDiscrepancia: false,
      status: "Ajuizada",
      dataAnalise: "2025-10-10"
    },
    {
      id: 9,
      cliente: "Lucas Martins",
      banco: "Banco I",
      modalidade: "Crédito Consignado",
      taxaContratual: 2.5,
      taxaBacen: 1.8,
      diferenca: 0.7,
      grauAbusividade: "Leve",
      prejuizoTotal: 35000,
      devolucaoDobro: 70000,
      temDiscrepancia: false,
      status: "Análise",
      dataAnalise: "2025-10-26"
    },
    {
      id: 10,
      cliente: "Carla Rocha",
      banco: "Banco J",
      modalidade: "Crédito Pessoal",
      taxaContratual: 3.5,
      taxaBacen: 3.2,
      diferenca: 0.3,
      grauAbusividade: "Leve",
      prejuizoTotal: 28000,
      devolucaoDobro: 56000,
      temDiscrepancia: false,
      status: "Proposta",
      dataAnalise: "2025-10-24"
    }
  ];

  // Adicionar score a cada análise
  const analisesComScore = analisesMock.map(analise => ({
    ...analise,
    score: calcularScorePrioridade(analise)
  }));

  // Filtrar análises
  const analisesFiltradas = analisesComScore
    .filter(analise => {
      const matchBusca = busca === "" || 
        analise.cliente.toLowerCase().includes(busca.toLowerCase()) ||
        analise.banco.toLowerCase().includes(busca.toLowerCase());
      
      const matchGrau = filtroGrau.length === 0 || filtroGrau.includes(analise.grauAbusividade);
      const matchPrejuizo = analise.prejuizoTotal >= filtroPrejuizoMin[0];
      const matchScore = analise.score >= filtroScoreMin[0];
      
      return matchBusca && matchGrau && matchPrejuizo && matchScore;
    })
    .sort((a, b) => {
      switch(ordenacao) {
        case "score-desc": return b.score - a.score;
        case "score-asc": return a.score - b.score;
        case "prejuizo-desc": return b.prejuizoTotal - a.prejuizoTotal;
        case "prejuizo-asc": return a.prejuizoTotal - b.prejuizoTotal;
        case "data-desc": return new Date(b.dataAnalise).getTime() - new Date(a.dataAnalise).getTime();
        case "data-asc": return new Date(a.dataAnalise).getTime() - new Date(b.dataAnalise).getTime();
        default: return 0;
      }
    });

  const getGrauColor = (grau: string) => {
    const colors: Record<string, string> = {
      "Dentro do Mercado": "text-green-600 bg-green-50",
      "Leve": "text-yellow-600 bg-yellow-50",
      "Moderado": "text-orange-600 bg-orange-50",
      "Grave": "text-red-600 bg-red-50",
      "Muito Grave": "text-red-700 bg-red-100",
      "Gravíssimo": "text-purple-600 bg-purple-50",
    };
    return colors[grau] || "text-gray-600 bg-gray-50";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Análise": "bg-blue-100 text-blue-800",
      "Proposta": "bg-yellow-100 text-yellow-800",
      "Ajuizada": "bg-purple-100 text-purple-800",
      "Sentença": "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === analisesFiltradas.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(analisesFiltradas.map(a => a.id));
    }
  };

  return (
    <>
      <NavigationBar />
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-purple-700 dark:text-purple-400">
              Lista de Análises Revisionais
            </h1>
            <p className="text-muted-foreground mt-1">
              {analisesFiltradas.length} análises encontradas
            </p>
          </div>
          <Button 
            onClick={() => navigate("/app/acoes-revisionais/nova-analise")}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Nova Análise
          </Button>
        </div>

        {/* Barra de Ferramentas */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Buscar por cliente ou banco..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
              <Select value={ordenacao} onValueChange={setOrdenacao}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Ordenar por..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score-desc">Score (maior)</SelectItem>
                  <SelectItem value="score-asc">Score (menor)</SelectItem>
                  <SelectItem value="prejuizo-desc">Prejuízo (maior)</SelectItem>
                  <SelectItem value="prejuizo-asc">Prejuízo (menor)</SelectItem>
                  <SelectItem value="data-desc">Data (recente)</SelectItem>
                  <SelectItem value="data-asc">Data (antiga)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Painel de Filtros Expansível */}
            {mostrarFiltros && (
              <div className="grid md:grid-cols-3 gap-6 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Grau de Abusividade</Label>
                  <div className="space-y-2">
                    {["Gravíssimo", "Muito Grave", "Grave", "Moderado", "Leve"].map(grau => (
                      <div key={grau} className="flex items-center gap-2">
                        <Checkbox
                          checked={filtroGrau.includes(grau)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFiltroGrau([...filtroGrau, grau]);
                            } else {
                              setFiltroGrau(filtroGrau.filter(g => g !== grau));
                            }
                          }}
                        />
                        <Label className="cursor-pointer">{grau}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Prejuízo Mínimo: R$ {filtroPrejuizoMin[0].toLocaleString("pt-BR")}</Label>
                  <Slider
                    value={filtroPrejuizoMin}
                    onValueChange={setFiltroPrejuizoMin}
                    max={150000}
                    step={5000}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Score Mínimo: {filtroScoreMin[0]}</Label>
                  <Slider
                    value={filtroScoreMin}
                    onValueChange={setFiltroScoreMin}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {/* Ações em Lote */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 pt-4 border-t">
                <span className="text-sm text-muted-foreground">
                  {selectedIds.length} selecionado(s)
                </span>
                <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Gerar Petições em Lote
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar Excel
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Alterar Status
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabela de Análises */}
        <Card>
          <CardHeader>
            <CardTitle>Análises Completas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedIds.length === analisesFiltradas.length && analisesFiltradas.length > 0}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Banco</TableHead>
                  <TableHead>Modalidade</TableHead>
                  <TableHead className="text-right">Taxa (%)</TableHead>
                  <TableHead className="text-right">BACEN (%)</TableHead>
                  <TableHead className="text-right">Diff (p.p.)</TableHead>
                  <TableHead>Grau</TableHead>
                  <TableHead className="text-right">Prejuízo</TableHead>
                  <TableHead className="text-right">Devolução 2x</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analisesFiltradas.map((analise) => (
                  <TableRow key={analise.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(analise.id)}
                        onCheckedChange={() => toggleSelection(analise.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{analise.cliente}</TableCell>
                    <TableCell>{analise.banco}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{analise.modalidade}</TableCell>
                    <TableCell className="text-right font-semibold">{analise.taxaContratual.toFixed(2)}%</TableCell>
                    <TableCell className="text-right text-green-600">{analise.taxaBacen.toFixed(2)}%</TableCell>
                    <TableCell className="text-right font-semibold text-red-600">{analise.diferenca.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={`${getGrauColor(analise.grauAbusividade)} font-semibold`}>
                        {analise.grauAbusividade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" }).format(analise.prejuizoTotal)}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" }).format(analise.devolucaoDobro)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg font-bold text-purple-600">{analise.score}</span>
                        <Progress value={analise.score} className="w-16 h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select defaultValue={analise.status}>
                        <SelectTrigger className={`w-[110px] ${getStatusColor(analise.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Análise">Análise</SelectItem>
                          <SelectItem value="Proposta">Proposta</SelectItem>
                          <SelectItem value="Ajuizada">Ajuizada</SelectItem>
                          <SelectItem value="Sentença">Sentença</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate(`/app/acoes-revisionais/analise/${analise.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/app/acoes-revisionais/nova-analise/${analise.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Análise
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/app/acoes-revisionais/gerar-peticoes?id=${analise.id}`)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Gerar Petição
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/app/acoes-revisionais/simulador?id=${analise.id}`)}>
                            <Shuffle className="mr-2 h-4 w-4" />
                            Simular "E Se?"
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
