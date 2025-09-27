import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveTableRowProps {
  children: React.ReactNode;
  className?: string;
  mobileCard?: React.ReactNode;
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          {children}
        </table>
      </div>
    </div>
  );
}

export function ResponsiveTableHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <thead className={cn("hidden md:table-header-group", className)}>
      {children}
    </thead>
  );
}

export function ResponsiveTableBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <>
      {/* Desktop tbody */}
      <tbody className={cn("hidden md:table-row-group", className)}>
        {children}
      </tbody>
      
      {/* Mobile cards container */}
      <div className="md:hidden space-y-3">
        {children}
      </div>
    </>
  );
}

export function ResponsiveTableRow({ children, className, mobileCard }: ResponsiveTableRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Desktop row */}
      <tr className={cn("hidden md:table-row", className)}>
        {children}
      </tr>
      
      {/* Mobile card */}
      <div className="md:hidden">
        {mobileCard || (
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  {/* Primary content */}
                  <div className="space-y-2">
                    {React.Children.map(children, (child, index) => {
                      if (index < 2) { // Show first 2 cells by default
                        return (
                          <div key={index} className="flex justify-between items-center">
                            {child}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
                
                {React.Children.count(children) > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                    className="ml-2 h-8 w-8 p-0"
                  >
                    {expanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              
              {/* Expanded content */}
              {expanded && React.Children.count(children) > 2 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  {React.Children.map(children, (child, index) => {
                    if (index >= 2) { // Show remaining cells when expanded
                      return (
                        <div key={index} className="flex justify-between items-center text-sm">
                          {child}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

export function ResponsiveTableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn(
      "text-left p-4 font-semibold text-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200",
      className
    )}>
      {children}
    </th>
  );
}

export function ResponsiveTableCell({ 
  children, 
  className, 
  label,
  primary = false 
}: { 
  children: React.ReactNode; 
  className?: string; 
  label?: string;
  primary?: boolean;
}) {
  return (
    <>
      {/* Desktop cell */}
      <td className={cn("hidden md:table-cell p-4 border-b border-slate-100", className)}>
        {children}
      </td>
      
      {/* Mobile cell content - handled by ResponsiveTableRow */}
      <div className="md:hidden flex justify-between items-center">
        {label && (
          <span className={cn(
            "text-sm font-medium text-slate-600",
            primary && "text-slate-800 font-semibold"
          )}>
            {label}:
          </span>
        )}
        <div className={cn(
          "text-sm text-slate-800",
          primary && "font-semibold text-base"
        )}>
          {children}
        </div>
      </div>
    </>
  );
}