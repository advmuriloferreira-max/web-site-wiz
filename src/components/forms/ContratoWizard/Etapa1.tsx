import { UseFormReturn } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PremiumSection } from "@/components/ui/premium-section";
import { PremiumInput } from "@/components/ui/premium-input";
import { useClientes } from "@/hooks/useClientes";
import { useBancos } from "@/hooks/useBancos";
import { ContratoWizardData } from "./types";
import { Users, Building, FileText, Info } from "lucide-react";
import { useEffect } from "react";

interface Etapa1Props {
  form: UseFormReturn<ContratoWizardData>;
}

export function Etapa1({ form }: Etapa1Props) {
  const { data: clientes } = useClientes();
  const { data: bancos } = useBancos();

  // Validação para número do contrato (apenas números, hífens e pontos)
  const validarNumeroContrato = (value: string) => {
    if (!value) return { isValid: true }; // Campo opcional
    
    // Permitir apenas números, hífens, pontos e espaços
    const regex = /^[0-9\-.\s]+$/;
    if (!regex.test(value)) {
      return { 
        isValid: false, 
        message: "Use apenas números, hífens e pontos. Evite nomes de operações." 
      };
    }
    
    // Verificar se não são apenas espaços ou caracteres especiais
    if (value.replace(/[\-.\s]/g, '').length < 3) {
      return { 
        isValid: false, 
        message: "Número deve ter pelo menos 3 dígitos válidos" 
      };
    }
    
    return { isValid: true };
  };

  // Auto-preenchimento do código do banco
  const selectedBancoId = form.watch("banco_id");
  useEffect(() => {
    if (selectedBancoId && bancos) {
      const selectedBanco = bancos.find(b => b.id === selectedBancoId);
      if (selectedBanco?.codigo_banco) {
        // Aqui você pode usar o código do banco para outros campos se necessário
        console.log("Banco selecionado:", selectedBanco.nome, selectedBanco.codigo_banco);
      }
    }
  }, [selectedBancoId, bancos]);

  return (
    <div className="space-y-6">
      <PremiumSection 
        title="Dados Básicos do Contrato" 
        icon={FileText}
        description="Configure as informações principais do contrato"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cliente */}
            <FormField
              control={form.control}
              name="cliente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-slate-700 font-medium">
                    <Users className="h-4 w-4 text-blue-600" />
                    Cliente *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-lg border-slate-200">
                      {clientes?.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id!} className="rounded-md">
                          <div>
                            <div className="font-medium text-slate-800">{cliente.nome}</div>
                            <div className="text-sm text-slate-500">{cliente.email}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Banco */}
            <FormField
              control={form.control}
              name="banco_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-slate-700 font-medium">
                    <Building className="h-4 w-4 text-blue-600" />
                    Instituição Financeira *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-lg border-slate-300 focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue placeholder="Selecione o banco" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-lg border-slate-200">
                      {bancos?.map((banco) => (
                        <SelectItem key={banco.id} value={banco.id!} className="rounded-md">
                          <div>
                            <div className="font-medium text-slate-800">{banco.nome}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Número do Contrato */}
          <FormField
            control={form.control}
            name="numero_contrato"
            render={({ field }) => {
              const validation = validarNumeroContrato(field.value || "");
              return (
                <FormItem>
                  <PremiumInput
                    label="Número do Contrato"
                    placeholder="Ex: 123456789, 123.456.789-0"
                    icon={FileText}
                    error={!validation.isValid ? validation.message : undefined}
                    className="max-w-md"
                    {...field}
                    onChange={(e) => {
                      // Filtrar caracteres não permitidos em tempo real
                      const value = e.target.value.replace(/[^0-9\-.\s]/g, '');
                      field.onChange(value);
                    }}
                  />
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
      </PremiumSection>

      <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-blue-800 mb-2">Informações importantes:</p>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>Certifique-se de que o cliente já está cadastrado no sistema</li>
              <li>Use apenas NÚMEROS no campo contrato. Evite nomes de operações</li>
              <li>Campos marcados com * são obrigatórios</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}