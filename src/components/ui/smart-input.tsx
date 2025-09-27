import React, { useState, useRef, useEffect } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Card } from './card';
import { cn } from '@/lib/utils';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

interface SmartInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  suggestions?: string[];
  validationResult?: {
    isValid: boolean;
    message?: string;
  };
  isValidating?: boolean;
  onSuggestionSelect?: (suggestion: string) => void;
  showValidationIcon?: boolean;
}

export const SmartInput = React.forwardRef<HTMLInputElement, SmartInputProps>(
  ({ 
    suggestions = [], 
    validationResult, 
    isValidating = false,
    onSuggestionSelect,
    showValidationIcon = true,
    className,
    ...props 
  }, ref) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (suggestions.length > 0 && document.activeElement === inputRef.current) {
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } else {
        setShowSuggestions(false);
      }
    }, [suggestions]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!showSuggestions || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          if (selectedIndex >= 0) {
            e.preventDefault();
            handleSuggestionClick(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          setSelectedIndex(-1);
          break;
      }
    };

    const handleSuggestionClick = (suggestion: string) => {
      onSuggestionSelect?.(suggestion);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    };

    const getValidationIcon = () => {
      if (isValidating) {
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      }
      
      if (validationResult?.isValid === false) {
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      }
      
      if (validationResult?.isValid === true && props.value) {
        return <Check className="h-4 w-4 text-green-500" />;
      }
      
      return null;
    };

    return (
      <div className="relative">
        <div className="relative">
          <Input
            {...props}
            ref={(node) => {
              inputRef.current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            className={cn(
              validationResult?.isValid === false && "border-destructive focus-visible:ring-destructive",
              showValidationIcon && "pr-10",
              className
            )}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={(e) => {
              // Delay hiding suggestions to allow click events
              setTimeout(() => {
                if (!suggestionsRef.current?.contains(document.activeElement)) {
                  setShowSuggestions(false);
                }
              }, 150);
              props.onBlur?.(e);
            }}
          />
          
          {showValidationIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {getValidationIcon()}
            </div>
          )}
        </div>

        {validationResult?.message && !validationResult.isValid && (
          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {validationResult.message}
          </p>
        )}

        {showSuggestions && suggestions.length > 0 && (
          <Card 
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 max-h-60 overflow-auto border shadow-lg bg-popover"
          >
            <div className="p-1">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    selectedIndex === index && "bg-accent"
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }
);

SmartInput.displayName = "SmartInput";