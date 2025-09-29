import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "text-foreground border-border",
        success: "border-transparent bg-success text-success-foreground hover:bg-success/90",
        warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning/90",
        // Status badges
        pending: "border-transparent bg-status-pending text-white hover:bg-status-pending/90",
        processing: "border-transparent bg-status-processing text-white hover:bg-status-processing/90", 
        completed: "border-transparent bg-status-completed text-white hover:bg-status-completed/90",
        cancelled: "border-transparent bg-status-cancelled text-white hover:bg-status-cancelled/90",
        // Classification badges
        c1: "border-transparent bg-classification-1 text-white hover:bg-classification-1/90",
        c2: "border-transparent bg-classification-2 text-white hover:bg-classification-2/90",
        c3: "border-transparent bg-classification-3 text-white hover:bg-classification-3/90",
        c4: "border-transparent bg-classification-4 text-white hover:bg-classification-4/90",
        c5: "border-transparent bg-classification-5 text-white hover:bg-classification-5/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
