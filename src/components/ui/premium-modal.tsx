import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const modalVariants = cva(
  "fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%] border bg-white shadow-2xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
  {
    variants: {
      size: {
        sm: "max-w-md rounded-xl",
        default: "max-w-lg rounded-xl",
        lg: "max-w-2xl rounded-xl",
        xl: "max-w-4xl rounded-xl",
        full: "max-w-[95vw] max-h-[95vh] rounded-xl",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const PremiumModal = DialogPrimitive.Root;

const PremiumModalTrigger = DialogPrimitive.Trigger;

const PremiumModalPortal = DialogPrimitive.Portal;

const PremiumModalClose = DialogPrimitive.Close;

const PremiumModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
PremiumModalOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface PremiumModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof modalVariants> {}

const PremiumModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  PremiumModalContentProps
>(({ className, size, children, ...props }, ref) => (
  <PremiumModalPortal>
    <PremiumModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(modalVariants({ size }), className)}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full bg-slate-100 hover:bg-slate-200 p-2 transition-colors duration-200 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </PremiumModalPortal>
));
PremiumModalContent.displayName = DialogPrimitive.Content.displayName;

const PremiumModalHeader = ({
  className,
  gradient = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { gradient?: boolean }) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-4",
      gradient && "bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100",
      className
    )}
    {...props}
  />
);
PremiumModalHeader.displayName = "PremiumModalHeader";

const PremiumModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-4 border-t border-slate-100",
      className
    )}
    {...props}
  />
);
PremiumModalFooter.displayName = "PremiumModalFooter";

const PremiumModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-slate-800",
      className
    )}
    {...props}
  />
));
PremiumModalTitle.displayName = DialogPrimitive.Title.displayName;

const PremiumModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-slate-600", className)}
    {...props}
  />
));
PremiumModalDescription.displayName = DialogPrimitive.Description.displayName;

const PremiumModalBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 py-4", className)} {...props} />
);
PremiumModalBody.displayName = "PremiumModalBody";

export {
  PremiumModal,
  PremiumModalPortal,
  PremiumModalOverlay,
  PremiumModalClose,
  PremiumModalTrigger,
  PremiumModalContent,
  PremiumModalHeader,
  PremiumModalFooter,
  PremiumModalTitle,
  PremiumModalDescription,
  PremiumModalBody,
};