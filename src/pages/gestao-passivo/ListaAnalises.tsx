// src/pages/gestao-passivo/ListaAnalises.tsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal } from 'lucide-react';
import { gerarRelatorioPDFPassivoBancario } from '@/lib/gerarRelatorioPDF';
import { toast } from 'sonner';

// ==============================================================================
// DADOS MOCKADOS (SUBSTITUIR PELA CHAMADA À API/BANCO DE DADOS)
// ==============================================================================

const mockAnalises = [
  { id: 1, contrato: 'CTR-001', cliente: 'Empresa A', banco: 'Itaú Unibanco S.A.', modalidade: 'Capital de giro', carteira: 'C4', saldoDevedor: 150000, diasAtraso: 550, provisaoPercentual: 90, propostaValor: 15000, marco: '90%+', status: 'Ativo' },
  { id: 2, contrato: 'CTR-002', cliente: 'Empresa B', banco: 'Bradesco S.A.', modalidade: 'Alienação de veículos', carteira: 'C2', saldoDevedor: 80000, diasAtraso: 450, provisaoPercentual: 80, propostaValor: 16000, marco: '80-89%', status: 'Ativo' },
  { id: 3, contrato: 'CTR-003', cliente: 'Pessoa Física C', banco: 'Santander Brasil S.A.', modalidade: 'Crédito pessoal', carteira: 'C5', saldoDevedor: 200000, diasAtraso: 360, provisaoPercentual: 70, propostaValor: 60000, marco: '70-79%', status: 'Arquivado' },
  { id: 4, contrato: 'CTR-004', cliente: 'Empresa D', banco: 'Banco do Brasil S.A.', modalidade: 'ACC', carteira: 'C4', saldoDevedor: 50000, diasAtraso: 730, provisaoPercentual: 95, propostaValor: 5000, marco: '90%+', status: 'Ativo' },
  { id: 5, contrato: 'CTR-005', cliente: 'Pessoa Física E', banco: 'Caixa Econômica Federal', modalidade: 'Crédito consignado', carteira: 'C5', saldoDevedor: 120000, diasAtraso: 300, provisaoPercentual: 60, propostaValor: 48000, marco: '60-69%', status: 'Ativo' },
];

// ==============================================================================
// COMPONENTE PRINCIPAL
// ==============================================================================

export default function ListaAnalisesPage() {
  const [filtro, setFiltro] = useState('');

  const analisesFiltradas = useMemo(() => {
    if (!filtro) return mockAnalises;
    return mockAnalises.filter(a => 
      a.contrato.toLowerCase().includes(filtro.toLowerCase()) ||
      a.cliente.toLowerCase().includes(filtro.toLowerCase()) ||
      a.banco.toLowerCase().includes(filtro.toLowerCase())
    );
  }, [filtro]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Lista de Análises</h1>
        <Input 
          placeholder="Filtrar por contrato, cliente, banco..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contrato</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Banco</TableHead>
              <TableHead className="text-right">Saldo Devedor</TableHead>
              <TableHead className="text-center">Dias Atraso</TableHead>
              <TableHead className="text-center">Provisão</TableHead>
              <TableHead className="text-right">Proposta</TableHead>
              <TableHead className="text-center">Marco</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analisesFiltradas.map((analise) => (
              <TableRow key={analise.id}>
                <TableCell className="font-medium">{analise.contrato}</TableCell>
                <TableCell>{analise.cliente}</TableCell>
                <TableCell>{analise.banco}</TableCell>
                <TableCell className="text-right">{analise.saldoDevedor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                <TableCell className="text-center">{analise.diasAtraso}</TableCell>
                <TableCell className="text-center">{analise.provisaoPercentual}%</TableCell>
                <TableCell className="text-right font-semibold text-green-600">{analise.propostaValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                <TableCell className="text-center font-bold text-orange-500">{analise.marco}</TableCell>
                <TableCell className="text-right">
                  <ActionsMenu id={analise.id} analise={analise} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// ==============================================================================
// SUB-COMPONENTE DE AÇÕES
// ==============================================================================

interface ActionsMenuProps {
  id: number;
  analise: typeof mockAnalises[0];
}

function ActionsMenu({ id, analise }: ActionsMenuProps) {
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    switch(action) {
      case 'Ver Detalhes':
        navigate(`/app/gestao-passivo/analise/${id}`);
        break;
      case 'Editar':
        toast.info(`Funcionalidade de edição será implementada em breve`);
        // navigate(`/app/gestao-passivo/editar/${id}`);
        break;
      case 'Gerar PDF':
        try {
          gerarRelatorioPDFPassivoBancario({
            numeroContrato: analise.contrato,
            contrato: analise.contrato,
            cliente: analise.cliente,
            banco: analise.banco,
            modalidade: analise.modalidade,
            carteira: analise.carteira,
            saldoDevedor: analise.saldoDevedor,
            diasAtraso: analise.diasAtraso,
            provisaoPercentual: analise.provisaoPercentual,
            propostaValor: analise.propostaValor,
            marco: analise.marco,
          });
          toast.success('PDF gerado com sucesso!');
        } catch (error) {
          toast.error('Erro ao gerar PDF');
          console.error(error);
        }
        break;
      case 'Excluir':
        if (confirm(`Deseja realmente excluir a análise ${analise.contrato}?`)) {
          toast.success(`Análise ${analise.contrato} excluída com sucesso`);
          // Lógica para excluir do backend
        }
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50 bg-background">
        <DropdownMenuItem onClick={() => handleAction('Ver Detalhes')}>Ver Detalhes</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('Editar')}>Editar</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('Gerar PDF')}>Gerar PDF</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={() => handleAction('Excluir')}>Excluir</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
