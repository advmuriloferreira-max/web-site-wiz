import { Badge } from "@/components/ui/badge";
import { useGarantiaExists } from "@/hooks/useGarantiaExists";

interface GarantiaIndicatorProps {
  contratoId: string;
}

export function GarantiaIndicator({ contratoId }: GarantiaIndicatorProps) {
  const { data: hasGarantia, isLoading } = useGarantiaExists(contratoId);

  if (isLoading) {
    return <span className="text-muted-foreground">-</span>;
  }

  return (
    <Badge variant={hasGarantia ? "default" : "secondary"}>
      {hasGarantia ? "S" : "N"}
    </Badge>
  );
}