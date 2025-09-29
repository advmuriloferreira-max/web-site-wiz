import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';

// Hook para detectar mobile
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, [breakpoint]);

  return isMobile;
}

// Hook para viewport dimensions
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}

// Componente para navegação mobile
interface MobileNavigationProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  className?: string;
}

export function MobileNavigation({ 
  children, 
  trigger,
  className 
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {trigger || (
            <Button 
              variant="ghost" 
              size="sm"
              className="touch-target"
              aria-label="Abrir menu de navegação"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className={cn("w-80 p-0", className)}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="touch-target"
                aria-label="Fechar menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Container para conteúdo mobile-safe
interface MobileSafeAreaProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileSafeArea({ children, className }: MobileSafeAreaProps) {
  return (
    <div className={cn(
      "mobile-safe",
      "min-h-screen w-full",
      className
    )}>
      {children}
    </div>
  );
}

// Componente para scroll horizontal em mobile
interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
  showScrollbar?: boolean;
}

export function HorizontalScroll({ 
  children, 
  className,
  showScrollbar = false 
}: HorizontalScrollProps) {
  return (
    <div className={cn(
      "overflow-x-auto",
      !showScrollbar && "scrollbar-hide",
      "pb-2", // Espaço para shadow/scroll
      className
    )}>
      <div className="min-w-max">
        {children}
      </div>
    </div>
  );
}

// Cards empilháveis para mobile
interface StackableCardProps {
  children: React.ReactNode;
  className?: string;
  onTap?: () => void;
}

export function StackableCard({ 
  children, 
  className, 
  onTap 
}: StackableCardProps) {
  return (
    <div 
      className={cn(
        "bg-card rounded-lg border shadow-sm",
        "p-4 space-y-3",
        onTap && "cursor-pointer active:scale-95 transition-transform",
        "touch-target",
        className
      )}
      onClick={onTap}
    >
      {children}
    </div>
  );
}

// Bottom sheet para ações mobile
interface BottomSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function BottomSheet({ 
  children, 
  isOpen, 
  onClose, 
  title 
}: BottomSheetProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sheet */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background rounded-t-xl border-t shadow-lg",
        "transform transition-transform duration-300",
        isOpen ? "translate-y-0" : "translate-y-full"
      )}>
        {title && (
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">{title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="touch-target"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="max-h-[70vh] overflow-y-auto p-4">
          {children}
        </div>
        
        {/* Handle para arrastar */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
          <div className="w-8 h-1 bg-muted-foreground/30 rounded-full" />
        </div>
      </div>
    </>
  );
}

// Floating Action Button
interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  className?: string;
}

export function FloatingActionButton({ 
  onClick, 
  icon, 
  label,
  className 
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-30",
        "w-14 h-14 rounded-full shadow-lg",
        "bg-primary hover:bg-primary-hover",
        "text-primary-foreground",
        "touch-target",
        className
      )}
      aria-label={label}
    >
      {icon}
    </Button>
  );
}

// Swipe gestures hook
export function useSwipeGestures(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold = 50
) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}