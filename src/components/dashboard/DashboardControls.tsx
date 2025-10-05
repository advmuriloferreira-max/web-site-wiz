import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Maximize2, 
  Minimize2, 
  Download, 
  Share2, 
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DashboardControlsProps {
  onFullscreen: () => void;
  isFullscreen: boolean;
  currentSection: number;
  totalSections: number;
  onNavigate: (direction: 'prev' | 'next') => void;
  onExportPDF: () => void;
  onShareWhatsApp: () => void;
}

export function DashboardControls({
  onFullscreen,
  isFullscreen,
  currentSection,
  totalSections,
  onNavigate,
  onExportPDF,
  onShareWhatsApp
}: DashboardControlsProps) {
  
  const sectionNames = [
    "Visão Geral",
    "Análise Presente",
    "Projeção Futura",
    "Calendário Estratégico"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Indicador de Seção (apenas em fullscreen) */}
      {isFullscreen && (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {currentSection + 1} / {totalSections}
            </Badge>
            <span className="text-sm font-semibold text-slate-700">
              {sectionNames[currentSection]}
            </span>
          </div>
        </div>
      )}

      {/* Controles Principais */}
      <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg p-2">
        {/* Navegação (apenas em fullscreen) */}
        {isFullscreen && (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onNavigate('prev')}
              disabled={currentSection === 0}
              className="h-10 w-10 p-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="h-6 w-px bg-slate-300" />
          </>
        )}

        {/* Menu de Ações */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-10 w-10 p-0">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShareWhatsApp}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar WhatsApp
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Botão Fullscreen */}
        <Button
          size="sm"
          variant="ghost"
          onClick={onFullscreen}
          className="h-10 w-10 p-0"
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5" />
          ) : (
            <Maximize2 className="h-5 w-5" />
          )}
        </Button>

        {/* Navegação (apenas em fullscreen) */}
        {isFullscreen && (
          <>
            <div className="h-6 w-px bg-slate-300" />
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onNavigate('next')}
              disabled={currentSection === totalSections - 1}
              className="h-10 w-10 p-0"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {/* Dica de Navegação (apenas em fullscreen, primeira vez) */}
      {isFullscreen && currentSection === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-3 max-w-xs animate-fade-in">
          <p className="text-xs text-blue-900">
            💡 Use as setas para navegar entre as seções ou pressione <kbd className="px-1 py-0.5 bg-white rounded text-xs">ESC</kbd> para sair
          </p>
        </div>
      )}
    </div>
  );
}
