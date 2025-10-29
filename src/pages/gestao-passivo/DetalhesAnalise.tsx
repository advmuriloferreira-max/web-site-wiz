// src/pages/gestao-passivo/DetalhesAnalise.tsx

import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { calcularProvisaoPercentual } from '../../lib/calculoGestaoPassivoBancario';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import NavigationBar from '@/components/NavigationBar';

// ==============================================================================
// DADOS MOCKADOS (SUBSTITUIR PELA CHAMADA À API/BANCO DE DADOS)
// ==============================================================================

// Simula a busca de uma análise específica pelo ID
const mockAnaliseDetalhada = {
  id: 1,
  numeroContrato: 'CTR-0012345',
  cliente: 'Empresa Exemplo Ltda',
  banco: 'Itaú Unibanco S.A.',
  modalidade: 'Capital de giro sem garantia',
  carteira: 'C4',
  saldoDevedor: 150000,
  dataVencimento: '2024-01-15',
  dataPrimeiroAtraso: '2024-03-20',
  diasAtraso: 224, // Calculado
  provisaoPercentual: 50, // Calculado
  provisaoValor: 75000, // Calculado
  propostaValor: 75000, // Calculado
  marco: '50-59%', // Calculado
};

// ==============================================================================
// COMPONENTE PRINCIPAL
// ==============================================================================

export default function DetalhesAnalisePage() {
  const { id } = useParams<{ id: string }>(); // Pega o ID da URL
  const [simuladorMeses, setSimuladorMeses] = useState(0);

  // No mundo real, você usaria o `id` para buscar os dados da análise
  const analise = mockAnaliseDetalhada;

  // --- DADOS PARA O GRÁFICO DE EVOLUÇÃO ---
  const dadosGraficoEvolucao = useMemo(() => {
    const data = [];
    const diasAtuais = analise.diasAtraso;
    for (let i = 0; i <= 24; i++) {
      const diasFuturos = diasAtuais + (i * 30);
      const provisaoFutura = calcularProvisaoPercentual(diasFuturos);
      data.push({ 
        mes: `M+${i}`,
        'Provisão (%)': provisaoFutura,
      });
    }
    return data;
  }, [analise.diasAtraso]);

  // --- CÁLCULO DO SIMULADOR ---
  const resultadoSimulador = useMemo(() => {
    const diasSimulados = analise.diasAtraso + (simuladorMeses * 30);
    const provisaoSimulada = calcularProvisaoPercentual(diasSimulados);
    return {
      dias: diasSimulados,
      provisao: provisaoSimulada,
    };
  }, [analise.diasAtraso, simuladorMeses]);

  if (!analise) {
    return <div>Análise não encontrada.</div>;
  }

  return (
    <>
      <NavigationBar />
      <div className="container mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Detalhes da Análise</h1>
        <p className="text-muted-foreground">Contrato: {analise.numeroContrato}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna de Informações Principais */}
        <div className="lg:col-span-1 space-y-8">
            <InfoCard analise={analise} />
            <RecomendacaoCard marco={analise.marco} />
        </div>

        {/* Coluna de Gráficos e Simulador */}
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Evolução da Provisão</CardTitle>
                    <CardDescription>Projeção do aumento da provisão com base nos dias de atraso, conforme Resolução BCB 352.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dadosGraficoEvolucao}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mes" />
                            <YAxis unit="%" />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Provisão (%)" stroke="hsl(var(--primary))" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Simulador de Cenários: "E se...?"</CardTitle>
                    <CardDescription>Arraste o controle para simular o impacto de esperar mais tempo para negociar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>E se esperar mais {simuladorMeses} mes(es)?</Label>
                        <Slider 
                            defaultValue={[0]} 
                            max={24} 
                            step={1} 
                            onValueChange={(value) => setSimuladorMeses(value[0])} 
                        />
                    </div>
                    <div className="text-center p-4 bg-gray-100 rounded-lg">
                        <p>Após {simuladorMeses} mes(es), o contrato terá <span className="font-bold">{resultadoSimulador.dias} dias</span> de atraso.</p>
                        <p className="text-lg">A provisão estimada será de <span className="font-bold text-red-600">{resultadoSimulador.provisao.toFixed(2)}%</span>.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
    </>
  );
}

// ==============================================================================
// SUB-COMPONENTES
// ==============================================================================

function InfoCard({ analise }: { analise: typeof mockAnaliseDetalhada }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{analise.cliente}</CardTitle>
                <CardDescription>{analise.banco} / {analise.modalidade}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span>Saldo Devedor:</span> <span className="font-semibold">{analise.saldoDevedor.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></div>
                <div className="flex justify-between"><span>Dias Atraso:</span> <span className="font-semibold">{analise.diasAtraso}</span></div>
                <div className="flex justify-between"><span>Carteira:</span> <span className="font-semibold">{analise.carteira}</span></div>
                <div className="flex justify-between"><span>Provisão Atual:</span> <span className="font-semibold">{analise.provisaoPercentual}%</span></div>
                <div className="flex justify-between"><span>Marco Estratégico:</span> <span className="font-semibold text-orange-500">{analise.marco}</span></div>
                <div className="flex justify-between pt-2 border-t"><span>Proposta Sugerida:</span> <span className="font-bold text-green-600 text-lg">{analise.propostaValor.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></div>
            </CardContent>
        </Card>
    )
}

function RecomendacaoCard({ marco }: { marco: string }) {
    const getRecomendacao = () => {
        switch(marco) {
            case '90%+': return { urgencia: 'Crítica', texto: 'A provisão máxima foi atingida. A negociação é altamente recomendada para evitar perdas maiores e recuperar parte do valor.' };
            case '80-89%': return { urgencia: 'Altíssima', texto: 'A provisão está muito alta. Negociar agora pode garantir um dos melhores descontos possíveis.' };
            case '70-79%': return { urgencia: 'Alta', texto: 'Excelente janela de oportunidade para negociação com bom desconto. A provisão continuará subindo rapidamente.' };
            case '60-69%': return { urgencia: 'Média', texto: 'Bom momento para iniciar as negociações. A tendência de aumento da provisão se intensifica nos próximos meses.' };
            case '50-59%': return { urgencia: 'Baixa', texto: 'A negociação já é vantajosa. Acompanhe a evolução para não perder o timing ideal.' };
            default: return { urgencia: 'N/A', texto: 'A provisão ainda é baixa. Monitore o risco de crédito.' };
        }
    }
    const recomendacao = getRecomendacao();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recomendação Estratégica</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="font-semibold">Nível de Urgência: <span className="text-red-500">{recomendacao.urgencia}</span></p>
                <p className="text-sm text-muted-foreground mt-2">{recomendacao.texto}</p>
            </CardContent>
        </Card>
    )
}
