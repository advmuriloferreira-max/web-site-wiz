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
  sub_categoria: string;
  modalidades: Array<{
    codigo_serie: number;
    nome_modalidade: string;
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

  // Agrupar modalidades por categoria e sub-categoria
  const modalidadesAgrupadas = useMemo(() => {
    if (!modalidades) return [];

    const grupos: { [key: string]: ModalidadeAgrupada } = {};

    modalidades.forEach((mod) => {
      // Ignorar séries totais (não devem aparecer na UI principal)
      if (mod.categoria === "Total") return;

      const chave = `${mod.categoria}||${mod.sub_categoria}`;

      if (!grupos[chave]) {
        grupos[chave] = {
          categoria: mod.categoria,
          sub_categoria: mod.sub_categoria,
          modalidades: [],
        };
      }

      grupos[chave].modalidades.push({
        codigo_serie: mod.codigo_serie,
        nome_modalidade: mod.nome_modalidade,
      });
    });

    // Converter para array e ordenar
    return Object.values(grupos).sort((a, b) => {
      // Primeiro por categoria (PF antes de PJ)
      if (a.categoria !== b.categoria) {
        return a.categoria === "Pessoas Físicas" ? -1 : 1;
      }
      // Depois por sub-categoria
      return a.sub_categoria.localeCompare(b.sub_categoria);
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
                {grupo.categoria === "Pessoas Físicas" ? "🧑 " : "🏢 "}
                {grupo.categoria} - {grupo.sub_categoria}
              </SelectLabel>
              
              {grupo.modalidades.map((mod) => (
                <SelectItem
                  key={mod.codigo_serie}
                  value={mod.codigo_serie.toString()}
                  className="pl-8 py-3 hover:bg-accent cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{mod.nome_modalidade}</span>
                    <span className="text-xs text-muted-foreground">
                      Código: {mod.codigo_serie}
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
