import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface MobileBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showBack?: boolean;
}

export function MobileBreadcrumb({ items, className, showBack = true }: MobileBreadcrumbProps) {
  const navigate = useNavigate();
  
  // Get current and parent items
  const currentItem = items[items.length - 1];
  const parentItem = items[items.length - 2];

  const handleBack = () => {
    if (parentItem?.href) {
      navigate(parentItem.href);
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      {/* Mobile breadcrumb */}
      <div className={cn("flex items-center gap-3 md:hidden p-4 bg-white border-b border-slate-200", className)}>
        {showBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2 h-auto min-w-[44px] touch-target"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Button>
        )}
        
        <div className="flex-1 min-w-0">
          {parentItem && (
            <div className="text-xs text-slate-500 truncate">
              {parentItem.label}
            </div>
          )}
          <div className="text-sm font-medium text-slate-900 truncate">
            {currentItem?.label}
          </div>
        </div>
      </div>

      {/* Desktop breadcrumb */}
      <div className={cn("hidden md:flex items-center space-x-2 text-sm text-slate-600 p-4", className)}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronLeft className="h-4 w-4 rotate-180 text-slate-400" />
            )}
            
            {item.href && !item.current ? (
              <Link 
                to={item.href}
                className="hover:text-slate-900 transition-colors duration-200"
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn(
                item.current ? "text-slate-900 font-medium" : "text-slate-600"
              )}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}