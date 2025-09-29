import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { ClienteWizardData } from "./index";

interface Etapa2Props {
  dados: ClienteWizardData;
  onChange: (dados: Partial<ClienteWizardData>) => void;
}

export function Etapa2Contato({ dados, onChange }: Etapa2Props) {
  const [emailValido, setEmailValido] = useState<boolean | null>(null);
  const [telefoneValido, setTelefoneValido] = useState<boolean | null>(null);

  const formatarTelefone = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    
    if (apenasNumeros.length <= 10) {
      // Fixo: (00) 0000-0000
      return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      // Celular: (00) 00000-0000
      return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const validarEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validarTelefone = (telefone: string): boolean => {
    const numeros = telefone.replace(/\D/g, '');
    return numeros.length >= 10 && numeros.length <= 11;
  };

  useEffect(() => {
    if (dados.email.length > 0) {
      setEmailValido(validarEmail(dados.email));
    } else {
      setEmailValido(null);
    }
  }, [dados.email]);

  useEffect(() => {
    if (dados.telefone.length > 0) {
      setTelefoneValido(validarTelefone(dados.telefone));
    } else {
      setTelefoneValido(null);
    }
  }, [dados.telefone]);

  const handleTelefoneChange = (value: string) => {
    const formatado = formatarTelefone(value);
    onChange({ telefone: formatado });
  };

  const handleEmailChange = (value: string) => {
    onChange({ email: value.toLowerCase() });
  };

  const temPeloMenosUmContato = dados.telefone.trim() || dados.email.trim();

  return (
    <div className="space-y-6">
      <Alert>
        <Phone className="h-4 w-4" />
        <AlertDescription>
          Informe pelo menos uma forma de contato (telefone ou email). Estes dados são importantes para comunicação.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {/* Telefone */}
        <div className="space-y-2">
          <Label htmlFor="telefone" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Telefone
            {telefoneValido && (
              <Badge variant="outline" className="ml-2 text-green-600">
                Válido
              </Badge>
            )}
          </Label>
          <div className="relative">
            <Input
              id="telefone"
              value={dados.telefone}
              onChange={(e) => handleTelefoneChange(e.target.value)}
              placeholder="(00) 00000-0000"
              className="text-base pr-10"
              maxLength={15}
            />
            {telefoneValido !== null && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {telefoneValido ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
          </div>
          {telefoneValido === false && (
            <p className="text-sm text-destructive">Telefone deve ter 10 ou 11 dígitos</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
            {emailValido && (
              <Badge variant="outline" className="ml-2 text-green-600">
                Válido
              </Badge>
            )}
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={dados.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="cliente@exemplo.com"
              className="text-base pr-10"
            />
            {emailValido !== null && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {emailValido ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
          </div>
          {emailValido === false && (
            <p className="text-sm text-destructive">Email deve ter um formato válido</p>
          )}
        </div>

        {/* Endereço */}
        <div className="space-y-2">
          <Label htmlFor="endereco" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Endereço Completo
          </Label>
          <Textarea
            id="endereco"
            value={dados.endereco}
            onChange={(e) => onChange({ endereco: e.target.value })}
            placeholder="Rua, número, complemento, bairro, cidade - UF, CEP"
            className="text-base min-h-20"
            rows={3}
          />
        </div>
      </div>

      {/* Validação de Contato */}
      {!temPeloMenosUmContato && (dados.telefone.length > 0 || dados.email.length > 0) && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Informe pelo menos um meio de contato válido (telefone ou email).
          </AlertDescription>
        </Alert>
      )}

      {temPeloMenosUmContato && (emailValido !== false && telefoneValido !== false) && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Dados de contato preenchidos corretamente!
          </AlertDescription>
        </Alert>
      )}

      {/* Resumo da Etapa */}
      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Resumo do contato:</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Telefone:</span>
            <span className={dados.telefone ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              {dados.telefone || 'Não informado'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Email:</span>
            <span className={dados.email ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              {dados.email || 'Não informado'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Endereço:</span>
            <span className={dados.endereco ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              {dados.endereco ? (dados.endereco.length > 30 ? dados.endereco.substring(0, 30) + '...' : dados.endereco) : 'Não informado'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}