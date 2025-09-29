import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  X, 
  AlertCircle, 
  Info, 
  ArrowRight,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  FileText,
  Users,
  Settings,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  EyeOff,
  Heart,
  Star,
  Bookmark,
  Share,
  Copy,
  Edit,
  Trash,
  Save,
  RefreshCw,
  Home,
  Menu,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedIconProps {
  className?: string;
  size?: number;
  animate?: boolean;
  state?: 'idle' | 'loading' | 'success' | 'error';
  onClick?: () => void;
}

// Animated Success Icon
export function AnimatedSuccessIcon({ className, size = 24, animate = true, onClick }: AnimatedIconProps) {
  return (
    <motion.div
      className={cn('inline-flex items-center justify-center', className)}
      onClick={onClick}
      whileHover={animate ? { scale: 1.1 } : undefined}
      whileTap={animate ? { scale: 0.95 } : undefined}
    >
      <motion.div
        initial={animate ? { scale: 0 } : undefined}
        animate={animate ? { scale: 1 } : undefined}
        transition={animate ? { 
          type: "spring", 
          stiffness: 500, 
          damping: 30 
        } : undefined}
      >
        <Check 
          size={size} 
          className="text-green-500"
        />
      </motion.div>
    </motion.div>
  );
}

// Animated Error Icon
export function AnimatedErrorIcon({ className, size = 24, animate = true, onClick }: AnimatedIconProps) {
  return (
    <motion.div
      className={cn('inline-flex items-center justify-center', className)}
      onClick={onClick}
      whileHover={animate ? { scale: 1.1 } : undefined}
      whileTap={animate ? { scale: 0.95 } : undefined}
    >
      <motion.div
        animate={animate ? {
          rotate: [0, -10, 10, -10, 10, 0],
        } : undefined}
        transition={animate ? {
          duration: 0.5,
          ease: "easeInOut"
        } : undefined}
      >
        <X 
          size={size} 
          className="text-red-500"
        />
      </motion.div>
    </motion.div>
  );
}

// Pulsing Loading Icon
export function AnimatedLoadingIcon({ className, size = 24, animate = true }: AnimatedIconProps) {
  return (
    <motion.div
      className={cn('inline-flex items-center justify-center', className)}
      animate={animate ? { rotate: 360 } : undefined}
      transition={animate ? {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      } : undefined}
    >
      <Clock size={size} className="text-blue-500" />
    </motion.div>
  );
}

// Context-aware Icon that changes based on state
export function StatefulIcon({ 
  state = 'idle', 
  className, 
  size = 24, 
  animate = true 
}: AnimatedIconProps) {
  const iconVariants = {
    idle: { scale: 1, rotate: 0 },
    loading: { scale: 1, rotate: 360 },
    success: { scale: [0, 1.2, 1], rotate: 0 },
    error: { scale: 1, rotate: [0, -10, 10, 0] }
  };

  const getIcon = () => {
    switch (state) {
      case 'loading':
        return <Clock size={size} className="text-blue-500" />;
      case 'success':
        return <Check size={size} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={size} className="text-red-500" />;
      default:
        return <Info size={size} className="text-gray-500" />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state}
        className={cn('inline-flex items-center justify-center', className)}
        variants={animate ? iconVariants : undefined}
        initial="idle"
        animate={state}
        exit="idle"
        transition={{
          duration: state === 'loading' ? 1 : 0.3,
          repeat: state === 'loading' ? Infinity : 0,
          ease: state === 'loading' ? "linear" : "easeOut"
        }}
      >
        {getIcon()}
      </motion.div>
    </AnimatePresence>
  );
}

// Custom INTELBANK icons
export function IntelbankLogoIcon({ className, size = 32, animate = true }: AnimatedIconProps) {
  return (
    <motion.div
      className={cn('inline-flex items-center justify-center', className)}
      whileHover={animate ? { 
        scale: 1.05,
        filter: "drop-shadow(0 4px 8px hsla(var(--primary) / 0.3))"
      } : undefined}
      transition={{ duration: 0.2 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.rect
          width="40"
          height="40"
          rx="8"
          fill="hsl(var(--primary))"
          initial={animate ? { scale: 0.8 } : undefined}
          animate={animate ? { scale: 1 } : undefined}
          transition={{ duration: 0.3 }}
        />
        
        <motion.path
          d="M10 15 L20 10 L30 15 L30 25 L20 30 L10 25 Z"
          fill="white"
          initial={animate ? { opacity: 0, scale: 0.5 } : undefined}
          animate={animate ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.5, delay: 0.1 }}
        />
        
        <motion.circle
          cx="20"
          cy="20"
          r="3"
          fill="hsl(var(--primary))"
          initial={animate ? { scale: 0 } : undefined}
          animate={animate ? { scale: 1 } : undefined}
          transition={{ duration: 0.3, delay: 0.3 }}
        />
      </svg>
    </motion.div>
  );
}

// Trending Arrow with animation
export function TrendingIcon({ 
  direction = 'up', 
  className, 
  size = 24, 
  animate = true 
}: AnimatedIconProps & { direction?: 'up' | 'down' }) {
  const Icon = direction === 'up' ? TrendingUp : TrendingDown;
  const color = direction === 'up' ? 'text-green-500' : 'text-red-500';

  return (
    <motion.div
      className={cn('inline-flex items-center justify-center', className)}
      animate={animate ? {
        y: direction === 'up' ? [0, -2, 0] : [0, 2, 0]
      } : undefined}
      transition={animate ? {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      } : undefined}
    >
      <Icon size={size} className={color} />
    </motion.div>
  );
}

// Interactive Button Icon
export function InteractiveIcon({ 
  icon: Icon = ArrowRight, 
  className, 
  size = 24, 
  animate = true,
  onClick 
}: AnimatedIconProps & { icon?: any }) {
  return (
    <motion.button
      className={cn(
        'inline-flex items-center justify-center p-2 rounded-full',
        'bg-primary/10 hover:bg-primary/20 text-primary',
        'transition-colors duration-200',
        className
      )}
      onClick={onClick}
      whileHover={animate ? { 
        scale: 1.05,
        backgroundColor: "hsl(var(--primary) / 0.15)"
      } : undefined}
      whileTap={animate ? { scale: 0.95 } : undefined}
      transition={{ duration: 0.1 }}
    >
      <motion.div
        animate={animate ? {
          x: [0, 2, 0]
        } : undefined}
        transition={animate ? {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        } : undefined}
      >
        <Icon size={size} />
      </motion.div>
    </motion.button>
  );
}

// Floating Action Button
export function FloatingActionIcon({ 
  icon: Icon = Plus, 
  className, 
  size = 24, 
  animate = true,
  onClick 
}: AnimatedIconProps & { icon?: any }) {
  return (
    <motion.button
      className={cn(
        'fixed bottom-6 right-6 w-14 h-14 rounded-full',
        'bg-primary text-primary-foreground shadow-lg',
        'flex items-center justify-center',
        'hover:shadow-xl transition-shadow duration-200',
        className
      )}
      onClick={onClick}
      whileHover={animate ? { 
        scale: 1.1,
        boxShadow: "0 8px 32px hsla(var(--primary) / 0.4)"
      } : undefined}
      whileTap={animate ? { scale: 0.9 } : undefined}
      animate={animate ? {
        y: [0, -4, 0]
      } : undefined}
      transition={animate ? {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      } : undefined}
    >
      <Icon size={size} />
    </motion.button>
  );
}

// Notification Badge Icon
export function NotificationIcon({ 
  count = 0, 
  className, 
  size = 24, 
  animate = true 
}: AnimatedIconProps & { count?: number }) {
  return (
    <motion.div 
      className={cn('relative inline-flex', className)}
      whileHover={animate ? { scale: 1.05 } : undefined}
    >
      <motion.div
        animate={animate && count > 0 ? {
          scale: [1, 1.1, 1]
        } : undefined}
        transition={animate ? {
          duration: 0.3,
          repeat: count > 0 ? Infinity : 0,
          repeatDelay: 2
        } : undefined}
      >
        <AlertCircle size={size} className="text-muted-foreground" />
      </motion.div>
      
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center"
            initial={animate ? { scale: 0 } : undefined}
            animate={animate ? { scale: 1 } : undefined}
            exit={animate ? { scale: 0 } : undefined}
            transition={{ duration: 0.2 }}
          >
            {count > 99 ? '99+' : count}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Heart/Like Icon with animation
export function LikeIcon({ 
  liked = false, 
  className, 
  size = 24, 
  animate = true,
  onClick 
}: AnimatedIconProps & { liked?: boolean }) {
  return (
    <motion.button
      className={cn('inline-flex items-center justify-center', className)}
      onClick={onClick}
      whileHover={animate ? { scale: 1.1 } : undefined}
      whileTap={animate ? { scale: 0.9 } : undefined}
    >
      <motion.div
        animate={animate && liked ? {
          scale: [1, 1.3, 1],
        } : undefined}
        transition={{ duration: 0.3 }}
      >
        <Heart 
          size={size} 
          className={cn(
            'transition-colors duration-200',
            liked ? 'text-red-500 fill-red-500' : 'text-muted-foreground'
          )}
        />
      </motion.div>
    </motion.button>
  );
}

// Export all icons for easy use
export const PremiumIcons = {
  AnimatedSuccess: AnimatedSuccessIcon,
  AnimatedError: AnimatedErrorIcon,
  AnimatedLoading: AnimatedLoadingIcon,
  Stateful: StatefulIcon,
  IntelbankLogo: IntelbankLogoIcon,
  Trending: TrendingIcon,
  Interactive: InteractiveIcon,
  FloatingAction: FloatingActionIcon,
  Notification: NotificationIcon,
  Like: LikeIcon
};