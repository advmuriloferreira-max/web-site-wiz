import { useTipoOperacaoById } from "@/hooks/useTipoOperacaoById";

interface TipoOperacaoDisplayProps {
  tipoOperacaoId: string | null;
  fallback?: string;
}

export function TipoOperacaoDisplay({ tipoOperacaoId, fallback = "-" }: TipoOperacaoDisplayProps) {
  const { data: tipoOperacao, isLoading } = useTipoOperacaoById(tipoOperacaoId);

  if (isLoading) {
    return <span className="text-muted-foreground">Carregando...</span>;
  }

  if (!tipoOperacao) {
    return <span className="text-muted-foreground">{fallback}</span>;
  }

  return <span>{tipoOperacao.nome}</span>;
}