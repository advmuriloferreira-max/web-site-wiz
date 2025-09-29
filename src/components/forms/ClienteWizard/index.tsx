import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, ArrowLeft, ArrowRight, Save } from "lucide-react";
import { Etapa1DadosBasicos } from "./Etapa1DadosBasicos";
import { Etapa2Contato } from "./Etapa2Contato";
import { Etapa3Observacoes } from "./Etapa3Observacoes";
import { useCreateCliente, Cliente } from "@/hooks/useClientes";
import { toast } from "sonner";

interface ClienteWizardProps {
  onSuccess?: () => void;
  clienteParaEditar?: Cliente | null;
}

export interface ClienteWizardData {
  // Etapa 1 - Dados Básicos
  nome: string;
  cpf_cnpj: string;
  
  // Etapa 2 - Contato
  telefone: string;
  email: string;
  endereco: string;
  
  // Etapa 3 - Observações e Responsável
  responsavel: string;
  observacoes: string;
}

const etapas = [
  { numero: 1, titulo: "Dados Básicos", descricao: "Nome e documento" },
  { numero: 2, titulo: "Contato", descricao: "Telefone, email e endereço" },
  { numero: 3, titulo: "Finalização", descricao: "Responsável e observações" }
];

export function ClienteWizard({ onSuccess, clienteParaEditar }: ClienteWizardProps) {
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [dados, setDados] = useState<ClienteWizardData>({
    nome: clienteParaEditar?.nome || "",
    cpf_cnpj: clienteParaEditar?.cpf_cnpj || "",
    telefone: clienteParaEditar?.telefone || "",
    email: clienteParaEditar?.email || "",
    endereco: clienteParaEditar?.endereco || "",
    responsavel: clienteParaEditar?.responsavel || "",
    observacoes: clienteParaEditar?.observacoes || "",
  });
  const [etapasCompletas, setEtapasCompletas] = useState<number[]>([]);

  const createClienteMutation = useCreateCliente();

  const progress = (etapaAtual / etapas.length) * 100;

  const atualizarDados = (novosDados: Partial<ClienteWizardData>) => {
    setDados(prev => ({ ...prev, ...novosDados }));
    
    // Salvamento automático local
    const dadosParaSalvar = { ...dados, ...novosDados };
    localStorage.setItem('cliente-wizard-draft', JSON.stringify(dadosParaSalvar));
  };

  const marcarEtapaCompleta = (etapa: number) => {
    if (!etapasCompletas.includes(etapa)) {
      setEtapasCompletas(prev => [...prev, etapa]);
    }
  };

  const podeAvancar = () => {
    switch (etapaAtual) {
      case 1:
        return dados.nome.trim() && dados.cpf_cnpj.trim();
      case 2:
        return dados.telefone.trim() || dados.email.trim();
      case 3:
        return true;
      default:
        return false;
    }
  };

  const avancarEtapa = () => {
    if (podeAvancar()) {
      marcarEtapaCompleta(etapaAtual);
      if (etapaAtual < etapas.length) {
        setEtapaAtual(etapaAtual + 1);
      }
    }
  };

  const voltarEtapa = () => {
    if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1);
    }
  };

  const finalizarCadastro = async () => {
    try {
      const clienteData = {
        nome: dados.nome.trim(),
        cpf_cnpj: dados.cpf_cnpj.trim(),
        telefone: dados.telefone.trim() || null,
        email: dados.email.trim() || null,
        endereco: dados.endereco.trim() || null,
        responsavel: dados.responsavel.trim() || null,
        observacoes: dados.observacoes.trim() || null,
      };

      await createClienteMutation.mutateAsync(clienteData);
      
      // Limpar rascunho
      localStorage.removeItem('cliente-wizard-draft');
      
      toast.success("Cliente cadastrado com sucesso!");
      onSuccess?.();
    } catch (error) {
      toast.error("Erro ao cadastrar cliente");
    }
  };

  const renderEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return (
          <Etapa1DadosBasicos
            dados={dados}
            onChange={atualizarDados}
          />
        );
      case 2:
        return (
          <Etapa2Contato
            dados={dados}
            onChange={atualizarDados}
          />
        );
      case 3:
        return (
          <Etapa3Observacoes
            dados={dados}
            onChange={atualizarDados}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header com Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {clienteParaEditar ? "Editar Cliente" : "Novo Cliente"}
          </h2>
          <div className="text-sm text-muted-foreground">
            Etapa {etapaAtual} de {etapas.length}
          </div>
        </div>
        
        <Progress value={progress} className="h-2 mb-4" />
        
        {/* Timeline das Etapas */}
        <div className="flex items-center justify-between">
          {etapas.map((etapa, index) => {
            const completa = etapasCompletas.includes(etapa.numero);
            const ativa = etapaAtual === etapa.numero;
            
            return (
              <div
                key={etapa.numero}
                className={`flex flex-col items-center flex-1 ${
                  index < etapas.length - 1 ? 'relative' : ''
                }`}
              >
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 mb-2
                  ${completa 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : ativa 
                    ? 'border-primary bg-primary text-white' 
                    : 'border-gray-300 text-gray-400'
                  }
                `}>
                  {completa ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{etapa.numero}</span>
                  )}
                </div>
                
                <div className="text-center">
                  <div className={`text-sm font-medium ${
                    ativa ? 'text-primary' : completa ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {etapa.titulo}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {etapa.descricao}
                  </div>
                </div>
                
                {index < etapas.length - 1 && (
                  <div className={`
                    absolute top-4 left-1/2 w-full h-0.5 -z-10
                    ${completa ? 'bg-green-500' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Conteúdo da Etapa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Circle className="w-5 h-5 text-primary" />
            {etapas[etapaAtual - 1]?.titulo}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderEtapa()}
        </CardContent>
      </Card>

      {/* Botões de Navegação */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={voltarEtapa}
          disabled={etapaAtual === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        <div className="flex gap-2">
          {etapaAtual < etapas.length ? (
            <Button
              onClick={avancarEtapa}
              disabled={!podeAvancar()}
              className="flex items-center gap-2"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={finalizarCadastro}
              disabled={createClienteMutation.isPending}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {createClienteMutation.isPending ? "Salvando..." : "Finalizar Cadastro"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}