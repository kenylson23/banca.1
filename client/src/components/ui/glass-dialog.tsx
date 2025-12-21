import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const GlassDialog = DialogPrimitive.Root;

const GlassDialogTrigger = DialogPrimitive.Trigger;

const GlassDialogPortal = DialogPrimitive.Portal;

const GlassDialogClose = DialogPrimitive.Close;

const GlassDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50',
      'bg-black/60',
      'backdrop-blur-md',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
GlassDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface GlassDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  hideCloseButton?: boolean;
}

const GlassDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  GlassDialogContentProps
>(({ className, children, hideCloseButton = false, ...props }, ref) => (
  <GlassDialogPortal>
    <GlassDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50',
        'translate-x-[-50%] translate-y-[-50%]',
        'w-full max-w-lg',
        'grid gap-4 p-6',
        // Glassmorphism
        'bg-neutral-900/80',
        'backdrop-blur-2xl backdrop-saturate-150',
        'border border-neutral-800/50',
        'shadow-2xl shadow-black/50',
        // Gradient border effect
        'before:absolute before:inset-0 before:-z-10',
        'before:rounded-2xl before:p-[1px]',
        'before:bg-gradient-to-br before:from-amber-500/20 before:via-transparent before:to-amber-500/20',
        'before:opacity-0 hover:before:opacity-100',
        'before:transition-opacity before:duration-500',
        // Inner glow
        'after:absolute after:inset-0 after:-z-20',
        'after:rounded-2xl',
        'after:bg-gradient-to-br after:from-amber-500/5 after:to-orange-500/5',
        // Rounded corners
        'rounded-2xl',
        // Animations
        'duration-300',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
        'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        className
      )}
      {...props}
    >
      {children}
      {!hideCloseButton && (
        <DialogPrimitive.Close
          className={cn(
            'absolute right-4 top-4',
            'rounded-lg p-1.5',
            'bg-neutral-800/50 backdrop-blur-sm',
            'border border-neutral-700/50',
            'text-neutral-400 hover:text-white',
            'hover:bg-neutral-700/50',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-neutral-900',
            'disabled:pointer-events-none'
          )}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </GlassDialogPortal>
));
GlassDialogContent.displayName = DialogPrimitive.Content.displayName;

const GlassDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
);
GlassDialogHeader.displayName = 'GlassDialogHeader';

const GlassDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
);
GlassDialogFooter.displayName = 'GlassDialogFooter';

const GlassDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-xl font-semibold leading-none tracking-tight',
      'text-white',
      className
    )}
    {...props}
  />
));
GlassDialogTitle.displayName = DialogPrimitive.Title.displayName;

const GlassDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-neutral-400', className)}
    {...props}
  />
));
GlassDialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  GlassDialog,
  GlassDialogPortal,
  GlassDialogOverlay,
  GlassDialogClose,
  GlassDialogTrigger,
  GlassDialogContent,
  GlassDialogHeader,
  GlassDialogFooter,
  GlassDialogTitle,
  GlassDialogDescription,
};
