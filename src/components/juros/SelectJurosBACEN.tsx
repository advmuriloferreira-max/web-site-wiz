import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModalidadesJurosBacen } from "@/hooks/useTaxasJurosBacen";
import { Loader2 } from "lucide-react";

interface SelectJurosBACENProps {
  value?: string;
  onValueChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

interface ModalidadeAgrupada {
  categoria: string;
  tipo_recurso: string;
  modalidades: Array<{
    id: string;
    nome: string;
    codigo_sgs: string;
  }>;
}

/**
 * Componente de seleção hierárquico de modalidades de juros do BACEN
 * Organiza as 48 séries em grupos por Categoria > Sub-categoria > Modalidade
 */
export function SelectJurosBACEN({
  value,
  onValueChange,
  label = "Modalidade BACEN",
  placeholder = "Selecione a modalidade...",
  required = false,
}: SelectJurosBACENProps) {
  const { data: modalidades, isLoading, error } = useModalidadesJurosBacen();

  // Agrupar modalidades por categoria e tipo_recurso
  const modalidadesAgrupadas = useMemo(() => {
    if (!modalidades) return [];

    const grupos: { [key: string]: ModalidadeAgrupada } = {};

    modalidades.forEach((mod) => {
      const chave = `${mod.categoria}||${mod.tipo_recurso}`;

      if (!grupos[chave]) {
        grupos[chave] = {
          categoria: mod.categoria,
          tipo_recurso: mod.tipo_recurso,
          modalidades: [],
        };
      }

      grupos[chave].modalidades.push({
        id: mod.id,
        nome: mod.nome,
        codigo_sgs: mod.codigo_sgs,
      });
    });

    // Converter para array e ordenar
    return Object.values(grupos).sort((a, b) => {
      // Primeiro por categoria (PF antes de PJ)
      if (a.categoria !== b.categoria) {
        return a.categoria === "Pessoa Física" ? -1 : 1;
      }
      // Depois por tipo_recurso
      return a.tipo_recurso.localeCompare(b.tipo_recurso);
    });
  }, [modalidades]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <div className="flex items-center justify-center p-8 border rounded-md bg-muted/50">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Carregando modalidades...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <div className="p-4 border rounded-md bg-destructive/10 border-destructive/20">
          <p className="text-sm text-destructive">
            Erro ao carregar modalidades. Tente novamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full bg-background">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        
        <SelectContent className="max-h-[400px] bg-background z-50">
          {modalidadesAgrupadas.map((grupo, idx) => (
            <SelectGroup key={idx}>
              <SelectLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 py-2 bg-muted/30 sticky top-0 z-10">
                {grupo.categoria === "Pessoa Física" ? "🧑 " : "🏢 "}
                {grupo.categoria} - {grupo.tipo_recurso}
              </SelectLabel>
              
              {grupo.modalidades.map((mod) => (
                <SelectItem
                  key={mod.id}
                  value={mod.id}
                  className="pl-8 py-3 hover:bg-accent cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{mod.nome}</span>
                    <span className="text-xs text-muted-foreground">
                      SGS: {mod.codigo_sgs}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>

      {modalidadesAgrupadas.length === 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          ⚠️ Nenhuma modalidade disponível. Execute a importação de dados.
        </p>
      )}
    </div>
  );
}
