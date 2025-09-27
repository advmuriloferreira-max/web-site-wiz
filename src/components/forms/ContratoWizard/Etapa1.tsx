import { UseFormReturn } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClientes } from "@/hooks/useClientes";
import { useBancos } from "@/hooks/useBancos";
import { ContratoWizardData } from "./types";
import { Users, Building, FileText } from "lucide-react";
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
            render={({ field }) => {
              const validation = validarNumeroContrato(field.value || "");
              return (
                <FormItem>
                  <FormLabel>Número do Contrato</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <input
                        placeholder="Ex: 123456789, 123.456.789-0"
                        {...field}
                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 max-w-md ${
                          !validation.isValid ? 'border-destructive focus-visible:ring-destructive' : ''
                        }`}
                        onChange={(e) => {
                          // Filtrar caracteres não permitidos em tempo real
                          const value = e.target.value.replace(/[^0-9\-.\s]/g, '');
                          field.onChange(value);
                        }}
                      />
                      {!validation.isValid && (
                        <p className="text-sm text-destructive">{validation.message}</p>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
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
                <li>Use apenas NÚMEROS no campo contrato. Evite nomes de operações</li>
                <li>Campos marcados com * são obrigatórios</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}