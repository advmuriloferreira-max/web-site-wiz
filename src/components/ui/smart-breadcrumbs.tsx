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
      {/* Main Breadcrumb */}
      <nav className="flex items-center space-x-1 flex-1">
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={item.url}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            
            {index === breadcrumbs.length - 1 ? (
              // Current page - not clickable
              <div className="flex items-center space-x-2">
                <span className="font-medium text-foreground px-2 py-1 rounded-md bg-muted/50">
                  {item.title}
                </span>
                
                {/* Bookmark toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmarkToggle}
                  className={cn(
                    "h-7 w-7 p-0 transition-colors",
                    isBookmarked() 
                      ? "text-yellow-500 hover:text-yellow-600" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Star className={cn("h-3 w-3", isBookmarked() && "fill-current")} />
                </Button>
              </div>
            ) : (
              // Clickable breadcrumb with dropdown for parent items
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto px-2 py-1 font-normal text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.title}
                    {index < breadcrumbs.length - 2 && (
                      <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                
                {index < breadcrumbs.length - 2 && (
                  <DropdownMenuContent align="start" className="w-56">
                    {/* Quick navigation */}
                    <div className="px-2 py-1.5">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Navegação Rápida
                      </span>
                    </div>
                    
                    {navigationItems.map((navItem) => (
                      <DropdownMenuItem key={navItem.url} asChild>
                        <Link to={navItem.url} className="flex items-center justify-between">
                          <div className="flex items-center">
                            {navItem.icon && <navItem.icon className="mr-2 h-4 w-4" />}
                            {navItem.title}
                          </div>
                          {showKeyboardShortcuts && navItem.shortcut && (
                            <Badge variant="secondary" className="text-xs">
                              {navItem.shortcut}
                            </Badge>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                )}
              </DropdownMenu>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Recent Pages Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span className="hidden sm:inline">Recentes</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="px-2 py-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Páginas Recentes
            </span>
          </div>
          
          {recentPages.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              Nenhuma página recente
            </div>
          ) : (
            recentPages.slice(0, 8).map((page) => (
              <DropdownMenuItem key={page.id} asChild>
                <Link to={page.url} className="flex items-center space-x-3 p-2">
                  {page.thumbnail && (
                    <img 
                      src={page.thumbnail} 
                      alt={page.title}
                      className="w-12 h-8 rounded object-cover bg-muted"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {page.title}
                    </div>
                    {page.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {page.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {new Date(page.timestamp).toLocaleDateString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Bookmarks Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center space-x-1">
            <Bookmark className="h-3 w-3" />
            <span className="hidden sm:inline">Favoritos</span>
            {bookmarks.length > 0 && (
              <Badge variant="secondary" className="h-4 text-xs">
                {bookmarks.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="px-2 py-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Páginas Favoritas
            </span>
          </div>
          
          {bookmarks.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              Nenhum favorito salvo
            </div>
          ) : (
            bookmarks.map((bookmark) => (
              <DropdownMenuItem key={bookmark.id} asChild>
                <Link to={bookmark.url} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="mr-2 h-3 w-3 text-yellow-500 fill-current" />
                    <span className="truncate">{bookmark.title}</span>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Keyboard Shortcuts Toggle */}
      {showKeyboardShortcuts && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowShortcuts(!showShortcuts)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Badge variant="outline" className="text-xs">
            Ctrl+K
          </Badge>
        </Button>
      )}
    </div>
  );
}