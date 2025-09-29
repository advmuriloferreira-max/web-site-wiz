import React from "react";
import { cn } from "@/lib/utils";

// Skip to main content link for keyboard navigation
export function SkipToMainContent() {
  return (
    <a
      href="#main-content"
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4",
        "bg-primary text-primary-foreground px-4 py-2 rounded-md z-50",
        "font-medium text-sm transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
      )}
    >
      Pular para o conteúdo principal
    </a>
  );
}

// Screen reader only text
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

// Focus trap for modals
export function FocusTrap({ 
  children, 
  active = true 
}: { 
  children: React.ReactNode; 
  active?: boolean; 
}) {
  const trapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!active || !trapRef.current) return;

    const focusableElements = trapRef.current.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    function handleTabKey(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    }

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [active]);

  return (
    <div ref={trapRef}>
      {children}
    </div>
  );
}

// Announcement for screen readers
export function LiveAnnouncement({ 
  message, 
  priority = 'polite' 
}: { 
  message: string; 
  priority?: 'polite' | 'assertive'; 
}) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

// Enhanced button with proper accessibility
interface AccessibleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescription?: string;
  className?: string;
}

export function AccessibleButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  ariaLabel,
  ariaDescription,
  className
}: AccessibleButtonProps) {
  const baseClasses = cn(
    // Base styles
    "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    
    // Minimum touch target for accessibility (44px)
    "min-h-[44px] min-w-[44px]",
    
    // Size variants
    {
      'px-3 py-2 text-sm': size === 'sm',
      'px-4 py-2 text-base': size === 'md',
      'px-6 py-3 text-lg': size === 'lg',
    },
    
    // Color variants
    {
      'bg-primary text-primary-foreground hover:bg-primary-hover focus:ring-primary': variant === 'primary',
      'bg-secondary text-secondary-foreground hover:bg-secondary-hover focus:ring-secondary': variant === 'secondary',
      'hover:bg-accent/10 focus:ring-accent': variant === 'ghost',
    },
    
    className
  );

  return (
    <button
      className={baseClasses}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescription ? `${ariaDescription}-desc` : undefined}
      type="button"
    >
      {children}
      {ariaDescription && (
        <span id={`${ariaDescription}-desc`} className="sr-only">
          {ariaDescription}
        </span>
      )}
    </button>
  );
}