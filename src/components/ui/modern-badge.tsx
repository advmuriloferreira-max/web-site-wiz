import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

const modernBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200/80",
        secondary: "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100/80",
        success: "border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-200/80 shadow-sm shadow-emerald-100",
        warning: "border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-200/80 shadow-sm shadow-amber-100",
        danger: "border-red-200 bg-red-100 text-red-800 hover:bg-red-200/80 shadow-sm shadow-red-100",
        info: "border-blue-200 bg-blue-100 text-blue-800 hover:bg-blue-200/80 shadow-sm shadow-blue-100",
        purple: "border-purple-200 bg-purple-100 text-purple-800 hover:bg-purple-200/80 shadow-sm shadow-purple-100",
        outline: "border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        default: "px-3 py-1.5 text-xs",
        lg: "px-4 py-2 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ModernBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modernBadgeVariants> {
  icon?: LucideIcon;
}

function ModernBadge({ className, variant, size, icon: Icon, children, ...props }: ModernBadgeProps) {
  return (
    <div className={cn(modernBadgeVariants({ variant, size }), className)} {...props}>
      {Icon && <Icon className="mr-1.5 h-3 w-3" />}
      {children}
    </div>
  );
}

export { ModernBadge, modernBadgeVariants };