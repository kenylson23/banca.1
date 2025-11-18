import { cn } from "@/lib/utils";

interface ShimmerSkeletonProps {
  className?: string;
  variant?: "default" | "card" | "text" | "circle";
}

export function ShimmerSkeleton({
  className,
  variant = "default",
}: ShimmerSkeletonProps) {
  const baseClasses = "relative overflow-hidden bg-muted/50";
  
  const variantClasses = {
    default: "rounded-lg",
    card: "rounded-lg h-[200px]",
    text: "rounded h-4",
    circle: "rounded-full",
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

interface LoadingKpiCardProps {
  delay?: number;
}

export function LoadingKpiCard({ delay = 0 }: LoadingKpiCardProps) {
  return (
    <div
      className="space-y-3 p-6 bg-card border border-card-border rounded-lg"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <ShimmerSkeleton variant="text" className="w-24" />
          <ShimmerSkeleton variant="text" className="w-32 h-8" />
        </div>
        <ShimmerSkeleton variant="circle" className="w-12 h-12" />
      </div>
      <ShimmerSkeleton variant="text" className="w-full h-8" />
      <ShimmerSkeleton variant="text" className="w-28 h-4" />
    </div>
  );
}
