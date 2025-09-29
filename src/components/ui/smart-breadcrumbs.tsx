import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight, ChevronDown, Home, Bookmark, Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useEnterpriseNavigation } from "@/hooks/useEnterpriseNavigation";

interface BreadcrumbItem {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: BreadcrumbItem[];
}

interface SmartBreadcrumbsProps {
  className?: string;
  showKeyboardShortcuts?: boolean;
}

export function SmartBreadcrumbs({ className, showKeyboardShortcuts = true }: SmartBreadcrumbsProps) {
  const location = useLocation();
  const { generateBreadcrumbs, keyboardShortcuts, recentPages, bookmarks, isBookmarked, addBookmark, removeBookmark } = useEnterpriseNavigation();
  
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  const breadcrumbs = generateBreadcrumbs();
  const currentPage = breadcrumbs[breadcrumbs.length - 1];

  // Navigation shortcuts for dropdown
  const navigationItems = [
    { title: "Dashboard", url: "/", icon: Home, shortcut: "Ctrl+1" },
    { title: "Clientes", url: "/clientes", shortcut: "Ctrl+2" },
    { title: "Contratos", url: "/contratos", shortcut: "Ctrl+3" },
    { title: "Processos", url: "/processos", shortcut: "Ctrl+4" },
    { title: "Acordos", url: "/acordos", shortcut: "Ctrl+5" },
    { title: "Cálculos", url: "/calculos", shortcut: "Ctrl+6" },
  ];

  const handleBookmarkToggle = () => {
    if (isBookmarked()) {
      const bookmark = bookmarks.find(b => b.url === location.pathname);
      if (bookmark) removeBookmark(bookmark.id);
    } else {
      addBookmark(currentPage.title);
    }
  };

  return (
    <div className={cn("flex items-center space-x-2 py-2", className)}>
      {/* Home Button - Always Visible */}
      <Link 
        to="/" 
        className="flex items-center space-x-1 px-2 py-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline text-sm font-medium">Home</span>
      </Link>

      {breadcrumbs.length > 1 && (
        <ChevronRight className="h-4 w-4 text-white/40 flex-shrink-0" />
      )}

      {/* Main Breadcrumb - Skip Home since we have dedicated button */}
      <nav className="flex items-center space-x-1 flex-1">
        {breadcrumbs.slice(1).map((item, index) => (
          <React.Fragment key={item.url}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-white/40 flex-shrink-0" />
            )}
            
            {index === breadcrumbs.slice(1).length - 1 ? (
              // Current page - not clickable
              <div className="flex items-center space-x-2">
                <span className="font-medium text-white px-2 py-1 rounded-md bg-white/10 backdrop-blur-sm">
                  {item.title}
                </span>
                
                {/* Bookmark toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmarkToggle}
                  className={cn(
                    "h-7 w-7 p-0 transition-all duration-200 hover:scale-110",
                    isBookmarked() 
                      ? "text-yellow-400 hover:text-yellow-300" 
                      : "text-white/60 hover:text-white"
                  )}
                >
                  <Star className={cn("h-3 w-3", isBookmarked() && "fill-current")} />
                </Button>
              </div>
            ) : (
              // Clickable breadcrumb
              <Link
                to={item.url}
                className="font-normal text-white/70 hover:text-white px-2 py-1 rounded-md hover:bg-white/10 transition-all duration-200"
              >
                {item.title}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Recent Pages Dropdown - Simplified */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200">
            <Clock className="h-4 w-4" />
            <span className="hidden lg:inline ml-1 text-sm">Recentes</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Páginas Recentes
            </span>
          </div>
          
          {recentPages.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              Nenhuma página recente
            </div>
          ) : (
            recentPages.slice(0, 5).map((page) => (
              <DropdownMenuItem key={page.id} asChild>
                <Link to={page.url} className="flex items-center space-x-2 p-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {page.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(page.timestamp).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}