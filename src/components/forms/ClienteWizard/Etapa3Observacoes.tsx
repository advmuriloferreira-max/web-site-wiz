import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserCheck, FileText, CheckCircle } from "lucide-react";
import { ClienteWizardData } from "./index";

interface Etapa3Props {
  dados: ClienteWizardData;
  onChange: (dados: Partial<ClienteWizardData>) => void;
}

export function Etapa3Observacoes({ dados, onChange }: Etapa3Props) {
  const dadosCompletos = dados.nome && dados.cpf_cnpj && (dados.telefone || dados.email);

  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Última etapa! Adicione informações complementares sobre o cliente.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {/* Observações */}
        <div className="space-y-2">
          <Label htmlFor="observacoes" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Observações Importantes
          </Label>
          <Textarea
            id="observacoes"
            value={dados.observacoes}
            onChange={(e) => onChange({ observacoes: e.target.value })}
            placeholder="Informações adicionais sobre o cliente, histórico, particularidades do caso, etc."
            className="text-base min-h-24"
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Anote qualquer informação relevante que possa ajudar no atendimento
          </p>
        </div>
      </div>

      {/* Resumo Final Completo */}
      <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />
          Resumo Final do Cliente
        </h4>
        
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dados Básicos</p>
              <p className="text-sm font-medium">{dados.nome || 'Nome não informado'}</p>
              <p className="text-sm">{dados.cpf_cnpj || 'Documento não informado'}</p>
            </div>
            
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contato</p>
              <p className="text-sm">{dados.telefone || 'Telefone não informado'}</p>
              <p className="text-sm">{dados.email || 'Email não informado'}</p>
            </div>
          </div>

          {dados.endereco && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Endereço</p>
              <p className="text-sm">{dados.endereco}</p>
            </div>
          )}

          {dados.observacoes && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Observações</p>
              <p className="text-sm">{dados.observacoes}</p>
            </div>
          )}
        </div>
      </div>

      {dadosCompletos && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            ✅ Cliente pronto para ser cadastrado! Clique em "Finalizar Cadastro" para salvar.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}