// src/pages/gestao-passivo/Dashboard.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Eye } from 'lucide-react';
import NavigationBar from '@/components/NavigationBar';
import { IntelliLogo } from "@/components/ui/intellbank-logo";

// ==============================================================================
// DADOS MOCKADOS (SUBSTITUIR PELA CHAMADA À API/BANCO DE DADOS)
// ==============================================================================

// Simula os dados que viriam do seu backend (Supabase)
const mockAnalises = [
  { id: 1, marco: '90%+', saldoDevedor: 150000, provisaoValor: 135000, propostaValor: 15000, banco: 'Itaú Unibanco S.A.', carteira: 'C4' },
  { id: 2, marco: '80-89%', saldoDevedor: 80000, provisaoValor: 60000, propostaValor: 12000, banco: 'Bradesco S.A.', carteira: 'C5' },
  { id: 3, marco: '70-79%', saldoDevedor: 200000, provisaoValor: 150000, propostaValor: 50000, banco: 'Santander Brasil S.A.', carteira: 'C3' },
  { id: 4, marco: '90%+', saldoDevedor: 50000, provisaoValor: 45000, propostaValor: 5000, banco: 'Banco do Brasil S.A.', carteira: 'C4' },
  { id: 5, marco: '60-69%', saldoDevedor: 120000, provisaoValor: 78000, propostaValor: 42000, banco: 'Caixa Econômica Federal', carteira: 'C2' },
  { id: 6, marco: '50-59%', saldoDevedor: 30000, provisaoValor: 16500, propostaValor: 13500, banco: 'Banco Inter S.A.', carteira: 'C5' },
  { id: 7, marco: '80-89%', saldoDevedor: 95000, provisaoValor: 80750, propostaValor: 14250, banco: 'BTG Pactual S.A.', carteira: 'C2' },
  { id: 8, marco: '90%+', saldoDevedor: 250000, provisaoValor: 225000, propostaValor: 25000, banco: 'Itaú Unibanco S.A.', carteira: 'C3' },
];

// ==============================================================================
// CONFIGURAÇÕES E HELPERS
// ==============================================================================

const MARCOS_CONFIG = {
  '90%+': { label: 'Oportunidade Premium', color: 'hsl(var(--destructive))', bgColor: 'bg-red-100' },
  '80-89%': { label: 'Oportunidade Excelente', color: 'hsl(var(--warning))', bgColor: 'bg-orange-100' },
  '70-79%': { label: 'Oportunidade Forte', color: 'hsl(var(--warning))', bgColor: 'bg-yellow-100' },
  '60-69%': { label: 'Oportunidade Boa', color: 'hsl(var(--info))', bgColor: 'bg-blue-100' },
  '50-59%': { label: 'Oportunidade Moderada', color: 'hsl(var(--success))', bgColor: 'bg-green-100' },
  '< 50%': { label: 'Baixo Risco', color: 'hsl(var(--muted-foreground))', bgColor: 'bg-gray-100' },
  'N/A': { label: 'Não Aplicável', color: 'hsl(var(--muted-foreground))', bgColor: 'bg-gray-100' },
};

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

// ==============================================================================
// COMPONENTE PRINCIPAL DO DASHBOARD
// ==============================================================================

export default function DashboardPage() {
  const navigate = useNavigate();

  // --- CÁLCULO DOS KPIs --- (Estes cálculos seriam feitos no backend idealmente)
  const totalAnalises = mockAnalises.length;
  const saldoTotalDevedor = mockAnalises.reduce((acc, curr) => acc + curr.saldoDevedor, 0);
  const provisaoTotal = mockAnalises.reduce((acc, curr) => acc + curr.provisaoValor, 0);
  const economiaPotencial = saldoTotalDevedor - provisaoTotal;

  // --- DADOS PARA OS GRÁFICOS ---
  const distribuicaoPorMarco = Object.keys(MARCOS_CONFIG).map(marco => ({
    name: marco,
    value: mockAnalises.filter(a => a.marco === marco).length,
  })).filter(d => d.value > 0);

  const distribuicaoPorBanco = mockAnalises.reduce((acc, curr) => {
    if (!acc[curr.banco]) {
      acc[curr.banco] = 0;
    }
    acc[curr.banco]++;
    return acc;
  }, {} as Record<string, number>);

  const dataGraficoBancos = Object.entries(distribuicaoPorBanco).map(([name, value]) => ({ name, value }));

  return (
    <>
      <NavigationBar />
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Radar de Oportunidades de Acordos</h1>

      {/* Seção de KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total de Análises" value={totalAnalises} />
        <KpiCard title="Saldo Devedor Total" value={saldoTotalDevedor} isCurrency />
        <KpiCard title="Provisão Total" value={provisaoTotal} isCurrency />
        <KpiCard title="Economia Potencial" value={economiaPotencial} isCurrency />
      </div>

      {/* Seção de Cards de Oportunidades por Marco */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Oportunidades por Marco de Provisionamento</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Object.entries(MARCOS_CONFIG).slice(0, 5).map(([key, config]) => {
            const analisesNoMarco = mockAnalises.filter(a => a.marco === key);
            const count = analisesNoMarco.length;
            const valorTotal = analisesNoMarco.reduce((acc, curr) => acc + curr.saldoDevedor, 0);
            return (
              <OpportunityCard 
                key={key} 
                marco={key}
                config={config} 
                count={count} 
                valorTotal={valorTotal}
              />
            );
          })}
        </div>
      </div>

      {/* Tabela de Análises Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Análises Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnalises.slice(0, 5).map((analise) => (
              <div key={analise.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex-1">
                  <p className="font-semibold">{analise.banco}</p>
                  <p className="text-sm text-muted-foreground">
                    Saldo: {analise.saldoDevedor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} | 
                    Marco: {analise.marco}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate(`/app/gestao-passivo/analise/${analise.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Seção de Gráficos */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Banco</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataGraficoBancos} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={150} />
                <Tooltip cursor={{fill: '#f3f4f6'}} formatter={(value) => `${value} análise(s)`} />
                <Legend />
                <Bar dataKey="value" name="Nº de Análises" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Marco</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={distribuicaoPorMarco} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {distribuicaoPorMarco.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} (${((value as number / totalAnalises) * 100).toFixed(0)}%)`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      </div>
    </>
  );
}

// ==============================================================================
// SUB-COMPONENTES
// ==============================================================================

interface KpiCardProps {
  title: string;
  value: number;
  isCurrency?: boolean;
}

function KpiCard({ title, value, isCurrency = false }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isCurrency ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : value}
        </div>
      </CardContent>
    </Card>
  );
}

interface OpportunityCardProps {
    marco: string;
    config: { label: string; color: string; bgColor: string; };
    count: number;
    valorTotal: number;
}

function OpportunityCard({ marco, config, count, valorTotal }: OpportunityCardProps) {
    return (
        <Card className={`${config.bgColor} border-2`} style={{ borderColor: config.color }}>
            <CardHeader>
                <CardTitle className="text-md font-bold" style={{ color: config.color }}>{marco}</CardTitle>
                <p className="text-sm font-semibold">{config.label}</p>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">análise(s) neste marco</p>
                <div className="text-lg font-semibold mt-2">
                    {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
            </CardContent>
        </Card>
    );
}
