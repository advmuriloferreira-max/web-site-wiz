import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, DollarSign, Target, Percent, Award, Bell } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import NavigationBar from "@/components/NavigationBar";
import { IntelliLogo } from "@/components/ui/intellbank-logo";

export default function RadarAcoes() {
  const navigate = useNavigate();

  // DADOS MOCKADOS - Substituir por chamadas ao Supabase
  const kpis = {
    totalContratos: 342,
    percentualAbusividade: 67.8,
    valorPrejuizo: 4850000,
    economiaPotencial: 3200000,
    mediaAbusividade: 42.5,
    taxaSucessoJudicial: 78.3,
  };

  // Distribuição por grau de abusividade
  const distribuicaoAbusividade = [
    { name: "Dentro do Mercado", value: 32, fill: "#10B981" },
    { name: "Leve", value: 45, fill: "#FBBF24" },
    { name: "Moderado", value: 78, fill: "#F97316" },
    { name: "Grave", value: 112, fill: "#EF4444" },
    { name: "Muito Grave", value: 54, fill: "#DC2626" },
    { name: "Gravíssimo", value: 21, fill: "#9333EA" },
  ];

  // Top 10 bancos com maior abusividade
  const top10Bancos = [
    { banco: "Banco A", abusividade: 58.2 },
    { banco: "Banco B", abusividade: 52.1 },
    { banco: "Banco C", abusividade: 48.7 },
    { banco: "Banco D", abusividade: 45.3 },
    { banco: "Banco E", abusividade: 42.9 },
    { banco: "Banco F", abusividade: 39.5 },
    { banco: "Banco G", abusividade: 36.8 },
    { banco: "Banco H", abusividade: 33.2 },
    { banco: "Banco I", abusividade: 29.7 },
    { banco: "Banco J", abusividade: 25.4 },
  ];

  // Evolução nos últimos 6 meses
  const evolucaoAnalises = [
    { mes: "Mai/25", analises: 42 },
    { mes: "Jun/25", analises: 58 },
    { mes: "Jul/25", analises: 67 },
    { mes: "Ago/25", analises: 73 },
    { mes: "Set/25", analises: 81 },
    { mes: "Out/25", analises: 95 },
  ];

  // Funil de conversão
  const funnelData = [
    { etapa: "Analisados", quantidade: 342, fill: "#3b82f6" },
    { etapa: "Com Abusividade", quantidade: 232, fill: "#f97316" },
    { etapa: "Ações Ajuizadas", quantidade: 87, fill: "#10b981" },
  ];

  // Top 10 oportunidades
  const top10Oportunidades = [
    { id: 1, cliente: "João Silva", banco: "Banco A", grau: "Gravíssimo", prejuizo: 125000, score: 98 },
    { id: 2, cliente: "Maria Santos", banco: "Banco B", grau: "Muito Grave", prejuizo: 98000, score: 95 },
    { id: 3, cliente: "Pedro Costa", banco: "Banco C", grau: "Gravíssimo", prejuizo: 112000, score: 94 },
    { id: 4, cliente: "Ana Oliveira", banco: "Banco D", grau: "Muito Grave", prejuizo: 87000, score: 92 },
    { id: 5, cliente: "Carlos Souza", banco: "Banco E", grau: "Grave", prejuizo: 76000, score: 88 },
    { id: 6, cliente: "Juliana Lima", banco: "Banco F", grau: "Grave", prejuizo: 69000, score: 85 },
    { id: 7, cliente: "Roberto Alves", banco: "Banco G", grau: "Moderado", prejuizo: 54000, score: 82 },
    { id: 8, cliente: "Fernanda Dias", banco: "Banco H", grau: "Moderado", prejuizo: 48000, score: 79 },
    { id: 9, cliente: "Lucas Martins", banco: "Banco I", grau: "Leve", prejuizo: 35000, score: 75 },
    { id: 10, cliente: "Carla Rocha", banco: "Banco J", grau: "Leve", prejuizo: 28000, score: 72 },
  ];

  // Alertas inteligentes
  const alertas = [
    { tipo: "critico", mensagem: "3 novos contratos com abusividade Gravíssima detectados", data: "Hoje" },
    { tipo: "aviso", mensagem: "Taxa BACEN atualizada - Verificar análises pendentes", data: "Ontem" },
    { tipo: "sucesso", mensagem: "Nova jurisprudência favorável STJ (REsp 1.234.567)", data: "2 dias" },
    { tipo: "alerta", mensagem: "Prazo prescricional próximo - Cliente: João Silva", data: "5 dias" },
  ];

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

  const getAlertIcon = (tipo: string) => {
    const icons: Record<string, { icon: typeof Bell; color: string }> = {
      critico: { icon: AlertTriangle, color: "text-red-600" },
      aviso: { icon: Bell, color: "text-yellow-600" },
      sucesso: { icon: Award, color: "text-green-600" },
      alerta: { icon: Bell, color: "text-orange-600" },
    };
    return icons[tipo] || icons.aviso;
  };

  return (
    <>
      <NavigationBar />
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-purple-700 dark:text-purple-400">
              Radar de Ações Revisionais
            </h1>
            <p className="text-muted-foreground mt-1">
              Identificação estratégica de oportunidades de ações revisionais
            </p>
          </div>
          <Button 
            onClick={() => navigate("/app/acoes-revisionais/nova-analise")}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Target className="mr-2 h-4 w-4" />
            Nova Análise
          </Button>
        </div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Contratos Analisados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{kpis.totalContratos}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                % Abusividade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{kpis.percentualAbusividade}%</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Prejuízo Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  notation: "compact",
                }).format(kpis.valorPrejuizo)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Economia Potencial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  notation: "compact",
                }).format(kpis.economiaPotencial)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Média Abusividade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{kpis.mediaAbusividade}%</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Taxa Sucesso Judicial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{kpis.taxaSucessoJudicial}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas Inteligentes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alertas Inteligentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertas.map((alerta, index) => {
                const AlertIcon = getAlertIcon(alerta.tipo).icon;
                const iconColor = getAlertIcon(alerta.tipo).color;
                return (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <AlertIcon className={`h-5 w-5 mt-0.5 ${iconColor}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alerta.mensagem}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alerta.data}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Gráficos Estratégicos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pizza - Distribuição por Grau */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribuição por Grau de Abusividade</CardTitle>
              <CardDescription>6 categorias de classificação</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distribuicaoAbusividade}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {distribuicaoAbusividade.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Barras - Top 10 Bancos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top 10 Bancos - Maior Abusividade</CardTitle>
              <CardDescription>Percentual médio de abusividade</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={top10Bancos} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="banco" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="abusividade" fill="#9333EA" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Linha - Evolução */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Evolução de Análises</CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evolucaoAnalises}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="analises" stroke="#9333EA" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Funil de Conversão */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Funil de Conversão</CardTitle>
              <CardDescription>Contratos → Abusividade → Ações</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="etapa" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade">
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top 10 Oportunidades */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top 10 Oportunidades de Ações Revisionais</CardTitle>
            <CardDescription>Ordenado por score de prioridade</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Banco</TableHead>
                  <TableHead>Grau de Abusividade</TableHead>
                  <TableHead>Prejuízo Total</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top10Oportunidades.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.cliente}</TableCell>
                    <TableCell>{item.banco}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getGrauColor(item.grau)}`}>
                        {item.grau}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(item.prejuizo)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold text-purple-600">{item.score}</div>
                        <div className="text-xs text-muted-foreground">/100</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/app/acoes-revisionais/analise/${item.id}`)}
                      >
                        Ver Análise
                      </Button>
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
