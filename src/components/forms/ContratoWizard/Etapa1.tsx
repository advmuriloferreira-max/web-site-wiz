import { UseFormReturn } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SmartInput } from "@/components/ui/smart-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClientes } from "@/hooks/useClientes";
import { useBancos } from "@/hooks/useBancos";
import { useSmartValidation } from "@/hooks/useSmartValidation";
import { ContratoWizardData } from "./types";
import { Users, Building, FileText } from "lucide-react";
import { useEffect } from "react";

interface Etapa1Props {
  form: UseFormReturn<ContratoWizardData>;
}

export function Etapa1({ form }: Etapa1Props) {
  const { data: clientes } = useClientes();
  const { data: bancos } = useBancos();

  // Validação inteligente para número do contrato
  const numeroContratoValidation = useSmartValidation(
    form.watch("numero_contrato"),
    [
      (value) => {
        if (!value) return { isValid: false, message: "Número do contrato é obrigatório" };
        if (value.length < 3) return { isValid: false, message: "Número deve ter pelo menos 3 caracteres" };
        return { isValid: true };
      }
    ],
    {
      enableSuggestions: true,
      suggestionTable: "contratos",
      suggestionField: "numero_contrato",
      minSuggestionLength: 3
    }
  );

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Dados Básicos do Contrato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cliente */}
            <FormField
              control={form.control}
              name="cliente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Cliente *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientes?.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id!}>
                          <div>
                            <div className="font-medium">{cliente.nome}</div>
                            <div className="text-sm text-muted-foreground">{cliente.email}</div>
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
                  <FormLabel className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Instituição Financeira *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o banco" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bancos?.map((banco) => (
                        <SelectItem key={banco.id} value={banco.id!}>
                          <div>
                            <div className="font-medium">{banco.nome}</div>
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do Contrato *</FormLabel>
                <FormControl>
                  <SmartInput
                    placeholder="Ex: 123456789"
                    {...field}
                    className="max-w-md"
                    suggestions={numeroContratoValidation.suggestions}
                    validationResult={numeroContratoValidation.validationResult}
                    isValidating={numeroContratoValidation.isValidating}
                    onSuggestionSelect={(suggestion) => {
                      form.setValue('numero_contrato', suggestion);
                      numeroContratoValidation.clearSuggestions();
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Informações importantes:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                <li>Certifique-se de que o cliente já está cadastrado no sistema</li>
                <li>O número do contrato deve ser único e exato conforme documentação</li>
                <li>Todos os campos marcados com * são obrigatórios</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}