import { cn } from "@/lib/utils";

interface ClassificationBadgeProps {
  classification: 1 | 2 | 3 | 4 | 5;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const classificationConfig = {
  1: { 
    label: "C1 - Normal", 
    color: "bg-classification-1 text-white", 
    textColor: "text-classification-1",
    borderColor: "border-classification-1/20" 
  },
  2: { 
    label: "C2 - Em Atenção", 
    color: "bg-classification-2 text-white", 
    textColor: "text-classification-2",
    borderColor: "border-classification-2/20" 
  },
  3: { 
    label: "C3 - Subnormal", 
    color: "bg-classification-3 text-white", 
    textColor: "text-classification-3",
    borderColor: "border-classification-3/20" 
  },
  4: { 
    label: "C4 - Duvidoso", 
    color: "bg-classification-4 text-white", 
    textColor: "text-classification-4",
    borderColor: "border-classification-4/20" 
  },
  5: { 
    label: "C5 - Prejuízo", 
    color: "bg-classification-5 text-white", 
    textColor: "text-classification-5",
    borderColor: "border-classification-5/20" 
  },
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

export function ClassificationBadge({ 
  classification, 
  size = "md", 
  showLabel = true,
  className 
}: ClassificationBadgeProps) {
  const config = classificationConfig[classification];
  
  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-full transition-all duration-200",
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {showLabel ? config.label : `C${classification}`}
    </span>
  );
}

export function ClassificationIndicator({ 
  classification, 
  className 
}: { 
  classification: 1 | 2 | 3 | 4 | 5; 
  className?: string;
}) {
  const config = classificationConfig[classification];
  
  return (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded-lg border",
      config.borderColor,
      "bg-background/50 backdrop-blur-sm",
      className
    )}>
      <div className={cn("w-3 h-3 rounded-full", config.color)} />
      <span className={cn("text-sm font-medium", config.textColor)}>
        {config.label}
      </span>
    </div>
  );
}