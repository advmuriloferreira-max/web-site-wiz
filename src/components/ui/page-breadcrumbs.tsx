import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbSegment {
  label: string;
  path?: string;
}

interface PageBreadcrumbsProps {
  segments: BreadcrumbSegment[];
  className?: string;
}

export function PageBreadcrumbs({ segments, className }: PageBreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center space-x-2 text-sm mb-6", className)} aria-label="Breadcrumb">
      <Link
        to="/"
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {segments.map((segment, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          
          {segment.path && index < segments.length - 1 ? (
            <Link
              to={segment.path}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {segment.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">
              {segment.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
