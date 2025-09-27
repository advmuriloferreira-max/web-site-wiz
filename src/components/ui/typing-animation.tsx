import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TypingAnimationProps {
  text: string;
  speed?: number;
  className?: string;
  showCursor?: boolean;
  onComplete?: () => void;
}

export function TypingAnimation({
  text,
  speed = 50,
  className,
  showCursor = true,
  onComplete,
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);
    
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return (
    <span className={cn("relative", className)}>
      {displayedText}
      {showCursor && (
        <motion.span
          className="inline-block w-0.5 h-4 bg-primary ml-0.5"
          animate={{
            opacity: isComplete ? 0 : [1, 1, 0, 0],
          }}
          transition={{
            duration: 1,
            repeat: isComplete ? 0 : Infinity,
            ease: "linear",
          }}
        />
      )}
    </span>
  );
}

interface PlaceholderTypingProps {
  placeholders: string[];
  speed?: number;
  pauseDuration?: number;
  className?: string;
}

export function PlaceholderTyping({
  placeholders,
  speed = 100,
  pauseDuration = 1500,
  className,
}: PlaceholderTypingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPlaceholder = placeholders[currentIndex];
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (displayedText.length < currentPlaceholder.length) {
          setDisplayedText(currentPlaceholder.slice(0, displayedText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      } else {
        if (displayedText.length > 0) {
          setDisplayedText(displayedText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % placeholders.length);
        }
      }
    }, isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentIndex, placeholders, speed, pauseDuration]);

  return (
    <span className={cn("text-muted-foreground", className)}>
      {displayedText}
      <motion.span
        className="inline-block w-0.5 h-4 bg-primary ml-0.5"
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </span>
  );
}