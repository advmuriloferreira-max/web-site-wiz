// src/pages/gestao-passivo/NovaAnalise.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { MODALIDADES_COMPLETAS, BANCOS_COMPLETOS, calcularAnaliseCompleta, IResultadoCalculo, Carteira } from '@/lib/calculoGestaoPassivoBancario';

// Supondo que você tenha componentes de UI como estes (ex: de Shadcn/ui)
// Se não, substitua por seus componentes de formulário padrão.
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import NavigationBar from '@/components/NavigationBar';

// ==============================================================================
// COMPONENTE PRINCIPAL
// ==============================================================================

export default function NovaAnalisePage() {
  // --- ESTADO DO FORMULÁRIO ---
  const [numeroContrato, setNumeroContrato] = useState('');
  const [banco, setBanco] = useState('');
  const [cliente, setCliente] = useState('');
  const [modalidade, setModalidade] = useState('');
  const [saldoDevedor, setSaldoDevedor] = useState<number | ''>('');
  const [dataPrimeiroAtraso, setDataPrimeiroAtraso] = useState('');

  // --- ESTADO DOS CÁLCULOS ---
  const [resultado, setResultado] = useState<IResultadoCalculo | null>(null);

  // --- ORGANIZAR MODALIDADES POR CARTEIRA PARA O SELECT ---
  const modalidadesAgrupadas = useMemo(() => {
    return MODALIDADES_COMPLETAS.reduce((acc, mod) => {
      if (!acc[mod.carteira]) {
        acc[mod.carteira] = [];
      }
      acc[mod.carteira].push(mod);
      return acc;
    }, {} as Record<Carteira, typeof MODALIDADES_COMPLETAS>);
  }, []);

  // --- EFEITO PARA CÁLCULO EM TEMPO REAL ---
  useEffect(() => {
    if (typeof saldoDevedor === 'number' && saldoDevedor > 0 && dataPrimeiroAtraso && modalidade) {
      const analise = calcularAnaliseCompleta(saldoDevedor, dataPrimeiroAtraso, modalidade);
      setResultado(analise);
    } else {
      setResultado(null); // Limpa os resultados se os campos essenciais não estiverem preenchidos
    }
  }, [saldoDevedor, dataPrimeiroAtraso, modalidade]);

  // --- FUNÇÃO DE SUBMISSÃO ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultado) {
      alert("Por favor, preencha todos os campos obrigatórios para gerar a análise.");
      return;
    }
    // Aqui você enviaria os dados para o seu backend (ex: Supabase)
    console.log("Dados para salvar:", {
      numeroContrato,
      banco,
      cliente,
      modalidade,
      saldoDevedor,
      dataPrimeiroAtraso,
      ...resultado,
    });
    alert("Análise salva com sucesso! (Simulação)");
    // Limpar formulário após salvar
  };

  return (
    <>
      <NavigationBar />
      <div className="container mx-auto p-4 md:p-8">
        <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna 1: Formulário de Entrada */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Nova Análise de Passivo Bancário</CardTitle>
                <CardDescription>Preencha os dados do contrato para cálculo automático da provisão e proposta.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Campos do Formulário */}
                <div className="space-y-2">
                  <Label htmlFor="numeroContrato">Número do Contrato *</Label>
                  <Input id="numeroContrato" value={numeroContrato} onChange={e => setNumeroContrato(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cliente">Nome do Cliente</Label>
                  <Input id="cliente" value={cliente} onChange={e => setCliente(e.target.value)} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="banco">Banco *</Label>
                   <Select onValueChange={setBanco} value={banco} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o banco" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-background">
                            {BANCOS_COMPLETOS.map(b => (
                                <SelectItem key={b.nome} value={b.nome}>{b.nome} ({b.segmento})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="modalidade">Modalidade da Operação/Garantia *</Label>
                  <Select onValueChange={setModalidade} value={modalidade} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a modalidade..." />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-background max-h-[300px]">
                      {Object.entries(modalidadesAgrupadas).map(([carteira, mods]) => (
                        <SelectGroup key={carteira}>
                          <SelectLabel>Carteira {carteira}</SelectLabel>
                          {mods.map(m => (
                            <SelectItem key={m.nome} value={m.nome}>{m.nome}</SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="carteira">Carteira de Risco</Label>
                    <Input id="carteira" value={resultado?.carteira || 'Preenchimento automático'} readOnly className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saldoDevedor">Saldo Devedor (R$) *</Label>
                  <Input id="saldoDevedor" type="number" value={saldoDevedor} onChange={e => setSaldoDevedor(Number(e.target.value))} placeholder="Ex: 50000.00" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataPrimeiroAtraso">Data do Primeiro Atraso *</Label>
                  <Input id="dataPrimeiroAtraso" type="date" value={dataPrimeiroAtraso} onChange={e => setDataPrimeiroAtraso(e.target.value)} required />
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Coluna 2: Preview em Tempo Real */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Preview da Análise</CardTitle>
                <CardDescription>Resultados calculados em tempo real.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {resultado ? (
                  <div className="space-y-5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Dias em Atraso</span>
                      <span className="font-bold text-lg">{resultado.diasAtraso}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Provisão (Percentual)</span>
                      <span className="font-bold text-lg text-primary">{resultado.provisaoPercentual.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Provisão (Valor)</span>
                      <span className="font-bold text-lg text-primary">{resultado.provisaoValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-green-700 dark:text-green-300">Proposta de Acordo</span>
                            <span className="font-bold text-xl text-green-700 dark:text-green-300">{resultado.propostaValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-muted-foreground">Marco Estratégico</span>
                      <span className="font-bold text-lg text-orange-500">{resultado.marco}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-10">
                    <p>Preencha os campos obrigatórios para ver a análise.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={!resultado}>Salvar Análise</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
    </>
  );
}
