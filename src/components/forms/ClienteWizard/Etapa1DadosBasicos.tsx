import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { User, FileText, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { ClienteWizardData } from "./index";

interface Etapa1Props {
  dados: ClienteWizardData;
  onChange: (dados: Partial<ClienteWizardData>) => void;
}

export function Etapa1DadosBasicos({ dados, onChange }: Etapa1Props) {
  const [cpfCnpjValido, setCpfCnpjValido] = useState<boolean | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState<'CPF' | 'CNPJ' | null>(null);

  const formatarCpfCnpj = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    
    if (apenasNumeros.length <= 11) {
      // CPF: 000.000.000-00
      setTipoDocumento('CPF');
      return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // CNPJ: 00.000.000/0000-00
      setTipoDocumento('CNPJ');
      return apenasNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const validarCpf = (cpf: string): boolean => {
    const numeros = cpf.replace(/\D/g, '');
    if (numeros.length !== 11) return false;
    
    if (/^(\d)\1{10}$/.test(numeros)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(numeros.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numeros.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(numeros.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(numeros.charAt(10));
  };

  const validarCnpj = (cnpj: string): boolean => {
    const numeros = cnpj.replace(/\D/g, '');
    if (numeros.length !== 14) return false;
    
    if (/^(\d)\1{13}$/.test(numeros)) return false;
    
    let tamanho = numeros.length - 2;
    let numeros_cnpj = numeros.substring(0, tamanho);
    const digitos = numeros.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros_cnpj.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    
    tamanho = tamanho + 1;
    numeros_cnpj = numeros.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros_cnpj.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    return resultado === parseInt(digitos.charAt(1));
  };

  const validarCpfCnpj = (documento: string): boolean => {
    const numeros = documento.replace(/\D/g, '');
    
    if (numeros.length === 11) {
      return validarCpf(documento);
    } else if (numeros.length === 14) {
      return validarCnpj(documento);
    }
    
    return false;
  };

  useEffect(() => {
    if (dados.cpf_cnpj.length > 0) {
      const valido = validarCpfCnpj(dados.cpf_cnpj);
      setCpfCnpjValido(valido);
    } else {
      setCpfCnpjValido(null);
      setTipoDocumento(null);
    }
  }, [dados.cpf_cnpj]);

  const handleCpfCnpjChange = (value: string) => {
    const formatado = formatarCpfCnpj(value);
    onChange({ cpf_cnpj: formatado });
  };

  const handleNomeChange = (value: string) => {
    // Capitalizar primeira letra de cada palavra
    const capitalizado = value.replace(/\b\w/g, l => l.toUpperCase());
    onChange({ nome: capitalizado });
  };

  return (
    <div className="space-y-6">
      <Alert>
        <User className="h-4 w-4" />
        <AlertDescription>
          Preencha os dados básicos do cliente. Os campos marcados com * são obrigatórios.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {/* Nome Completo */}
        <div className="space-y-2">
          <Label htmlFor="nome" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Nome Completo *
          </Label>
          <Input
            id="nome"
            value={dados.nome}
            onChange={(e) => handleNomeChange(e.target.value)}
            placeholder="Digite o nome completo do cliente"
            className="text-base"
            required
          />
          {dados.nome.length > 0 && dados.nome.length < 3 && (
            <p className="text-sm text-destructive">Nome deve ter pelo menos 3 caracteres</p>
          )}
        </div>

        {/* CPF/CNPJ */}
        <div className="space-y-2">
          <Label htmlFor="cpf_cnpj" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            CPF/CNPJ *
            {tipoDocumento && (
              <Badge variant="outline" className="ml-2">
                {tipoDocumento}
              </Badge>
            )}
          </Label>
          <div className="relative">
            <Input
              id="cpf_cnpj"
              value={dados.cpf_cnpj}
              onChange={(e) => handleCpfCnpjChange(e.target.value)}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              className="text-base pr-10"
              maxLength={18}
              required
            />
            {cpfCnpjValido !== null && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {cpfCnpjValido ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
          </div>
          
          {cpfCnpjValido === false && (
            <p className="text-sm text-destructive flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              {tipoDocumento} inválido
            </p>
          )}
          
          {cpfCnpjValido === true && (
            <p className="text-sm text-green-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {tipoDocumento} válido
            </p>
          )}
        </div>
      </div>

      {/* Resumo da Etapa */}
      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Resumo dos dados básicos:</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Nome:</span>
            <span className={dados.nome ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              {dados.nome || 'Não informado'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Documento:</span>
            <span className={dados.cpf_cnpj ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              {dados.cpf_cnpj || 'Não informado'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tipo:</span>
            <span className={tipoDocumento ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              {tipoDocumento || 'Não identificado'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}