import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { cn } from "@/lib/utils";

interface ResponsiveDrawerProps {
  children?: React.ReactNode;
  className?: string;
}

export function ResponsiveDrawer({ children, className }: ResponsiveDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "md:hidden fixed top-4 left-4 z-50 h-10 w-10 p-0",
            "bg-white/90 backdrop-blur-sm border border-slate-200 shadow-lg",
            "hover:bg-white active:scale-95 transition-all duration-200",
            className
          )}
        >
          <Menu className="h-5 w-5 text-slate-700" />
          <span className="sr-only">Toggle Navigation</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="left" 
        className="w-80 p-0 border-r-0 bg-gradient-to-b from-slate-900 to-slate-800"
        onInteractOutside={() => setOpen(false)}
      >
        {/* Header com botão fechar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">INTELBANK</h2>
              <p className="text-xs text-slate-400">Menu de Navegação</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          <AppSidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
}